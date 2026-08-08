"use client";

import Image from "next/image";
import { type ChangeEventHandler, useMemo, useRef, useState } from "react";
import { EGG_GROUPS, PETS, type Pet } from "../data";
import { FLAG, OWN, isBreedable, ownsKind, petKey, petLabel, seasonMatches, type Focus, type OwnedMap } from "../planner-core";
import { PetImage } from "./pet-image";

type ViewFilter = "all" | "owned" | "missing";

type CollectionSectionProps = {
  owned: OwnedMap;
  shinyCount: number;
  colorfulCount: number;
  comboCount: number;
  limitedMissingCount: number;
  otherChannelMissingCount: number;
  saveStatus: string;
  seasonKeys: string[];
  onToggleOwned: (key: string, bit: number) => void;
  onExport: () => void;
  onImport: ChangeEventHandler<HTMLInputElement>;
  onClear: () => void;
};

function PetCard({ pet, ownedMask, onToggleOwned }: { pet: Pet; ownedMask: number; onToggleOwned: (key: string, bit: number) => void }) {
  const key = petKey(pet);
  const disabled = !isBreedable(pet);
  const offspring = pet.offspringKey && pet.offspringKey !== key ? PETS.find((candidate) => petKey(candidate) === pet.offspringKey) : undefined;
  const offspringLabel = offspring ? petLabel(offspring) : petLabel(pet);
  const inheritanceNote = offspring ? `，繁育后代：${offspringLabel}；${pet.offspringReason}` : "";
  const rows = [
    { variant: "shiny", label: "异色", male: OWN.SHINY_M, female: OWN.SHINY_F },
    { variant: "colorful", label: "炫彩", male: OWN.COLOR_M, female: OWN.COLOR_F },
    { variant: "combo", label: "异色炫彩", male: OWN.COMBO_M, female: OWN.COMBO_F },
  ] as const;
  return (
    <article className={`pet-card ${ownedMask ? "has-rare" : "missing-rare"} ${disabled ? "unbreedable" : ""}`}>
      <div className="pet-visual">
        <PetImage pet={pet} />
        <span className="season-tag">{pet.season.slice(0, 2)}</span>
        <span className={`availability-tag ${pet.availability}`}>{pet.availability === "permanent" ? "常驻 · 低优" : "限时 · 优先"}</span>
        {Boolean(ownedMask) && <span className="owned-tag">已登记</span>}
        {disabled && <span className="lock-tag">不可繁育</span>}
        {offspring && <span className="inheritance-tag">后代为原形态</span>}
      </div>
      <div className="pet-info">
        <h3>
          <span className="pet-name">{pet.name}</span>
          <span className="pet-info-trigger" tabIndex={0} aria-label={`${petLabel(pet)}，异色时效：${pet.availabilityReason}，蛋组：${pet.groups.length ? pet.groups.join("、") : "无可用蛋组"}${inheritanceNote}${pet.evolutionChain.length > 1 ? `，进化链：${pet.evolutionChain.join(" → ")}` : ""}`}>
            i
            <span className="pet-evolution-tooltip" role="tooltip">
              {pet.form && <span className="pet-tooltip-section"><strong>地区形态</strong><span>{pet.form}</span></span>}
              <span className="pet-tooltip-section"><strong>异色时效</strong><span>{pet.availabilityReason}</span></span>
              <span className="pet-tooltip-section"><strong>所在蛋组</strong><span>{pet.groups.length ? pet.groups.join(" · ") : "无可用蛋组"}</span></span>
              {offspring && <span className="pet-tooltip-section offspring-result"><strong>繁育后代</strong><span>{offspringLabel}<small>{pet.offspringReason}</small></span></span>}
              {pet.evolutionChain.length > 1 && <span className="pet-tooltip-section"><strong>进化链与附加形态</strong><span>{pet.evolutionChain.join(" → ")}</span></span>}
            </span>
          </span>
        </h3>
        {pet.form && <span className="pet-form-label">地区形态 · {pet.form}</span>}
        <p>{pet.groups.length ? pet.groups.join(" · ") : "无可用蛋组"}</p>
      </div>
      <div className="rare-picker" role="group" aria-label={`${petLabel(pet)}珍稀形态与性别`}>
        {rows.map((row) => (
          <div className={`rare-row variant-${row.variant}`} key={row.variant}>
            <div className="variant-label"><span className={`variant-mark mark-${row.variant}`} aria-hidden="true"><Image src={`/assets/traits/mark-${row.variant}.png`} alt="" width={26} height={26} unoptimized /></span><span>{row.label}</span></div>
            <button type="button" disabled={Boolean(pet.flags & FLAG.FEMALE_ONLY)} className={`gender-button gender-male ${ownedMask & row.male ? "active" : ""}`} aria-pressed={Boolean(ownedMask & row.male)} onClick={() => onToggleOwned(key, row.male)} title={pet.flags & FLAG.FEMALE_ONLY ? "此精灵仅有母性" : `${row.label}公体`}>♂</button>
            <button type="button" className={`gender-button gender-female ${ownedMask & row.female ? "active" : ""}`} aria-pressed={Boolean(ownedMask & row.female)} onClick={() => onToggleOwned(key, row.female)} title={`${row.label}母体`}>♀</button>
          </div>
        ))}
      </div>
    </article>
  );
}

export function CollectionSection({ owned, shinyCount, colorfulCount, comboCount, limitedMissingCount, otherChannelMissingCount, saveStatus, seasonKeys, onToggleOwned, onExport, onImport, onClear }: CollectionSectionProps) {
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<Focus>("all");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [eggGroupFilter, setEggGroupFilter] = useState("all");
  const importRef = useRef<HTMLInputElement>(null);
  const visiblePets = useMemo(() => PETS.filter((pet) => {
    const query = search.trim().toLowerCase();
    if (query && !`${pet.name}${pet.form}${pet.groups.join("")}${pet.availabilityReason}${pet.offspringReason}`.toLowerCase().includes(query)) return false;
    if (!seasonMatches(pet, seasonFilter)) return false;
    if (eggGroupFilter === "none" && pet.groups.length) return false;
    if (eggGroupFilter !== "all" && eggGroupFilter !== "none" && !pet.groups.includes(eggGroupFilter)) return false;
    if (viewFilter === "owned" && !owned[petKey(pet)]) return false;
    if (viewFilter === "missing" && ownsKind(owned[petKey(pet)], "shiny")) return false;
    return true;
  }), [search, seasonFilter, eggGroupFilter, viewFilter, owned]);

  return (
    <section className="collection-section" id="collection">
      <div className="section-heading collection-heading">
        <div><p className="eyebrow">MY RARE CATALOG</p><h2>异色 · 炫彩图鉴</h2><p className="collection-note">三类记录互不覆盖；“异色炫彩”会同时计入异色与炫彩拥有进度；同名地区形态按独立卡片登记。后天形成的形态仍可登记并作为亲本，但不会被当作可原样孵出的目标。当前尚缺 {limitedMissingCount} 张可孵的赛季限时异色，推荐会先推进它们。</p></div>
        <div className="save-actions"><button type="button" onClick={onExport}>导出进度</button><button type="button" onClick={() => importRef.current?.click()}>导入进度</button><button className="danger-link" type="button" onClick={onClear}>清空</button><input ref={importRef} type="file" accept="application/json,.json" onChange={onImport} hidden /></div>
      </div>
      <div className="catalog-stats"><div><strong>{shinyCount}</strong><span>有异色</span></div><div><strong>{colorfulCount}</strong><span>有炫彩</span></div><div><strong>{comboCount}</strong><span>异色炫彩</span></div><div><strong>{otherChannelMissingCount}</strong><span>需其他渠道</span></div><p>{saveStatus}</p></div>
      <div className="catalog-toolbar">
        <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索精灵或蛋组" aria-label="搜索精灵或蛋组" /></label>
        <div className="filter-group" role="group" aria-label="赛季筛选">{(["all", ...seasonKeys] as Focus[]).map((value) => <button type="button" className={seasonFilter === value ? "active" : ""} key={value} onClick={() => setSeasonFilter(value)}>{value === "all" ? "全部赛季" : value}</button>)}</div>
        <div className="filter-group view" role="group" aria-label="拥有状态筛选">{(["all", "owned", "missing"] as ViewFilter[]).map((value) => <button type="button" className={viewFilter === value ? "active" : ""} key={value} onClick={() => setViewFilter(value)}>{value === "all" ? "全部" : value === "owned" ? "已拥有" : "未拥有"}</button>)}</div>
      </div>
      <div className="egg-group-filter-panel">
        <div className="egg-group-filter-heading"><div><span>EGG GROUP INDEX</span><strong>按蛋组查看图鉴</strong></div><p><b>{visiblePets.length}</b> 只符合当前条件</p></div>
        <div className="egg-group-filter-list" role="group" aria-label="蛋组筛选">
          {(["all", ...EGG_GROUPS, "none"] as string[]).map((group) => {
            const count = group === "all" ? PETS.length : PETS.filter((pet) => group === "none" ? !pet.groups.length : pet.groups.includes(group)).length;
            const label = group === "all" ? "全部蛋组" : group === "none" ? "无蛋组" : group;
            return <button type="button" key={group} className={eggGroupFilter === group ? "active" : ""} aria-pressed={eggGroupFilter === group} onClick={() => setEggGroupFilter(group)}><span>{label}</span><small>{count}</small></button>;
          })}
        </div>
      </div>
      <div className="pet-grid">{visiblePets.map((pet) => <PetCard key={petKey(pet)} pet={pet} ownedMask={owned[petKey(pet)] || 0} onToggleOwned={onToggleOwned} />)}</div>
      {!visiblePets.length && <div className="no-results">没有符合当前筛选的精灵。</div>}
    </section>
  );
}
