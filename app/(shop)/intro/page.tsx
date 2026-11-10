"use client";

// #/intro du prototype : relance l'intro, puis revient à l'accueil.
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { demo } from "@/lib/demo/store";

export default function IntroPage() {
  const router = useRouter();
  useEffect(() => {
    demo.update((d) => {
      d.introDone = false;
      d.introStep = 0;
    });
    router.replace("/");
  }, [router]);
  return null;
}
