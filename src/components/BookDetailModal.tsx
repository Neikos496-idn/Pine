import { useEffect } from 'react';
import {
  BookOpen,
  Bookmark,
  Download,
  FileText,
  Headphones,
  Library,
  X,
} from 'lucide-react';
import { HistoricalBook } from '../types/library';
import { BookCoverArt } from './BookCoverArt';

interface BookDetailModalProps {
  book: HistoricalBook | null;
  isSaved: boolean;
  effectivePrintCopies: number;
  onClose: () => void;
  onToggleSave: (bookId: string) => void;
  onOpenReader: (book: HistoricalBook, chapterIndex?: number) => void;
  onDownloadPdf: (book: HistoricalBook) => void;
  onPlayAudiobook: (book: HistoricalBook, chapterIndex?: number) => void;
  onOpenLoanModal: (book: HistoricalBook) => void;
}

export function BookDetailModal({
  book,
  isSaved,
  effectivePrintCopies,
  onClose,
  onToggleSave,
  onOpenReader,
  onDownloadPdf,
  onPlayAudiobook,
  onOpenLoanModal,
}: BookDetailModalProps) {
  useEffect(() => {
    if (!book) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, onClose]);

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-book-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#FBF9F5] border border-[#D6CEBE] shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky top strip */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-[#FBF9F5]/95 border-b border-[#DED6C8]">
          <div className="flex items-center gap-3 text-xs font-mono text-[#57534E] truncate">
            <span>{book.accessionNumber}</span>
            <span aria-hidden="true">/</span>
            <span className="truncate">{book.era}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(book.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors whitespace-nowrap cursor-pointer ${
                isSaved
                  ? 'bg-[#1D3557] text-[#FBF9F5] border-[#1D3557]'
                  : 'bg-transparent text-[#1C1917] border-[#D6CEBE] hover:bg-[#F2EDE4]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{isSaved ? 'Tersimpan di Rak' : 'Simpan ke Rak'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail pustaka"
              className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EDE4] rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left column: Framed plate & caption */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[#F2EDE4] p-4 border border-[#DED6C8]">
              <BookCoverArt book={book} className="aspect-[3/4] w-full" />
            </div>
            <p className="text-xs font-serif italic text-[#57534E]">
              {book.plateNumber}
            </p>
            <div className="pt-3 border-t border-[#DED6C8]">
              <p className="text-xs font-medium text-[#78716C] mb-1">Provenans & Asal Koleksi</p>
              <p className="text-xs text-[#57534E] leading-relaxed">{book.provenance}</p>
            </div>
          </div>

          {/* Right column: Accession metadata + 3 format cards */}
          <div className="lg:col-span-8 space-y-7">
            <div>
              <p className="text-xs text-[#7C4A1E] font-medium tracking-wide mb-2">
                {book.era} · {book.yearLabel}
              </p>
              <h2
                id="detail-book-title"
                className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-tight text-balance"
              >
                {book.title}
              </h2>
              <p className="mt-2 text-base text-[#57534E] leading-relaxed">
                {book.subtitle}
              </p>
            </div>

            <p className="text-[15px] text-[#292524] leading-relaxed">
              {book.synopsis}
            </p>

            {/* Pull quote with top/bottom hairline rules */}
            <blockquote className="py-4 border-y border-[#DED6C8]">
              <p className="font-serif italic text-lg sm:text-xl text-[#1C1917] leading-relaxed">
                “{book.pullQuote}”
              </p>
              <footer className="mt-2 text-xs text-[#78716C]">
                — {book.pullQuoteSource}
              </footer>
            </blockquote>

            {/* Accession metadata definition list */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm border-b border-[#DED6C8] pb-6">
              <div>
                <dt className="text-xs text-[#78716C]">Penulis / Penyusun</dt>
                <dd className="font-medium text-[#1C1917] mt-0.5">
                  {book.author} <span className="text-[#78716C] font-normal">({book.authorYears})</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#78716C]">Penerbit / Lembaga</dt>
                <dd className="font-medium text-[#1C1917] mt-0.5">{book.publisher}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#78716C]">Bahasa Naskah</dt>
                <dd className="font-medium text-[#1C1917] mt-0.5">{book.language}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#78716C]">Nomor Arsip & Dimensi</dt>
                <dd className="font-mono text-xs text-[#1C1917] mt-1 tabular-nums">
                  {book.accessionNumber} · {book.print.dimensions}
                </dd>
              </div>
            </dl>

            {/* Availability across 3 formats */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                Ketersediaan Tiga Format Pustaka
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Buku Cetak */}
                <div className="flex flex-col justify-between bg-[#F2EDE4] border border-[#DED6C8] p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-[#1C1917]">
                      <span className="inline-flex items-center gap-1.5">
                        <Library className="w-4 h-4 text-[#7C4A1E]" strokeWidth={1.75} />
                        Buku Cetak
                      </span>
                      <span className="font-mono tabular-nums text-[#57534E]">
                        {book.print.shelfCode}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#1C1917]">
                      {book.print.available
                        ? `${effectivePrintCopies} dari ${book.print.totalCopies} eksemplar tersedia`
                        : 'Sedang dalam restorasi'}
                    </p>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {book.print.readingRoom}. {book.print.bindingSpec}.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#DED6C8]">
                    <button
                      type="button"
                      disabled={!book.print.available || effectivePrintCopies <= 0}
                      onClick={() => onOpenLoanModal(book)}
                      className="w-full py-2 px-3 text-xs font-medium rounded border border-[#1D3557] text-[#1D3557] hover:bg-[#1D3557] hover:text-[#FBF9F5] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {!book.print.available
                        ? 'Tidak Dapat Dipinjam'
                        : effectivePrintCopies > 0
                        ? 'Pinjam Buku Cetak'
                        : 'Eksemplar Sedang Dipinjam'}
                    </button>
                  </div>
                </div>

                {/* 2. Naskah PDF */}
                <div className="flex flex-col justify-between bg-[#F2EDE4] border border-[#DED6C8] p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-[#1C1917]">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#1D3557]" strokeWidth={1.75} />
                        Naskah PDF
                      </span>
                      <span className="font-mono tabular-nums text-[#57534E]">
                        {book.pdf.fileSizeMb.toFixed(1)} MB
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#1C1917]">
                      Tersedia · <span className="font-mono tabular-nums">{book.pdf.pages}</span> hlm
                    </p>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {book.pdf.scanResolution}. {book.pdf.editionNote}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#DED6C8] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReader(book, 0)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded bg-[#1D3557] text-[#FBF9F5] hover:bg-[#152843] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(book)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded border border-[#D6CEBE] bg-[#FBF9F5] text-[#1C1917] hover:bg-[#EBE5DA] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>

                {/* 3. Audiobook */}
                <div className="flex flex-col justify-between bg-[#F2EDE4] border border-[#DED6C8] p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-[#1C1917]">
                      <span className="inline-flex items-center gap-1.5">
                        <Headphones className="w-4 h-4 text-[#7C4A1E]" strokeWidth={1.75} />
                        Audiobook
                      </span>
                      <span className="font-mono tabular-nums text-[#57534E]">
                        {book.audiobook.available ? book.audiobook.totalDurationLabel : '—'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#1C1917]">
                      {book.audiobook.available
                        ? `Narator: ${book.audiobook.narrator}`
                        : 'Sedang dalam produksi studio'}
                    </p>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {book.audiobook.available
                        ? `${book.chapters.length} bab rekaman · ${book.audiobook.bitRate}`
                        : 'Rekaman audio untuk edisi ini dijadwalkan hadir pada kuartal mendatang.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#DED6C8]">
                    <button
                      type="button"
                      disabled={!book.audiobook.available}
                      onClick={() => onPlayAudiobook(book, 0)}
                      className="w-full py-2 px-3 text-xs font-medium rounded border border-[#7C4A1E] text-[#7C4A1E] hover:bg-[#7C4A1E] hover:text-[#FBF9F5] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {book.audiobook.available ? 'Putar Audiobook' : 'Belum Tersedia'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter index preview */}
            <div className="pt-2">
              <h4 className="text-xs uppercase tracking-widest text-[#78716C] mb-3">
                Daftar Bab & Naskah Digital
              </h4>
              <div className="divide-y divide-[#DED6C8] border-y border-[#DED6C8]">
                {book.chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">
                        <span className="font-mono text-xs text-[#7C4A1E] mr-2">
                          {ch.number}
                        </span>
                        {ch.title}
                      </p>
                      <p className="text-xs text-[#57534E] mt-0.5">{ch.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenReader(book, idx)}
                        className="px-3 py-1.5 text-xs font-medium text-[#1D3557] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
                      >
                        Baca Bab
                      </button>
                      {book.audiobook.available && (
                        <button
                          type="button"
                          onClick={() => onPlayAudiobook(book, idx)}
                          className="px-3 py-1.5 text-xs font-medium text-[#7C4A1E] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
                        >
                          Dengarkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
