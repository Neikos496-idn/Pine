import { SVGProps } from 'react';

interface PhainonSunLogoProps extends SVGProps<SVGSVGElement> {
  withHalo?: boolean;
}

/**
 * Emblem Matahari terinspirasi motif Surya / Coreflame Phainon (Honkai: Star Rail):
 * Cakram surya pusat, cincin astrolab ganda, dan 12 sinar tombak bergantian.
 */
export function PhainonSunLogo({
  withHalo = true,
  className = 'w-6 h-6',
  ...props
}: PhainonSunLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer celestial halo ring */}
      {withHalo && (
        <circle
          cx="50"
          cy="50"
          r="43"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeDasharray="6 4"
          opacity="0.55"
        />
      )}

      {/* 4 Cardinal long spear rays (N, E, S, W) */}
      <polygon points="50,3 54.5,24 50,29 45.5,24" fill="currentColor" />
      <polygon points="97,50 76,54.5 71,50 76,45.5" fill="currentColor" />
      <polygon points="50,97 45.5,76 50,71 54.5,76" fill="currentColor" />
      <polygon points="3,50 24,45.5 29,50 24,54.5" fill="currentColor" />

      {/* 4 Diagonal medium diamond rays (NE, SE, SW, NW) */}
      <polygon points="83.2,16.8 68.5,35.8 64.2,35.8 64.2,31.5" fill="currentColor" />
      <polygon points="83.2,83.2 64.2,68.5 64.2,64.2 68.5,64.2" fill="currentColor" />
      <polygon points="16.8,83.2 31.5,64.2 35.8,64.2 35.8,68.5" fill="currentColor" />
      <polygon points="16.8,16.8 35.8,31.5 35.8,35.8 31.5,35.8" fill="currentColor" />

      {/* 4 Secondary fine rays */}
      <line x1="65" y1="14" x2="58" y2="30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="86" y1="65" x2="70" y2="58" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="35" y1="86" x2="42" y2="70" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14" y1="35" x2="30" y2="42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />

      {/* Inner solar astrolabe ring */}
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="50" cy="50" r="14.5" stroke="currentColor" strokeWidth="1" opacity="0.7" />

      {/* Central blazing core star */}
      <path
        d="M50 37 L53.4 46.6 L63 50 L53.4 53.4 L50 63 L46.6 53.4 L37 50 L46.6 46.6 Z"
        fill="currentColor"
      />
    </svg>
  );
}
