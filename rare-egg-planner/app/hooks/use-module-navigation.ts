"use client";

import { useCallback, useEffect, useState } from "react";

export type ModuleKey = "home" | "catalog" | "planner";

const VISIT_KEY = "roco-rare-egg-planner-visited-v1";
const LEGACY_MODULES: Record<string, ModuleKey> = {
  top: "home",
  resources: "home",
  collection: "catalog",
  plan: "planner",
  route: "planner",
};

function moduleFromHash(hash: string): ModuleKey | null {
  const value = hash.replace(/^#/, "");
  if (value === "home" || value === "catalog" || value === "planner") return value;
  return LEGACY_MODULES[value] ?? null;
}

export function useModuleNavigation() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("home");

  const openModule = useCallback((module: ModuleKey, historyMode: "push" | "replace" = "push") => {
    setActiveModule(module);
    const nextUrl = `${window.location.pathname}${window.location.search}#${module}`;
    window.history[historyMode === "replace" ? "replaceState" : "pushState"](null, "", nextUrl);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, []);

  useEffect(() => {
    const requestedModule = moduleFromHash(window.location.hash);
    let initialModule: ModuleKey = requestedModule ?? "home";

    try {
      const returningUser = window.localStorage.getItem(VISIT_KEY) === "1";
      window.localStorage.setItem(VISIT_KEY, "1");
      if (!requestedModule && returningUser) initialModule = "planner";
    } catch {
      // 本地存储不可用时保留首页作为安全默认值。
    }

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${initialModule}`);
    window.requestAnimationFrame(() => {
      setActiveModule(initialModule);
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    const syncFromHistory = () => {
      const nextModule = moduleFromHash(window.location.hash) ?? "home";
      setActiveModule(nextModule);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    };
    window.addEventListener("hashchange", syncFromHistory);
    window.addEventListener("popstate", syncFromHistory);

    const backToTop = document.querySelector<HTMLElement>(".back-to-top");
    const pageTop = document.getElementById("page-top");
    const topObserver = pageTop && backToTop ? new IntersectionObserver(([entry]) => {
      backToTop.classList.toggle("is-visible", !entry.isIntersecting);
    }, { threshold: 0 }) : null;
    if (topObserver && pageTop) topObserver.observe(pageTop);

    return () => {
      topObserver?.disconnect();
      window.removeEventListener("hashchange", syncFromHistory);
      window.removeEventListener("popstate", syncFromHistory);
    };
  }, []);

  return { activeModule, openModule };
}
