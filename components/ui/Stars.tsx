import { Icon } from "./Icon";
import styles from "./Stars.module.css";

/** Règle du prototype (fonction stars) : pleine si r ≥ i − 0,25, demie si r ≥ i − 0,75, sinon vide. */
export function starKinds(value: number): Array<"full" | "half" | "empty"> {
  return [1, 2, 3, 4, 5].map((i) => (value >= i - 0.25 ? "full" : value >= i - 0.75 ? "half" : "empty"));
}

export function Stars({ value, className }: { value: number; className?: string }) {
  const label = `Note : ${value.toFixed(1).replace(".", ",")} sur 5`;
  return (
    <span role="img" aria-label={label} className={[styles.stars, className ?? ""].filter(Boolean).join(" ")}>
      {starKinds(value).map((k, i) => (
        <span key={i} data-star={k} className={k === "empty" ? styles.empty : undefined}>
          <Icon name={k === "half" ? "star-half-stroke" : "star"} variant={k === "empty" ? "regular" : "solid"} />
        </span>
      ))}
    </span>
  );
}
