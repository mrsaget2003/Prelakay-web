"use client";

// Menu mobile de la console (onglet « Plus ») — aMenu du prototype.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AMENU, type AMenuItem } from "@/lib/demo/adminMenu";
import { adminSession } from "@/lib/demo/adminSession";
import { auditLog } from "@/lib/demo/admin";
import { can } from "@/lib/domain/admin";
import { isAvailable } from "@/lib/config/release";
import { useToast } from "@/components/ui/Toast";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonBadge } from "@/components/ui/Tag";
import { AHead, useMe } from "@/components/admin/shell";
import { DataIcon, Fi } from "@/components/proto/ui";

export default function AdminMenu() {
  const me = useMe();
  const router = useRouter();
  const toast = useToast();
  const items = AMENU.filter((m): m is AMenuItem => m[0] !== "-" && can(me.role, (m as AMenuItem)[0]));
  return (
    <>
      <AHead title="Menu" />
      <div className="smenu">
        {items.map(([k, icon, label, path, f]) =>
          f && !isAvailable(f) ? (
            <ComingSoon key={k} feature={f}>
              <button className="panel lrow amr">
                <DataIcon cls={icon} />
                <span>{label}</span>
                <SoonBadge />
              </button>
            </ComingSoon>
          ) : (
            <Link key={k} prefetch={f ? false : undefined} className="panel lrow amr" href={`/admin${path ? "/" + path : ""}`}>
              <DataIcon cls={icon} />
              <span>{label}</span>
              <Fi s="chevron-right" />
            </Link>
          ),
        )}
        <button
          className="panel lrow amr"
          onClick={() => {
            auditLog(me, "Déconnexion", "Console admin");
            adminSession.logout();
            toast.show("Vous êtes déconnecté de la console");
            router.replace("/admin/login");
          }}
        >
          <Fi s="arrow-right-from-bracket" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </>
  );
}
