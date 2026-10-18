import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { AgentsSection, DesignSystemSection, FigmaSection, StepsSection } from './sections/Features';
import { ClosingCta, Footer, LocalSection } from './sections/Closing';

export function App() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-fg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Hero />
        <div className="mt-[72px] md:mt-[110px]">
          <StepsSection />
          <AgentsSection />
          <FigmaSection />
          <DesignSystemSection />
          <LocalSection />
        </div>
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
