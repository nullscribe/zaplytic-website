import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import gsap from "@/lib/gsap";
import { initAnimatedBackground } from "@/scripts/background";
import { REDUCED_MOTION, mockMedia } from "@/test/media";

type Call = { op: string; fillStyle: string; composite: string; args: number[] };

/** Minimal 2D context that records every fillRect with the style in effect at the time. */
function fakeContext() {
  const calls: Call[] = [];
  const ctx = {
    fillStyle: "",
    globalCompositeOperation: "source-over",
    setTransform: vi.fn(),
    scale: vi.fn(),
    fillRect(...args: number[]) {
      calls.push({
        op: "fillRect",
        fillStyle: ctx.fillStyle,
        composite: ctx.globalCompositeOperation,
        args
      });
    }
  };
  return { ctx, calls };
}

function setup({ width = 420, height = 210, dpr = 1 } = {}) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", height);
  vi.stubGlobal("devicePixelRatio", dpr);
  const canvas = document.createElement("canvas");
  const { ctx, calls } = fakeContext();
  canvas.getContext = vi.fn(() => ctx) as unknown as HTMLCanvasElement["getContext"];
  document.body.append(canvas);
  return { canvas, ctx, calls };
}

const flushObservers = () => new Promise((resolve) => setTimeout(resolve, 0));
// 420x210 viewport with 42px spacing -> 10 columns x 5 rows
const DOTS = 50;

beforeEach(() => mockMedia());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("initAnimatedBackground", () => {
  test("returns a no-op cleanup when 2D canvas is unsupported", () => {
    const canvas = document.createElement("canvas");
    canvas.getContext = vi.fn(() => null) as unknown as HTMLCanvasElement["getContext"];
    const cleanup = initAnimatedBackground(canvas);
    expect(cleanup).toBeTypeOf("function");
    expect(() => cleanup()).not.toThrow();
  });

  test("sizes the canvas to the viewport at device pixel ratio", () => {
    const { canvas, ctx } = setup({ width: 300, height: 200, dpr: 2 });
    initAnimatedBackground(canvas)();
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(400);
    expect(canvas.style.width).toBe("300px");
    expect(canvas.style.height).toBe("200px");
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  });

  test("caps the pixel ratio at 2 to bound the canvas size", () => {
    const { canvas } = setup({ width: 100, height: 100, dpr: 3 });
    initAnimatedBackground(canvas)();
    expect(canvas.width).toBe(200);
  });

  describe("with reduced motion", () => {
    beforeEach(() => mockMedia([REDUCED_MOTION]));

    test("draws one static frame and never starts the ticker", () => {
      const add = vi.spyOn(gsap.ticker, "add");
      const { canvas, calls } = setup();
      initAnimatedBackground(canvas);

      expect(add).not.toHaveBeenCalled();
      // background fill + one 2x2 square per dot
      expect(calls).toHaveLength(1 + DOTS);
      expect(calls[0].args).toEqual([0, 0, 420, 210]);
      expect(calls.slice(1).every((c) => c.args[2] === 2 && c.args[3] === 2)).toBe(true);
    });

    test("uses multiply blending in light mode and lighter blending in dark mode", async () => {
      const { canvas, calls } = setup();
      initAnimatedBackground(canvas);
      expect(calls[1].composite).toBe("multiply");

      calls.length = 0;
      document.documentElement.classList.add("dark");
      await flushObservers();
      expect(calls[1].composite).toBe("lighter");
    });

    test("cleanup stops redrawing on theme changes", async () => {
      const { canvas, calls } = setup();
      initAnimatedBackground(canvas)();
      calls.length = 0;
      document.documentElement.classList.add("dark");
      await flushObservers();
      expect(calls).toHaveLength(0);
    });
  });

  describe("animated", () => {
    function start() {
      let tick: ((time: number) => void) | undefined;
      vi.spyOn(gsap.ticker, "add").mockImplementation(((cb: (time: number) => void) => {
        tick = cb;
      }) as typeof gsap.ticker.add);
      const remove = vi.spyOn(gsap.ticker, "remove").mockImplementation(() => {});
      const env = setup();
      const cleanup = initAnimatedBackground(env.canvas);
      return { ...env, cleanup, remove, tick: (t: number) => tick!(t) };
    }

    test("registers a ticker callback and draws every dot each frame", () => {
      const { calls, tick } = start();
      calls.length = 0;
      tick(16);
      expect(calls).toHaveLength(1 + DOTS);
      expect(calls[0].composite).toBe("source-over");
    });

    test("dots near the pointer grow and shift from cyan toward lime", () => {
      const { calls, tick } = start();
      const dot = { x: 21, y: 21 }; // first dot

      tick(16);
      const idle = calls.at(1 - DOTS - 1 + 1)!; // first dot of the frame
      calls.length = 0;

      window.dispatchEvent(new PointerEvent("pointermove", { clientX: dot.x, clientY: dot.y }));
      tick(32);
      const hovered = calls[1];

      expect(hovered.args[2]).toBeGreaterThan(idle.args[2]);
      expect(hovered.args[2]).toBe(5); // full influence: 1 + 1 * 4
      expect(hovered.fillStyle).toMatch(/^rgba\(132, 204, 22,/); // lime
    });

    test("the effect stops when the pointer leaves the window", () => {
      const { calls, tick } = start();
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 21, clientY: 21 }));
      window.dispatchEvent(new PointerEvent("pointerleave"));
      calls.length = 0;
      tick(16);
      expect(calls[1].args[2]).toBeLessThan(5);
    });

    test("rebuilds the grid when the window is resized", () => {
      const { calls, tick } = start();
      vi.stubGlobal("innerWidth", 840);
      window.dispatchEvent(new Event("resize"));
      calls.length = 0;
      tick(16);
      expect(calls).toHaveLength(1 + DOTS * 2);
    });

    test("cleanup removes the ticker and window listeners", () => {
      const { cleanup, remove, calls, tick } = start();
      cleanup();
      expect(remove).toHaveBeenCalledTimes(1);

      vi.stubGlobal("innerWidth", 840);
      window.dispatchEvent(new Event("resize"));
      calls.length = 0;
      tick(16);
      expect(calls).toHaveLength(1 + DOTS); // grid not rebuilt
    });
  });
});
