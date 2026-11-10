import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFollowStore, FOLLOW_KEY, __resetFollows } from "@/lib/hooks/useFollowStore";

// D.3 — « Suivre » un store : localStorage (try/catch), lu après le montage.
beforeEach(() => {
  localStorage.clear();
  __resetFollows();
});

describe("useFollowStore", () => {
  it("lit l'état sauvegardé après le montage", () => {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(["bel-soley"]));
    const { result } = renderHook(() => useFollowStore("bel-soley"));
    expect(result.current.following).toBe(true);
    expect(result.current.ready).toBe(true);
  });

  it("bascule et enregistre", () => {
    const { result } = renderHook(() => useFollowStore("tech-sud"));
    expect(result.current.following).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.following).toBe(true);
    expect(JSON.parse(localStorage.getItem(FOLLOW_KEY)!)).toEqual(["tech-sud"]);
    act(() => result.current.toggle());
    expect(result.current.following).toBe(false);
    expect(JSON.parse(localStorage.getItem(FOLLOW_KEY)!)).toEqual([]);
  });

  it("deux instances du même store restent synchronisées", () => {
    const a = renderHook(() => useFollowStore("kay-pratik"));
    const b = renderHook(() => useFollowStore("kay-pratik"));
    act(() => a.result.current.toggle());
    expect(b.result.current.following).toBe(true);
  });

  it("stockage indisponible : pas d'erreur, l'état reste en mémoire", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(() => useFollowStore("moto-pyes"));
    act(() => result.current.toggle());
    expect(result.current.following).toBe(true);
    spy.mockRestore();
  });
});
