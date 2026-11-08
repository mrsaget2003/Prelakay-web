import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./EmptyState.module.css";

// État vide (02-app-flow §3) : message explicite + action suggérée.
export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.ic}><Icon name={icon} /></span>
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
