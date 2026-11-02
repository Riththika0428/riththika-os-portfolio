// Light/dark theme helpers. The saved choice lives in localStorage; the
// inline script in app/layout.js applies it before first paint (no flash).
export const THEME_KEY = "theme";
export const DEFAULT_THEME = "dark";

export function readTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode / blocked storage: the choice just won't be remembered */
  }
}

// Runs in <head> before React hydrates. Keep it tiny and dependency-free.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t="${DEFAULT_THEME}";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}})();`;