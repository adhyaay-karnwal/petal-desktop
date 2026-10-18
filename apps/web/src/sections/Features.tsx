import { README_URL } from '../links';
import { ArrowUp, Check, Chevron as ChevronRight, FileCode, Folder } from '../ui/icons';
import { Feature, LearnMore, Reveal, Section, SectionHeader, ShotCard, TwoCol } from '../ui/primitives';

const fade = '[mask-image:linear-gradient(to_bottom,#000_70%,transparent)]';

/* ---------- 1. Design -> Style -> Code ---------- */

function StepCanvas() {
  return (
    <div className="flex h-full items-center justify-center">
      <ShotCard className="w-full max-w-[340px]">
        <img
          src="/step-canvas.webp"
          width={1200}
          height={1031}
          loading="lazy"
          decoding="async"
          alt="A frame of shadcn components on the Petal canvas, next to a card an agent just added."
          className="shot shot-dim"
        />
      </ShotCard>
    </div>
  );
}

function StepStyles() {
  return (
    <div className={`flex h-full justify-center overflow-hidden ${fade}`}>
      <ShotCard className="mt-2 w-[240px] self-start">
        <img
          src="/step-styles.webp"
          width={300}
          height={560}
          loading="lazy"
          decoding="async"
          alt="Petal's styles panel with position, layout, size, appearance, padding and background controls."
          className="shot shot-dim"
        />
      </ShotCard>
    </div>
  );
}

function StepCode() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <ShotCard className="w-full max-w-[340px]">
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-[12px] text-fg/80">
          <FileCode className="size-3.5 text-muted-fg" />
          NewComponent.tsx
          <span className="ml-auto text-muted-fg">React · Tailwind</span>
        </div>
        <img
          src="/step-code.webp"
          width={420}
          height={258}
          loading="lazy"
          decoding="async"
          alt="The code drawer showing the selected element exported as a React component."
          className="shot shot-dim"
        />
      </ShotCard>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 whitespace-nowrap" aria-hidden>
        <span className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[#111] px-3 text-[12.5px] font-medium text-white shadow-lg">
          Send to agent <ArrowUp className="size-3" />
        </span>
        <span className="flex h-8 items-center gap-1.5 rounded-[8px] bg-card px-3 text-[12.5px] font-medium text-fg shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_6px_16px_-8px_rgb(0_0_0/0.2)]">
          Copy code <kbd className="rounded border border-line px-1 font-mono text-[10px] text-muted-fg">⌘C</kbd>
        </span>
      </div>
    </div>
  );
}

export function StepsSection() {
  const steps = [
    {
      art: <StepCanvas />,
      label: '01·Design',
      title: 'Compose on the canvas',
      body: 'Drop in components, arrange frames, and keep every screen of a flow in view at once.',
    },
    {
      art: <StepStyles />,
      label: '02·Style',
      title: 'Tune it like a design tool',
      body: 'Padding, layout, radius and fills live in one panel, and the real component updates as you drag.',
    },
    {
      art: <StepCode />,
      label: '03·Code',
      title: 'Take the code with you',
      body: 'Copy clean React and Tailwind, or hand it straight to your agent. What you see is what ships.',
    },
  ];
  return (
    <Section id="features" label="steps-title">
      <SectionHeader
        id="steps-title"
        title="Lay it out visually, hand it off as React."
        intro="Every element on the canvas is a real component with real styles, so there is nothing to redline and nothing to rebuild."
      />
      <div className="mt-12 grid md:mt-14 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 90}
            className={`py-10 md:py-0 ${i > 0 ? 'border-t border-line md:border-t-0 md:border-l' : 'pt-0'} ${
              i === 0 ? 'md:pr-9' : i === 1 ? 'md:px-9' : 'md:pl-9'
            }`}
          >
            <div className="h-[280px] md:h-[300px]">{s.art}</div>
            <div className="mt-8">
              <Feature label={s.label} title={s.title}>
                {s.body}
              </Feature>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 md:mt-14">
        <LearnMore href={README_URL}>Read how Petal works</LearnMore>
      </div>
    </Section>
  );
}

/* ---------- 2. Agents ---------- */

function Terminal() {
  return (
    <div className="overflow-hidden rounded-[14px] bg-[#111] text-[12px] leading-[1.7] text-white/85 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)] ring-1 ring-black/10 dark:ring-white/10">
      <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
        </span>
        <span className="mx-auto pr-10 text-[11px] text-white/50">~/acme-web · your agent</span>
      </div>
      <div className="px-4 py-3.5 font-mono">
        <p>
          <span className="text-white/40">&gt;</span> put the PricingCard from components/ui on my Petal canvas
        </p>
        <p className="mt-2 text-white/55">● petal · add to canvas (MCP)</p>
        <p className="pl-3 text-white/55">└ placed PricingCard on “Components”</p>
        <p className="mt-2">
          Done. It uses your Button and Badge, and every prop is editable in Petal.
          <span className="caret ml-0.5 inline-block h-[1.05em] w-[0.5em] translate-y-[2px] bg-white/70" />
        </p>
      </div>
    </div>
  );
}

function AgentsArt() {
  return (
    <div className="mt-12 grid items-start gap-6 md:mt-16 md:grid-cols-[300px_minmax(0,1fr)] md:gap-10 lg:gap-14">
      <Reveal>
        <ShotCard className="mx-auto max-w-[300px]">
          <img
            src="/agent-chat.webp"
            width={300}
            height={440}
            loading="lazy"
            decoding="async"
            alt="Petal's agent panel: a request to add a pink button, the agent's summary of the change, and the message box."
            className="shot shot-dim"
          />
        </ShotCard>
      </Reveal>
      <div className="flex flex-col gap-6 md:pt-10">
        <Reveal delay={80} className="max-md:hidden">
          <ShotCard>
            <img
              src="/agent-connect.webp"
              width={1111}
              height={183}
              loading="lazy"
              decoding="async"
              alt="The Connect your agent card: Claude Code in Petal shows Connected, and the MCP server shows Server ready."
              className="shot shot-dim"
            />
          </ShotCard>
        </Reveal>
        <Reveal delay={160} className="md:ml-auto md:w-[88%]">
          <Terminal />
        </Reveal>
      </div>
    </div>
  );
}

export function AgentsSection() {
  return (
    <Section id="agents" label="agents-title">
      <SectionHeader
        id="agents-title"
        title="Bring the agent you already pay for."
        intro={
          <>
            Petal plugs into the subscriptions already on your machine. Run Claude Code in the side panel, or let Codex and Cursor drive the canvas over MCP.
          </>
        }
      />
      <AgentsArt />
      <TwoCol>
        <Feature title="Ask for changes right on the canvas">
          Select an element, describe what you want, and the agent edits exactly that element, with your selection sent
          along as context.
        </Feature>
        <Feature title="Work from your editor over MCP">
          Petal runs a local MCP server. Connect Claude Code, Codex, Cursor or any MCP client to place components and
          pull finished designs back into your repo.
        </Feature>
      </TwoCol>
      <LearnMore href={README_URL}>Set up an agent</LearnMore>
    </Section>
  );
}

/* ---------- 3. Figma paste ---------- */

function FigmaArt() {
  const sel = 'absolute size-[6px] border border-[#3b82f6] bg-white';
  return (
    <div className="relative h-full overflow-hidden rounded-[18px] bg-panel">
      <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[12px] whitespace-nowrap text-fg shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_20px_-10px_rgb(0_0_0/0.25)]">
        <Check className="size-3.5 text-emerald-600" />
        Pasted from Figma · 14 layers
      </div>
      <div className="absolute top-[72px] left-1/2 w-[248px] -translate-x-1/2">
        <p className="mb-1 text-[11px] text-[#3b82f6]">Sign in</p>
        <div className="relative rounded-[12px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06)] outline outline-1 outline-[#3b82f6]">
          <span className={`${sel} -top-[3.5px] -left-[3.5px]`} />
          <span className={`${sel} -top-[3.5px] -right-[3.5px]`} />
          <span className={`${sel} -bottom-[3.5px] -left-[3.5px]`} />
          <span className={`${sel} -right-[3.5px] -bottom-[3.5px]`} />
          <p className="text-[13px] font-semibold text-fg">Welcome back</p>
          <p className="mt-0.5 text-[10.5px] text-muted-fg">Sign in to continue to your workspace.</p>
          <div className="mt-3 h-7 rounded-[6px] border border-line px-2 text-[10.5px] leading-7 text-muted-fg">you@studio.com</div>
          <div className="mt-2 h-7 rounded-[6px] bg-primary text-center text-[10.5px] leading-7 font-medium text-primary-fg">Continue</div>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 left-4 rounded-[10px] bg-card px-3 py-2.5 font-mono text-[10.5px] leading-[1.6] text-fg/75 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_20px_-12px_rgb(0_0_0/0.25)]">
        <span className="text-[#8b5cf6]">&lt;Card</span> <span className="text-fg/50">className=</span>
        <span className="text-emerald-700 dark:text-emerald-400">"w-80 p-6"</span>
        <span className="text-[#8b5cf6]">&gt;</span>
        <br />
        &nbsp;&nbsp;<span className="text-[#8b5cf6]">&lt;Button&gt;</span>Continue<span className="text-[#8b5cf6]">&lt;/Button&gt;</span>
      </div>
    </div>
  );
}

function LayersArt() {
  return (
    <div className={`flex h-full justify-center overflow-hidden rounded-[18px] bg-panel ${fade}`}>
      <ShotCard className="mt-6 w-[280px] self-start">
        <img
          src="/layers.webp"
          width={602}
          height={1160}
          loading="lazy"
          decoding="async"
          alt="Petal's layer tree: frames, headings and text, with Button components marked in purple."
          className="shot shot-dim"
        />
      </ShotCard>
    </div>
  );
}

export function FigmaSection() {
  return (
    <Section id="figma" label="figma-title">
      <SectionHeader
        id="figma-title"
        title="Paste from Figma, keep it as code."
        intro="Copy a frame in Figma and paste it onto the canvas. Petal rebuilds it as editable elements with a real layer tree, so nothing gets redrawn by hand."
      />
      <div className="mt-12 grid md:mt-16 md:grid-cols-2">
        <Reveal className="pb-10 md:pr-12 md:pb-0">
          <div className="h-[300px] md:h-[340px]">
            <FigmaArt />
          </div>
          <div className="mt-8">
            <Feature title="Paste frames straight in">
              Layout, text and fills come across as HTML and Tailwind you can restyle on the canvas or swap for your own
              components.
            </Feature>
          </div>
        </Reveal>
        <Reveal delay={80} className="border-t border-line pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-12">
          <div className="h-[300px] md:h-[340px]">
            <LayersArt />
          </div>
          <div className="mt-8">
            <Feature title="Every layer is a real element">
              Components show up in purple in the layer tree, so you always know which pieces map back to your codebase.
            </Feature>
          </div>
        </Reveal>
      </div>
      <div className="mt-12">
        <LearnMore href={README_URL}>See what Petal can import</LearnMore>
      </div>
    </Section>
  );
}

/* ---------- 4. Design system import ---------- */

function RepoTree() {
  const row = 'flex items-center gap-2 py-[5px]';
  return (
    <ShotCard className="text-[13px] text-fg/85">
      <div className="flex items-center gap-2 border-b border-line bg-panel/60 px-4 py-3">
        <Folder className="size-4 text-muted-fg" />
        <span className="font-medium text-fg">acme-design-system</span>
        <span className="text-muted-fg">~/code</span>
      </div>
      <div className="px-4 py-3">
        <div className={row}>
          <ChevronRight className="size-3 rotate-90 text-muted-fg" />
          <Folder className="size-4 text-muted-fg" /> components
        </div>
        {['button.tsx', 'badge.tsx', 'card.tsx'].map((f) => (
          <div key={f} className={`${row} pl-9`}>
            <FileCode className="size-4 text-muted-fg" /> {f}
          </div>
        ))}
        <div className={row}>
          <ChevronRight className="size-3 text-muted-fg" />
          <Folder className="size-4 text-muted-fg" /> app
        </div>
      </div>
      <div className="border-t border-line px-4 py-3 font-mono text-[11.5px] leading-[1.9]">
        <p className="text-muted-fg">globals.css</p>
        {[
          ['--brand', '#e11d74'],
          ['--ink', '#1f1235'],
          ['--canvas', '#faf7fc'],
          ['--success', '#12a150'],
        ].map(([k, v]) => (
          <p key={k} className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] ring-1 ring-black/10" style={{ background: v }} />
            <span className="text-muted-fg">{k}:</span> {v};
          </p>
        ))}
      </div>
    </ShotCard>
  );
}

function ImportArrow() {
  return (
    <div className="flex items-center justify-center py-4 md:py-0" aria-hidden>
      <svg viewBox="0 0 120 12" className="hidden h-3 w-full text-line md:block" preserveAspectRatio="none">
        <circle cx="4" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 6H114" stroke="currentColor" strokeWidth="1.2" className="flow-dash" />
        <path d="M110 2l5 4-5 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="absolute rounded-[6px] border border-line bg-bg px-2 py-0.5 font-mono text-[10.5px] tracking-[0.18em] text-muted-fg">
        IMPORT
      </span>
    </div>
  );
}

export function DesignSystemSection() {
  return (
    <Section id="design-systems" label="ds-title">
      <SectionHeader
        id="ds-title"
        title="Your design system, on the canvas."
        intro="Point Petal at your repo and it pulls in your tokens and components. Design with the pieces your team already ships, then send the result back."
      />
      <Reveal className="mt-12 grid items-start md:mt-16 md:grid-cols-[300px_minmax(80px,1fr)_minmax(0,600px)]">
        <div>
          <p className="mb-3 text-[15px] text-muted-fg">Your repo</p>
          <RepoTree />
        </div>
        <div className="relative flex h-full items-center">
          <div className="relative w-full">
            <ImportArrow />
          </div>
        </div>
        <div>
          <p className="mb-3 text-[15px] text-muted-fg">Canvas</p>
          <ShotCard>
            <img
              src="/design-system.webp"
              width={1396}
              height={860}
              loading="lazy"
              decoding="async"
              alt="An imported @acme/design-system page on the Petal canvas, showing brand, ink, canvas and success colour tokens."
              className="shot shot-dim"
            />
          </ShotCard>
        </div>
      </Reveal>
      <TwoCol>
        <Feature title="Import a local folder">
          Open a project from disk to bring its components, colours and type scale onto the canvas.
        </Feature>
        <Feature title="Or start from GitHub">
          Connect a repository and Petal picks up its components and styles, ready to drag into any frame.
        </Feature>
      </TwoCol>
      <LearnMore href={README_URL}>Bring in your codebase</LearnMore>
    </Section>
  );
}

