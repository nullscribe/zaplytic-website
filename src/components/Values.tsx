import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type ReactElement } from "react";
import type { Value } from "@/loaders/team";

const ACCENT_TEXT: Record<Value["accent"], string> = {
  cyan: "text-cyan-600 dark:text-cyan-300",
  lime: "text-lime-600 dark:text-lime-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  indigo: "text-indigo-600 dark:text-indigo-300"
};

const ACCENT_ICON_BG: Record<Value["accent"], string> = {
  cyan: "from-cyan-500/15 to-cyan-500/5 text-cyan-400 ring-cyan-400/20",
  lime: "from-lime-500/15 to-lime-500/5 text-lime-400 ring-lime-400/20",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-400 ring-emerald-400/20",
  indigo: "from-indigo-500/15 to-indigo-500/5 text-indigo-400 ring-indigo-400/20"
};

const ACCENT_GLOW: Record<Value["accent"], string> = {
  cyan: "hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.35)] hover:border-cyan-400/40",
  lime: "hover:shadow-[0_20px_50px_-12px_rgba(132,204,22,0.35)] hover:border-lime-400/40",
  emerald: "hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.35)] hover:border-emerald-400/40",
  indigo: "hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.35)] hover:border-indigo-400/40"
};

const ICONS: Record<Value["icon"], ReactElement> = {
  robust: (
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
        d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm0 4v10m-3-7 3-3 3 3"
      />
    </svg>
  ),
  promise: (
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
        d="M7.5 8.25h.75m0 0h.75m0 0h.75m0 0h.75m0 0h.75m-6 3h.75m0 0h.75m0 0h.75m0 0h.75m0 0h.75M3 4.5h18M5.25 4.5v15a.75.75 0 0 0 .75.75h12a.75.75 0 0 0 .75-.75v-15M9 12.75h6"
      />
    </svg>
  ),
  empower: (
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
  "real-world": (
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
  simple: (
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
        d="M9.75 3.75h-4.5A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25h4.5M14.25 3.75h4.5A2.25 2.25 0 0 1 21 6v12a2.25 2.25 0 0 1-2.25 2.25h-4.5M9 12h6m-3-3 3 3-3 3"
      />
    </svg>
  ),
  trust: (
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
        d="M9 12.75 11.25 15 15 9.75m-3 8.25-8.69-4.52A1.5 1.5 0 0 1 2.5 17.1V6.9a1.5 1.5 0 0 1 .81-1.33L12 2.25l8.69 3.32a1.5 1.5 0 0 1 .81 1.33v10.2a1.5 1.5 0 0 1-.81 1.33L12 21.75Z"
      />
    </svg>
  )
};

const PAD = 2;

export default function Values({ values }: { values: Value[] }) {
  const pad = (n: number) => String(n).padStart(PAD, "0");

  useGSAP(() => {
    gsap.from(".valuecard", {
      opacity: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: "#values-section", start: "top 80%" },
      clearProps: "all"
    });
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {values.map((value, i) => (
        <button
          key={value.title}
          aria-label={value.title}
          className={`valuecard group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-bg-subtle/40 p-5 text-left backdrop-blur transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${ACCENT_GLOW[value.accent]}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex size-12 items-center justify-center rounded-xl bg-linear-to-br ring-1 ${ACCENT_ICON_BG[value.accent]}`}
            >
              {ICONS[value.icon]}
            </span>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-fg-subtle">
              {pad(i + 1)}
            </span>
          </div>

          <h4 className="text-lg font-bold leading-7 tracking-tight text-fg">{value.title}</h4>
          <span
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT_TEXT[value.accent]}`}
          >
            {value.principle}
          </span>
          <p className="text-sm leading-6 text-fg-muted">{value.description}</p>
        </button>
      ))}
    </div>
  );
}
