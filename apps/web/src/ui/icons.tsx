import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const ArrowRight = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Menu = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
export const Close = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Apple = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.4-1-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);
export const Windows = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M3 5.5l7.5-1v7H3v-6zm0 13l7.5 1v-7H3v6zm8.5 1.2L21 21v-8.5h-9.5v7.2zm0-15.4v7.2H21V3l-9.5 1.3z" />
  </svg>
);

/* Neutral glyphs for the agent row (not vendor logos). */
export const Spark = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
  </svg>
);
export const Knot = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 9.5l2.5 2.5-2.5 2.5M13 15h3" />
  </svg>
);
export const Cube = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6z" />
    <path d="M4 7.4l8 4.6 8-4.6M12 12v9.2" />
  </svg>
);
export const Plug = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 3v4M15 3v4M7 7h10v4a5 5 0 01-10 0V7zM12 16v5" />
  </svg>
);

/* Small UI glyphs */
export const Folder = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3.5 6.5a1.5 1.5 0 011.5-1.5h4l2 2h8a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0119 19H5a1.5 1.5 0 01-1.5-1.5v-11z" />
  </svg>
);
export const FileCode = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
    <path d="M14 3v5h5M10 13l-2 2 2 2M14 13l2 2-2 2" />
  </svg>
);
export const Chevron = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const Frame = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />
  </svg>
);
export const Diamond = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l9 9-9 9-9-9 9-9z" />
  </svg>
);
export const ArrowUp = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Plus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Home = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1v-8.5z" />
  </svg>
);
export const Cursor = (p: P) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden {...p}>
    <path d="M5 3l14 7.5-6.2 1.6L10 18.5 5 3z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

/* Fact grid glyphs */
export const UserOff = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.4 3.6-5.5 7-5.5 1.4 0 2.6.3 3.7.9M3 3l18 18" />
  </svg>
);
export const HardDrive = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M5.5 13l2.2-7.2A2 2 0 019.6 4.4h4.8a2 2 0 011.9 1.4L18.5 13M7 16.5h.01M10.5 16.5h.01" />
  </svg>
);
export const Bolt = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" />
  </svg>
);
export const Brackets = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 5l-5 7 5 7M16 5l5 7-5 7M13.5 4l-3 16" />
  </svg>
);
export const Laptop = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2.5 19h19" />
  </svg>
);
export const Tag = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3.5 12.2V4.5a1 1 0 011-1h7.7l8.3 8.3a1.4 1.4 0 010 2l-6.2 6.2a1.4 1.4 0 01-2 0L3.5 12.2z" />
    <circle cx="8" cy="8" r="1.3" />
  </svg>
);
export const Monitor = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16v4" />
  </svg>
);
export const Sun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </svg>
);
export const Moon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
  </svg>
);
