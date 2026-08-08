import { TARGET_LABEL, VARIANT_LABEL, petKey, petLabel, type PlannerPet, type RoadStep, type TargetKind } from "../planner-core";
import { PetImage } from "./pet-image";

export function RoadmapSection({ activeKind, roadmap, femaleSeed }: { activeKind: TargetKind; roadmap: RoadStep[]; femaleSeed?: PlannerPet }) {
  return (
    <section className="roadmap-section" id="route">
      <div className="section-heading compact"><div><p className="eyebrow">COLLECTION ROUTE</p><h2>{TARGET_LABEL[activeKind]}后续收集路线</h2></div><p>每完成一个目标，默认继续获得对应父本，用它连接更多蛋组和后续目标。</p></div>
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
              <p>{step.group} · {step.target.availability === "season-limited" ? "限时目标" : "常驻目标"} · 可衔接 {step.unlocks} 个后续目标</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="route-empty"><div><span>01</span><i>♀</i></div><p>{femaleSeed ? `你已登记 ${petLabel(femaleSeed)} 的珍稀母本，系统会寻找能够帮助收集未拥有异色的同蛋组父本。` : "登记至少一只可繁育的异色、炫彩或异色炫彩亲本后，这里会显示后续收集顺序。"}</p></div>
      )}
    </section>
  );
}
