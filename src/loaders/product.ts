export type ProductCategory = "saas" | "oss" | "client";

export interface Product {
  name: string;
  description: string;
  technologies: string[];
  category: ProductCategory;
  liveLink?: string;
  githubLink?: string;
}

export const products: Product[] = [
  {
    name: "ZapRoute",
    category: "saas",
    liveLink: "https://zaproute.com.bd",
    technologies: ["Ruby on Rails", "Hotwire", "PostgreSQL"],
    description: "A modern travel agency ERP that keeps things simple."
  },
  {
    name: "ZapMemo",
    category: "saas",
    technologies: ["Ruby on Rails", "Hotwire", "PostgreSQL"],
    description:
      "Digital memo and receipt system for small shops — fast, offline-first, no install required."
  },
  {
    name: "Kanon Academy",
    category: "client",
    liveLink: "https://kanon-academy.pages.dev/",
    technologies: ["TypeScript", "React", "Node.js"],
    description: "Online learning platform."
  },
  {
    name: "AMC-Booster",
    liveLink: "https://amcbooster.com",
    category: "client",
    technologies: ["Ruby on Rails", "Hotwire", "PostgreSQL"],
    description: "Medical academic course platform."
  },
  {
    name: "RailGuard",
    category: "oss",
    githubLink: "https://github.com/zaplytic/railguard",
    technologies: ["TypeScript", "Node.js", "PostgreSQL"],
    description: "Self-hosted crash reporting, performance and error monitoring."
  }
];

export const GITHUB_ORG_URL = "https://github.com/zaplytic";
