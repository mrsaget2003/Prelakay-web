"use client";

// Journal d'activité — aAudit du prototype : chaque décision de la console.

import { useDemo } from "@/lib/demo/store";
import { AHead } from "@/components/admin/shell";

export default function Audit() {
  const s = useDemo();
  const A = s.admin.audit;
  return (
    <>
      <AHead title="Journal d'activité" crumb={[["Journal d'activité"]]} />
      <div className="panel">
        {A.length ? (
          <div className="tbl-w">
            <table className="tbl rsp">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Membre</th>
                  <th>Action</th>
                  <th>Cible</th>
                </tr>
              </thead>
              <tbody>
                {A.map((a, i) => (
                  <tr key={i}>
                    <td data-l="Heure">{a.at}</td>
                    <td data-l="Membre">
                      {a.who}
                      <br />
                      <span className="cap">{a.role}</span>
                    </td>
                    <td data-l="Action">{a.a}</td>
                    <td data-l="Cible">{a.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Aucune action enregistrée pendant cette session.</p>
        )}
      </div>
    </>
  );
}
