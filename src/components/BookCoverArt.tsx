import { useState } from 'react';
import { HistoricalBook } from '../types/library';
import { PhainonSunLogo } from './PhainonSunLogo';

interface BookCoverArtProps {
  book: HistoricalBook;
  className?: string;
}

export function BookCoverArt({ book, className = '' }: BookCoverArtProps) {
  const [imgError, setImgError] = useState(false);

  if (!book.coverImage || imgError) {
    return (
      <div
        className={`relative flex flex-col justify-between bg-[#EBE5DA] border border-[#D6CEBE] p-6 text-[#1C1917] select-none ${className}`}
      >
        <div className="border border-[#C9BFA9] h-full w-full p-4 flex flex-col justify-between bg-[#F2EDE4]/60">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#57534E]">
            <span>{book.accessionNumber}</span>
            <span>{book.timelineYear}</span>
          </div>

          <div className="my-auto py-4 text-center space-y-3">
            <div className="mx-auto w-11 h-11 flex items-center justify-center border border-[#C9BFA9] text-[#B8862D]">
              <PhainonSunLogo className="w-6 h-6" />
            </div>
            <p className="font-serif text-xl leading-snug font-semibold text-[#1C1917] px-2">
              {book.title}
            </p>
            <div className="w-12 h-px bg-[#C9BFA9] mx-auto" />
            <p className="text-xs text-[#57534E] font-medium">{book.author}</p>
          </div>

          <div className="text-center text-[11px] uppercase tracking-[0.18em] text-[#78716C] border-t border-[#D6CEBE] pt-3">
            Katarsis
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#EBE5DA] border border-[#DED6C8] ${className}`}>
      <img
        src={book.coverImage}
        alt={book.coverAlt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
