"use client";

// Page d'un event Prélakay (ex-V1.x, actif dans le prototype) : produits des stores participants.

import { useParams } from "next/navigation";
import { allProducts, storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { eventsList } from "@/lib/demo/marketing";
import { ProductCard } from "@/components/proto/cards";
import { Crumb } from "@/components/proto/legal";
import { EmptyBox, Fi, Page404 } from "@/components/proto/ui";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const e = eventsList(s).find((x) => x.id === id);
  if (!e) return <Page404 />;
  const list = allProducts().filter((p) => e.stores.includes(p.store));
  return (
    <div className="wrap">
      <Crumb items={[[e.n]]} />
      <section className="pt-hero ev">
        <div>
          <h1>{e.n}</h1>
          <p>
            Du {e.from} au {e.to} · {e.stores.map((x) => storeBy(x)?.n).filter(Boolean).join(", ") || "stores à venir"}
          </p>
        </div>
      </section>
      {list.length ? (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <EmptyBox icon={<Fi r="calendar" />} t="Les stores rejoignent l'event" p="Revenez bientôt pour voir les produits participants." />
      )}
    </div>
  );
}
