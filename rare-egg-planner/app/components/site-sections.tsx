import { DATA_UPDATED_AT, PETS } from "../data";

const LATEST_SEASON = [...PETS].sort((a, b) => Number(b.season.match(/^S(\d+)/)?.[1] || 0) - Number(a.season.match(/^S(\d+)/)?.[1] || 0))[0]?.season || "未知赛季";

export function SiteNavigation() {
  return (
    <>
      <nav className="side-nav" aria-label="功能模块快速定位">
        <a href="#top"><span>01</span><b>概览</b></a>
        <a href="#plan"><span>02</span><b>摆窝</b></a>
        <a href="#route"><span>03</span><b>路线</b></a>
        <a href="#collection"><span>04</span><b>图鉴</b></a>
        <a href="#rules"><span>05</span><b>规则</b></a>
      </nav>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回顶部"><span className="brand-mark">✦</span><span>珍稀孵蛋规划台</span></a>
        <nav aria-label="页面导航"><a href="#plan">摆窝推荐</a><a href="#collection">珍稀图鉴</a><a href="#rules">规则依据</a></nav>
        <span className="offline-badge"><i /> 离线可用 · 自动保存</span>
      </header>
    </>
  );
}

export function HeroSection({ shinyCount, colorfulCount, comboCount }: { shinyCount: number; colorfulCount: number; comboCount: number }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">ROCO RARE EGG PLANNER</p>
        <h1>让异色与炫彩，<br />在下一窝共存。</h1>
        <p className="hero-lead">分别登记异色、炫彩、异色炫彩的公母个体；规划台会按母系出蛋、特征组合、同蛋组与斜角紧邻范围，自动排出当下收益最高的窝位。</p>
        <div className="hero-actions"><a className="primary-button" href="#collection">登记珍稀形态 <span>→</span></a><a className="text-button" href="#plan">先看推荐逻辑</a></div>
      </div>
      <div className="hero-status" aria-label="收集进度摘要">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-egg"><span>✦</span></div>
        <div className="status-card status-owned"><strong>{shinyCount}</strong><span>/ {PETS.length} 有异色</span></div>
        <div className="status-card status-male colorful-stat"><strong>{colorfulCount}</strong><span>/ {PETS.length} 有炫彩</span></div>
        <div className="status-card status-reach combo-stat"><strong>{comboCount}</strong><span>异色炫彩共存</span></div>
      </div>
    </section>
  );
}

export function RulesSection() {
  return (
    <section className="rules-section" id="rules">
      <div><p className="eyebrow">RULES & SOURCES</p><h2>推荐是怎样算出来的</h2></div>
      <div className="rule-grid">
        <article><span>01</span><h3>特征可以共存</h3><p>异色、炫彩分别登记；异色炫彩亲代同时提供两种特征。亲代只会提高对应蛋的出现概率，并非必出。</p></article>
        <article><span>02</span><h3>配对资格不等于形态遗传</h3><p>蛋组用于判断亲本能否配对；磨损等后天形成的形态仍可作为亲本，但孵出的后代会回到可遗传的原形态。</p></article>
        <article><span>03</span><h3>斜角紧邻仍有效</h3><p>以九宫格中心到角位为极限范围；横、竖或斜向紧挨父本的小窝都会保留配对连线。</p></article>
        <article><span>04</span><h3>限时异色先于常驻</h3><p>先最大化尚未拥有的赛季限时异色；限时目标已集齐，或当前亲本无法推进限时目标时，才用雅丹鬃与战令精灵等常驻异色低优补位。</p></article>
      </div>
      <div className="source-note">
        <p><strong>数据版本：</strong> {LATEST_SEASON}，最终形态图鉴卡片 {PETS.length} 张；炫彩可与异色叠加，同名地区形态按基础 ID 独立登记，但推荐器会另行判断该形态能否作为孵化结果遗传。雅丹鬃与各赛季战令精灵标记为常驻低优，其余赛季异色按限时优先。数据库更新时间 {DATA_UPDATED_AT.replace("T", " ").replace(/Z$/, "")}。本工具为非商业离线辅助，数据署名遵循 CC BY-NC-SA 4.0。</p>
        <div><a href="https://wiki.biligame.com/rocom/%E8%9B%8B%E7%BB%84%E8%AE%A1%E7%AE%97%E5%99%A8" target="_blank" rel="noreferrer">Bwiki 蛋组计算器 ↗</a><a href="https://roco.gptvip.chat/colorful-overview" target="_blank" rel="noreferrer">炫彩总览 ↗</a><a href="https://calecgos.github.io/roco_nest_placement/" target="_blank" rel="noreferrer">小窝排布规则 ↗</a></div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return <footer><span>✦ 珍稀孵蛋规划台</span><p>异色、炫彩与组合形态独立保存于本机</p><a href="#top">回到顶部 ↑</a></footer>;
}
