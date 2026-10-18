/**
 * Petal logo. This is the only place the brand mark is referenced.
 * To swap in a new mark, change the import below (e.g. `./v2/logo.svg`).
 */
// Animated Petal mark (recreation of @Metagravity0's logo; see tools/brand/v2/NOTES.md).
import markUrl from './v2/logo-animated-pink.svg';

export const LOGO_MARK_URL = markUrl;

type LogoProps = { className?: string; showWordmark?: boolean };

export function Logo({ className = '', showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={markUrl} alt="" width={28} height={28} className="size-7 shrink-0" draggable={false} />
      {showWordmark && (
        <span className="font-brand text-[21px] leading-none font-bold tracking-[-0.03em] text-ink">Petal</span>
      )}
    </span>
  );
}
