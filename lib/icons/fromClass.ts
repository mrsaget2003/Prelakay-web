import { ICONS, type IconName } from "./registry";

// Les données de démo (seed) gardent les classes Font Awesome du prototype
// (« fa-solid fa-shirt »). Cette fonction les traduit vers le registre, seul point
// d'entrée des icônes (le passage à Iconly Pro reste mécanique).

export function iconFromClass(cls: string): { name: IconName; variant: "solid" | "regular" } {
  const tokens = cls.split(/\s+/);
  const variant = tokens.includes("fa-regular") ? "regular" : "solid";
  const raw = tokens.find((t) => t.startsWith("fa-") && !["fa-solid", "fa-regular", "fa-brands"].includes(t));
  const key = raw?.slice(3) ?? "";
  const name = (key in ICONS ? key : "box") as IconName;
  return { name, variant };
}
