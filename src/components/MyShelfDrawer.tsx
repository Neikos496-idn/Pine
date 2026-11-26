import { useEffect, useState } from 'react';
import { BookOpen, Download, Headphones, Trash2, X } from 'lucide-react';
import { HistoricalBook, LibraryAccessPass, PrintLoanRecord } from '../types/library';
import { PhainonSunLogo } from './PhainonSunLogo';

interface MyShelfDrawerProps {
  open: boolean;
  accessPass: LibraryAccessPass | null;
  savedBooks: HistoricalBook[];
  loans: PrintLoanRecord[];
  onClose: () => void;
  onOpenAccessModal: () => void;
  onRemoveSaved: (bookId: string) => void;
  onCancelLoan: (loanId: string) => void;
  onOpenBookDetail: (book: HistoricalBook) => void;
  onOpenReader: (book: HistoricalBook) => void;
  onDownloadPdf: (book: HistoricalBook) => void;
  onPlayAudio: (book: HistoricalBook) => void;
}

export function MyShelfDrawer({
  open,
  accessPass,
  savedBooks,
  loans,
  onClose,
  onOpenAccessModal,
  onRemoveSaved,
  onCancelLoan,
  onOpenBookDetail,
  onOpenReader,
  onDownloadPdf,
  onPlayAudio,
}: MyShelfDrawerProps) {
  const [tab, setTab] = useState<'pinjaman' | 'tersimpan'>('pinjaman');

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1C1917]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Rak Saya"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FBF9F5] border-l border-[#D6CEBE] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#DED6C8] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">Rak Saya</h2>
            <p className="text-xs text-[#57534E] mt-0.5">
              Pinjaman buku cetak & naskah tersimpan di peramban
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Rak Saya"
            className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EDE4] rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phainon Solar Access Pass Strip */}
        <div className="px-6 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAccessModal();
            }}
            className={`w-full text-left p-3.5 border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
              accessPass
                ? 'bg-[#1D3557] text-[#FBF9F5] border-[#C89B3C]/70 hover:bg-[#152843]'
                : 'bg-[#F2EDE4] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EBE5DA]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <PhainonSunLogo
                className={`w-7 h-7 shrink-0 ${accessPass ? 'text-[#E6C167]' : 'text-[#B8862D]'}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-mono uppercase tracking-wider truncate ${
                    accessPass ? 'text-[#E6C167]' : 'text-[#7C4A1E]'
                  }`}
                >
                  {accessPass ? `SEGEL SURYA · ${accessPass.solarCode}` : 'KARTU AKSES KATARSIS'}
                </p>
                <p className="text-xs font-medium truncate mt-0.5">
                  {accessPass
                    ? `${accessPass.memberName} (${accessPass.tier})`
                    : 'Aktifkan Kartu Pembaca Segel Surya'}
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-medium underline underline-offset-4 shrink-0 ${
                accessPass ? 'text-[#E6C167]' : 'text-[#1D3557]'
              }`}
            >
              {accessPass ? 'Lihat' : 'Aktivasi'}
            </span>
          </button>
        </div>

        {/* Segmented tabs */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-2 p-1 bg-[#F2EDE4] border border-[#DED6C8] rounded-md">
            <button
              type="button"
              onClick={() => setTab('pinjaman')}
              className={`py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'pinjaman'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Pinjaman Cetak ({loans.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('tersimpan')}
              className={`py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'tersimpan'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Naskah Tersimpan ({savedBooks.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {tab === 'pinjaman' ? (
            loans.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#D6CEBE] p-6">
                <p className="font-serif text-lg text-[#1C1917]">Belum ada peminjaman cetak</p>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Pilih buku dengan ketersediaan eksemplar fisik di katalog untuk membuat reservasi pengambilan.
                </p>
              </div>
            ) : (
              loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-[#F2EDE4] border border-[#DED6C8] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-mono text-[#7C4A1E]">
                        KODE {loan.reservationCode} · RAK {loan.shelfCode}
                      </p>
                      <h3 className="font-serif text-lg font-semibold text-[#1C1917] leading-snug mt-0.5">
                        {loan.bookTitle}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCancelLoan(loan.id)}
                      aria-label="Batalkan atau kembalikan pinjaman"
                      className="p-1.5 text-[#78716C] hover:text-[#991B1B] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-[#57534E] space-y-1 pt-2 border-t border-[#DED6C8]">
                    <p>Peminjam: {loan.borrowerName}</p>
                    <p>Layanan: {loan.loanType}</p>
                    <p className="font-mono tabular-nums">
                      Ambil: {loan.pickupDate} · Kembali: {loan.dueDate}
                    </p>
                  </div>
                </div>
              ))
            )
          ) : savedBooks.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[#D6CEBE] p-6">
              <p className="font-serif text-lg text-[#1C1917]">Rak baca Anda masih kosong</p>
              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                Simpan naskah dari katalog agar mudah dibuka ulang untuk dibaca atau didengarkan.
              </p>
            </div>
          ) : (
            savedBooks.map((book) => (
              <div key={book.id} className="bg-[#F2EDE4] border border-[#DED6C8] p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBookDetail(book)}
                    className="text-left group cursor-pointer"
                  >
                    <p className="text-[11px] font-mono text-[#7C4A1E]">
                      {book.accessionNumber} · {book.era}
                    </p>
                    <h3 className="font-serif text-lg font-semibold text-[#1C1917] group-hover:underline underline-offset-4 mt-0.5">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-0.5">{book.author}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSaved(book.id)}
                    aria-label="Hapus dari Rak Saya"
                    className="p-1.5 text-[#78716C] hover:text-[#991B1B] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DED6C8]">
                  <button
                    type="button"
                    onClick={() => onOpenReader(book)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownloadPdf(book)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#D6CEBE] bg-[#FBF9F5] text-[#1C1917] rounded hover:bg-[#EBE5DA] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  {book.audiobook.available && (
                    <button
                      type="button"
                      onClick={() => onPlayAudio(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-[#7C4A1E] text-[#7C4A1E] rounded hover:bg-[#7C4A1E] hover:text-[#FBF9F5] cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Dengar</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
