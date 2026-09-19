"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { PETS } from "../data";
import { FLAG, OWN, migrateOwnedMap, petKey, type Focus, type OwnedMap } from "../planner-core";

const STORAGE_KEY = "roco-rare-nest-planner-v2";
const LEGACY_STORAGE_KEY = "roco-shiny-nest-planner-v1";
const PROGRESS_VERSION = 5;
const PET_MAP = new Map(PETS.map((pet) => [petKey(pet), pet]));

type StoredProgress = {
  version?: number;
  owned?: OwnedMap;
  nestCount?: number;
  focus?: Focus;
  excludeBattlePass?: boolean;
};

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    id: string;
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<FileSystemFileHandle>;
};

function downloadProgress(payload: string) {
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "roco-rare-egg-progress.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function usePlannerProgress() {
  const [owned, setOwned] = useState<OwnedMap>({});
  const [nestCount, setNestCount] = useState(10);
  const [focus, setFocus] = useState<Focus>("all");
  const [excludeBattlePass, setExcludeBattlePass] = useState(false);
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
        if (typeof parsed.excludeBattlePass === "boolean") setExcludeBattlePass(parsed.excludeBattlePass);
      }
      setSaveStatus("已自动保存到本机");
    } catch {
      setSaveStatus("本机存储不可用，请导出进度作为备份");
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    /* eslint-disable react-hooks/set-state-in-effect -- save status reflects whether the external browser storage write succeeded. */
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: PROGRESS_VERSION, owned, nestCount, focus, excludeBattlePass, savedAt: new Date().toISOString() }));
      setSaveStatus("已自动保存到本机");
    } catch {
      setSaveStatus("本机存储不可用，请导出进度作为备份");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [owned, nestCount, focus, excludeBattlePass, hydrated]);

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

  async function exportProgress() {
    const buildPayload = () => JSON.stringify({ version: PROGRESS_VERSION, owned, nestCount, focus, excludeBattlePass, exportedAt: new Date().toISOString() }, null, 2);
    const savePicker = (window as SaveFilePickerWindow).showSaveFilePicker;

    if (savePicker) {
      try {
        const fileHandle = await savePicker.call(window, {
          id: "roco-progress-export",
          suggestedName: "roco-rare-egg-progress.json",
          types: [{ description: "洛克王国珍稀孵蛋规划进度", accept: { "application/json": [".json"] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(buildPayload());
        await writable.close();
        setToast("进度文件已保存");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setToast("已取消导出");
          return;
        }
      }
    }

    downloadProgress(buildPayload());
    setToast("另存为不可用，已改用浏览器下载");
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
        if (typeof payload.excludeBattlePass === "boolean") setExcludeBattlePass(payload.excludeBattlePass);
        setToast("进度导入成功");
      } catch {
        setToast("无法识别该进度文件");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function clearProgress() {
    const confirmed = window.confirm(`此操作无法撤销，建议先导出进度作为备份。\n\n确定清空全部 ${PETS.length} 只精灵的异色、炫彩与异色炫彩登记吗？`);
    if (!confirmed) return false;
    setOwned({});
    setToast("图鉴登记已清空");
    return true;
  }

  return {
    owned,
    nestCount,
    setNestCount,
    focus,
    setFocus,
    excludeBattlePass,
    setExcludeBattlePass,
    saveStatus,
    toast,
    toggleOwned,
    exportProgress,
    importProgress,
    clearProgress,
  };
}
