import { GITHUB_ORG_URL } from "@/loaders/product";

export type TeaserVariant = "more-coming" | "see-github" | "discuss";

interface TeaserCardProps {
  variant: TeaserVariant;
  href?: string;
}

const CYAN = "#06b6d4";

const PlusIcon = () => (
  <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
    <path
      d="M24 8 v32 M8 24 h32"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1 1.8.5 2.2.7.1-1 .4-1.7.7-2.1-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
    <path
      d="M4 5h16v11H8l-4 4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default function TeaserCard({ variant, href = "#" }: TeaserCardProps) {
  if (variant === "more-coming") {
    return (
      <div
        className="product flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-800/30 p-6 text-center transition-colors hover:border-cyan-500/50 hover:bg-neutral-800/50"
        aria-label="More products coming soon"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-700/50 text-neutral-400 transition-colors group-hover:text-cyan-400">
          <PlusIcon />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          More coming
        </p>
        <p className="mt-1 text-xs text-neutral-600">We're building new ideas</p>
      </div>
    );
  }

  if (variant === "see-github") {
    return (
      <a
        href={GITHUB_ORG_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="product group flex h-full flex-col items-center justify-center rounded-2xl border border-lime-500/30 bg-neutral-800/40 p-6 text-center transition-all hover:border-lime-400/60 hover:bg-neutral-800/70 hover:shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]"
        aria-label="See our GitHub"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-500/10 text-lime-400 transition-transform group-hover:scale-110">
          <GitHubIcon />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-neutral-300">
          See our GitHub
        </p>
        <p className="mt-1 text-xs text-neutral-500">More open source on the way</p>
      </a>
    );
  }

  return (
    <a
      href={href}
      className="product group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-lime-500/5 p-6 text-center transition-all hover:border-cyan-400/60 hover:shadow-[0_0_30px_-8px_rgba(6,182,212,0.5)]"
      aria-label="Want to discuss a project?"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px circle at 50% 30%, ${CYAN}22, transparent 60%)`
        }}
      />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 transition-transform group-hover:scale-110">
        <ChatIcon />
      </div>
      <p className="relative mt-4 text-lg font-semibold text-neutral-200">
        Want to discuss?
      </p>
      <p className="relative mt-1 text-sm text-neutral-400">
        Let's build something together
      </p>
    </a>
  );
}
