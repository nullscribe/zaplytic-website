import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import gsap from "@/lib/gsap";
import { products } from "@/loaders/product";
import {
  animations,
  initProductAnimations,
  parseTranslate,
  type ProductAnimationName
} from "@/scripts/product-animations";
import { resetGsap, tweensOf } from "@/test/gsap";
import { REDUCED_MOTION, mockMedia } from "@/test/media";

/** Minimal markup per scene: only the elements each animation looks up. */
const FIXTURES: Record<ProductAnimationName, string> = {
  ZapRoute: `<svg><path id="zr-path"></path><circle class="zr-pulse"></circle><circle class="zr-pulse"></circle><circle id="zr-traveler"></circle></svg>`,
  ZapMemo: `<svg><path class="zm-print"></path>${'<rect class="zm-item"></rect>'.repeat(5)}</svg>`,
  RailGuard: `<svg><polyline id="rg-line"></polyline><polyline id="rg-area"></polyline>${'<circle class="rg-node"></circle>'.repeat(3)}</svg>`,
  "Kanon Academy": `<svg>${[110, 200, 290].map((x) => `<g class="ka-book" transform="translate(${x},60)"></g>`).join("")}</svg>`,
  "AMC-Booster": `<svg><g class="cl-cross" transform="translate(200,60)"></g><rect id="cl-progress" width="0"></rect></svg>`
};

function mount(name: ProductAnimationName) {
  const root = document.createElement("div");
  root.dataset.productAnimation = name;
  root.innerHTML = FIXTURES[name];
  document.body.append(root);
  return root;
}

beforeEach(() => {
  mockMedia();
  // happy-dom has no SVG geometry (getTotalLength always returns 0): fake a 100-unit path
  vi.spyOn(window.SVGPathElement.prototype, "getTotalLength").mockReturnValue(100);
  vi.spyOn(window.SVGPathElement.prototype, "getPointAtLength").mockImplementation(
    (d: number) => ({ x: d, y: d / 2 }) as DOMPoint
  );
});

afterEach(() => {
  resetGsap();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("parseTranslate", () => {
  test.each([
    ["translate(110,60)", [110, 60]],
    ["translate(110, 60)", [110, 60]],
    ["translate( -12.5 , 3.25 )", [-12.5, 3.25]],
    ["translate(200 60) scale(1.1)", [200, 60]]
  ])("%s", (input, expected) => {
    expect(parseTranslate(input)).toEqual(expected);
  });

  test.each([[null], [""], ["rotate(45)"], ["translate(10)"]])("%j falls back to 0,0", (input) => {
    expect(parseTranslate(input)).toEqual([0, 0]);
  });
});

describe("animations", () => {
  test("there is an animation for every product on the site", () => {
    for (const product of products) {
      expect(animations).toHaveProperty(product.name);
    }
  });

  test("ZapRoute moves the traveller along the route and pulses the stops", () => {
    const root = mount("ZapRoute");
    animations.ZapRoute(root);
    const traveler = root.querySelector("#zr-traveler")!;
    expect(traveler.getAttribute("cx")).toBe("0");
    expect(traveler.getAttribute("cy")).toBe("0");
    expect(tweensOf(root.querySelectorAll(".zr-pulse"))).toHaveLength(1);
  });

  test("ZapRoute does nothing without its path", () => {
    const root = document.createElement("div");
    expect(() => animations.ZapRoute(root)).not.toThrow();
  });

  test("ZapMemo cycles the receipt lines and blinks the print icon", () => {
    const root = mount("ZapMemo");
    animations.ZapMemo(root);
    expect(tweensOf(root.querySelectorAll(".zm-item")).length).toBeGreaterThan(0);
    expect(tweensOf(root.querySelector(".zm-print")!)).toHaveLength(1);
  });

  test("RailGuard draws a 40-point chart and its filled area", () => {
    const root = mount("RailGuard");
    animations.RailGuard(root);
    const line = root.querySelector("#rg-line")!.getAttribute("points")!.split(" ");
    const area = root.querySelector("#rg-area")!.getAttribute("points")!.split(" ");
    expect(line).toHaveLength(40);
    const [firstX, firstY] = line[0].split(",").map(Number);
    const [lastX, lastY] = line.at(-1)!.split(",").map(Number);
    expect([firstX, firstY]).toEqual([0, 84]);
    expect(lastX).toBeCloseTo(360);
    expect(lastY).toBe(84);
    // area closes the shape along the bottom edge
    expect(area[0]).toBe("0,140");
    expect(area.at(-1)).toBe("360,140");
    expect(tweensOf(root.querySelectorAll(".rg-node"))).toHaveLength(1);
  });

  test("RailGuard does nothing without its polylines", () => {
    expect(() => animations.RailGuard(document.createElement("div"))).not.toThrow();
  });

  test("Kanon Academy floats each book from its own position", () => {
    const root = mount("Kanon Academy");
    animations["Kanon Academy"](root);
    const books = root.querySelectorAll(".ka-book");
    expect(books).toHaveLength(3);
    books.forEach((book) => expect(tweensOf(book)).toHaveLength(1));
  });

  test("AMC-Booster fills the progress bar and pulses the cross", () => {
    const root = mount("AMC-Booster");
    animations["AMC-Booster"](root);
    expect(tweensOf(root.querySelector("#cl-progress")!)).toHaveLength(1);
  });

  test("AMC-Booster tolerates missing parts", () => {
    expect(() => animations["AMC-Booster"](document.createElement("div"))).not.toThrow();
  });
});

describe("initProductAnimations", () => {
  test("starts the matching animation for every scene on the page", () => {
    const spies = Object.fromEntries(
      Object.keys(animations).map((name) => [
        name,
        vi.spyOn(animations, name as ProductAnimationName).mockImplementation(() => {})
      ])
    );
    const roots = (Object.keys(FIXTURES) as ProductAnimationName[]).map(mount);

    initProductAnimations();

    roots.forEach((root) => {
      const name = root.dataset.productAnimation as ProductAnimationName;
      expect(spies[name]).toHaveBeenCalledExactlyOnceWith(root);
    });
  });

  test("ignores unknown scene names", () => {
    const root = document.createElement("div");
    root.dataset.productAnimation = "Not A Product";
    document.body.append(root);
    expect(() => initProductAnimations()).not.toThrow();
  });

  test("only looks inside the given scope", () => {
    const spy = vi.spyOn(animations, "ZapMemo").mockImplementation(() => {});
    mount("ZapMemo");
    initProductAnimations(document.createElement("div"));
    expect(spy).not.toHaveBeenCalled();
  });

  test("leaves every scene static with reduced motion", () => {
    mockMedia([REDUCED_MOTION]);
    const spy = vi.spyOn(animations, "ZapRoute");
    mount("ZapRoute");
    initProductAnimations();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("animation frames", () => {
  /** Jumps every running animation forward so onUpdate/onRepeat callbacks fire. */
  function advance(seconds: number) {
    for (const child of gsap.globalTimeline.getChildren(true, true, true)) {
      child.totalTime(child.totalTime() + seconds);
    }
  }

  test("ZapRoute's traveller moves along the route", () => {
    const root = mount("ZapRoute");
    animations.ZapRoute(root);
    advance(1); // 1s of a 4s loop -> a quarter of the way
    const traveler = root.querySelector("#zr-traveler")!;
    expect(Number(traveler.getAttribute("cx"))).toBeCloseTo(25);
    expect(Number(traveler.getAttribute("cy"))).toBeCloseTo(12.5);
  });

  test("RailGuard scrolls new data points into the chart", () => {
    const root = mount("RailGuard");
    animations.RailGuard(root);
    const line = root.querySelector("#rg-line")!;
    const before = line.getAttribute("points");
    advance(0.45); // just past one 0.4s cycle
    const after = line.getAttribute("points")!;
    expect(after).not.toBe(before);
    expect(after.split(" ")).toHaveLength(40); // window size stays fixed
    for (const point of after.split(" ")) {
      const y = Number(point.split(",")[1]);
      expect(y).toBeGreaterThanOrEqual(10); // never drawn above the chart's top padding
      expect(y).toBeLessThanOrEqual(140);
    }
  });

  test("RailGuard spikes every eighth point", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // flat baseline at y = 77
    const root = mount("RailGuard");
    animations.RailGuard(root);
    advance(0.01); // step off the cycle boundary so each 0.4s step crosses exactly one repeat
    for (let i = 0; i < 8; i++) advance(0.4);
    const ys = root
      .querySelector("#rg-line")!
      .getAttribute("points")!
      .split(" ")
      .map((p) => Number(p.split(",")[1]));
    expect(ys.at(-1)).toBeCloseTo(77 - 56); // spike: base - 40% of the height
    expect(ys.at(-2)).toBeCloseTo(77);
  });

  test("Kanon Academy books float up from where they were placed", () => {
    const root = mount("Kanon Academy");
    animations["Kanon Academy"](root);
    advance(1);
    const [first] = root.querySelectorAll(".ka-book");
    const [x, y] = parseTranslate(first.getAttribute("transform"));
    expect(x).toBe(110);
    expect(y).toBeLessThan(60);
    expect(y).toBeGreaterThanOrEqual(50);
  });

  test("AMC-Booster's cross pulses in place", () => {
    const root = mount("AMC-Booster");
    animations["AMC-Booster"](root);
    advance(0.5);
    const transform = root.querySelector(".cl-cross")!.getAttribute("transform")!;
    expect(transform).toMatch(/^translate\(200,60\) scale\(1\.\d+\)$/);
    expect(Number(root.querySelector("#cl-progress")!.getAttribute("width"))).toBeGreaterThan(0);
  });
});
