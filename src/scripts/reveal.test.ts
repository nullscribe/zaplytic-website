import { afterEach, describe, expect, test, vi } from "vitest";
import { initReveal, reveal, revealLine } from "@/scripts/reveal";

type Callback = (entries: Partial<IntersectionObserverEntry>[], self: IntersectionObserver) => void;

/** Captures every IntersectionObserver the script creates, so tests can fire entries. */
function stubObserver() {
  const observers: {
    callback: Callback;
    options?: IntersectionObserverInit;
    observed: Element[];
    unobserved: Element[];
    self: IntersectionObserver;
  }[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        const record = {
          callback,
          options,
          observed: [] as Element[],
          unobserved: [] as Element[],
          self: this as unknown as IntersectionObserver
        };
        observers.push(record);
        Object.assign(this, {
          observe: (el: Element) => record.observed.push(el),
          unobserve: (el: Element) => record.unobserved.push(el),
          disconnect: () => {}
        });
      }
    }
  );
  const fire = (target: Element, entry: Partial<IntersectionObserverEntry>) => {
    const record = observers.find((o) => o.observed.includes(target))!;
    record.callback(
      [
        {
          target,
          isIntersecting: false,
          boundingClientRect: { top: 2000 } as DOMRectReadOnly,
          rootBounds: { bottom: 640 } as DOMRectReadOnly,
          ...entry
        }
      ],
      record.self
    );
  };
  return { observers, fire };
}

afterEach(() => vi.unstubAllGlobals());

describe("revealLine", () => {
  const el = (value?: string) => {
    const div = document.createElement("div");
    if (value !== undefined) div.dataset.reveal = value;
    return div;
  };

  test("reads the percentage from data-reveal", () => {
    expect(revealLine(el("85"))).toBe(85);
    expect(revealLine(el("75"))).toBe(75);
  });

  test.each([undefined, "", "0", "abc", "150", "-5"])("falls back to 80 for %j", (value) => {
    expect(revealLine(el(value))).toBe(80);
  });
});

describe("reveal", () => {
  test("marks the trigger and the elements it owns, but not nested triggers' elements", () => {
    document.body.innerHTML = `
      <section id="outer" data-reveal>
        <h3 id="label" class="motion-reveal"></h3>
        <div id="plain"></div>
        <div id="inner" data-reveal="75">
          <article id="card" class="motion-reveal"></article>
        </div>
      </section>`;
    reveal(document.getElementById("outer")!);

    expect(document.getElementById("outer")).toHaveClass("is-revealed");
    expect(document.getElementById("label")).toHaveClass("is-revealed");
    expect(document.getElementById("plain")).not.toHaveClass("is-revealed");
    // the inner trigger reveals its own elements on its own line
    expect(document.getElementById("inner")).not.toHaveClass("is-revealed");
    expect(document.getElementById("card")).not.toHaveClass("is-revealed");
  });

  test("a trigger that is itself animated reveals itself", () => {
    document.body.innerHTML = `<h2 id="title" class="motion-reveal" data-reveal></h2>`;
    reveal(document.getElementById("title")!);
    expect(document.getElementById("title")).toHaveClass("is-revealed");
  });
});

describe("initReveal", () => {
  const fixture = () => {
    document.body.innerHTML = `
      <section id="a" data-reveal="80"><p class="motion-reveal"></p></section>
      <section id="b" data-reveal="80"></section>
      <section id="c" data-reveal="75"></section>`;
    return ["a", "b", "c"].map((id) => document.getElementById(id)!);
  };

  test("uses one observer per reveal line, with a matching root margin", () => {
    const { observers } = stubObserver();
    fixture();
    initReveal();
    expect(observers.map((o) => o.options?.rootMargin)).toEqual([
      "0px 0px -20% 0px",
      "0px 0px -25% 0px"
    ]);
    expect(observers[0].observed.map((el) => el.id)).toEqual(["a", "b"]);
    expect(observers[1].observed.map((el) => el.id)).toEqual(["c"]);
  });

  test("reveals once the element crosses the line, then stops watching it", () => {
    const { observers, fire } = stubObserver();
    const [a] = fixture();
    initReveal();

    fire(a, { isIntersecting: false });
    expect(a).not.toHaveClass("is-revealed");

    fire(a, { isIntersecting: true, boundingClientRect: { top: 500 } as DOMRectReadOnly });
    expect(a).toHaveClass("is-revealed");
    expect(a.querySelector(".motion-reveal")).toHaveClass("is-revealed");
    expect(observers[0].unobserved).toEqual([a]);
  });

  test("reveals sections already scrolled past (page loaded part-way down)", () => {
    const { fire } = stubObserver();
    const [a] = fixture();
    initReveal();
    fire(a, { isIntersecting: false, boundingClientRect: { top: -900 } as DOMRectReadOnly });
    expect(a).toHaveClass("is-revealed");
  });

  test("is idempotent when several components on a page call it", () => {
    const { observers } = stubObserver();
    fixture();
    initReveal();
    initReveal();
    expect(observers.flatMap((o) => o.observed)).toHaveLength(3);
  });

  test("does nothing on pages without reveals", () => {
    const { observers } = stubObserver();
    document.body.innerHTML = "<main></main>";
    initReveal();
    expect(observers).toHaveLength(0);
  });

  test("reveals everything immediately without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const sections = fixture();
    initReveal();
    for (const s of sections) expect(s).toHaveClass("is-revealed");
    expect(document.querySelector(".motion-reveal")).toHaveClass("is-revealed");
  });
});
