import { useEffect, useState, type ReactNode } from 'react';
import { Logo } from '../brand/Logo';
import {
  ALL_RELEASES_URL,
  DOWNLOAD_MAC_URL,
  DOWNLOAD_WINDOWS_URL,
  ISSUES_URL,
  README_URL,
  REPO_URL,
} from '../links';
import { Bolt, Brackets, Cursor, HardDrive, Laptop, Monitor, Moon, Sun, Tag, UserOff } from '../ui/icons';
import { Button, Reveal, Section, SectionHeader, container } from '../ui/primitives';
import { Selection } from './Hero';

/* ---------- Free + local (replaces Lunagraph's community gallery) ---------- */

const facts = [
  { icon: UserOff, title: 'No sign-up', body: 'Open the app and start designing. There is no account to create and no trial clock.' },
  { icon: HardDrive, title: 'Files stay on your disk', body: 'Projects, settings and history live on your computer, not in someone else’s workspace.' },
  { icon: Bolt, title: 'Your own agent', body: 'Petal uses the Claude Code, Codex or Cursor subscription you already have.' },
  { icon: Brackets, title: 'Plain React output', body: 'What you export is ordinary React and Tailwind. No runtime, no proprietary format.' },
  { icon: Laptop, title: 'macOS and Windows', body: 'Native builds for Apple Silicon Macs and 64-bit Windows, updated with every release.' },
  { icon: Tag, title: 'Free to use', body: 'No seats, no tiers, no paywalled features. Download it and it is yours.' },
];

export function LocalSection() {
  return (
    <Section id="local" label="local-title">
      <div className="md:pt-[60px]">
        <SectionHeader
          id="local-title"
          center
          title={<span className="text-[34px] md:text-[48px]">Free, and it runs on your machine.</span>}
          intro="No account, no cloud workspace, no seat licences. Petal is a desktop app that keeps your work where it belongs."
        />
      </div>
      <ul className="mt-12 grid md:mt-14 md:grid-cols-3">
        {facts.map(({ icon: I, title, body }, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <Reveal
              as="li"
              key={title}
              delay={col * 80}
              className={[
                'py-7 md:py-8',
                i > 0 ? 'border-t border-line' : 'pt-2',
                row === 0 ? 'md:border-t-0 md:pt-2' : 'md:border-t md:pt-8',
                row === 0 ? 'md:pb-8' : 'md:pb-2',
                col === 0 ? 'md:pr-6' : col === 1 ? 'md:border-l md:border-line md:px-6' : 'md:border-l md:border-line md:pl-6',
              ].join(' ')}
            >
              <span className="grid size-10 place-items-center rounded-[12px] bg-muted text-fg">
                <I className="size-[18px]" />
              </span>
              <h3 className="mt-4 text-[15px] font-medium text-[#111] dark:text-fg">{title}</h3>
              <p className="mt-1.5 text-[15px] leading-[1.45] text-copy">{body}</p>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

/* ---------- Closing CTA: a selected frame with floating property chips ---------- */

function Chip({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute flex items-center gap-2 rounded-[12px] bg-card py-1.5 pr-1.5 pl-3 text-[11px] text-fg shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_12px_28px_-12px_rgb(0_0_0/0.22)] md:text-[12px] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_12px_28px_-12px_rgb(0_0_0/0.8)] ${className}`}
    >
      <span className="text-fg/70">{label}</span>
      <span className="flex items-center gap-2 rounded-[7px] border border-line px-2 py-1 text-fg/80">{children}</span>
    </div>
  );
}

export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className={`${container} pt-[100px] pb-[110px] md:pt-[150px] md:pb-[150px]`}>
      <Reveal className="relative mx-auto max-w-[560px]">
        <div className="relative rounded-[28px] border border-black/[0.08] bg-card px-6 py-14 text-center md:rounded-[32px] md:px-10 md:py-[72px] dark:border-white/10">
          <Selection className="-inset-px rounded-[2px]" />
          <h2 id="cta-title" className="font-display text-[36px] leading-[1.05] text-ink md:text-[52px]">
            Make something real.
          </h2>
          <p className="mx-auto mt-4 max-w-[400px] text-[17px] leading-normal text-body md:text-[18px]">
            Petal is free for macOS and Windows.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button href={DOWNLOAD_MAC_URL} className="md:text-base" aria-label="Download Petal for macOS (Apple Silicon)">
              Download for Mac
            </Button>
            <Button href={DOWNLOAD_WINDOWS_URL} variant="secondary" className="md:text-base" aria-label="Download Petal for Windows">
              Windows
            </Button>
          </div>
        </div>
        <Chip label="Radius" className="float-y -top-[22px] left-0 md:-top-[22px] md:-left-[128px]">
          <span className="text-muted-fg">◰</span> 28 <span className="text-muted-fg">px</span>
          <Cursor className="cursor-nudge absolute -right-1 -bottom-5 size-5" />
        </Chip>
        <Chip label="Fill" className="-top-[22px] right-0 md:top-[36px] md:-right-[150px]">
          <span className="size-3 rounded-[3px] border border-line bg-card" /> <span className="dark:hidden">FFFFFF</span>
          <span className="hidden dark:inline">141414</span> <span className="text-muted-fg">100%</span>
        </Chip>
        <Chip label="Border" className="-bottom-[22px] left-0 md:bottom-[56px] md:-left-[190px]">
          <span className="size-3 rounded-[3px] border border-line bg-black/10 dark:bg-white/10" /> <span className="dark:hidden">000000</span>
          <span className="hidden dark:inline">FFFFFF</span> <span className="text-muted-fg">{'8%'}</span>
        </Chip>
        <Chip label="Shadow" className="float-y right-0 -bottom-[22px] md:-right-[96px] md:-bottom-[24px]">
          <span className="text-muted-fg">❏</span> 0 <span className="text-muted-fg">px</span>
        </Chip>
      </Reveal>
    </section>
  );
}

/* ---------- Footer ---------- */

type Theme = 'system' | 'light' | 'dark';

function applyTheme(t: Theme) {
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const t = localStorage.getItem('petal-theme');
      return t === 'light' || t === 'dark' ? t : 'system';
    } catch {
      return 'system';
    }
  });
  useEffect(() => {
    applyTheme(theme);
    try {
      if (theme === 'system') localStorage.removeItem('petal-theme');
      else localStorage.setItem('petal-theme', theme);
    } catch {
      /* storage blocked */
    }
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => applyTheme('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [theme]);

  const opts: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: 'system', label: 'System', Icon: Monitor },
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="Theme" className="flex items-center gap-0.5 rounded-full border border-line p-0.5">
      {opts.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
            theme === value ? 'bg-muted text-fg' : 'text-muted-fg hover:text-fg'
          }`}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

const footerCols = [
  {
    title: 'Download',
    links: [
      { label: 'macOS (Apple Silicon)', href: DOWNLOAD_MAC_URL },
      { label: 'Windows', href: DOWNLOAD_WINDOWS_URL },
      { label: 'All releases', href: ALL_RELEASES_URL },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: REPO_URL },
      { label: 'Report an issue', href: ISSUES_URL },
      { label: 'Readme', href: README_URL },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Agents', href: '#agents' },
      { label: 'Design systems', href: '#design-systems' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-line">
      <div className={`${container} flex flex-col items-start justify-between gap-10 py-16 md:flex-row`}>
        <a href="#top" aria-label="Petal home">
          <Logo />
        </a>
        <div className="flex flex-wrap gap-x-12 gap-y-10 md:gap-24">
          {footerCols.map((c) => (
            <nav key={c.title} aria-label={c.title} className="flex min-w-[140px] flex-col gap-2 md:min-w-0">
              <h3 className="text-base font-medium text-fg">{c.title}</h3>
              {c.links.map((l) => {
                const external = l.href.startsWith('http');
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-base text-muted-fg transition-colors hover:text-fg"
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>
          ))}
        </div>
      </div>
      <div className={`${container} flex items-center justify-between gap-4 py-6`}>
        <p className="text-sm text-muted-fg">© {new Date().getFullYear()} Petal. Runs on your machine.</p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
