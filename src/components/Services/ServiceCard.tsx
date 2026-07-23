import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactElement } from "react";
import type { Service, ServiceIconName } from "@/loaders/services";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const ICONS: Record<ServiceIconName, ReactElement> = {
  website: (
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
        d="M10.5 1.5 9 4.5H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-3l-1.5-3h-3Zm1.5 5.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z"
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
        d="M3.75 3v11.25A2.75 2.75 0 0 0 6.5 17h11a2.75 2.75 0 0 0 2.75-2.75V3h-2.5v4.5h-2.5V3h-2.5v4.5h-2.5V3h-2.5v4.5H6.25V3h-2.5Zm0 13.5V20a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-3.5"
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
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.438M2.25 3l1.8 8.25h11.7m-13.5 0 1.5 6a.75.75 0 0 0 .73.562h9.94a.75.75 0 0 0 .73-.562L19.05 5.5m-13.05 6.75L5 5.5m14.05 0H5.106m13.944 0a.75.75 0 0 1 .73.935l-.555 2.19a.75.75 0 0 1-.73.562H5.106M8.25 21a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm9 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
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
        d="M12 6.75a8.25 8.25 0 0 1 8.25 8.25M12 6.75a8.25 8.25 0 0 0-8.25 8.25m8.25-8.25a8.25 8.25 0 0 1 0 16.5 8.25 8.25 0 0 1 0-16.5Zm-7.5 8.25a8.25 8.25 0 0 0 8.25 8.25M19.5 9.75a8.25 8.25 0 0 1 0 4.5M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
      />
    </svg>
  )
};

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const disabled = reduceMotion() || isTouch();

  useGSAP(
    () => {
      if (disabled) return;
      const wrap = wrapRef.current;
      const icon = iconRef.current;
      if (!wrap || !icon) return;

      const setVar = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        wrap.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        wrap.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      };

      const popIn = () =>
        gsap.to(icon, { scale: 1.18, duration: 0.25, ease: "back.out(3)" });
      const popOut = () =>
        gsap.to(icon, { scale: 1, duration: 0.3, ease: "power2.out" });

      wrap.addEventListener("pointermove", setVar);
      wrap.addEventListener("pointerenter", popIn);
      wrap.addEventListener("pointerleave", popOut);
      return () => {
        wrap.removeEventListener("pointermove", setVar);
        wrap.removeEventListener("pointerenter", popIn);
        wrap.removeEventListener("pointerleave", popOut);
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
      style={
        disabled
          ? undefined
          : { ["--mx" as string]: "50%", ["--my" as string]: "50%" }
      }
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
          ref={iconRef}
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
            isFeature
              ? "text-sm md:text-base md:leading-7"
              : "text-sm leading-7"
          }`}
        >
          {service.description}
        </p>

        {isFeature && service.highlights && (
          <ul className="mt-6 hidden grid-cols-1 gap-x-6 gap-y-3 sm:grid sm:grid-cols-2 lg:mt-auto">
            {service.highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm md:text-base text-fg-muted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="size-4 shrink-0 text-cyan-500"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
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
