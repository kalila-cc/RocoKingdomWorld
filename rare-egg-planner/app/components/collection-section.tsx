"use client";

import Image from "next/image";
import { type ChangeEventHandler, useMemo, useRef, useState } from "react";
import { EGG_GROUPS, PETS, PET_SERIES, type Pet } from "../data";
import { FLAG, OWN, isBattlePassPet, isBreedable, ownsKind, petKey, petLabel, seasonMatches, type Focus, type OwnedMap } from "../planner-core";
import { SERIES_ICONS } from "../series-icons";
import { PetImage } from "./pet-image";

type ViewFilter = "all" | "owned" | "missing";
type GenderFilter = "all" | "male" | "female";

function SeriesIcon({ series, className }: { series: string; className: string }) {
  const fileName = SERIES_ICONS[series];
  return fileName ? <Image className={className} src={`/assets/series/${fileName}`} alt="" width={64} height={64} unoptimized /> : null;
}

type CollectionSectionProps = {
  pets: Pet[];
  owned: OwnedMap;
  shinyCount: number;
  colorfulCount: number;
  comboCount: number;
  limitedMissingCount: number;
  otherChannelMissingCount: number;
  saveStatus: string;
  seasonKeys: string[];
  excludeBattlePass: boolean;
  onExcludeBattlePassChange: (value: boolean) => void;
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
        <span className={`availability-tag ${pet.availability}`}>{isBattlePassPet(pet) ? "战令异色" : pet.availability === "permanent" ? "常驻 · 低优" : "限时 · 优先"}</span>
        {Boolean(ownedMask) && <span className="owned-tag">已登记</span>}
        {disabled && <span className="lock-tag">不可繁育</span>}
        {offspring && <span className="inheritance-tag">后代不继承此形态</span>}
      </div>
      <div className="pet-info">
        <h3>
          <span className="pet-name">{pet.name}</span>
          <span className="pet-info-trigger" tabIndex={0} aria-label={`${petLabel(pet)}，系别：${pet.series.join("、")}，异色获取信息：${pet.availabilityReason}，蛋组：${pet.groups.length ? pet.groups.join("、") : "无可用蛋组"}${inheritanceNote}${pet.evolutionChain.length > 1 ? `，进化链：${pet.evolutionChain.join(" → ")}` : ""}`}>
            i
            <span className="pet-evolution-tooltip" role="tooltip">
              {pet.form && <span className="pet-tooltip-section"><strong>地区形态</strong><span>{pet.form}</span></span>}
              <span className="pet-tooltip-section"><strong>所属系别</strong><span>{pet.series.map((series) => `${series}系`).join(" · ")}</span></span>
              <span className="pet-tooltip-section"><strong>异色获取信息</strong><span>{pet.availabilityReason}</span></span>
              <span className="pet-tooltip-section"><strong>所在蛋组</strong><span>{pet.groups.length ? pet.groups.join(" · ") : "无可用蛋组"}</span></span>
              {offspring && <span className="pet-tooltip-section offspring-result"><strong>繁育后代</strong><span>{offspringLabel}<small>{pet.offspringReason}</small></span></span>}
              {pet.evolutionChain.length > 1 && <span className="pet-tooltip-section"><strong>进化链及其他形态</strong><span>{pet.evolutionChain.join(" → ")}</span></span>}
            </span>
          </span>
        </h3>
        {pet.form && <span className="pet-form-label">地区形态 · {pet.form}</span>}
        {isBattlePassPet(pet) && <span className="pet-source-label">战令来源</span>}
        <span className="pet-series-list" aria-label={`所属系别：${pet.series.map((series) => `${series}系`).join("、")}`}>{pet.series.map((series) => <span key={series}><SeriesIcon series={series} className="pet-series-icon" /><span>{series}系</span></span>)}</span>
        <p>{pet.groups.length ? pet.groups.join(" · ") : "无可用蛋组"}</p>
      </div>
      <div className="rare-picker" role="group" aria-label={`${petLabel(pet)}珍稀形态与性别`}>
        {rows.map((row) => (
          <div className={`rare-row variant-${row.variant}`} key={row.variant}>
            <div className="variant-label"><span className={`variant-mark mark-${row.variant}`} aria-hidden="true"><Image src={`/assets/traits/mark-${row.variant}.png`} alt="" width={26} height={26} unoptimized /></span><span>{row.label}</span></div>
            <button type="button" disabled={Boolean(pet.flags & FLAG.FEMALE_ONLY)} className={`gender-button gender-male ${ownedMask & row.male ? "active" : ""}`} aria-pressed={Boolean(ownedMask & row.male)} onClick={() => onToggleOwned(key, row.male)} title={pet.flags & FLAG.FEMALE_ONLY ? "该精灵仅有雌性" : `${row.label}父本`}>♂</button>
            <button type="button" className={`gender-button gender-female ${ownedMask & row.female ? "active" : ""}`} aria-pressed={Boolean(ownedMask & row.female)} onClick={() => onToggleOwned(key, row.female)} title={`${row.label}母本`}>♀</button>
          </div>
        ))}
      </div>
    </article>
  );
}

export function CollectionSection({ pets, owned, shinyCount, colorfulCount, comboCount, limitedMissingCount, otherChannelMissingCount, saveStatus, seasonKeys, excludeBattlePass, onExcludeBattlePassChange, onToggleOwned, onExport, onImport, onClear }: CollectionSectionProps) {
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<Focus>("all");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [eggGroupFilter, setEggGroupFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const importRef = useRef<HTMLInputElement>(null);
  const visiblePets = useMemo(() => pets.filter((pet) => {
    const query = search.trim().toLowerCase();
    if (query && !`${pet.name}${pet.form}${pet.groups.join("")}${pet.series.map((series) => `${series}系`).join("")}${pet.availabilityReason}${pet.offspringReason}`.toLowerCase().includes(query)) return false;
    if (!seasonMatches(pet, seasonFilter)) return false;
    if (eggGroupFilter === "none" && pet.groups.length) return false;
    if (eggGroupFilter !== "all" && eggGroupFilter !== "none" && !pet.groups.includes(eggGroupFilter)) return false;
    if (seriesFilter !== "all" && !pet.series.includes(seriesFilter)) return false;
    if (viewFilter === "owned" && !owned[petKey(pet)]) return false;
    if (viewFilter === "missing" && ownsKind(owned[petKey(pet)], "shiny")) return false;
    const ownedMask = owned[petKey(pet)] || 0;
    if (genderFilter === "male" && !(ownedMask & (OWN.SHINY_M | OWN.COLOR_M | OWN.COMBO_M))) return false;
    if (genderFilter === "female" && !(ownedMask & (OWN.SHINY_F | OWN.COLOR_F | OWN.COMBO_F))) return false;
    return true;
  }), [pets, search, seasonFilter, eggGroupFilter, seriesFilter, viewFilter, genderFilter, owned]);

  return (
    <section className="collection-section" id="collection">
      <div className="section-heading collection-heading">
        <div><p className="eyebrow">MY RARE CATALOG</p><h2>异色 · 炫彩图鉴</h2><p className="collection-note">异色、炫彩与异色炫彩分别登记，互不覆盖；异色炫彩会同时计入异色与炫彩进度。同名地区形态使用独立卡片。后天形成的形态仍可登记并作为亲本，但不会作为可原样孵化的目标。排除战令精灵后，它们将不参与统计、推荐和后续路线。当前还有 {limitedMissingCount} 只可孵的赛季限时异色尚未收集，摆窝推荐会优先选择这些目标。</p></div>
        <div className="save-actions"><button type="button" onClick={onExport}>导出进度</button><button type="button" onClick={() => importRef.current?.click()}>导入进度</button><button className="danger-action" type="button" aria-label="清空全部图鉴登记（需要确认）" onClick={onClear}>清空登记</button><input ref={importRef} type="file" accept="application/json,.json" onChange={onImport} hidden /></div>
      </div>
      <div className="catalog-stats"><div><strong>{shinyCount}</strong><span>已拥有异色</span></div><div><strong>{colorfulCount}</strong><span>已拥有炫彩</span></div><div><strong>{comboCount}</strong><span>已拥有异色炫彩</span></div><div><strong>{otherChannelMissingCount}</strong><span>需通过其他渠道</span></div><p>{saveStatus}</p></div>
      <div className="catalog-toolbar">
        <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索精灵、系别或蛋组" aria-label="搜索精灵、系别或蛋组" /></label>
        <div className="filter-group" role="group" aria-label="赛季筛选">{(["all", ...seasonKeys] as Focus[]).map((value) => <button type="button" className={seasonFilter === value ? "active" : ""} key={value} aria-pressed={seasonFilter === value} onClick={() => setSeasonFilter(value)}>{value === "all" ? "全部赛季" : value}</button>)}</div>
        <div className="filter-group gender-filter" role="group" aria-label="已登记性别筛选">{(["all", "male", "female"] as GenderFilter[]).map((value) => <button type="button" className={genderFilter === value ? "active" : ""} key={value} aria-pressed={genderFilter === value} onClick={() => setGenderFilter(value)}>{value === "all" ? "全部性别" : value === "male" ? "雄性" : "雌性"}</button>)}</div>
        <div className="filter-group view" role="group" aria-label="拥有状态筛选">{(["all", "owned", "missing"] as ViewFilter[]).map((value) => <button type="button" className={viewFilter === value ? "active" : ""} key={value} aria-pressed={viewFilter === value} onClick={() => setViewFilter(value)}>{value === "all" ? "全部" : value === "owned" ? "已拥有" : "未拥有"}</button>)}</div>
        <button className={`source-filter-toggle ${excludeBattlePass ? "active" : ""}`} type="button" aria-pressed={excludeBattlePass} onClick={() => onExcludeBattlePassChange(!excludeBattlePass)}><span aria-hidden="true" /><span><strong>排除战令精灵</strong><small>{excludeBattlePass ? "当前不参与统计与推荐" : "当前参与统计与推荐"}</small></span></button>
      </div>
      <div className="egg-group-filter-panel">
        <div className="egg-group-filter-heading"><div><span>EGG GROUP INDEX</span><strong>按蛋组查看图鉴</strong></div><p><b>{visiblePets.length}</b> 只精灵符合当前筛选</p></div>
        <div className="egg-group-filter-list" role="group" aria-label="蛋组筛选">
          {(["all", ...EGG_GROUPS, "none"] as string[]).map((group) => {
            const count = group === "all" ? pets.length : pets.filter((pet) => group === "none" ? !pet.groups.length : pet.groups.includes(group)).length;
            const label = group === "all" ? "全部蛋组" : group === "none" ? "无蛋组" : group;
            return <button type="button" key={group} className={eggGroupFilter === group ? "active" : ""} aria-pressed={eggGroupFilter === group} onClick={() => setEggGroupFilter(group)}><span>{label}</span><small>{count}</small></button>;
          })}
        </div>
      </div>
      <div className="series-filter-panel">
        <div className="series-filter-heading"><div><span>PET TYPE INDEX</span><strong>按系别查看图鉴</strong></div><p>双系别精灵会出现在两个所属系别下</p></div>
        <div className="series-filter-list" role="group" aria-label="系别筛选">
          {(["all", ...PET_SERIES] as string[]).map((series) => {
            const count = series === "all" ? pets.length : pets.filter((pet) => pet.series.includes(series)).length;
            return <button type="button" key={series} className={seriesFilter === series ? "active" : ""} aria-pressed={seriesFilter === series} onClick={() => setSeriesFilter(series)}>{series !== "all" && <SeriesIcon series={series} className="series-filter-icon" />}<span>{series === "all" ? "全部系别" : `${series}系`}</span><small>{count}</small></button>;
          })}
        </div>
      </div>
      <div className="pet-grid">{visiblePets.map((pet) => <PetCard key={petKey(pet)} pet={pet} ownedMask={owned[petKey(pet)] || 0} onToggleOwned={onToggleOwned} />)}</div>
      {!visiblePets.length && <div className="no-results">没有符合当前筛选的精灵。</div>}
    </section>
  );
}
