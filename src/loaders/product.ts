import kanonAcademy from "@/assets/kanon-academy.webp";
import adorn from "@/assets/adorn.webp";
import railguard from "@/assets/railguard.webp";
import neonGadgets from "@/assets/neongadgets.webp";
import zaproute from "@/assets/zaproute.webp";

export interface Product {
  name: string;
  description: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
  image: string;
}

export const products = [
  {
    name: "ZapRoute",
    liveLink: "https://zaproute.ddns.net",
    technologies: ["Ruby on Rails", "Hotwire", "PostgreSQL"],
    description: "A modern travel agency erp that keep things simple",
    image: zaproute
  },
  {
    name: "RailGuard",
    description: "A powerful, self-hosted crash reporting, performance and error monitoring tool.",
    technologies: ["TypeScript", "Node.js", "PostgreSQL"],
    githubLink: "https://github.com/zaplytic/railguard",
    image: railguard
  },
  {
    name: "Kanon Academy",
    description: "Online Learning Platform",
    technologies: ["TypeScript", "React", "Node.js"],
    githubLink: "https://github.com/zaplytic/kanon-academy",
    liveLink: "https://kanon-academy.pages.dev/",
    image: kanonAcademy
  },
  {
    name: "neongadgets",
    description: "An electronics ecommerce shop",
    technologies: ["Ruby", "Ruby on Rails", "PostgreSQL"],
    githubLink: "https://github.com/zaplytic/neongadgets",
    image: neonGadgets
  },
  {
    name: "adorn",
    description: "Ornaments eShop in Bangladesh",
    technologies: ["Ruby", "Ruby on Rails", "PostgreSQL"],
    githubLink: "https://github.com/zaplytic/adorn",
    image: adorn
  }
] satisfies Product[];
