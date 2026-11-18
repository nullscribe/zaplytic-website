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
