import { TARGET_LABEL, VARIANT_LABEL, petKey, petLabel, type PlannerPet, type RoadStep, type TargetKind } from "../planner-core";
import { PetImage } from "./pet-image";

export function RoadmapSection({ activeKind, roadmap, femaleSeed }: { activeKind: TargetKind; roadmap: RoadStep[]; femaleSeed?: PlannerPet }) {
  return (
    <section className="roadmap-section" id="route">
      <div className="section-heading compact"><div><p className="eyebrow">COLLECTION ROUTE</p><h2>{TARGET_LABEL[activeKind]}扩散路线</h2></div><p>每一步默认把新目标继续孵到可作父本的对应形态，再打开更多蛋组连接。</p></div>
      {roadmap.length > 0 ? (
        <div className="route-track">
          {roadmap.map((step, index) => (
            <article className="route-step" key={`${petKey(step.source.pet)}-${step.source.variant}-${petKey(step.target)}`}>
              <span className="route-index">{index + 1}</span>
              <div className="route-pair">
                <div className={`route-pet-avatar route-father variant-${step.source.variant}`}><PetImage pet={step.source.pet} /><small aria-label={`${VARIANT_LABEL[step.source.variant]}父本`} title={`${VARIANT_LABEL[step.source.variant]}父本`}>♂</small></div>
                <span>＋</span>
                <div className={`route-pet-avatar route-mother variant-${step.motherVariant}`}><PetImage pet={step.target} /><small aria-label={`${VARIANT_LABEL[step.motherVariant]}母本`} title={`${VARIANT_LABEL[step.motherVariant]}母本`}>♀</small></div>
              </div>
              <strong>{petLabel(step.source.pet)} → {petLabel(step.target)}</strong>
              <p>{step.group} · {step.target.availability === "season-limited" ? "限时优先" : "常驻低优"} · 新开 {step.unlocks} 个后续目标</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="route-empty"><div><span>01</span><i>♀</i></div><p>{femaleSeed ? `你已有 ${petLabel(femaleSeed)} 的珍稀母本，系统会寻找可推进异色收集的同蛋组父本。` : "登记至少一只可繁育的异色、炫彩或异色炫彩后，这里会生成扩散顺序。"}</p></div>
      )}
    </section>
  );
}
