/** Normalises a URL path for nav matching: drops ".html", "/index" and trailing slashes. */
export function normalizePath(pathname: string): string {
  return pathname.replace(/(\/index)?\.html$/, "").replace(/\/+$/, "") || "/";
}

/** Whether a nav link to `href` should be marked active on `pathname`. */
export function isActivePath(href: string, pathname: string): boolean {
  const current = normalizePath(pathname);
  return href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
}

/** Mobile menu: the button shows/hides the menu (the hamburger icon stays, as in the original design). */
export function initMobileNav(toggle: HTMLElement, menu: HTMLElement): void {
  toggle.addEventListener("click", () => {
    const open = !menu.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/** Places the gradient underline under the active link. */
export function positionUnderline(row: HTMLElement, bar: HTMLElement): void {
  const active = row.querySelector<HTMLElement>(".activeNav");
  if (!active) {
    bar.style.opacity = "0";
    return;
  }
  bar.style.opacity = "1";
  bar.style.left = `${active.offsetLeft}px`;
  bar.style.width = `${active.offsetWidth}px`;
  bar.style.top = `${active.offsetTop + active.offsetHeight - 2}px`;
}

/** Keeps the underline in place as the layout shifts (scrollbar appearing, resize, font swap). */
export function initNavUnderline(row: HTMLElement, bar: HTMLElement): () => void {
  const position = () => positionUnderline(row, bar);
  position();

  let observer: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(position);
    observer.observe(row);
    row.querySelectorAll("a").forEach((link) => observer?.observe(link));
  }
  document.fonts?.ready.then(position);

  return () => observer?.disconnect();
}
