import { products, type ProductCategory } from "@/loaders/product";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedBackground from "@/components/AnimatedBackground";
import ProductCard from "@/components/ProductCard";
import TeaserCard from "@/components/TeaserCard";

const SECTION_LABELS: Record<ProductCategory, string> = {
  saas: "In-House SaaS",
  client: "Client Projects",
  oss: "Open Source"
};

function Section({ category }: { category: ProductCategory }) {
  const items = products.filter((p) => p.category === category);

  return (
    <section className="mt-8 sm:mt-10">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle">
        {SECTION_LABELS[category]}
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
        {category === "saas" && <TeaserCard variant="more-coming" />}
        {category === "client" && <TeaserCard variant="discuss" href="/about#contact" />}
        {category === "oss" && <TeaserCard variant="see-github" />}
      </div>
    </section>
  );
}

export default function Products() {
  useGSAP(() => {
    gsap.from(".product", {
      scale: 0.6,
      opacity: 0,
      duration: 0.25,
      stagger: 0.05
    });
    gsap.from(".title,.subtitle", {
      yPercent: 100,
      opacity: 0,
      duration: 0.3
    });
    gsap.from("section h3", {
      opacity: 0,
      x: -16,
      duration: 0.3,
      stagger: 0.1,
      delay: 0.1
    });
  }, []);

  return (
    <div className="py-12 sm:py-16" data-testid="productspage">
      <AnimatedBackground />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="title text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Our Products
          </h2>
          <p className="subtitle mt-6 text-lg leading-8 text-fg-muted">
            A showcase of our projects and experiments.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="mt-16 text-center text-fg-subtle">No products yet.</p>
        ) : (
          <>
            <Section category="saas" />
            <Section category="client" />
            <Section category="oss" />
          </>
        )}
      </div>
    </div>
  );
}
