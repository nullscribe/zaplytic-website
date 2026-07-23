import { GITHUB_ORG_URL } from "@/loaders/product";

export type TeaserVariant = "more-coming" | "see-github" | "discuss";

interface TeaserCardProps {
  variant: TeaserVariant;
  href?: string;
}

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

const ICONS = {
  "more-coming": PlusIcon,
  "see-github": GitHubIcon,
  discuss: ChatIcon
} as const;

const LABELS = {
  "more-coming": "More coming",
  "see-github": "See our GitHub",
  discuss: "Want to discuss?"
} as const;

const SUBTITLES = {
  "more-coming": "We're building new ideas",
  "see-github": "More open source on the way",
  discuss: "Let's build something together"
} as const;

const ACCENTS = {
  "more-coming": {
    border: "border-cyan-500/50 hover:border-cyan-400",
    bg: "hover:bg-cyan-500/5",
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    label: "text-cyan-300",
    subtitle: "text-cyan-500/70"
  },
  discuss: {
    border: "border-emerald-500/50 hover:border-emerald-400",
    bg: "hover:bg-emerald-500/5",
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    label: "text-emerald-300",
    subtitle: "text-emerald-500/70"
  },
  "see-github": {
    border: "border-lime-500/50 hover:border-lime-400",
    bg: "hover:bg-lime-500/5",
    icon: "text-lime-400",
    iconBg: "bg-lime-500/10",
    label: "text-lime-300",
    subtitle: "text-lime-500/70"
  }
} as const;

export default function TeaserCard({ variant, href = "#" }: TeaserCardProps) {
  const Icon = ICONS[variant];
  const label = LABELS[variant];
  const subtitle = SUBTITLES[variant];
  const accent = ACCENTS[variant];
  const hrefValue = variant === "see-github" ? GITHUB_ORG_URL : href;
  const isLink = variant !== "more-coming";
  const Tag = isLink ? "a" : "div";

  return (
    <Tag
      href={isLink ? hrefValue : undefined}
      target={isLink ? "_blank" : undefined}
      rel={isLink ? "noopener noreferrer" : undefined}
      className={`product group flex h-full min-h-[28rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-800/30 p-5 text-center transition-colors ${accent.border} ${accent.bg}`}
      aria-label={label}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${accent.iconBg} ${accent.icon} transition-transform group-hover:scale-110`}
      >
        <Icon />
      </div>
      <p
        className={`mt-3 text-sm font-semibold uppercase tracking-wider ${accent.label}`}
      >
        {label}
      </p>
      <p className={`mt-1 text-xs ${accent.subtitle}`}>{subtitle}</p>
    </Tag>
  );
}
