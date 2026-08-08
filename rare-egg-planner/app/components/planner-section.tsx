import { type CSSProperties } from "react";
import { PETS } from "../data";
import {
  TARGET_LABEL,
  VARIANT_LABEL,
  commonGroup,
  petKey,
  petLabel,
  slotPoint,
  type Focus,
  type Plan,
} from "../planner-core";
import { PetImage } from "./pet-image";

const PET_MAP = new Map(PETS.map((pet) => [petKey(pet), pet]));

type PlannerSectionProps = {
  plan: Plan;
  planOptions: Plan[];
  activePlanIndex: number;
  nestCount: number;
  focus: Focus;
  seasonKeys: string[];
  maleCount: boolean;
  onDecreaseNest: () => void;
  onIncreaseNest: () => void;
  onFocusChange: (focus: Focus) => void;
  onPlanChange: (index: number) => void;
  onOpenCatalog: () => void;
};

export function PlannerSection({ plan, planOptions, activePlanIndex, nestCount, focus, seasonKeys, maleCount, onDecreaseNest, onIncreaseNest, onFocusChange, onPlanChange, onOpenCatalog }: PlannerSectionProps) {
  const activeKind = plan.kind;
  const motherKeys = Array.from(new Set(plan.edges.map((edge) => petKey(edge.mother.pet))));
  return (
    <section className="planner-section" id="plan">
      <div className="section-heading solo"><div><p className="eyebrow">SMART NEST LAYOUT</p><h2>此刻最值得摆的窝</h2></div></div>
      <div className="planner-grid">
        <article className="nest-card">
          <div className="nest-toolbar">
            <div className="control-block">
              <span className="control-label">小窝总数</span>
              <div className="stepper"><button type="button" onClick={onDecreaseNest} aria-label="减少小窝">−</button><strong>{nestCount}</strong><button type="button" onClick={onIncreaseNest} aria-label="增加小窝">＋</button></div>
            </div>
            <div className="control-block focus-control">
              <span className="control-label">目标赛季</span>
              <div className="pill-switch" role="group" aria-label="目标赛季">
                {(["all", ...seasonKeys] as Focus[]).map((value) => <button className={focus === value ? "active" : ""} type="button" key={value} onClick={() => onFocusChange(value)}>{value === "all" ? "全部" : value}</button>)}
              </div>
            </div>
            <div className="plan-score" aria-label={`当前方案推荐度 ${plan.recommendation}%`}>
              <span>推荐度</span><strong>{plan.recommendation ? `${plan.recommendation}%` : "--"}</strong><small>{plan.targetTier === "season-limited" ? "限时异色优先" : plan.targetTier === "permanent" ? "常驻异色补全" : `${TARGET_LABEL[activeKind]}方案`}</small>
            </div>
          </div>

          <div className="plan-options-bar">
            <div className="plan-options-label"><strong>可选方案</strong><small>{planOptions.length > 1 ? `共 ${planOptions.length} 组，可直接切换` : "当前仅有一组有效方案"}</small></div>
            <div className="plan-option-switch" role="group" aria-label="摆窝可选方案">
              {planOptions.map((option, index) => (
                <button className={activePlanIndex === index ? "active" : ""} type="button" key={index} aria-pressed={activePlanIndex === index} onClick={() => onPlanChange(index)}>
                  <span>方案 {index + 1}</span><small>{option.recommendation ? `${option.recommendation}%` : "待登记"}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={`nest-map ${plan.slots.length ? "has-plan" : "empty"}`}>
            <div className="map-grid" />
            <svg className="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {plan.edges.map((edge, index) => {
                const start = slotPoint(edge.father);
                const end = slotPoint(edge.mother);
                return <line key={`${petKey(edge.father.pet)}-${petKey(edge.mother.pet)}-${index}`} x1={start.left} y1={start.top} x2={end.left} y2={end.top} />;
              })}
            </svg>
            {plan.slots.map((slot) => {
              const pos = slotPoint(slot);
              return (
                <div key={`${slot.role}-${petKey(slot.pet)}-${slot.variant}`} className={`nest-slot ${slot.role} variant-${slot.variant}`} style={{ "--left": `${pos.left}%`, "--top": `${pos.top}%` } as CSSProperties} tabIndex={0} aria-label={`${petLabel(slot.pet)}，${VARIANT_LABEL[slot.variant]}${slot.role === "father" ? "父本" : "母本"}，蛋组：${slot.pet.groups.length ? slot.pet.groups.join("、") : "无可用蛋组"}`}>
                  <div className="nest-shell"><PetImage pet={slot.pet} /></div>
                  <span className="gender-pin">{slot.role === "father" ? "♂" : "♀"}</span>
                  <strong title={petLabel(slot.pet)}>{petLabel(slot.pet)}</strong>
                  <small>{VARIANT_LABEL[slot.variant]}{slot.role === "father" ? "父本" : "母本"}</small>
                  <span className="pet-group-tooltip" role="tooltip"><b>所在蛋组</b>{slot.pet.groups.length ? slot.pet.groups.join(" · ") : "无可用蛋组"}</span>
                </div>
              );
            })}
            {!plan.slots.length && (
              <div className="map-empty-state">
                <span className="empty-symbol">♂</span>
                <h3>{maleCount ? "当前赛季暂无可孵目标" : "先登记可传递珍稀特征的父本"}</h3>
                <p>{maleCount ? "切换目标赛季或检查已有记录，系统会继续按异色炫彩、异色、炫彩自动降级寻找方案。" : "可登记异色炫彩父本；也可用异色父本搭配目标炫彩母本，反向亦可。"}</p>
                <a href="#catalog" onClick={(event) => { event.preventDefault(); onOpenCatalog(); }}>去登记图鉴 →</a>
              </div>
            )}
            <div className="distance-key"><span /> 实线代表同蛋组且横、竖或斜角紧邻</div>
          </div>

        </article>

        <aside className="recommendation-panel">
          <div className="panel-title"><span>本轮蛋单</span><small>{plan.targetTier === "season-limited" ? "赛季限时目标" : plan.targetTier === "permanent" ? "常驻目标低优补位" : "蛋种跟随母本"}</small></div>
          <div className="egg-list">
            {motherKeys.map((key, index) => {
              const mother = PET_MAP.get(key)!;
              const fathers = Array.from(new Set(plan.edges.filter((edge) => petKey(edge.mother.pet) === key).map((edge) => petKey(edge.father.pet))));
              return <div className="egg-item" key={key}><span className="egg-number">{String(index + 1).padStart(2, "0")}</span><PetImage pet={mother} /><div><strong>{petLabel(mother)}</strong><small>{commonGroup(PET_MAP.get(fathers[0])!, mother)} · 接入 {fathers.length} 只父本</small></div></div>;
            })}
            {!plan.edges.length && <p className="panel-empty">登记图鉴后，具体蛋单会出现在这里。</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
