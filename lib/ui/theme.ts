// Mode sombre (ex-V1.1, actif dans le prototype — CLAUDE.md 10 nov. 2026) : préférence par
// appareil (localStorage, conforts de lecture seulement), attribut data-theme sur <html>.

export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "pk-theme";

export function getTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolvedTheme(t: ThemeChoice): "light" | "dark" {
  if (t !== "system") return t;
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(t: ThemeChoice) {
  document.documentElement.setAttribute("data-theme", resolvedTheme(t));
}

export function setTheme(t: ThemeChoice) {
  try {
    if (t === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, t);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
  applyTheme(t);
}

/** Script exécuté avant le rendu (pas de flash clair au chargement d'une page sombre). */
export const THEME_BOOT = `(function(){try{var v=localStorage.getItem("${THEME_KEY}");var d=v==="dark"||(v!=="light"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})();`;
