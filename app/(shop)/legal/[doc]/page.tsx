"use client";

// Document légal (en préparation).
import { useParams } from "next/navigation";
import { LegalDoc } from "@/components/proto/legal";

export default function LegalDocPage() {
  const { doc } = useParams<{ doc: string }>();
  return <LegalDoc slug={doc} />;
}
