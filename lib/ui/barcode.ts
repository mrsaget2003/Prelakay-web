// Scan de code-barres (ex-V2, actif dans le prototype) : BarcodeDetector du navigateur s'il existe ;
// sinon le vendeur saisit le code. null = pas de code lu.

type Detector = { detect(src: CanvasImageSource): Promise<{ rawValue: string }[]> };

export function barcodeSupported(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export async function scanBarcode(video: HTMLVideoElement): Promise<string | null> {
  if (!barcodeSupported()) return null;
  const D = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
  const d = new D({ formats: ["ean_13", "ean_8", "upc_a", "code_128"] });
  const r = await d.detect(video);
  return r[0]?.rawValue ?? null;
}
