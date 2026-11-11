import { describe, it, expect } from "vitest";
import { waLink, fbLink } from "@/lib/proto/shareLinks";

// Partage : WhatsApp et Facebook s'ouvrent vraiment (plus de toast « Ouverture de… », spec §9).
describe("liens de partage", () => {
  it("WhatsApp : texte + lien encodés", () => {
    expect(waLink("https://prelakay.com/store/bel-soley", "Bel Soley sur Prélakay")).toBe(
      "https://wa.me/?text=Bel%20Soley%20sur%20Pr%C3%A9lakay%20https%3A%2F%2Fprelakay.com%2Fstore%2Fbel-soley",
    );
  });
  it("Facebook : lien encodé", () => {
    expect(fbLink("https://prelakay.com/p/tech-1")).toBe("https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fprelakay.com%2Fp%2Ftech-1");
  });
});
