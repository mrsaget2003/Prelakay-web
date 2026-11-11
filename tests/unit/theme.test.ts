import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyTheme, getTheme, resolvedTheme, setTheme, THEME_KEY } from "@/lib/ui/theme";

// Mode sombre (ex-V1.1, actif dans le prototype) : clair, sombre ou selon l'appareil.
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("thème", () => {
  it("par défaut : selon l'appareil", () => {
    expect(getTheme()).toBe("system");
  });
  it("sombre : attribut data-theme sur <html> et choix gardé", () => {
    setTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(getTheme()).toBe("dark");
  });
  it("selon l'appareil : suit prefers-color-scheme", () => {
    const mm = vi.spyOn(window, "matchMedia").mockImplementation((q: string) => ({ matches: q.includes("dark"), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);
    expect(resolvedTheme("system")).toBe("dark");
    applyTheme("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    mm.mockRestore();
  });
  it("clair : data-theme=light", () => {
    setTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
