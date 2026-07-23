import { useGSAP } from "@gsap/react";
import { useRef, type ReactElement } from "react";
import type { Service, ServiceIconName } from "@/loaders/services";

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const ICONS: Record<ServiceIconName, ReactElement> = {
  website: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-8 lg:size-10"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3 7.5 7.03 7.5 12s2.015 9 4.5 9Zm-9-9h18"
      />
    </svg>
  ),
  app: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-7"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  ),
  erp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-7"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 2.25h15a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75Zm-1 18.75h17M9 5.25h6M6.75 8.25h10.5M6.75 11.25h10.5M6.75 14.25h7.5"
      />
    </svg>
  ),
  ecommerce: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-7"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  ),
  support: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-7"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.182-1.19a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.37a11.04 11.04 0 0 1-5.516-5.517c-.172-.44-.006-.927.37-1.21l1.293-.97a1.125 1.125 0 0 0 .417-1.172L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  )
};

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const disabled = reduceMotion() || isTouch();

  useGSAP(
    () => {
      if (disabled) return;
      const wrap = wrapRef.current;
      if (!wrap) return;

      const setVar = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        wrap.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        wrap.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      };

      wrap.addEventListener("pointermove", setVar);
      return () => {
        wrap.removeEventListener("pointermove", setVar);
      };
    },
    { scope: wrapRef, dependencies: [disabled] }
  );

  const isFeature = service.feature;

  return (
    <div
      ref={wrapRef}
      className={`group relative flex h-full overflow-hidden rounded-2xl bg-bg-elevated/80 p-5 ring-1 ring-fg/10 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(6,182,212,0.35)] ${
        isFeature ? "md:p-8 lg:p-10" : "md:p-6"
      }`}
      style={disabled ? undefined : { ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          disabled
            ? undefined
            : {
                background:
                  "radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(6,182,212,0.18), transparent 60%)"
              }
        }
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-cyan-400/40 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex h-full flex-col">
        <span
          className={`inline-flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/15 to-lime-500/15 text-cyan-500 ring-1 ring-cyan-400/20 ${
            isFeature ? "md:size-16 lg:size-20" : ""
          }`}
        >
          {ICONS[service.iconName]}
        </span>

        <h3
          className={`mt-5 font-bold tracking-tight text-fg ${
            isFeature ? "text-2xl md:text-3xl" : "text-xl"
          }`}
        >
          {service.title}
        </h3>
        <p
          className={`mt-2 text-fg-muted ${
            isFeature ? "text-sm md:text-base md:leading-7" : "text-sm leading-7"
          }`}
        >
          {service.description}
        </p>

        {isFeature && service.highlights && (
          <ul className="mt-6 hidden grid-cols-1 gap-x-6 gap-y-3 sm:grid sm:grid-cols-2 lg:mt-auto">
            {service.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm md:text-base text-fg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="size-4 shrink-0 text-cyan-500"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
