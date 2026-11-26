import { useEffect, useState } from 'react';
import { Check, Copy, Download, FileCode2, X } from 'lucide-react';
import { HistoricalBook } from '../types/library';
import { downloadCatalogBibtex, downloadCatalogJson } from '../utils/exportCatalog';

interface GithubGuideModalProps {
  open: boolean;
  books: HistoricalBook[];
  onClose: () => void;
}

const GIT_COMMANDS = `git init
git add .
git commit -m "Rilis perdana Katarsis"
git branch -M main
git remote add origin https://github.com/USERNAME/katarsis.git
git push -u origin main`;

export function GithubGuideModal({ open, books, onClose }: GithubGuideModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GIT_COMMANDS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FBF9F5] border border-[#D6CEBE] shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DED6C8]">
          <div>
            <p className="text-xs font-mono text-[#7C4A1E]">REPOSITORI TERBUKA & GITHUB PAGES</p>
            <h2 id="github-modal-title" className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1">
              Unggah ke GitHub & Ekspor Katalog
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan GitHub"
            className="p-1.5 text-[#57534E] hover:text-[#1C1917] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5 text-sm text-[#292524] leading-relaxed">
          <p>
            Seluruh kode sumber <strong>Katarsis</strong> disusun sebagai aplikasi statis
            tanpa ketergantungan basis data eksternal. Konfigurasi{' '}
            <code className="font-mono text-xs bg-[#F2EDE4] px-1.5 py-0.5 border border-[#DED6C8]">
              base: './'
            </code>{' '}
            pada Vite dan berkas alur kerja{' '}
            <code className="font-mono text-xs bg-[#F2EDE4] px-1.5 py-0.5 border border-[#DED6C8]">
              .github/workflows/deploy.yml
            </code>{' '}
            telah disertakan agar situs dapat langsung diterbitkan ke GitHub Pages.
          </p>

          <div className="bg-[#F2EDE4] border border-[#DED6C8] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[#1C1917] inline-flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-[#1D3557]" />
                Perintah Unggah ke GitHub
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#FBF9F5] border border-[#D6CEBE] rounded hover:bg-[#EBE5DA] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#1D3557]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Perintah'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-[#1C1917] bg-[#FBF9F5] border border-[#DED6C8] p-3 overflow-x-auto leading-relaxed">
              {GIT_COMMANDS}
            </pre>
            <p className="text-xs text-[#57534E]">
              Setelah terunggah, buka menu <strong>Settings → Pages</strong> pada repositori GitHub
              Anda dan pilih <strong>Source: GitHub Actions</strong>.
            </p>
          </div>

          <div className="pt-2 border-t border-[#DED6C8] space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
              Ekspor Metadata Katalog & Sitasi
            </h3>
            <p className="text-xs text-[#57534E]">
              Unduh seluruh indeks pustaka sejarah untuk dokumentasi repositori GitHub atau manajemen referensi akademik.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => downloadCatalogJson(books)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#1D3557] text-[#FBF9F5] rounded hover:bg-[#152843] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Katalog JSON</span>
              </button>
              <button
                type="button"
                onClick={() => downloadCatalogBibtex(books)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border border-[#D6CEBE] bg-[#F2EDE4] text-[#1C1917] rounded hover:bg-[#EBE5DA] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Sitasi BibTeX (.bib)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
