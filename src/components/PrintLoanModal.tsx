import { FormEvent, useEffect, useState } from 'react';
import { Check, Library, X } from 'lucide-react';
import { HistoricalBook, LibraryAccessPass, PrintLoanRecord } from '../types/library';

interface PrintLoanModalProps {
  book: HistoricalBook | null;
  accessPass: LibraryAccessPass | null;
  onClose: () => void;
  onConfirmLoan: (loan: PrintLoanRecord) => void;
}

export function PrintLoanModal({ book, accessPass, onClose, onConfirmLoan }: PrintLoanModalProps) {
  const [borrowerName, setBorrowerName] = useState(accessPass?.memberName ?? '');
  const [borrowerEmail, setBorrowerEmail] = useState(accessPass?.memberEmail ?? '');
  const [loanType, setLoanType] = useState<'Pinjam Bawa Pulang' | 'Reservasi Ruang Baca'>(
    'Pinjam Bawa Pulang'
  );
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [submittedSlip, setSubmittedSlip] = useState<PrintLoanRecord | null>(null);

  useEffect(() => {
    if (!book) {
      setSubmittedSlip(null);
      return;
    }
    if (accessPass) {
      setBorrowerName((prev) => prev || accessPass.memberName);
      setBorrowerEmail((prev) => prev || accessPass.memberEmail);
    }
    if (book.print.statusLabel === 'Baca di Tempat') {
      setLoanType('Reservasi Ruang Baca');
    } else {
      setLoanType('Pinjam Bawa Pulang');
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, accessPass, onClose]);

  if (!book) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim() || !borrowerEmail.trim()) return;

    const pickup = new Date(pickupDate);
    const due = new Date(pickup);
    due.setDate(due.getDate() + (loanType === 'Pinjam Bawa Pulang' ? 14 : 1));

    const code = `KT-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: PrintLoanRecord = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      accessionNumber: book.accessionNumber,
      shelfCode: book.print.shelfCode,
      readingRoom: book.print.readingRoom,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim(),
      pickupDate,
      dueDate: due.toISOString().split('T')[0],
      loanType,
      reservationCode: code,
      createdAt: new Date().toISOString(),
    };

    onConfirmLoan(record);
    setSubmittedSlip(record);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#FBF9F5] border border-[#D6CEBE] shadow-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DED6C8]">
          <div>
            <p className="text-xs font-mono text-[#7C4A1E]">
              {book.accessionNumber} · RAK {book.print.shelfCode}
            </p>
            <h2 id="loan-modal-title" className="font-serif text-2xl font-semibold text-[#1C1917] mt-1">
              Peminjaman Buku Cetak
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir peminjaman"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSlip ? (
          <div className="mt-6 space-y-5">
            <div className="bg-[#F2EDE4] border border-[#DED6C8] p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1D3557]">
                <Check className="w-4 h-4" />
                <span>Reservasi Buku Cetak Tercatat</span>
              </div>
              <p className="text-sm text-[#292524] leading-relaxed">
                Tunjukkan kode reservasi di bawah kepada petugas meja sirkulasi saat pengambilan naskah.
              </p>
              <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DED6C8] text-xs">
                <div>
                  <dt className="text-[#78716C]">Kode Pengambilan</dt>
                  <dd className="font-mono text-base font-semibold text-[#1C1917] mt-0.5">
                    {submittedSlip.reservationCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#78716C]">Jenis Layanan</dt>
                  <dd className="font-medium text-[#1C1917] mt-0.5">{submittedSlip.loanType}</dd>
                </div>
                <div>
                  <dt className="text-[#78716C]">Tanggal Ambil</dt>
                  <dd className="font-mono text-[#1C1917] mt-0.5">{submittedSlip.pickupDate}</dd>
                </div>
                <div>
                  <dt className="text-[#78716C]">Batas Pengembalian</dt>
                  <dd className="font-mono text-[#1C1917] mt-0.5">{submittedSlip.dueDate}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#78716C]">Lokasi Pengambilan</dt>
                  <dd className="font-medium text-[#1C1917] mt-0.5">{submittedSlip.readingRoom}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-sm font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="bg-[#F2EDE4] border border-[#DED6C8] p-3.5 flex items-start gap-3">
              <Library className="w-4 h-4 text-[#7C4A1E] mt-0.5 shrink-0" />
              <div className="text-xs text-[#57534E]">
                <p className="font-semibold text-[#1C1917]">{book.title}</p>
                <p className="mt-0.5">{book.print.readingRoom}</p>
              </div>
            </div>

            <div>
              <label htmlFor="loan-name" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                Nama Lengkap Peminjam
              </label>
              <input
                id="loan-name"
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Contoh: Hendra Wijaya"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557]"
              />
            </div>

            <div>
              <label htmlFor="loan-email" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                Surel Anggota / Peneliti
              </label>
              <input
                id="loan-email"
                type="email"
                required
                value={borrowerEmail}
                onChange={(e) => setBorrowerEmail(e.target.value)}
                placeholder="nama@institusi.ac.id"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="loan-type" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                  Skema Layanan
                </label>
                <select
                  id="loan-type"
                  value={loanType}
                  onChange={(e) =>
                    setLoanType(e.target.value as 'Pinjam Bawa Pulang' | 'Reservasi Ruang Baca')
                  }
                  disabled={book.print.statusLabel === 'Baca di Tempat'}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557] disabled:bg-[#F2EDE4]"
                >
                  <option value="Pinjam Bawa Pulang">Pinjam Bawa Pulang (14 Hari)</option>
                  <option value="Reservasi Ruang Baca">Reservasi Ruang Baca (1 Hari)</option>
                </select>
              </div>

              <div>
                <label htmlFor="loan-date" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                  Tanggal Pengambilan
                </label>
                <input
                  id="loan-date"
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] font-mono focus:outline-none focus:border-[#1D3557]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium border border-[#D6CEBE] rounded text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors cursor-pointer"
              >
                Konfirmasi Peminjaman
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
