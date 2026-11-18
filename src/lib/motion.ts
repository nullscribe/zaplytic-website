/**
 * Build-time helpers for the CSS animations. Everything here runs while Astro renders the
 * page, so the browser receives ready-made markup and needs no animation library.
 */

/** Small deterministic PRNG (mulberry32): the same seed always gives the same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Splits text into words, dropping the whitespace between them. */
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Splits a word into characters (code points, so emoji and accents stay whole). */
export function splitChars(word: string): string[] {
  return Array.from(word);
}

/**
 * Off-screen start offsets for the hero title's fly-in: each word starts ±1000px away on
 * both axes, matching the original GSAP `random([-1000, 1000])`.
 */
export function flyInOffsets(count: number, seed = 1): { x: number; y: number }[] {
  const random = seededRandom(seed);
  const pick = () => (random() < 0.5 ? -1000 : 1000);
  return Array.from({ length: count }, () => ({ x: pick(), y: pick() }));
}

export const CHART = { width: 360, height: 140, points: 40, spikeEvery: 8, minY: 10 } as const;

/**
 * Y values for the RailGuard "live monitoring" chart, generated with the same rules the GSAP
 * version used at runtime: noise around 55% of the height, a tall spike every 8th sample,
 * never closer than 10px to the top.
 */
export function chartSeries(count = CHART.points, seed = 7): number[] {
  const random = seededRandom(seed);
  const { height, spikeEvery, minY } = CHART;
  return Array.from({ length: count }, (_, i) => {
    const base = height * 0.55 + (random() - 0.5) * height * 0.2;
    const spike = (i + 1) % spikeEvery === 0;
    return Math.max(minY, spike ? base - height * 0.4 : base);
  });
}

/**
 * Polyline points for `series` repeated `copies` times, so the chart can scroll left by one
 * period in a seamless CSS loop.
 */
export function chartPolyline(series: number[], copies = 2): { line: string; period: number } {
  const step = CHART.width / (CHART.points - 1);
  const ys = Array.from({ length: copies }, () => series).flat();
  const line = ys.map((y, i) => `${round(i * step)},${round(y)}`).join(" ");
  return { line, period: round(series.length * step) };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Products page entrance: cards pop in from 60% scale, 0.05s apart, in page order. */
export const popIn = (index: number): string =>
  `--i: ${index}; --from-sx: 0.6; --from-sy: 0.6; --duration: 0.25s; --stagger: 0.05s`;
