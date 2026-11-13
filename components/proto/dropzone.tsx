"use client";

// Dépôt de fichier « magnétique » (13 nov. 2026) — composant MagneticDropZone fourni par
// Marc-Karlin, traduit dans nos styles : Font Awesome au lieu de Phosphor, CSS du projet au
// lieu de Tailwind, aucune dépendance ajoutée (motion est déjà validé).
//
// Pendant qu'on fait glisser un fichier dans la fenêtre, la zone se penche vers lui (ressort
// sans rebond : elle suit le pointeur) ; au survol, elle s'agrandit de 2,5 %. Sur mobile il
// n'y a pas de glisser-déposer : un toucher ouvre l'appareil photo ou la galerie.
// Une fois la photo choisie, on la voit en aperçu, avec « Remplacer » et « Retirer ».

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Fi } from "./ui";

const MAGNET_DISTANCE = 180;
const MAX_OFFSET = 10;
const MAGNET_SPRING = { damping: 24, mass: 0.65, stiffness: 280 };

function isFileDrag(dt: DataTransfer | null) {
  return dt ? Array.from(dt.types).includes("Files") : false;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

export function MagneticDropZone({
  label,
  maxSize = 20 * 1024 * 1024,
  onChange,
}: {
  /** « Recto », « Verso », « Photo du produit »… */
  label: string;
  maxSize?: number;
  onChange: (file: File | null) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [near, setNear] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const ms = useMotionValue(1);
  const sx = useSpring(mx, MAGNET_SPRING);
  const sy = useSpring(my, MAGNET_SPRING);
  const ss = useSpring(ms, MAGNET_SPRING);
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0) scale(${ss})`;

  const reset = useCallback(() => {
    mx.set(0);
    my.set(0);
    ms.set(1);
    setNear(false);
    setOver(false);
  }, [mx, my, ms]);

  // l'aperçu suit le fichier ; l'ancienne URL est libérée à chaque changement et au démontage
  const previewRef = useRef<string | null>(null);
  const showPreview = (f: File | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    // createObjectURL manque dans certains environnements (jsdom des tests) : pas d'aperçu, rien d'autre ne change
    previewRef.current = f && f.type.startsWith("image/") && typeof URL.createObjectURL === "function" ? URL.createObjectURL(f) : null;
    setPreview(previewRef.current);
  };
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  useEffect(() => {
    function onDragOver(e: globalThis.DragEvent) {
      if (!isFileDrag(e.dataTransfer) || !zone.current) return;
      const r = zone.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = Math.max(Math.abs(e.clientX - cx) - r.width / 2, 0);
      const dy = Math.max(Math.abs(e.clientY - cy) - r.height / 2, 0);
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / MAGNET_DISTANCE);
      if (!proximity) return reset();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      const ddx = e.clientX - cx;
      const ddy = e.clientY - cy;
      const d = Math.max(Math.hypot(ddx, ddy), 1);
      const offset = inside ? 0 : proximity * MAX_OFFSET;
      mx.set(reduce ? 0 : (ddx / d) * offset);
      my.set(reduce ? 0 : (ddy / d) * offset);
      ms.set(reduce ? 1 : inside ? 1.025 : 1.01);
      setNear(true);
      setOver(inside);
    }
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
    };
  }, [mx, my, ms, reduce, reset]);

  const accept = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError(`${f.name} n'est pas une photo.`);
      return;
    }
    if (f.size > maxSize) {
      setError(`${f.name} dépasse ${formatBytes(maxSize)}.`);
      return;
    }
    setError(null);
    setFile(f);
    showPreview(f);
    onChange(f);
  };
  const clear = () => {
    setFile(null);
    showPreview(null);
    setError(null);
    onChange(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    accept(e.dataTransfer.files[0]);
    reset();
  };
  const onZoneDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    accept(e.target.files?.[0]);
    e.target.value = "";
  };

  const title = over ? "Lâchez pour l'ajouter" : near ? "Approchez-la" : label;

  return (
    <div className="mdz-w">
      <motion.div
        ref={zone}
        className={`mdz${near ? " near" : ""}${over ? " over" : ""}${file ? " has" : ""}`}
        onDragOver={onZoneDragOver}
        onDrop={onDrop}
        style={{ transform: reduce ? undefined : transform }}
      >
        <input ref={input} id={id} type="file" accept="image/*" className="sr" aria-label={label} onChange={onInput} />
        {file ? (
          <div className="mdz-done">
            {preview ? (
              // aperçu local (blob:) : l'optimiseur Next ne s'applique pas
              // eslint-disable-next-line @next/next/no-img-element
              <img className="mdz-pv" src={preview} alt={`${label} : aperçu`} />
            ) : null}
            <div className="mdz-meta">
              <b>
                <Fi s="circle-check" className="ok-c" /> {label}
              </b>
              <span className="cap">{formatBytes(file.size)}</span>
              <span className="mdz-acts">
                <button type="button" className="btn btn-o btn-sm" onClick={() => input.current?.click()}>
                  Remplacer
                </button>
                <button type="button" className="btn btn-o btn-sm" aria-label={`Retirer ${label}`} onClick={clear}>
                  <Fi s="xmark" />
                </button>
              </span>
            </div>
          </div>
        ) : (
          <label htmlFor={id} className="mdz-pick">
            <Fi s="upload" className="mdz-ic" />
            <b>{title}</b>
            <span className="cap mdz-hint-d">Glissez la photo ici, ou cliquez</span>
            <span className="cap mdz-hint-m">Prendre ou choisir une photo</span>
          </label>
        )}
      </motion.div>
      {error ? (
        <p className="ferr" role="alert">
          <Fi s="circle-exclamation" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
