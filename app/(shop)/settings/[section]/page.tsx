"use client";

// Section de paramètres (profil, secu, notifs, lang, ville, privacy) — pageSettings(sec) du prototype.
import { useParams } from "next/navigation";
import { Settings } from "@/components/proto/subpages";

export default function SettingsSectionPage() {
  const { section } = useParams<{ section: string }>();
  return <Settings sec={section} />;
}
