import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

// Carte : radius-lg, padding 16, ombre unique (design-prelakay §8.4).
// La carte produit (radius-sm, 03-design §9.4) vit dans components/shop.
export function Card({ flat, className, ...rest }: HTMLAttributes<HTMLDivElement> & { flat?: boolean }) {
  return <div className={[styles.card, flat ? styles.flat : "", className ?? ""].filter(Boolean).join(" ")} {...rest} />;
}
