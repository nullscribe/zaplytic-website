import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const CYAN: [number, number, number] = [6, 182, 212];
const LIME: [number, number, number] = [132, 204, 22];
const SPACING = 42;
const INFLUENCE_R = 180;
const BG = "rgba(9, 9, 11, 1)";

type Dot = { x: number; y: number };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgba(c: [number, number, number], alpha: number): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let width = 0;
      let height = 0;
      let dpr = 1;
      let dots: Dot[] = [];
      const mouse = { x: -9999, y: -9999, active: false };
      let t = 0;
      let lastTime = 0;

      const buildGrid = () => {
        dots = [];
        for (let y = SPACING / 2; y < height; y += SPACING) {
          for (let x = SPACING / 2; x < width; x += SPACING) {
            dots.push({ x, y });
          }
        }
      };

      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        buildGrid();
      };

      const drawStatic = () => {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = rgba(CYAN, 0.18);
        for (const d of dots) {
          ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
        }
      };

      const onTick = (time: number) => {
        const dt = lastTime ? time - lastTime : 16;
        lastTime = time;
        t += dt;

        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, width, height);

        const r2 = INFLUENCE_R * INFLUENCE_R;
        for (const d of dots) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          let influence = 0;
          if (mouse.active && dist2 < r2) {
            influence = 1 - Math.sqrt(dist2) / INFLUENCE_R;
          }
          const ambient = 0.25 + 0.25 * Math.sin((d.x + d.y) * 0.006 + t * 0.0008);
          const strength = Math.max(influence, ambient * 0.5);
          const size = 1 + strength * 3;
          const alpha = 0.15 + strength * 0.7;
          const cr = Math.round(lerp(CYAN[0], LIME[0], strength));
          const cg = Math.round(lerp(CYAN[1], LIME[1], strength));
          const cb = Math.round(lerp(CYAN[2], LIME[2], strength));
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
          ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
        }
      };

      resize();

      if (reduceMotion) {
        drawStatic();
        return;
      }

      const onPointerMove = (e: PointerEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
      };
      const onPointerLeave = () => {
        mouse.active = false;
      };

      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        gsap.ticker.remove(onTick);
      };
    },
    { dependencies: [] }
  );

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none h-full w-full"
      aria-hidden="true"
    />
  );
}
