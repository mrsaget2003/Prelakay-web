// Équivalent de parse() du prototype : le prototype lit « #/nom/id/sous?params »,
// l'application lit le chemin Next.js. La coque (header, barre mobile, onglets)
// décide de son affichage à partir de ce même objet, comme render() du prototype.

export type ProtoRoute = {
  name: string;
  id: string | null;
  sub: string | null;
  params: Record<string, string>;
  q: string;
  tab: string;
};

export function parseRoute(pathname: string, search: string): ProtoRoute {
  const parts = pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  const params: Record<string, string> = {};
  new URLSearchParams(search).forEach((v, k) => {
    params[k] = v;
  });
  const name = parts[0] || "home";
  let tab = "";
  if (name === "discover") tab = params.sort === "new" ? "new" : params.sort === "near" ? "near" : params.ready ? "ready" : "";
  if (name === "map") tab = "map";
  return { name, id: parts[1] ?? null, sub: parts[2] ?? null, params, q: params.q || "", tab };
}
