import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ToastProvider } from "@/components/ui/Toast";

/** `render` dans un ToastProvider (le toast vit à la racine de l'app). */
export function renderWithToast(ui: ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}
