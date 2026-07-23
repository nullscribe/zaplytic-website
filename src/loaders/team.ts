export type Role = "Founder & Engineer" | "Product R&D" | "Design" | "Corporate Relations";

export interface Member {
  name: string;
  role: Role;
  bio: string;
}

export const team: Member[] = [
  {
    name: "Jahid Hasan Imon",
    role: "Founder & Engineer",
    bio: "Leads engineering and builds the products end-to-end."
  },
  {
    name: "Tanvir Mahmud",
    role: "Product R&D",
    bio: "Drives product research, planning, and roadmap."
  },
  {
    name: "Rehnuma Tabassum",
    role: "Design",
    bio: "Owns visual design and product UX across everything we ship."
  },
  {
    name: "Tushar Patowary",
    role: "Corporate Relations",
    bio: "Manages client and partner relationships so projects keep moving."
  }
];

export interface Value {
  title: string;
  principle: string;
  description: string;
  accent: "cyan" | "lime" | "emerald" | "indigo";
  icon: "robust" | "promise" | "empower" | "real-world" | "simple" | "trust";
}

export const values: Value[] = [
  {
    title: "Robust software",
    principle: "Built to last",
    description:
      "Software should keep working, not just ship. We invest in the boring parts — error handling, tests, observability — so what we build stays reliable under real load and real mistakes.",
    accent: "cyan",
    icon: "robust"
  },
  {
    title: "Keep our promises",
    principle: "Say what we'll do, then do it",
    description:
      "Deadlines, scopes, and support commitments mean something to us. We'd rather renegotiate a promise upfront than quietly miss it later. Trust is built by doing what we said we would.",
    accent: "lime",
    icon: "promise"
  },
  {
    title: "Empower everyone",
    principle: "Tools for all three",
    description:
      "Developers, businesses, and individuals shouldn't need three different products. The same tool should respect a hobbyist's weekend and a team's production stack — without forcing anyone up a pricing ladder.",
    accent: "emerald",
    icon: "empower"
  },
  {
    title: "Real problem solving",
    principle: "From problems we've seen",
    description:
      "Every product starts from a real problem we've hit firsthand — not a trend we're chasing. If we wouldn't use it ourselves, it doesn't ship.",
    accent: "indigo",
    icon: "real-world"
  },
  {
    title: "Earn trust, not lock-in",
    principle: "Yours to keep",
    description:
      "Your data, your exports, your exit. We win by being the best choice, not the only one. No proprietary formats, no hostage data, no quiet renewals.",
    accent: "cyan",
    icon: "trust"
  },
  {
    title: "Default to simple",
    principle: "Remove, don't add",
    description:
      "Complexity is easy; simplicity is hard. We'd rather remove a feature than bury it behind a setting. The best config is no config, and the best button is the one we didn't ship.",
    accent: "indigo",
    icon: "simple"
  }
];

export const CONTACT_EMAIL = "zaplytic@gmail.com";

export const socials = [
  { label: "Email", href: `mailto:${CONTACT_EMAIL}` },
  { label: "Twitter", href: "https://www.twitter.com" },
  { label: "GitHub", href: "https://www.github.com/zaplytic" },
  { label: "Slack", href: "https://www.slack.com" }
] as const;
