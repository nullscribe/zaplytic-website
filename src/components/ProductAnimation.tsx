import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactElement } from "react";

export type ProductAnimationName =
  "ZapRoute" | "ZapMemo" | "RailGuard" | "Kanon Academy" | "ClinicaLearn" | "adorn";

const CYAN = "#06b6d4";
const LIME = "#84cc16";

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SVG_PROPS = {
  viewBox: "0 0 400 200",
  preserveAspectRatio: "xMidYMid slice",
  className: "h-44 w-full rounded",
  "aria-hidden": true
} as const;

export default function ProductAnimation({ name }: { name: ProductAnimationName }) {
  const ref = useRef<HTMLDivElement>(null);
  const static_ = reduceMotion();

  useGSAP(
    () => {
      if (static_ || !ref.current) return;
      const anim = animations[name];
      anim?.(ref.current);
    },
    { scope: ref, dependencies: [name, static_] }
  );

  return (
    <div ref={ref} className="rounded bg-bg-subtle/60">
      {scenes[name]}
    </div>
  );
}

/* ---------- Scenes (static SVG markup) ---------- */

const scenes: Record<ProductAnimationName, ReactElement> = {
  ZapRoute: (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="zr-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor={LIME} />
        </linearGradient>
      </defs>
      <path
        id="zr-path"
        d="M30,150 C80,40 150,180 200,90 S320,30 370,120"
        fill="none"
        stroke="url(#zr-grad)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.45"
      />
      {[
        [30, 150],
        [150, 130],
        [200, 90],
        [320, 50]
      ].map(([x, y], i) => (
        <circle
          key={i}
          className="zr-pulse"
          cx={x}
          cy={y}
          r="5"
          fill={i % 2 ? CYAN : LIME}
          opacity="0.9"
        />
      ))}
      <circle id="zr-traveler" r="7" fill={CYAN} opacity="0.95" />
    </svg>
  ),
  ZapMemo: (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="zm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.25" />
          <stop offset="100%" stopColor={LIME} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect
        x="120"
        y="30"
        width="160"
        height="140"
        rx="8"
        fill="url(#zm-grad)"
        stroke={CYAN}
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <path d="M120,162 v8 q0,8 8,8 h144 q8,0 8,-8 v-8 z" fill={LIME} opacity="0.18" />
      <g
        transform="translate(248,42)"
        stroke={LIME}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M0,4 h16 M8,-4 v16" className="zm-print" />
      </g>
      {[60, 78, 96, 114, 132].map((y, i) => (
        <rect
          key={i}
          className="zm-item"
          x="140"
          y={y}
          width={i === 4 ? 80 : 120}
          height="6"
          rx="3"
          fill={i % 2 ? CYAN : LIME}
          opacity="0"
        />
      ))}
    </svg>
  ),
  RailGuard: (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="rg-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.05" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g transform="translate(20,30)">
        <rect
          width="360"
          height="140"
          rx="6"
          fill="url(#rg-grad)"
          stroke={CYAN}
          strokeOpacity="0.2"
        />
        <polyline
          id="rg-line"
          fill="none"
          stroke={CYAN}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline id="rg-area" fill={LIME} fillOpacity="0.08" stroke="none" />
        {[
          [60, 110],
          [180, 110],
          [300, 110]
        ].map(([x, y], i) => (
          <circle key={i} className="rg-node" cx={x} cy={y} r="3" fill={LIME} />
        ))}
      </g>
    </svg>
  ),
  "Kanon Academy": (
    <svg {...SVG_PROPS}>
      {[
        [110, 60],
        [200, 80],
        [290, 60]
      ].map(([x, y], i) => (
        <g key={i} className="ka-book" transform={`translate(${x},${y})`}>
          <rect
            x="-26"
            y="-30"
            width="52"
            height="60"
            rx="4"
            fill={i % 2 ? CYAN : LIME}
            fillOpacity="0.12"
            stroke={i % 2 ? CYAN : LIME}
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <rect
            x="-18"
            y="-18"
            width="36"
            height="3"
            rx="1.5"
            fill={i % 2 ? CYAN : LIME}
            opacity="0.7"
          />
          <rect
            x="-18"
            y="-8"
            width="24"
            height="3"
            rx="1.5"
            fill={i % 2 ? CYAN : LIME}
            opacity="0.5"
          />
          <rect
            x="-18"
            y="2"
            width="30"
            height="3"
            rx="1.5"
            fill={i % 2 ? CYAN : LIME}
            opacity="0.5"
          />
        </g>
      ))}
    </svg>
  ),
  ClinicaLearn: (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="cl-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor={LIME} />
        </linearGradient>
      </defs>
      <g transform="translate(140,40)">
        <rect
          x="-40"
          y="0"
          width="80"
          height="100"
          rx="6"
          fill={CYAN}
          fillOpacity="0.08"
          stroke={CYAN}
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <rect x="-32" y="14" width="64" height="4" rx="2" fill={CYAN} opacity="0.6" />
        <rect x="-32" y="24" width="48" height="4" rx="2" fill={CYAN} opacity="0.4" />
        <rect x="-32" y="34" width="56" height="4" rx="2" fill={CYAN} opacity="0.4" />
      </g>
      <g className="cl-cross" transform="translate(200,60)">
        <rect x="-7" y="-22" width="14" height="44" rx="3" fill={LIME} />
        <rect x="-22" y="-7" width="44" height="14" rx="3" fill={LIME} />
      </g>
      <rect
        x="80"
        y="160"
        width="240"
        height="10"
        rx="5"
        fill={CYAN}
        fillOpacity="0.1"
        stroke={CYAN}
        strokeOpacity="0.3"
      />
      <rect id="cl-progress" x="80" y="160" width="0" height="10" rx="5" fill="url(#cl-grad)" />
    </svg>
  ),
  adorn: (
    <svg {...SVG_PROPS}>
      <defs>
        <linearGradient id="ad-shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
          <stop offset="50%" stopColor={LIME} stopOpacity="0.9" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ad-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.2" />
          <stop offset="100%" stopColor={LIME} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle
        className="ad-shape"
        cx="110"
        cy="100"
        r="38"
        fill="url(#ad-fill)"
        stroke={CYAN}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <g
        className="ad-shape"
        transform="translate(200,100)"
        fill="url(#ad-fill)"
        stroke={LIME}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      >
        <path d="M0,-42 L34,0 L0,42 L-34,0 Z" />
      </g>
      <circle
        className="ad-shape"
        cx="290"
        cy="100"
        r="24"
        fill="none"
        stroke={CYAN}
        strokeOpacity="0.6"
        strokeWidth="2"
      />
      <circle
        cx="290"
        cy="100"
        r="14"
        fill="url(#ad-fill)"
        stroke={LIME}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <rect
        id="ad-shimmer-bar"
        x="-100"
        y="0"
        width="200"
        height="200"
        fill="url(#ad-shimmer)"
        opacity="0.0"
        transform="translate(0,0)"
      />
    </svg>
  )
};

/* ---------- Animation logic ----------
 * Animations avoid GSAP's SVG transform parsing (which requires
 * SVGTransformList.consolidate, unsupported in happy-dom). Transform
 * changes use proxy objects + setAttribute; attribute changes use the
 * AttrPlugin (core GSAP).
 */

const parseTranslate = (t: string | null): [number, number] => {
  if (!t) return [0, 0];
  const m = t.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0];
};

const animations: Record<ProductAnimationName, (root: HTMLElement) => void> = {
  ZapRoute: (root) => {
    const path = root.querySelector("#zr-path") as SVGPathElement | null;
    const traveler = root.querySelector("#zr-traveler") as SVGCircleElement | null;
    if (!path || !traveler) return;
    const length = path.getTotalLength();
    const proxy = { t: 0 };
    const setPos = (t: number) => {
      const pt = path.getPointAtLength(t * length);
      traveler.setAttribute("cx", String(pt.x));
      traveler.setAttribute("cy", String(pt.y));
    };
    setPos(0);
    gsap.to(proxy, {
      t: 1,
      duration: 4,
      ease: "none",
      repeat: -1,
      onUpdate: () => setPos(proxy.t)
    });
    gsap.to(root.querySelectorAll(".zr-pulse"), {
      attr: { r: 8 },
      opacity: 0.4,
      duration: 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.3
    });
  },
  ZapMemo: (root) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
    tl.fromTo(
      root.querySelectorAll(".zm-item"),
      { opacity: 0 },
      { opacity: 1, duration: 0.35, stagger: 0.18, ease: "power2.out" }
    ).to(root.querySelectorAll(".zm-item"), {
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.in",
      delay: 1.2
    });
    gsap.to(root.querySelector(".zm-print"), {
      opacity: 0.3,
      duration: 0.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  },
  RailGuard: (root) => {
    const line = root.querySelector("#rg-line") as SVGPolylineElement | null;
    const area = root.querySelector("#rg-area") as SVGPolylineElement | null;
    if (!line || !area) return;
    const W = 360;
    const H = 140;
    const MAX = 40;
    const pts: number[] = Array.from({ length: MAX }, () => H * 0.6);
    let spikeCounter = 0;
    const render = () => {
      const step = W / (MAX - 1);
      const linePts = pts.map((y, i) => `${i * step},${y}`).join(" ");
      line.setAttribute("points", linePts);
      area.setAttribute("points", `0,${H} ${linePts} ${W},${H}`);
    };
    render();
    const proxy = { v: 0 };
    gsap.to(proxy, {
      v: 1,
      duration: 0.4,
      ease: "none",
      repeat: -1,
      onRepeat: () => {
        pts.shift();
        spikeCounter++;
        const isSpike = spikeCounter % 8 === 0;
        const base = H * 0.55 + (Math.random() - 0.5) * H * 0.2;
        const next = isSpike ? Math.max(10, base - H * 0.4) : Math.max(10, base);
        pts.push(next);
        render();
      }
    });
    gsap.to(root.querySelectorAll(".rg-node"), {
      opacity: 0.3,
      duration: 1.1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.25
    });
  },
  "Kanon Academy": (root) => {
    gsap.utils.toArray<SVGGElement>(".ka-book", root).forEach((book, i) => {
      const [bx, by] = parseTranslate(book.getAttribute("transform"));
      const yp = { v: 0 };
      gsap.to(yp, {
        v: -10,
        duration: 2 + i * 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.2,
        onUpdate: () => book.setAttribute("transform", `translate(${bx},${by + yp.v})`)
      });
      gsap.to(book, {
        opacity: 0.6,
        duration: 2.5 + i * 0.3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.15
      });
    });
  },
  ClinicaLearn: (root) => {
    const progress = root.querySelector("#cl-progress") as SVGRectElement | null;
    if (progress) {
      gsap.fromTo(
        progress,
        { attr: { width: 0 } },
        {
          attr: { width: 240 },
          duration: 2.4,
          ease: "power2.inOut",
          repeat: -1,
          repeatDelay: 0.6,
          yoyo: true
        }
      );
    }
    const cross = root.querySelector(".cl-cross") as SVGGElement | null;
    if (cross) {
      const [cx, cy] = parseTranslate(cross.getAttribute("transform"));
      const sp = { v: 1 };
      gsap.to(sp, {
        v: 1.18,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        onUpdate: () => cross.setAttribute("transform", `translate(${cx},${cy}) scale(${sp.v})`)
      });
    }
  },
  adorn: (root) => {
    gsap.utils.toArray<SVGElement>(".ad-shape", root).forEach((shape, i) => {
      gsap.to(shape, {
        opacity: 0.5,
        duration: 2 + i * 0.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
        delay: i * 0.25
      });
    });
    const bar = root.querySelector("#ad-shimmer-bar") as SVGRectElement | null;
    if (bar) {
      gsap.fromTo(
        bar,
        { attr: { x: -120 }, opacity: 0 },
        {
          attr: { x: 520 },
          opacity: 0.7,
          duration: 2.6,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 0.8
        }
      );
    }
  }
};
