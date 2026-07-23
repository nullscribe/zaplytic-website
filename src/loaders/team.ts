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
  description: string;
  accent: "cyan" | "lime" | "emerald" | "indigo";
}

export const values: Value[] = [
  {
    title: "Open-source first",
    description: "Wherever we can, we build in the open. Collaboration beats silos.",
    accent: "cyan"
  },
  {
    title: "Quality over quantity",
    description: "Fewer things, done well. We ship when it actually solves the problem.",
    accent: "lime"
  },
  {
    title: "Empower everyone",
    description: "Developers, businesses, and individuals — tools should work for all three.",
    accent: "emerald"
  },
  {
    title: "Built for the real world",
    description: "Every product starts from a real problem we've seen firsthand.",
    accent: "indigo"
  }
];

export const CONTACT_EMAIL = "zaplytic@gmail.com";

export const socials = [
  { label: "Email", href: `mailto:${CONTACT_EMAIL}` },
  { label: "Twitter", href: "https://www.twitter.com" },
  { label: "GitHub", href: "https://www.github.com/zaplytic" },
  { label: "Slack", href: "https://www.slack.com" }
] as const;
