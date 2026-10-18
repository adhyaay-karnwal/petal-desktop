import { useEffect, useState } from 'react';
import { LOGO_MARK_URL } from '../brand/Logo';
import { DOWNLOAD_MAC_URL, DOWNLOAD_WINDOWS_URL } from '../links';
import { ArrowUp, Cube, Cursor, Home, Knot, Plug, Plus, Spark } from '../ui/icons';
import { Button, Reveal, container } from '../ui/primitives';

const WORDS = ['ships.', 'runs.', 'works.'];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Canvas-style selection box with corner handles, in Petal pink. */
export function Selection({ className = '' }: { className?: string }) {
  const h = 'absolute size-[7px] border border-petal bg-white';
  return (
    <span aria-hidden className={`pointer-events-none absolute border border-petal ${className}`}>
      <span className={`${h} -top-[4px] -left-[4px]`} />
      <span className={`${h} -top-[4px] -right-[4px]`} />
      <span className={`${h} -bottom-[4px] -left-[4px]`} />
      <span className={`${h} -right-[4px] -bottom-[4px]`} />
    </span>
  );
}

function Headline() {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), 2800);
    return () => window.clearInterval(t);
  }, [reduced]);
  const word = reduced ? WORDS[0] : WORDS[i];

  return (
    <h1 id="hero-title" className="font-display m-0 w-full text-center text-[clamp(38px,10vw,72px)] leading-[1.05] tracking-[-0.01em] text-ink">
      <span className="sr-only">Design that ships.</span>
      <span aria-hidden className="block whitespace-nowrap">
        Design that{' '}
        <span className="relative inline-block px-[0.06em]">
          <span key={word} className="word-in inline-block">
            {word}
          </span>
          <Selection className="-inset-x-[0.02em] top-[0.12em] -bottom-[0.06em]" />
          <span className="absolute -top-[1.35em] left-0 rounded-[4px] bg-petal px-1.5 py-0.5 font-sans text-[11px] leading-none font-medium tracking-normal text-white md:text-[12px]">
            Text
          </span>
          <Cursor className="cursor-nudge absolute -right-[0.22em] -bottom-[0.32em] size-[0.34em] max-w-6 min-w-4" />
        </span>
      </span>
    </h1>
  );
}

function ChatOverlay() {
  return (
    <div className="float-y absolute bottom-[-56px] left-[-16px] hidden w-[264px] rounded-[16px] bg-card p-3 text-[11.5px] leading-[1.5] shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_24px_48px_-16px_rgb(0_0_0/0.22)] lg:block dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_24px_48px_-16px_rgb(0_0_0/0.8)]">
      <div className="ml-auto w-fit max-w-[210px] rounded-[10px] bg-muted px-3 py-2 text-fg/80">
        Add a card that says hello, with a Ship it button.
      </div>
      <p className="mt-2.5 text-muted-fg">Worked for 9s · Made 1 change</p>
      <p className="mt-1 text-fg/80">
        Placed a <b className="font-semibold text-fg">Card</b> next to your components, using your Button.
      </p>
      <div className="mt-3 rounded-[10px] border border-line px-2.5 pt-2 pb-1.5">
        <p className="text-muted-fg">Ask for a change</p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          <Spark className="size-3" />
          <span className="text-fg/80">Sonnet 5</span>
          <span className="text-muted-fg">High</span>
          <Plus className="ml-auto size-3.5 text-muted-fg" />
          <span className="grid size-5 place-items-center rounded-md bg-muted">
            <ArrowUp className="size-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  return (
    <div className="relative">
      <figure className="m-0 overflow-hidden rounded-[18px] border border-black/[0.08] bg-[#f6f6f6] shadow-[0_40px_80px_-32px_rgb(0_0_0/0.28),0_12px_24px_-12px_rgb(0_0_0/0.08)] md:rounded-[24px] dark:border-white/10 dark:bg-[#1b1b1b] dark:shadow-[0_40px_80px_-32px_rgb(0_0_0/0.9)]">
        {/* window chrome */}
        <div className="flex h-[38px] items-center gap-3 border-b border-black/[0.06] px-3.5 md:h-[40px] dark:border-white/10">
          <span className="flex gap-2" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </span>
          <Home className="ml-3 size-4 text-black/50 max-sm:hidden dark:text-white/50" />
          <span className="flex h-[26px] items-center gap-2 rounded-[7px] border border-black/[0.08] bg-white px-2.5 text-[11px] text-black/80 dark:border-white/10 dark:bg-white/10 dark:text-white/80">
            <img src={LOGO_MARK_URL} alt="" className="size-3" />
            Packaged test
          </span>
          <span className="flex items-center gap-2 text-[11px] text-black/45 max-md:hidden dark:text-white/45">Design System</span>
          <Plus className="size-3.5 text-black/45 dark:text-white/45" />
        </div>
        <picture>
          <source media="(max-width: 639px)" srcSet="/hero-editor-mobile.webp" width={1200} height={923} />
          <img
            src="/hero-editor.webp"
            width={2400}
            height={1471}
            alt="The Petal editor: a layer tree of shadcn components on the left, a canvas with buttons, badges, a form card and an AI-added card in the middle, and the code drawer below."
            className="shot shot-dim"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </figure>
      <ChatOverlay />
    </div>
  );
}

const agents = [
  { icon: Spark, name: 'Claude Code' },
  { icon: Knot, name: 'Codex' },
  { icon: Cube, name: 'Cursor' },
];

function AgentStrip() {
  return (
    <div className={`${container} mt-10 flex flex-col gap-6 md:mt-[96px] lg:flex-row lg:items-start lg:justify-between`}>
      <Reveal as="p" className="max-w-[520px] text-[15px] leading-[1.55] text-body md:text-[18px]">
        <span className="text-fg">Use the agent you already have.</span> Chat with it inside Petal, or point it at Petal&rsquo;s
        MCP server from wherever you code.
      </Reveal>
      <Reveal delay={100} className="lg:pt-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[13.5px] text-fg md:text-[15px]" aria-label="Works with">
          {agents.map(({ icon: I, name }, n) => (
            <li key={name} className={`flex items-center gap-1.5 ${n === 0 ? 'lg:border-r lg:border-line lg:pr-5' : ''}`}>
              <I className="size-4" />
              {name}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="text-fg/80">or any client over</span>
            <Plug className="size-4" />
            MCP
          </li>
        </ul>
      </Reveal>
    </div>
  );
}

export function Hero() {
  return (
    <div id="top">
      <section aria-labelledby="hero-title" className="flex flex-col items-center px-5 pt-[136px] md:pt-[168px]">
        <div className="flex w-full max-w-[820px] flex-col items-center gap-6 md:gap-8">
          <Headline />
          <p className="m-0 max-w-[720px] text-center text-[clamp(17px,4.8vw,20px)] leading-normal tracking-[-0.02em] text-pretty text-body">
            Shape real React components on a canvas, next to your coding agent.{' '}
            <br className="max-sm:hidden" />
            Free, local, and ready to hand off.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href={DOWNLOAD_MAC_URL} aria-label="Download Petal for macOS (Apple Silicon)">
              Download for Mac
            </Button>
            <Button href={DOWNLOAD_WINDOWS_URL} variant="secondary" aria-label="Download Petal for Windows">
              Windows
            </Button>
          </div>
        </div>
      </section>
      <div className="mx-auto mt-12 w-[min(1200px,calc(100%-40px))] md:mt-16">
        <Reveal>
          <Showcase />
        </Reveal>
      </div>
      <AgentStrip />
    </div>
  );
}
