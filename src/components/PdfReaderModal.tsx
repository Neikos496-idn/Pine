import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Headphones,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { HistoricalBook } from '../types/library';

interface PdfReaderModalProps {
  book: HistoricalBook | null;
  initialChapterIndex: number;
  onClose: () => void;
  onDownloadPdf: (book: HistoricalBook) => void;
  onPlayChapterAudio: (book: HistoricalBook, chapterIndex: number) => void;
}

export function PdfReaderModal({
  book,
  initialChapterIndex,
  onClose,
  onDownloadPdf,
  onPlayChapterAudio,
}: PdfReaderModalProps) {
  const [chapterIdx, setChapterIdx] = useState(initialChapterIndex);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    setChapterIdx(initialChapterIndex);
  }, [initialChapterIndex, book?.id]);

  useEffect(() => {
    if (!book) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, onClose]);

  if (!book) return null;

  const chapter = book.chapters[chapterIdx] ?? book.chapters[0];
  const progressPercent = Math.round(((chapterIdx + 1) / book.chapters.length) * 100);

  const fontSizeClass =
    fontSize === 'sm'
      ? 'text-[15px] leading-relaxed'
      : fontSize === 'lg'
      ? 'text-[19px] leading-loose'
      : 'text-[17px] leading-[1.8]';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#FBF9F5] text-[#1C1917]"
      role="dialog"
      aria-modal="true"
      aria-label={`Ruang Baca PDF: ${book.title}`}
    >
      {/* Top reader toolbar */}
      <header className="border-b border-[#DED6C8] bg-[#F2EDE4] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-mono text-[#57534E] truncate">
            {book.accessionNumber} · EDISI PDF ({book.pdf.pages} HLM · {book.pdf.fileSizeMb.toFixed(1)} MB)
          </p>
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917] truncate">
            {book.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center border border-[#D6CEBE] bg-[#FBF9F5] rounded">
            <button
              type="button"
              aria-label="Perkecil huruf"
              onClick={() => setFontSize((prev) => (prev === 'lg' ? 'md' : 'sm'))}
              className="p-2 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono text-[#57534E] border-x border-[#D6CEBE]">
              {fontSize === 'sm' ? '15px' : fontSize === 'md' ? '17px' : '19px'}
            </span>
            <button
              type="button"
              aria-label="Perbesar huruf"
              onClick={() => setFontSize((prev) => (prev === 'sm' ? 'md' : 'lg'))}
              className="p-2 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {book.audiobook.available && (
            <button
              type="button"
              onClick={() => onPlayChapterAudio(book, chapterIdx)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-[#7C4A1E] text-[#7C4A1E] rounded hover:bg-[#7C4A1E] hover:text-[#FBF9F5] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dengarkan Bab Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDownloadPdf(book)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup ruang baca"
            className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#E7DFD1] rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Thin reading progress bar */}
      <div className="h-0.5 bg-[#E7DFD1] w-full">
        <div
          className="h-full bg-[#1D3557] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main reader body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left sidebar: Table of contents & margin notes */}
          <aside className="lg:col-span-4 space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#78716C] mb-3">
                Daftar Isi Naskah
              </h3>
              <nav className="divide-y divide-[#DED6C8] border-y border-[#DED6C8]">
                {book.chapters.map((item, idx) => {
                  const active = idx === chapterIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChapterIdx(idx)}
                      className={`w-full text-left py-3 px-2 transition-colors cursor-pointer ${
                        active ? 'bg-[#F2EDE4]' : 'hover:bg-[#F2EDE4]/60'
                      }`}
                    >
                      <p className="text-[11px] font-mono text-[#7C4A1E]">{item.number}</p>
                      <p
                        className={`text-sm mt-0.5 ${
                          active ? 'font-semibold text-[#1C1917]' : 'text-[#57534E]'
                        }`}
                      >
                        {item.title}
                      </p>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-[#F2EDE4] border border-[#DED6C8] p-4 space-y-2">
              <p className="text-xs font-medium text-[#1C1917]">Catatan Faksimili Digital</p>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Resolusi pindai: {book.pdf.scanResolution}. Terindeks OCR penuh dan siap
                diunduh sebagai berkas PDF portabel untuk kajian luring.
              </p>
            </div>
          </aside>

          {/* Right reading column */}
          <article className="lg:col-span-8 max-w-2xl">
            <div className="pb-6 border-b border-[#DED6C8]">
              <p className="text-xs font-mono uppercase tracking-widest text-[#7C4A1E]">
                {chapter.number} · {book.author}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-2 leading-tight text-balance">
                {chapter.title}
              </h1>
              <p className="mt-2 text-sm text-[#57534E]">{chapter.summary}</p>
            </div>

            <div className={`mt-8 space-y-6 text-[#292524] ${fontSizeClass}`}>
              {chapter.paragraphs.map((para, pIdx) => (
                <p
                  key={pIdx}
                  className={
                    pIdx === 0
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-[#1D3557]'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            {chapterIdx === 0 && (
              <blockquote className="my-8 py-5 border-y border-[#DED6C8]">
                <p className="font-serif italic text-xl sm:text-2xl text-[#1C1917] leading-relaxed">
                  “{book.pullQuote}”
                </p>
                <footer className="mt-2 text-xs text-[#78716C]">
                  — {book.pullQuoteSource}
                </footer>
              </blockquote>
            )}

            {/* Footnote block */}
            <footer className="mt-10 pt-4 border-t border-[#DED6C8] text-xs text-[#57534E] leading-relaxed">
              <span className="font-mono text-[#7C4A1E] mr-2">Catatan Kaki:</span>
              {chapter.footnote}
            </footer>

            {/* Chapter Pagination */}
            <div className="mt-10 pt-6 border-t border-[#DED6C8] flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={chapterIdx === 0}
                onClick={() => setChapterIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[#D6CEBE] rounded text-[#1C1917] hover:bg-[#F2EDE4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bab Sebelumnya</span>
              </button>

              <span className="text-xs font-mono tabular-nums text-[#57534E]">
                Bab {chapterIdx + 1} / {book.chapters.length}
              </span>

              <button
                type="button"
                disabled={chapterIdx >= book.chapters.length - 1}
                onClick={() => setChapterIdx((i) => Math.min(book.chapters.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[#D6CEBE] rounded text-[#1C1917] hover:bg-[#F2EDE4] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Bab Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
