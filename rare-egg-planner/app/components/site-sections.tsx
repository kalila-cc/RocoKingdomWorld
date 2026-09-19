import Image from "next/image";
import { PETS } from "../data";
import type { ModuleKey } from "../hooks/use-module-navigation";

type ModuleNavigationProps = {
  activeModule: ModuleKey;
  onModuleChange: (module: ModuleKey) => void;
};

const MODULES: { key: ModuleKey; label: string }[] = [
  { key: "home", label: "首页" },
  { key: "catalog", label: "图鉴登记" },
  { key: "planner", label: "摆窝推荐" },
];

export function SiteNavigation({ activeModule, onModuleChange }: ModuleNavigationProps) {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); onModuleChange("home"); }} aria-label="打开首页"><span className="brand-mark"><Image src="/assets/brand/rare-egg-icon-transparent.png" alt="" width={34} height={34} priority unoptimized /></span><span>珍稀孵蛋规划台</span></a>
        <nav className="module-tabs" aria-label="主要功能" role="tablist">
          {MODULES.map((module) => {
            const active = activeModule === module.key;
            return <a key={module.key} id={`module-tab-${module.key}`} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} aria-selected={active} role="tab" href={`#${module.key}`} onClick={(event) => { event.preventDefault(); onModuleChange(module.key); }}>{module.label}</a>;
          })}
        </nav>
        <div className="topbar-status"><span className="offline-badge"><i /> 离线可用 · 自动保存</span></div>
      </header>
      <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="回到顶部" title="回到顶部" />
    </>
  );
}

export function HeroSection({ shinyCount, colorfulCount, comboCount, onModuleChange }: { shinyCount: number; colorfulCount: number; comboCount: number; onModuleChange: (module: ModuleKey) => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">ROCO RARE EGG PLANNER</p>
        <h1>为异色与炫彩，<br />规划下一窝。</h1>
        <p className="hero-lead">分别登记异色、炫彩与异色炫彩的父本和母本；工具会根据后代随母本、亲本特征、蛋组兼容与相邻窝位，生成当前更合适的摆窝方案。</p>
        <div className="hero-actions"><a className="primary-button" href="#catalog" onClick={(event) => { event.preventDefault(); onModuleChange("catalog"); }}>登记图鉴 <span>→</span></a><a className="text-button" href="#planner" onClick={(event) => { event.preventDefault(); onModuleChange("planner"); }}>查看摆窝推荐</a></div>
      </div>
      <div className="hero-status" aria-label="收集进度摘要">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-egg"><span>✦</span></div>
        <div className="status-card status-owned"><strong>{shinyCount}</strong><span>/ {PETS.length} 已拥有异色</span></div>
        <div className="status-card status-male colorful-stat"><strong>{colorfulCount}</strong><span>/ {PETS.length} 已拥有炫彩</span></div>
        <div className="status-card status-reach combo-stat"><strong>{comboCount}</strong><span>已拥有异色炫彩</span></div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  return (
    <section className="resources-section" aria-label="参考资料">
      <a className="wiki-reference" href="https://wiki.biligame.com/nrc/" target="_blank" rel="noreferrer" title="前往洛克王国世界 Bwiki"><span>资料参考</span><strong>洛克王国世界 Bwiki</strong><i aria-hidden="true" /></a>
    </section>
  );
}

export function SiteFooter() {
  return <footer><span>✦ 珍稀孵蛋规划台</span><p>异色、炫彩与异色炫彩登记独立保存于本机</p></footer>;
}
