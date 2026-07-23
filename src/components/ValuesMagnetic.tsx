import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import type { Value } from "@/loaders/team";

const ACCENT_TEXT: Record<Value["accent"], string> = {
  cyan: "text-cyan-300",
  lime: "text-lime-300",
  emerald: "text-emerald-300",
  indigo: "text-indigo-300"
};

const ACCENT_RING: Record<Value["accent"], string> = {
  cyan:
    "border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_24px_-6px_rgba(6,182,212,0.6)]",
  lime: "border-lime-500/40 hover:border-lime-400 hover:shadow-[0_0_24px_-6px_rgba(132,204,22,0.6)]",
  emerald:
    "border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.6)]",
  indigo:
    "border-indigo-500/40 hover:border-indigo-400 hover:shadow-[0_0_24px_-6px_rgba(99,102,241,0.6)]"
};

const ACCENT_DOT: Record<Value["accent"], string> = {
  cyan: "bg-cyan-400",
  lime: "bg-lime-400",
  emerald: "bg-emerald-400",
  indigo: "bg-indigo-400"
};

const RADIUS = 140;
const MAX_PUSH = 28;

export default function ValuesMagnetic({ values }: { values: Value[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const quickTo = useRef<
    { x: gsap.QuickToFunc; y: gsap.QuickToFunc }[]
  >([]);

  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isTouch = window.matchMedia("(hover: none)").matches;
      if (reduceMotion || isTouch) return;

      quickTo.current = chipRefs.current.map((el) => ({
        x: gsap.quickTo(el as HTMLButtonElement, "x", {
          duration: 0.4,
          ease: "power3.out"
        }),
        y: gsap.quickTo(el as HTMLButtonElement, "y", {
          duration: 0.4,
          ease: "power3.out"
        })
      }));

      const onMove = (e: PointerEvent) => {
        const chips = chipRefs.current;
        for (let i = 0; i < chips.length; i++) {
          const chip = chips[i];
          if (!chip) continue;
          const r = chip.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = cx - e.clientX;
          const dy = cy - e.clientY;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const force = (1 - dist / RADIUS) * MAX_PUSH;
            const ang = Math.atan2(dy, dx);
            quickTo.current[i].x(Math.cos(ang) * force);
            quickTo.current[i].y(Math.sin(ang) * force);
          } else {
            quickTo.current[i].x(0);
            quickTo.current[i].y(0);
          }
        }
      };

      const onLeave = () => {
        quickTo.current.forEach((q) => {
          q.x(0);
          q.y(0);
        });
      };

      const wrap = wrapRef.current;
      if (!wrap) return;
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
      return () => {
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: wrapRef }
  );

  useGSAP(
    () => {
      gsap.from(".valuechip", {
        opacity: 0,
        y: 24,
        duration: 0.4,
        stagger: 0.08,
        scrollTrigger: { trigger: "#values-section", start: "top 80%" }
      });
      gsap.from("#value-panel", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        delay: 0.2,
        scrollTrigger: { trigger: "#values-section", start: "top 80%" }
      });
    },
    []
  );

  const current = values[active];

  const handleEnter = (i: number) => {
    if (i === active) return;
    gsap.to("#value-panel-content", {
      opacity: 0,
      y: -8,
      duration: 0.15,
      onComplete: () => {
        setActive(i);
        gsap.fromTo(
          "#value-panel-content",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % values.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [values.length]);

  useEffect(() => {
    if (active === 0) return;
    gsap.fromTo(
      "#value-panel-content",
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );
  }, [active]);

  return (
    <div ref={wrapRef} className="mt-6">
      <div className="flex flex-wrap gap-3">
        {values.map((value, i) => (
          <button
            key={value.title}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => handleEnter(i)}
            onClick={() => handleEnter(i)}
            className={`valuechip inline-flex items-center gap-2 rounded-full border bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-200 backdrop-blur transition-colors duration-200 ${
              ACCENT_RING[value.accent]
            } ${i === active ? "text-white" : ""}`}
            aria-label={value.title}
          >
            <span
              className={`size-1.5 rounded-full ${ACCENT_DOT[value.accent]}`}
              aria-hidden
            />
            {value.title}
          </button>
        ))}
      </div>

      <div
        id="value-panel"
        className="mt-6 min-h-[8rem] rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur"
      >
        <div id="value-panel-content" className="flex flex-col gap-2">
          <h4
            className={`text-lg font-semibold tracking-tight ${ACCENT_TEXT[current.accent]}`}
          >
            {current.title}
          </h4>
          <p className="max-w-xl text-sm leading-6 text-neutral-400">
            {current.description}
          </p>
        </div>
      </div>
    </div>
  );
}
