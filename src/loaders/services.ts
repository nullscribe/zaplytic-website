export type ServiceIconName =
  | "website"
  | "app"
  | "erp"
  | "ecommerce"
  | "support";

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: ServiceIconName;
  feature: boolean;
  highlights?: string[];
}

export const services: Service[] = [
  {
    id: "custom-websites",
    title: "Custom Websites",
    description:
      "A professional website for your business, shop, or personal brand — built to look great on every device and easy for customers to find.",
    iconName: "website",
    feature: true,
    highlights: [
      "Mobile-friendly and fast-loading",
      "Designed to match your brand",
      "Easy to update yourself",
      "Ready in days, not months",
      "Helps customers find you on Google",
      "Free hosting setup included"
    ]
  },
  {
    id: "mobile-apps",
    title: "Mobile Apps",
    description:
      "Native apps for Android and iOS — for bookings, orders, and on-the-go management.",
    iconName: "app",
    feature: false
  },
  {
    id: "business-software",
    title: "Business Software (ERP / POS)",
    description:
      "Inventory, billing, and receipt systems for small shops and growing businesses.",
    iconName: "erp",
    feature: false
  },
  {
    id: "ecommerce-solutions",
    title: "E-commerce Solutions",
    description: "Online stores to sell your products across Bangladesh.",
    iconName: "ecommerce",
    feature: false
  },
  {
    id: "ongoing-support",
    title: "Ongoing Support",
    description:
      "Updates, fixes, and help so your software keeps running smoothly.",
    iconName: "support",
    feature: false
  }
];
