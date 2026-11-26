import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import { HistoricalBook } from '../types/library';

interface AudiobookPlayerBarProps {
  book: HistoricalBook | null;
  chapterIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onChangeChapter: (index: number) => void;
  onClose: () => void;
}

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function AudiobookPlayerBar({
  book,
  chapterIndex,
  isPlaying,
  onTogglePlay,
  onChangeChapter,
  onClose,
}: AudiobookPlayerBarProps) {
  const [elapsed, setElapsed] = useState(0);
  const [rate, setRate] = useState<number>(1);
  const [voiceActive, setVoiceActive] = useState(true);
  const [queueOpen, setQueueOpen] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const chapter = book?.chapters[chapterIndex] ?? book?.chapters[0];
  const duration = chapter?.durationSeconds ?? 180;

  // Reset elapsed when track changes
  useEffect(() => {
    setElapsed(0);
  }, [book?.id, chapterIndex]);

  // Synchronize Web Speech API narration when available
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (!book || !chapter || !isPlaying || !voiceActive) {
      return;
    }

    const spokenText = `${book.title}. ${chapter.number}: ${chapter.title}. ${chapter.paragraphs.join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = 'id-ID';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
    if (idVoice) utterance.voice = idVoice;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [book, chapter, isPlaying, rate, voiceActive]);

  // Progress timer
  useEffect(() => {
    if (!book || !chapter || !isPlaying) return;

    const interval = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + rate;
        if (next >= duration) {
          if (chapterIndex < book.chapters.length - 1) {
            onChangeChapter(chapterIndex + 1);
          } else {
            onTogglePlay();
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [book, chapter, chapterIndex, duration, isPlaying, onChangeChapter, onTogglePlay, rate]);

  // Stop speech when unmounted or closed
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!book || !chapter) return null;

  const progressPct = Math.min(100, Math.round((elapsed / duration) * 100));

  const cycleRate = () => {
    const rates = [0.85, 1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
    setRate(rates[nextIdx]);
  };

  return (
    <aside
      aria-label="Pemutar Audiobook"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#1C1917] text-[#FBF9F5] border-t border-[#44403C]"
    >
      {/* Expandable chapter queue */}
      {queueOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 border-b border-[#44403C] bg-[#292524]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-[#D6CEBE]">
              Daftar Bab Rekaman · Narator: {book.audiobook.narrator}
            </p>
            <button
              type="button"
              onClick={() => setQueueOpen(false)}
              className="text-xs text-[#D6CEBE] hover:text-white cursor-pointer"
            >
              Sembunyikan
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {book.chapters.map((ch, idx) => {
              const active = idx === chapterIndex;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onChangeChapter(idx)}
                  className={`text-left px-3 py-2 rounded border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1D3557] border-[#4A6FA5] text-white'
                      : 'bg-[#1C1917]/60 border-[#44403C] text-[#D6CEBE] hover:bg-[#1C1917]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>{ch.number}</span>
                    <span className="tabular-nums">{formatClock(ch.durationSeconds)}</span>
                  </div>
                  <p className="text-xs font-medium mt-0.5 truncate">{ch.title}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main compact player strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden sm:flex w-9 h-9 items-center justify-center bg-[#292524] border border-[#44403C] text-[#D6CEBE] shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-[#FBF9F5] truncate">
              {chapter.number}: {chapter.title}
            </p>
            <p className="text-[11px] text-[#A8A29E] truncate">
              {book.title} · {book.audiobook.narrator}
            </p>
          </div>
        </div>

        {/* Center controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            disabled={chapterIndex === 0}
            onClick={() => onChangeChapter(Math.max(0, chapterIndex - 1))}
            aria-label="Bab sebelumnya"
            className="p-1.5 text-[#D6CEBE] hover:text-white disabled:opacity-35 cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Jeda audiobook' : 'Putar audiobook'}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FBF9F5] text-[#1C1917] hover:bg-[#E7DFD1] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            disabled={chapterIndex >= book.chapters.length - 1}
            onClick={() => onChangeChapter(Math.min(book.chapters.length - 1, chapterIndex + 1))}
            aria-label="Bab berikutnya"
            className="p-1.5 text-[#D6CEBE] hover:text-white disabled:opacity-35 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right progress + speed + queue */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2 w-48">
            <span className="text-[11px] font-mono tabular-nums text-[#A8A29E]">
              {formatClock(elapsed)}
            </span>
            <input
              type="range"
              aria-label="Progres audio"
              min={0}
              max={duration}
              value={Math.min(duration, Math.floor(elapsed))}
              onChange={(e) => setElapsed(Number(e.target.value))}
              className="w-full accent-[#D6CEBE] cursor-pointer h-1"
            />
            <span className="text-[11px] font-mono tabular-nums text-[#A8A29E]">
              {formatClock(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={cycleRate}
            className="px-2 py-1 text-[11px] font-mono tabular-nums border border-[#44403C] rounded text-[#D6CEBE] hover:text-white hover:border-[#78716C] cursor-pointer"
            title="Ubah kecepatan narasi"
          >
            {rate}x
          </button>

          <button
            type="button"
            onClick={() => setVoiceActive((v) => !v)}
            title={voiceActive ? 'Suara narasi aktif' : 'Suara narasi dibisukan'}
            className={`p-1.5 rounded cursor-pointer ${
              voiceActive ? 'text-[#FBF9F5]' : 'text-[#78716C]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setQueueOpen((o) => !o)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border border-[#44403C] rounded text-[#D6CEBE] hover:text-white cursor-pointer whitespace-nowrap"
          >
            <span>Bab</span>
            {queueOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={cycleRate}
            className="md:hidden px-2 py-1 text-[11px] font-mono tabular-nums border border-[#44403C] rounded text-[#D6CEBE] hover:text-white cursor-pointer"
            title="Ubah kecepatan narasi"
          >
            {rate}x
          </button>
          <button
            type="button"
            onClick={() => setQueueOpen((o) => !o)}
            className="md:hidden inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-[#44403C] rounded text-[#D6CEBE] hover:text-white cursor-pointer whitespace-nowrap"
          >
            <span>Bab</span>
            {queueOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pemutar audio"
            className="p-1.5 text-[#A8A29E] hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slim top hairline progress indicator */}
      <div className="h-0.5 bg-[#292524] w-full">
        <div
          className="h-full bg-[#C9BFA9] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </aside>
  );
}
