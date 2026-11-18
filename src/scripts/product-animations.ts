import gsap from "@/lib/gsap";
import { reduceMotion } from "@/scripts/motion";

export type ProductAnimationName =
  "ZapRoute" | "ZapMemo" | "RailGuard" | "Kanon Academy" | "AMC-Booster";

/* ---------- Animation logic ----------
 * Animations avoid GSAP's SVG transform parsing (which requires
 * SVGTransformList.consolidate, unsupported in happy-dom). Transform
 * changes use proxy objects + setAttribute; attribute changes use the
 * AttrPlugin (core GSAP).
 */

export const parseTranslate = (t: string | null): [number, number] => {
  if (!t) return [0, 0];
  const m = t.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : [0, 0];
};

export const animations: Record<ProductAnimationName, (root: HTMLElement) => void> = {
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
  "AMC-Booster": (root) => {
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
  }
};

/** Start the animation for every product scene rendered on the page. */
export function initProductAnimations(scope: ParentNode = document): void {
  if (reduceMotion()) return;
  scope.querySelectorAll<HTMLElement>("[data-product-animation]").forEach((root) => {
    const name = root.dataset.productAnimation as ProductAnimationName;
    animations[name]?.(root);
  });
}
