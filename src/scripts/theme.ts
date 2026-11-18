export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function currentTheme(root: HTMLElement = document.documentElement): Theme {
  return root.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable */
  }
}

export function toggleLabel(theme: Theme): string {
  return theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

/**
 * Wires a theme toggle button. The sun/moon icons switch purely via the `dark:` CSS
 * variant; this keeps the accessible label in sync and flips the theme on click.
 * Returns a cleanup function.
 */
export function initThemeToggle(
  button: HTMLElement,
  root: HTMLElement = document.documentElement
): () => void {
  const syncLabel = () => {
    const label = toggleLabel(currentTheme(root));
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  };

  const onClick = () => {
    applyTheme(currentTheme(root) === "dark" ? "light" : "dark", root);
    syncLabel();
  };

  syncLabel();
  button.addEventListener("click", onClick);
  // Also follow theme changes made elsewhere (another toggle on the page)
  const observer = new MutationObserver(syncLabel);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });

  return () => {
    button.removeEventListener("click", onClick);
    observer.disconnect();
  };
}
