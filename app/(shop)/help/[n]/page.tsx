"use client";

// Article d'aide — pageHelpArticle du prototype.
import { useParams } from "next/navigation";
import { HelpArticle } from "@/components/proto/subpages";

export default function HelpArticlePage() {
  const { n } = useParams<{ n: string }>();
  return <HelpArticle n={n} />;
}
