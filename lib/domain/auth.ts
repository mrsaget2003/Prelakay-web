// Connexion et inscription (12 nov. 2026) : règles pures, partagées démo / production.
// L'inscription demande la confirmation du mot de passe (Marc-Karlin).

export const PASSWORD_MIN = 8;

export type SignupInput = { email: string; username: string; password: string; confirm: string };
export type LoginInput = { email: string; password: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-z0-9_]{3,20}$/;

/** @username : 3 à 20 caractères, lettres minuscules, chiffres et « _ » ; le « @ » est facultatif. */
export function normalizeUsername(u: string): string {
  return u.trim().replace(/^@/, "").toLowerCase();
}

export function validateSignup(x: SignupInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!EMAIL.test(x.email.trim())) e.email = "Indiquez une adresse e-mail valide.";
  if (!USERNAME.test(normalizeUsername(x.username))) e.username = "3 à 20 caractères : lettres, chiffres ou « _ ».";
  if (x.password.length < PASSWORD_MIN) e.password = `${PASSWORD_MIN} caractères au minimum.`;
  if (!x.confirm) e.confirm = "Confirmez votre mot de passe.";
  else if (x.confirm !== x.password) e.confirm = "Les deux mots de passe ne sont pas identiques.";
  return e;
}

export function validateLogin(x: LoginInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!EMAIL.test(x.email.trim())) e.email = "Indiquez une adresse e-mail valide.";
  if (!x.password) e.password = "Indiquez votre mot de passe.";
  return e;
}
