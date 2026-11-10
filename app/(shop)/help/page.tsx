"use client";

// Centre d'aide — pageHelp du prototype (recherche ?q=).
import { useProtoRoute } from "@/components/proto/shell";
import { Help } from "@/components/proto/subpages";

export default function HelpPage() {
  const r = useProtoRoute();
  return <Help key={r.q} q={r.q} />;
}
