"use client";

// Résultats de recherche — #/search?q= du prototype.
import { useProtoRoute } from "@/components/proto/shell";
import { DiscoverView } from "@/components/proto/discover";

export default function SearchPage() {
  const r = useProtoRoute();
  return <DiscoverView q={r.q} params={r.params} />;
}
