import { useEffect, useState } from 'react';
import { Logo } from '../brand/Logo';
import { DOWNLOAD_MAC_URL, REPO_URL } from '../links';
import { Close, Menu } from '../ui/icons';

const links = [
  { href: '#features', label: 'Features', external: false },
  { href: REPO_URL, label: 'GitHub', external: true },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const solid = scrolled || open;
  const ext = (external: boolean) => (external ? { target: '_blank', rel: 'noopener noreferrer' } : {});

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav aria-label="Main" className="px-5 md:px-4">
        <div className="relative mx-auto max-w-[1120px]">
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-2.5 -right-2.5 -left-3.5 rounded-[28px] bg-bg/75 shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-10px_rgb(0_0_0/0.10)] backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-300 ease-out sm:-right-3 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-10px_rgb(0_0_0/0.6)] ${
              solid ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="relative flex items-center justify-between py-5">
            <a href="#top" aria-label="Petal home" className="flex shrink-0 items-center">
              <Logo />
            </a>
            <div className="flex items-center gap-3 max-sm:hidden">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...ext(l.external)}
                  className="px-1 py-1.5 text-sm font-medium text-ink transition-opacity hover:opacity-70"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={DOWNLOAD_MAC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-300 ${
                  scrolled ? 'bg-primary text-primary-fg hover:bg-primary/85' : 'text-ink hover:opacity-70'
                }`}
              >
                Download
              </a>
            </div>
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center text-ink transition-opacity hover:opacity-70 sm:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <Close className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          <div id="mobile-menu" hidden={!open} className="relative pb-4 sm:hidden">
            {[...links, { href: DOWNLOAD_MAC_URL, label: 'Download', external: true }].map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...ext(l.external)}
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
