"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { PETS } from "../data";
import { FLAG, OWN, migrateOwnedMap, petKey, type Focus, type OwnedMap } from "../planner-core";

const STORAGE_KEY = "roco-rare-nest-planner-v2";
const LEGACY_STORAGE_KEY = "roco-shiny-nest-planner-v1";
const PROGRESS_VERSION = 4;
const PET_MAP = new Map(PETS.map((pet) => [petKey(pet), pet]));

type StoredProgress = {
  version?: number;
  owned?: OwnedMap;
  nestCount?: number;
  focus?: Focus;
};

export function usePlannerProgress() {
  const [owned, setOwned] = useState<OwnedMap>({});
  const [nestCount, setNestCount] = useState(10);
  const [focus, setFocus] = useState<Focus>("all");
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取本机记录…");
  const [toast, setToast] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only progress is intentionally hydrated after SSR. */
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoredProgress;
        if (parsed.owned) setOwned(migrateOwnedMap(PETS, parsed.owned));
        if (parsed.nestCount) setNestCount(Math.min(10, Math.max(2, parsed.nestCount)));
        if (parsed.focus) setFocus(parsed.focus);
      }
      setSaveStatus("更改后已自动保存到本机");
    } catch {
      setSaveStatus("本机存储不可用，请导出进度备份");
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    /* eslint-disable react-hooks/set-state-in-effect -- save status reflects whether the external browser storage write succeeded. */
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: PROGRESS_VERSION, owned, nestCount, focus, savedAt: new Date().toISOString() }));
      setSaveStatus("更改后已自动保存到本机");
    } catch {
      setSaveStatus("本机存储不可用，请导出进度备份");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [owned, nestCount, focus, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function toggleOwned(key: string, bit: number) {
    const pet = PET_MAP.get(key);
    if (!pet) return;
    if ((pet.flags & FLAG.FEMALE_ONLY) && (bit === OWN.SHINY_M || bit === OWN.COLOR_M || bit === OWN.COMBO_M)) return;
    setOwned((current) => ({ ...current, [key]: (current[key] || 0) ^ bit }));
  }

  function exportProgress() {
    const payload = JSON.stringify({ version: PROGRESS_VERSION, owned, nestCount, focus, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "洛克异色炫彩孵蛋进度.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("进度文件已导出");
  }

  function importProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result)) as StoredProgress;
        if (!payload.owned) throw new Error("invalid");
        setOwned(migrateOwnedMap(PETS, payload.owned));
        if (payload.nestCount) setNestCount(Math.min(10, Math.max(2, payload.nestCount)));
        if (payload.focus) setFocus(payload.focus);
        setToast("进度已恢复");
      } catch {
        setToast("无法识别这个进度文件");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function clearProgress() {
    if (!window.confirm(`确定清空全部 ${PETS.length} 只精灵的异色、炫彩与组合形态记录吗？`)) return;
    setOwned({});
    setToast("拥有记录已清空");
  }

  return {
    owned,
    nestCount,
    setNestCount,
    focus,
    setFocus,
    saveStatus,
    toast,
    toggleOwned,
    exportProgress,
    importProgress,
    clearProgress,
  };
}
