import { formatHTG } from "@/lib/format";
import styles from "./Price.module.css";

// Prix (Onest 17 px gras sur la carte produit, 03-design §9.4) + prix barré en Caption.
export function Price({ amount, was, size = "md", className }: { amount: number; was?: number; size?: "md" | "lg"; className?: string }) {
  return (
    <span className={[styles.price, styles[size], className ?? ""].filter(Boolean).join(" ")}>
      <b>{formatHTG(amount)}</b>
      {was && was > amount ? <s>{formatHTG(was)}</s> : null}
    </span>
  );
}
