import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import ProductAnimation, {
  type ProductAnimationName
} from "@/components/ProductAnimation";
import type { Product } from "@/loaders/product";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none)").matches;

export default function ProductCard({ product }: { product: Product }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const disabled = reduceMotion() || isTouch();

  useGSAP(
    () => {
      if (disabled) return;
      const card = cardRef.current;
      const wrap = wrapRef.current;
      if (!card || !wrap) return;

      const rotX = gsap.quickTo(card, "rotationX", { duration: 0.3, ease: "power2.out" });
      const rotY = gsap.quickTo(card, "rotationY", { duration: 0.3, ease: "power2.out" });

      const onMove = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        rotY((px - 0.5) * 16);
        rotX(-(py - 0.5) * 16);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
      };

      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
      return () => {
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: wrapRef, dependencies: [disabled] }
  );

  return (
    <div ref={wrapRef} className="h-full" style={{ perspective: "1000px" }}>
      <article
        ref={cardRef}
        className="product group relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl bg-neutral-800/80 p-5 shadow-lg ring-1 ring-white/5 backdrop-blur transition-shadow duration-300 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.35)] md:p-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(6,182,212,0.18), transparent 60%)"
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-cyan-400/40 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />

        <div className="relative">
          <ProductAnimation name={product.name as ProductAnimationName} />
        </div>

        <div className="relative mt-5 flex flex-col">
          <h3 className="text-2xl font-bold leading-9 tracking-tight text-neutral-200">
            {product.name}
          </h3>
          <p className="mt-2 min-h-[3.5rem] text-base leading-7 text-neutral-400">
            {product.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-neutral-700/70 px-2 py-1 text-xs font-medium text-neutral-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-auto flex items-center gap-x-4 pt-6">
          {product.liveLink && (
            <a
              href={product.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Live Demo
            </a>
          )}
          {product.githubLink && (
            <a
              href={product.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-neutral-600 px-3.5 py-2.5 text-sm font-semibold text-neutral-200 shadow-sm transition-colors hover:bg-neutral-500"
            >
              GitHub
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
