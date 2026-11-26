import { Bookmark } from 'lucide-react';
import { PhainonSunLogo } from './PhainonSunLogo';

interface TopBarProps {
  savedCount: number;
  activeLoanCount: number;
  onOpenShelf: () => void;
  onOpenGithubModal: () => void;
}

export function TopBar({
  savedCount,
  activeLoanCount,
  onOpenShelf,
  onOpenGithubModal,
}: TopBarProps) {
  const totalShelfItems = savedCount + activeLoanCount;

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-[#DED6C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single brand lockup with Phainon Solar Emblem */}
        <a
          href="#beranda"
          className="inline-flex items-center gap-2.5 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D3557]"
        >
          <PhainonSunLogo className="w-6 h-6 text-[#B8862D] shrink-0" />
          <span>Katarsis</span>
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          <a
            href="#katalog"
            className="hover:text-[#1C1917] hover:underline underline-offset-4 decoration-[#7C4A1E] transition-colors whitespace-nowrap shrink-0"
          >
            Katalog
          </a>
          <a
            href="#lini-masa"
            className="hover:text-[#1C1917] hover:underline underline-offset-4 decoration-[#7C4A1E] transition-colors whitespace-nowrap shrink-0"
          >
            Lini Masa
          </a>
          <a
            href="#ruang-dengar"
            className="hover:text-[#1C1917] hover:underline underline-offset-4 decoration-[#7C4A1E] transition-colors whitespace-nowrap shrink-0"
          >
            Ruang Dengar
          </a>
          <button
            type="button"
            onClick={onOpenGithubModal}
            className="hover:text-[#1C1917] hover:underline underline-offset-4 decoration-[#7C4A1E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Arsip GitHub
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenShelf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium bg-[#1D3557] text-[#FBF9F5] rounded-md hover:bg-[#152843] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3557]"
          >
            <Bookmark className="w-4 h-4" strokeWidth={1.75} />
            <span>
              Rak Saya
              {totalShelfItems > 0 && (
                <span className="ml-1.5 font-mono tabular-nums">({totalShelfItems})</span>
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
