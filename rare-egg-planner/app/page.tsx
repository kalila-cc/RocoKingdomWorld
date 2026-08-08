"use client";

import { useMemo, useState } from "react";
import { CollectionSection } from "./components/collection-section";
import { PlannerSection } from "./components/planner-section";
import { RoadmapSection } from "./components/roadmap-section";
import { HeroSection, RulesSection, SiteFooter, SiteNavigation } from "./components/site-sections";
import { PETS } from "./data";
import { usePlannerProgress } from "./hooks/use-planner-progress";
import { AUTO_PRIORITY, availableMotherVariants, createPlanner, isBreedable, isEggTarget, ownsKind, petKey } from "./planner-core";

const PLANNER = createPlanner(PETS);
const SEASON_KEYS = Array.from(new Set(PETS.map((pet) => pet.season.match(/^S\d+/)?.[0]).filter((value): value is string => Boolean(value)))).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

export default function Home() {
  const { owned, nestCount, setNestCount, focus, setFocus, saveStatus, toast, toggleOwned, exportProgress, importProgress, clearProgress } = usePlannerProgress();
  const [salt, setSalt] = useState(0);
  const plan = useMemo(() => PLANNER.makeAutoPlan(owned, nestCount, focus, salt), [owned, nestCount, focus, salt]);
  const roadmap = useMemo(() => PLANNER.buildRoadmap(owned, focus, plan.kind, plan.objective), [owned, focus, plan.kind, plan.objective]);
  const stats = useMemo(() => ({
    shiny: PETS.filter((pet) => ownsKind(owned[petKey(pet)], "shiny")).length,
    colorful: PETS.filter((pet) => ownsKind(owned[petKey(pet)], "colorful")).length,
    combo: PETS.filter((pet) => ownsKind(owned[petKey(pet)], "combo")).length,
    limitedMissing: PETS.filter((pet) => pet.availability === "season-limited" && isEggTarget(pet) && !ownsKind(owned[petKey(pet)], "shiny")).length,
    otherChannelMissing: PETS.filter((pet) => !ownsKind(owned[petKey(pet)], "shiny") && !isEggTarget(pet)).length,
  }), [owned]);
  const maleCount = AUTO_PRIORITY.some((kind) => PLANNER.maleParents(owned, kind).length > 0);
  const femaleSeed = PETS.find((pet) => availableMotherVariants(owned[petKey(pet)]).length > 1 && isBreedable(pet));

  return (
    <main>
      <SiteNavigation />
      <HeroSection shinyCount={stats.shiny} colorfulCount={stats.colorful} comboCount={stats.combo} />
      <PlannerSection
        plan={plan}
        nestCount={nestCount}
        focus={focus}
        seasonKeys={SEASON_KEYS}
        maleCount={maleCount}
        onDecreaseNest={() => setNestCount((value) => Math.max(2, value - 1))}
        onIncreaseNest={() => setNestCount((value) => Math.min(10, value + 1))}
        onFocusChange={setFocus}
        onRefresh={() => setSalt((value) => value + 1)}
      />
      <RoadmapSection activeKind={plan.kind} roadmap={roadmap} femaleSeed={femaleSeed} />
      <CollectionSection
        owned={owned}
        shinyCount={stats.shiny}
        colorfulCount={stats.colorful}
        comboCount={stats.combo}
        limitedMissingCount={stats.limitedMissing}
        otherChannelMissingCount={stats.otherChannelMissing}
        saveStatus={saveStatus}
        seasonKeys={SEASON_KEYS}
        onToggleOwned={toggleOwned}
        onExport={exportProgress}
        onImport={importProgress}
        onClear={clearProgress}
      />
      <RulesSection />
      <SiteFooter />
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
