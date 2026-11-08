import type { ReactNode } from "react";
import styles from "./Tag.module.css";

// Étiquettes de statut du prototype (tag-new / neu / ok / warn / err).
export type TagTone = "new" | "neu" | "ok" | "warn" | "err";

export function Tag({ tone, children, className }: { tone: TagTone; children: ReactNode; className?: string }) {
  return (
    <span data-tone={tone} className={[styles.tag, styles[tone], className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

/** Pastille « À venir » posée à côté d'une entrée de menu d'une version future. */
export function SoonBadge() {
  return <span className={styles.soon}>À venir</span>;
}
