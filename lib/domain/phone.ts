// Inscription par téléphone + code SMS (ex-V2, active dans le prototype). En démonstration, le code
// est dérivé du numéro et affiché dans le bandeau démo ; en production : envoi SMS (fournisseur à choisir).

/** Numéro haïtien à 8 chiffres ; « +509 » facultatif ; null si invalide. */
export function normalizeHtPhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^\d{8}$/.test(d) ? d : null;
}

/** Code de démonstration (6 chiffres), stable pour un même numéro. */
export function demoOtp(phone: string): string {
  let h = 7;
  for (const c of phone) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String(100000 + (h % 900000));
}

export function otpOk(phone: string, code: string): boolean {
  return code.replace(/\s/g, "") === demoOtp(phone);
}
