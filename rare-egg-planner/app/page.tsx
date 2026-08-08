"use client";

import { useMemo, useState } from "react";
import { CollectionSection } from "./components/collection-section";
import { PlannerSection } from "./components/planner-section";
import { RoadmapSection } from "./components/roadmap-section";
import { HeroSection, ResourcesSection, SiteFooter, SiteNavigation } from "./components/site-sections";
import { PETS } from "./data";
import { useModuleNavigation } from "./hooks/use-module-navigation";
import { usePlannerProgress } from "./hooks/use-planner-progress";
import { AUTO_PRIORITY, availableMotherVariants, createPlanner, isBattlePassPet, isBreedable, isEggTarget, ownsKind, petKey } from "./planner-core";

const SEASON_KEYS = Array.from(new Set(PETS.map((pet) => pet.season.match(/^S\d+/)?.[0]).filter((value): value is string => Boolean(value)))).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

export default function Home() {
  const { activeModule, openModule } = useModuleNavigation();
  const { owned, nestCount, setNestCount, focus, setFocus, excludeBattlePass, setExcludeBattlePass, saveStatus, toast, toggleOwned, exportProgress, importProgress, clearProgress } = usePlannerProgress();
  const [selectedPlan, setSelectedPlan] = useState(0);
  const activePets = useMemo(() => excludeBattlePass ? PETS.filter((pet) => !isBattlePassPet(pet)) : PETS, [excludeBattlePass]);
  const planner = useMemo(() => createPlanner(activePets), [activePets]);
  const planOptions = useMemo(() => planner.makeAutoPlanOptions(owned, nestCount, focus), [planner, owned, nestCount, focus]);
  const activePlanIndex = Math.min(selectedPlan, Math.max(0, planOptions.length - 1));
  const plan = planOptions[activePlanIndex];
  const roadmap = useMemo(() => planner.buildRoadmap(owned, focus, plan.kind, plan.objective), [planner, owned, focus, plan.kind, plan.objective]);
  const stats = useMemo(() => ({
    shiny: activePets.filter((pet) => ownsKind(owned[petKey(pet)], "shiny")).length,
    colorful: activePets.filter((pet) => ownsKind(owned[petKey(pet)], "colorful")).length,
    combo: activePets.filter((pet) => ownsKind(owned[petKey(pet)], "combo")).length,
    limitedMissing: activePets.filter((pet) => pet.availability === "season-limited" && isEggTarget(pet) && !ownsKind(owned[petKey(pet)], "shiny")).length,
    otherChannelMissing: activePets.filter((pet) => !ownsKind(owned[petKey(pet)], "shiny") && !isEggTarget(pet)).length,
  }), [activePets, owned]);
  const maleCount = AUTO_PRIORITY.some((kind) => planner.maleParents(owned, kind).length > 0);
  const femaleSeed = activePets.find((pet) => availableMotherVariants(owned[petKey(pet)]).length > 1 && isBreedable(pet));

  return (
    <main>
      <span className="module-top-sentinel" id="page-top" aria-hidden="true" />
      <SiteNavigation activeModule={activeModule} onModuleChange={openModule} />
      {activeModule === "home" && <div className="module-view module-view-home" role="tabpanel" aria-labelledby="module-tab-home">
        <HeroSection shinyCount={stats.shiny} colorfulCount={stats.colorful} comboCount={stats.combo} onModuleChange={openModule} />
        <ResourcesSection />
      </div>}
      {activeModule === "catalog" && <div className="module-view" role="tabpanel" aria-labelledby="module-tab-catalog">
        <CollectionSection
          pets={activePets}
          owned={owned}
          shinyCount={stats.shiny}
          colorfulCount={stats.colorful}
          comboCount={stats.combo}
          limitedMissingCount={stats.limitedMissing}
          otherChannelMissingCount={stats.otherChannelMissing}
          saveStatus={saveStatus}
          seasonKeys={SEASON_KEYS}
          excludeBattlePass={excludeBattlePass}
          onExcludeBattlePassChange={(value) => { setExcludeBattlePass(value); setSelectedPlan(0); }}
          onToggleOwned={(key, bit) => { toggleOwned(key, bit); setSelectedPlan(0); }}
          onExport={exportProgress}
          onImport={(event) => { setSelectedPlan(0); importProgress(event); }}
          onClear={() => { clearProgress(); setSelectedPlan(0); }}
        />
      </div>}
      {activeModule === "planner" && <div className="module-view" role="tabpanel" aria-labelledby="module-tab-planner">
        <PlannerSection
          plan={plan}
          planOptions={planOptions}
          activePlanIndex={activePlanIndex}
          nestCount={nestCount}
          focus={focus}
          seasonKeys={SEASON_KEYS}
          maleCount={maleCount}
          onDecreaseNest={() => { setNestCount((value) => Math.max(2, value - 1)); setSelectedPlan(0); }}
          onIncreaseNest={() => { setNestCount((value) => Math.min(10, value + 1)); setSelectedPlan(0); }}
          onFocusChange={(value) => { setFocus(value); setSelectedPlan(0); }}
          onPlanChange={setSelectedPlan}
          onOpenCatalog={() => openModule("catalog")}
        />
        <RoadmapSection activeKind={plan.kind} roadmap={roadmap} femaleSeed={femaleSeed} />
      </div>}
      <SiteFooter />
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
