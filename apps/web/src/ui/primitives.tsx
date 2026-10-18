import { useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from 'react';
import { ArrowRight } from './icons';

/** Adds `.is-in` when the element scrolls into view (CSS handles the motion + reduced-motion). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export const container = 'mx-auto w-[min(1120px,calc(100%-40px))] md:w-[min(1120px,calc(100%-32px))]';

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'lg';
  className?: string;
  external?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
};

export function Button({ href, children, variant = 'primary', size = 'lg', className = '', external = true, ...rest }: BtnProps) {
  const v =
    variant === 'primary'
      ? 'bg-primary text-primary-fg hover:bg-primary/85'
      : 'bg-muted text-fg hover:bg-muted/70 dark:hover:bg-white/15';
  const s = size === 'lg' ? 'h-10 px-6 text-sm' : 'h-8 px-3 text-sm';
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 ${v} ${s} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

export function LearnMore({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-[15px] leading-[22.5px] font-medium text-fg/70 transition-colors hover:text-fg"
    >
      <span className="border-b border-current/30 pb-px group-hover:border-current">{children}</span>
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

/** A content section with the hairline rule on top, Lunagraph-style. */
export function Section({ id, children, className = '', label }: { id?: string; children: ReactNode; className?: string; label?: string }) {
  return (
    <section id={id} aria-labelledby={label} className={`${container} scroll-mt-20 ${className}`}>
      <hr className="border-0 border-t border-line" />
      <div className="pt-[72px] pb-[72px] md:pt-[90px] md:pb-[90px]">{children}</div>
    </section>
  );
}

export function SectionHeader({ id, title, intro, center = false }: { id: string; title: ReactNode; intro: ReactNode; center?: boolean }) {
  return (
    <Reveal className={center ? 'text-center' : ''}>
      <h2 id={id} className="font-display text-[32px] leading-[1.1] text-ink md:text-[40px]">
        {title}
      </h2>
      <p
        className={`mt-4 max-w-[720px] text-[17px] leading-[1.5] text-pretty text-body md:mt-5 md:text-[18px] ${center ? 'mx-auto' : ''}`}
      >
        {intro}
      </p>
    </Reveal>
  );
}

export function Feature({ title, children, label }: { title: string; children: ReactNode; label?: string }) {
  return (
    <div>
      {label && <p className="mb-3 font-mono text-[12px] tracking-[0.1em] text-muted-fg uppercase">{label}</p>}
      <h3 className="text-[20px] leading-[1.3] font-medium tracking-[-0.02em] text-ink md:text-[16px]">{title}</h3>
      <p className="mt-2 max-w-[440px] text-[16px] leading-[1.55] text-copy">{children}</p>
    </div>
  );
}

/** Two text columns separated by a vertical rule (stacked with a horizontal rule on mobile). */
export function TwoCol({ children }: { children: [ReactNode, ReactNode] }) {
  return (
    <div className="mt-12 grid md:mt-12 md:grid-cols-2">
      <Reveal className="pb-10 md:py-12 md:pr-12">{children[0]}</Reveal>
      <Reveal delay={80} className="border-t border-line pt-10 pb-10 md:border-t-0 md:border-l md:py-12 md:pl-12">
        {children[1]}
      </Reveal>
    </div>
  );
}

/** Rounded light frame used behind cropped screenshots. */
export function ShotCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[18px] bg-card shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_48px_-24px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_24px_48px_-24px_rgb(0_0_0/0.7)] ${className}`}
    >
      {children}
    </div>
  );
}
