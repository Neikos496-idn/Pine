import { FormEvent, useEffect, useState } from 'react';
import { BookOpen, Check, Headphones, Library, ShieldCheck, X } from 'lucide-react';
import { AccessTier, LibraryAccessPass } from '../types/library';
import { PhainonSunLogo } from './PhainonSunLogo';

interface LibraryAccessModalProps {
  open: boolean;
  accessPass: LibraryAccessPass | null;
  onClose: () => void;
  onActivatePass: (pass: LibraryAccessPass) => void;
  onRevokePass: () => void;
}

export function LibraryAccessModal({
  open,
  accessPass,
  onClose,
  onActivatePass,
  onRevokePass,
}: LibraryAccessModalProps) {
  const [memberName, setMemberName] = useState(accessPass?.memberName ?? '');
  const [memberEmail, setMemberEmail] = useState(accessPass?.memberEmail ?? '');
  const [affiliation, setAffiliation] = useState(accessPass?.affiliation ?? '');
  const [tier, setTier] = useState<AccessTier>(
    accessPass?.tier ?? 'Peneliti Ruang Naskah Langka'
  );
  const [isEditing, setIsEditing] = useState(!accessPass);

  useEffect(() => {
    if (!open) return;
    setMemberName(accessPass?.memberName ?? '');
    setMemberEmail(accessPass?.memberEmail ?? '');
    setAffiliation(accessPass?.affiliation ?? '');
    setTier(accessPass?.tier ?? 'Peneliti Ruang Naskah Langka');
    setIsEditing(!accessPass);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, accessPass, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    const codeNumber = Math.floor(1000 + Math.random() * 9000);
    const nextPass: LibraryAccessPass = {
      memberName: memberName.trim(),
      memberEmail: memberEmail.trim(),
      affiliation: affiliation.trim() || 'Peneliti Mandiri · Aedes Elysiae',
      tier,
      solarCode: `SOL-${codeNumber}`,
      activatedAt: new Date().toISOString().split('T')[0],
    };

    onActivatePass(nextPass);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/65 backdrop-blur-[2px] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FBF9F5] border border-[#C89B3C]/60 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Phainon Sun Crest */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#DED6C8]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 flex items-center justify-center bg-[#1D3557] text-[#E6C167] border border-[#C89B3C]/50 shrink-0">
              <PhainonSunLogo className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A6E1C] font-medium">
                Gerbang Akses Surya · Katarsis
              </p>
              <h2
                id="access-modal-title"
                className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-0.5"
              >
                Kartu Akses Perpustakaan
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup gerbang akses"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isEditing && accessPass ? (
          <div className="mt-6 space-y-6">
            {/* Phainon Solar Pass Credential Card */}
            <div className="relative overflow-hidden bg-[#1D3557] text-[#FBF9F5] border border-[#C89B3C] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#E6C167]">
                    KATARSIS · SEGEL SURYA AKTIF
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold mt-1 text-[#FBF9F5]">
                    {accessPass.memberName}
                  </h3>
                  <p className="text-xs text-[#D6CEBE] mt-0.5">{accessPass.affiliation}</p>
                </div>
                <PhainonSunLogo className="w-14 h-14 text-[#E6C167] shrink-0" />
              </div>

              <dl className="mt-6 pt-4 border-t border-[#FBF9F5]/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <dt className="text-[#D6CEBE]">Kode Segel</dt>
                  <dd className="font-mono text-sm font-semibold text-[#E6C167] mt-0.5 tabular-nums">
                    {accessPass.solarCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#D6CEBE]">Tingkat Akses</dt>
                  <dd className="font-medium text-[#FBF9F5] mt-0.5">{accessPass.tier}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-[#D6CEBE]">Tanggal Aktivasi</dt>
                  <dd className="font-mono text-[#FBF9F5] mt-0.5 tabular-nums">
                    {accessPass.activatedAt}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Format Permissions Summary */}
            <div className="bg-[#F2EDE4] border border-[#DED6C8] p-4 space-y-2.5 text-xs">
              <p className="font-medium text-[#1C1917] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9A6E1C]" />
                <span>Hak Akses Pustaka Terbuka & Terdaftar</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[#57534E]">
                <div className="flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-[#9A6E1C] shrink-0" />
                  <span>Buku Cetak: Isi Otomatis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1D3557] shrink-0" />
                  <span>Naskah PDF: Penuh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-[#9A6E1C] shrink-0" />
                  <span>Audiobook: Penuh</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-xs font-medium border border-[#D6CEBE] bg-[#F2EDE4] text-[#1C1917] rounded hover:bg-[#EBE5DA] cursor-pointer"
                >
                  Ubah Identitas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRevokePass();
                    setIsEditing(true);
                  }}
                  className="text-xs text-[#78716C] hover:text-[#991B1B] underline underline-offset-4 cursor-pointer"
                >
                  Nonaktifkan Kartu
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors cursor-pointer"
              >
                Masuk ke Katalog
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <p className="text-sm text-[#57534E] leading-relaxed">
              Aktifkan Kartu Akses Surya <strong>Katarsis</strong> untuk mengakses katalog sejarah,
              mempercepat reservasi buku cetak, serta menyelaraskan catatan pembaca Anda.
            </p>

            <div>
              <label htmlFor="access-name" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                Nama Pembaca / Peneliti
              </label>
              <input
                id="access-name"
                type="text"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Contoh: Khaslana / Ardiansyah Putra"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="access-email" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                  Surel Akses
                </label>
                <input
                  id="access-email"
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="pembaca@katarsis.lib"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557]"
                />
              </div>

              <div>
                <label htmlFor="access-affiliation" className="block text-xs font-medium text-[#1C1917] mb-1.5">
                  Institusi / Lingkup Kajian
                </label>
                <input
                  id="access-affiliation"
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="Opsional (mis. Fakultas Sejarah)"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#D6CEBE] rounded text-[#1C1917] focus:outline-none focus:border-[#1D3557]"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-[#1C1917] mb-2">
                Jalur Akses Pustaka
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    {
                      id: 'Peneliti Ruang Naskah Langka',
                      desc: 'Buku cetak, ruang naskah langka, PDF penuh, & audiobook',
                    },
                    {
                      id: 'Pembaca Arsip Terbuka',
                      desc: 'Baca & unduh PDF terindeks serta pemutar audiobook',
                    },
                  ] as const
                ).map((option) => {
                  const selected = tier === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTier(option.id)}
                      className={`text-left p-3.5 border rounded transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#F2EDE4] border-[#B8862D] text-[#1C1917]'
                          : 'bg-white border-[#DED6C8] text-[#57534E] hover:border-[#C9BFA9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1C1917]">{option.id}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-[#9A6E1C] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-[#57534E] mt-1 leading-relaxed">{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DED6C8]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium border border-[#D6CEBE] rounded text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] border border-[#C89B3C]/60 rounded hover:bg-[#152843] transition-colors cursor-pointer"
              >
                <PhainonSunLogo withHalo={false} className="w-4 h-4 text-[#E6C167]" />
                <span>Aktifkan Segel Surya</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
