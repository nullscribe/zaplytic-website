import { describe, expect, test } from "vitest";
import {
  CHART,
  chartPolyline,
  chartSeries,
  flyInOffsets,
  popIn,
  seededRandom,
  splitChars,
  splitWords
} from "@/lib/motion";

describe("seededRandom", () => {
  test("is deterministic for a seed, so builds are reproducible", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  test("different seeds give different sequences", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });

  test("returns numbers in [0, 1)", () => {
    const random = seededRandom(3);
    for (let i = 0; i < 1000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe("splitWords / splitChars", () => {
  test("splits on any whitespace and drops empty pieces", () => {
    expect(splitWords("  with High-Quality\n Softwares ")).toEqual([
      "with",
      "High-Quality",
      "Softwares"
    ]);
  });

  test("keeps punctuation with its word", () => {
    expect(splitWords("We build tools we'd use ourselves.")).toEqual([
      "We",
      "build",
      "tools",
      "we'd",
      "use",
      "ourselves."
    ]);
  });

  test("splits by code point so multi-unit characters stay whole", () => {
    expect(splitChars("we'd")).toEqual(["w", "e", "'", "d"]);
    expect(splitChars("a😀b")).toEqual(["a", "😀", "b"]);
  });
});

describe("flyInOffsets", () => {
  test("one offset per word, each axis exactly ±1000px", () => {
    const offsets = flyInOffsets(6);
    expect(offsets).toHaveLength(6);
    for (const { x, y } of offsets) {
      expect([-1000, 1000]).toContain(x);
      expect([-1000, 1000]).toContain(y);
    }
  });

  test("is stable between builds", () => {
    expect(flyInOffsets(4)).toEqual(flyInOffsets(4));
  });

  test("words come from different directions", () => {
    const keys = new Set(flyInOffsets(20).map(({ x, y }) => `${x},${y}`));
    expect(keys.size).toBeGreaterThan(1);
  });
});

describe("chartSeries", () => {
  const series = chartSeries();

  test("has one value per chart point", () => {
    expect(series).toHaveLength(CHART.points);
  });

  test("stays inside the chart, never above the 10px top padding", () => {
    for (const y of series) {
      expect(y).toBeGreaterThanOrEqual(CHART.minY);
      expect(y).toBeLessThanOrEqual(CHART.height);
    }
  });

  test("baseline noise sits around 55% of the height (63–91px)", () => {
    series
      .filter((_, i) => (i + 1) % CHART.spikeEvery !== 0)
      .forEach((y) => {
        expect(y).toBeGreaterThanOrEqual(63);
        expect(y).toBeLessThanOrEqual(91);
      });
  });

  test("every 8th sample is a spike well above the baseline", () => {
    series.forEach((y, i) => {
      if ((i + 1) % CHART.spikeEvery === 0) expect(y).toBeLessThan(63 - 20);
    });
  });

  test("is deterministic", () => {
    expect(chartSeries()).toEqual(chartSeries());
  });
});

describe("chartPolyline", () => {
  test("repeats the series so the scroll loops seamlessly", () => {
    const { line, period } = chartPolyline([10, 20, 30], 2);
    const points = line.split(" ");
    expect(points).toHaveLength(6);
    // the second copy starts exactly one period after the first
    expect(points[3]).toBe(`${period},10`);
    expect(points.slice(3).map((p) => p.split(",")[1])).toEqual(["10", "20", "30"]);
  });

  test("spaces points across the chart width (40 points over 360px)", () => {
    const { line, period } = chartPolyline(chartSeries(), 2);
    const xs = line.split(" ").map((p) => Number(p.split(",")[0]));
    expect(xs[0]).toBe(0);
    expect(xs[CHART.points - 1]).toBeCloseTo(CHART.width);
    expect(period).toBeCloseTo((CHART.width / (CHART.points - 1)) * CHART.points);
    // two copies are wide enough to cover the visible chart while scrolling one period
    expect(xs.at(-1)!).toBeGreaterThanOrEqual(CHART.width + period - 10);
  });
});

describe("popIn", () => {
  test("staggers cards 0.05s apart from 60% scale", () => {
    expect(popIn(3)).toBe(
      "--i: 3; --from-sx: 0.6; --from-sy: 0.6; --duration: 0.25s; --stagger: 0.05s"
    );
  });
});
