"use client";

// Discovery — #/discover du prototype (catégories, filtres, tri, quota « Nouveaux »).
import { useProtoRoute } from "@/components/proto/shell";
import { DiscoverView } from "@/components/proto/discover";

export default function DiscoverPage() {
  const r = useProtoRoute();
  return <DiscoverView q="" params={r.params} />;
}
