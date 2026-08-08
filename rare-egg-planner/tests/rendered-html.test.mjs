import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the rare egg planner", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>珍稀孵蛋规划台｜洛克王国：世界<\/title>/);
  assert.match(html, /为异色与炫彩/);
  assert.match(html, /已拥有异色炫彩/);
  assert.match(html, /主要功能[\s\S]*?href="#home"[\s\S]*?首页[\s\S]*?href="#catalog"[\s\S]*?图鉴登记[\s\S]*?href="#planner"[\s\S]*?摆窝推荐/);
  assert.match(html, /role="tabpanel"[\s\S]*?aria-labelledby="module-tab-home"/);
  assert.doesNotMatch(html, /功能模块快速定位|class="side-nav"/);
  assert.doesNotMatch(html, /id="plan"|id="collection"|id="route"/);
  assert.match(html, /洛克王国世界 Bwiki/);
  assert.match(html, /wiki\.biligame\.com\/rocom\/%E9%A6%96%E9%A1%B5/);
  assert.match(html, /\/favicon-egg\.png/);
  assert.match(html, /\/assets\/brand\/rare-egg-icon-transparent\.png/);
  assert.doesNotMatch(html, /http:\/\/localhost\/favicon-egg\.png/);
  assert.doesNotMatch(html, /常用参考入口|Bwiki 蛋组计算器|炫彩总览|小窝排布规则/);
  assert.doesNotMatch(html, /推荐是怎样算出来的/);
  assert.doesNotMatch(html, /曼哈顿距离/);
  assert.doesNotMatch(html, /异色 · 炫彩图鉴|当前推荐摆窝方案|异色炫彩后续收集路线/);
});

test("offline package is self-contained and data-complete", async () => {
  const [html, app, plannerCore, plannerSource, progressSource, data, style, appStyle, updater, sourceUpdater, updaterRuntime, updaterWiki, updaterEggs, updaterBuilder, updaterInstall, launcher, petFiles, seriesIconFiles, publicSeriesIconFiles, shinyMark, colorfulMark, comboMark, brandIcon, favicon] = await Promise.all([
    readFile(new URL("../offline/index.html", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/app.js", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/planner-core.js", import.meta.url), "utf8"),
    readFile(new URL("../app/planner-core.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/use-planner-progress.ts", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/data.js", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/style.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../offline/tools/update-pet-database.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/update-pet-database.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/updater/00-runtime.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/updater/10-wiki-source.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/updater/20-egg-source.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/updater/30-database-builder.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/updater/40-install.ps1", import.meta.url), "utf8"),
    readFile(new URL("../offline/update-database.bat", import.meta.url), "utf8"),
    readdir(new URL("../offline/assets/pets/", import.meta.url)),
    readdir(new URL("../offline/assets/series/", import.meta.url)),
    readdir(new URL("../public/assets/series/", import.meta.url)),
    readFile(new URL("../offline/assets/traits/mark-shiny.png", import.meta.url)),
    readFile(new URL("../offline/assets/traits/mark-colorful.png", import.meta.url)),
    readFile(new URL("../offline/assets/traits/mark-combo.png", import.meta.url)),
    readFile(new URL("../offline/assets/brand/rare-egg-icon-transparent.png", import.meta.url)),
    readFile(new URL("../offline/assets/brand/rare-egg-favicon.png", import.meta.url)),
  ]);

  assert.match(html, /assets\/style\.css/);
  assert.match(html, /assets\/data\.js/);
  assert.match(html, /assets\/planner-core\.js/);
  assert.match(html, /assets\/app\.js/);
  assert.match(html, /assets\/brand\/rare-egg-icon-transparent\.png/);
  assert.match(html, /assets\/brand\/rare-egg-favicon\.png/);
  assert.match(html, /当前推荐摆窝方案/);
  assert.match(html, /本轮孵蛋目标/);
  assert.match(html, /后续收集路线/);
  assert.match(app, /异色获取信息/);
  assert.match(app, /后代不继承此形态/);
  assert.ok(brandIcon.length > 10_000, "offline package should include the generated website icon");
  assert.ok(favicon.length > 1_000, "offline package should include the optically corrected favicon");
  assert.doesNotMatch(html, /(?:src|href)=["']\/\//);
  assert.match(app, /roco-rare-nest-planner-v2/);
  assert.match(app, /roco-shiny-nest-planner-v1/);
  assert.match(app, /version:5/);
  assert.doesNotMatch(app, /version:4/);
  assert.match(app, /roco-rare-egg-progress\.json/);
  assert.match(app, /window\.ROCO_PLANNER/);
  assert.doesNotMatch(app, /function layoutScore/);
  assert.doesNotMatch(app, /function makePlan\(/);
  assert.match(plannerCore, /Generated from app\/planner-core\.ts/);
  assert.equal(style, appStyle, "在线与离线 CSS 必须由同一组样式分片生成");
  assert.match(style, /Generated from styles\/site\/\*\.css/);
  assert.equal(updater, sourceUpdater, "离线更新器必须由唯一源码同步生成");
  assert.match(updater, /Generated from scripts\/updater\/\*\.ps1/);
  assert.match(updaterRuntime, /^param\(/);
  assert.match(updaterWiki, /function Get-WikiShinyEntries/);
  assert.match(updaterEggs, /function Get-EggCatalog/);
  assert.match(updaterBuilder, /function New-Database/);
  assert.match(updaterInstall, /^try \{/);
  assert.match(plannerCore, /function migrateOwnedMap/);
  assert.match(plannerCore, /function isEggTarget/);
  assert.match(plannerCore, /function isBattlePassPet/);
  assert.match(plannerCore, /pet\.key \|\| pet\.name/);
  assert.match(plannerCore, /SHINY_M: 1/);
  assert.match(plannerCore, /shiny && colorful/);
  assert.match(plannerSource, /AUTO_PRIORITY: TargetKind\[\] = \["combo", "shiny", "colorful"\]/);
  assert.match(app, /nestCount:10/);
  assert.match(plannerCore, /function layoutPositions\(count\)/);
  assert.match(plannerSource, /Math\.max\(Math\.abs\(a\.x - b\.x\), Math\.abs\(a\.y - b\.y\)\) <= NEST_GRID_STEP/);
  assert.doesNotMatch(plannerCore, /Math\.abs\(a\.x-b\.x\)\+Math\.abs\(a\.y-b\.y\)<=5/);
  assert.match(plannerSource, /10: \[3, 4, 3\]/);
  assert.match(plannerCore, /rankedShinyPlans/);
  assert.match(plannerSource, /for \(const targetTier of \["season-limited", "permanent"\] as const\)/);
  assert.match(plannerSource, /if \(selected\) return finalize\(selected, "shiny", targetTier\)/);
  assert.match(plannerCore, /recommendationFor/);
  assert.match(plannerCore, /function makeAutoPlanOptions/);
  assert.match(plannerSource, /EXACT_PARENT_LIMIT = 5/);
  assert.match(plannerSource, /function makeExactCandidate/);
  assert.match(plannerSource, /parentCount > 0 && parentCount <= EXACT_PARENT_LIMIT/);
  assert.match(plannerSource, /salt === 0 && canUseExactSearch/);
  assert.match(plannerSource, /const adjacentPositionPairs: Array<\[number, number\]>/);
  assert.match(plannerSource, /const pairable = Array\.from/);
  assert.match(plannerSource, /const scoreArrangement = \(arrangement: number\[\]\)/);
  assert.doesNotMatch(plannerSource, /function layoutScore/);
  assert.match(plannerSource, /const maxStagnantAttempts = Math\.max\(6, optionLimit\)/);
  assert.match(plannerSource, /if \(stagnantAttempts >= maxStagnantAttempts\) break/);
  assert.match(plannerCore, /stagnantAttempts >= maxStagnantAttempts/);
  assert.match(html, /id="planOptions"/);
  assert.doesNotMatch(html, /id="refreshPlan"/);
  assert.match(app, /state\.selectedPlan/);
  assert.match(app, /makePlanOptions\(\)/);
  assert.match(app, /mark-\$\{row\.variant\}\.png/);
  assert.match(app, /variant-mark mark-\$\{row\.variant\}/);
  assert.match(app, /gender-button gender-male/);
  assert.match(app, /gender-button gender-female/);
  assert.match(html, /id="genderFilter"[^>]*aria-label="已登记性别筛选"/);
  assert.match(html, /id="genderFilter"[\s\S]*id="viewFilter"/);
  assert.match(app, /state\.gender==="male"[^\n]*OWN\.SHINY_M\|OWN\.COLOR_M\|OWN\.COMBO_M/);
  assert.match(app, /state\.gender==="female"[^\n]*OWN\.SHINY_F\|OWN\.COLOR_F\|OWN\.COMBO_F/);
  assert.match(app, /父本/);
  assert.match(app, /母本/);
  assert.doesNotMatch(app, /公体|母体|\$\{kindLabel\}蛋/);
  assert.match(html, /id="battlePassFilter"[^>]*aria-pressed="false"/);
  assert.match(html, /排除战令精灵/);
  assert.match(app, /NON_BATTLE_PASS_PETS/);
  assert.match(app, /excludeBattlePass/);
  assert.match(app, /PLANNERS\.noBattlePass/);
  assert.match(app, /当前不参与统计与推荐/);
  assert.match(app, /const EGG_GROUPS = Array\.from/);
  assert.match(app, /state\.group==="none"/);
  assert.match(app, /pet-group-tooltip/);
  assert.match(app, /eggGroupResult/);
  assert.doesNotMatch(html, /id="kindSwitch"/);
  assert.doesNotMatch(html, /priority-order/);
  assert.match(html, /窝位横、竖或斜向相邻/);
  assert.doesNotMatch(html, /曼哈顿距离/);
  assert.doesNotMatch(html, /class="side-nav"/);
  assert.match(html, /data-module-view="home"/);
  assert.match(html, /data-module-view="catalog"[^>]*hidden/);
  assert.match(html, /data-module-view="planner"[^>]*hidden/);
  assert.match(html, /class="back-to-top" type="button"/);
  assert.match(html, /data-pet-total/);
  assert.match(html, /class="wiki-reference"/);
  assert.match(html, /id="eggGroupFilter"/);
  assert.match(html, /id="eggGroupResult"/);
  assert.match(html, /按蛋组查看图鉴/);
  assert.match(html, /id="seriesFilter"[^>]*aria-label="系别筛选"/);
  assert.match(html, /按系别查看图鉴/);
  assert.match(html, /搜索精灵、系别或蛋组/);
  assert.match(app, /所属系别/);
  assert.doesNotMatch(html, /搜索精灵、系列|按系列查看图鉴|系列筛选|双系列精灵/);
  assert.doesNotMatch(app, /系列：|所属系列|全部系列/);
  assert.match(app, /state\.series!=="all"[^\n]*pet\.series/);
  assert.match(app, /pet-series-list/);
  assert.match(app, /assets\/series\/\$\{escapeHtml\(fileName\)\}/);
  assert.doesNotMatch(app, /patchwiki\.biligame\.com|图标_宠物_属性|seriesIcons/);
  assert.doesNotMatch(html, /本轮决策摘要|窝位利用|双特征机会|最大提升建议|摆放前确认/);
  assert.doesNotMatch(html, /本轮目标母窝|有效配对连线|父本覆盖目标|仍需解锁路线/);
  assert.match(app, /PETS\.length/);
  assert.match(app, /SEASON_KEYS/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /roco-rare-egg-planner-visited-v1/);
  assert.match(app, /activateModule/);
  assert.match(app, /moduleFromHash/);
  assert.doesNotMatch(app, /activateSection/);
  assert.doesNotMatch(app, /resourceStatus|LATEST_SEASON/);
  assert.match(app, /route-pet-avatar route-father/);
  assert.doesNotMatch(app, /metricAdvice|metricCoverage|metricUtilization|metricCombo|可再解锁/);
  assert.match(updater, /api\/shiny-transfer-planner/);
  assert.match(updater, /api\/shiny-transfer-summary/);
  assert.match(updater, /action=ask/);
  assert.match(updater, /egg-groups/);
  assert.match(updater, /variant_label/);
  assert.match(updater, /regional-final-variants/);
  assert.match(updater, /schemaVersion = 7/);
  assert.match(updater, /type_name/);
  assert.match(updater, /主属性.*副属性/);
  assert.match(updater, /series: string\[\]/);
  assert.match(updater, /offspringFormOverrides/);
  assert.match(updater, /3477 = 3332/);
  assert.match(updater, /\$permanentShinyReasons/);
  assert.match(updater, /雅丹鬃/);
  assert.match(updater, /\$result\.ImageMap\[\$pet\.key\]/);
  assert.match(updater, /curl\.exe/);
  assert.match(updater, /Test-ImageFile/);
  assert.match(updater, /backup/);
  assert.match(updater, /CheckOnly/);
  assert.doesNotMatch(updater, /iiurlwidth|图标_宠物_属性|seriesIcons/);
  assert.match(launcher, /update-pet-database\.ps1/);
  const offlinePaths = await readdir(new URL("../offline/", import.meta.url), { recursive: true });
  assert.ok(offlinePaths.every((path) => /^[\x00-\x7F]+$/.test(path)), "离线包内的目录和文件名必须全部使用 ASCII");
  const expectedSeriesIcons = ["bug.png", "cute.png", "dark.png", "dragon.png", "electric.png", "fire.png", "ghost.png", "grass.png", "ground.png", "ice.png", "illusion.png", "light.png", "martial.png", "mechanical.png", "normal.png", "poison.png", "water.png", "wing.png"];
  assert.deepEqual(Array.from(seriesIconFiles).sort(), expectedSeriesIcons);
  assert.deepEqual(Array.from(publicSeriesIconFiles).sort(), expectedSeriesIcons);
  let seriesIconBytes = 0;
  for (const fileName of expectedSeriesIcons) {
    const [offlineIcon, publicIcon] = await Promise.all([
      readFile(new URL(`../offline/assets/series/${fileName}`, import.meta.url)),
      readFile(new URL(`../public/assets/series/${fileName}`, import.meta.url)),
    ]);
    seriesIconBytes += offlineIcon.length;
    assert.ok(offlineIcon.equals(publicIcon), `${fileName} should be identical online and offline`);
    assert.equal(offlineIcon.readUInt32BE(16), 64, `${fileName} should stay lightweight at 64px`);
    assert.equal(offlineIcon.readUInt32BE(20), 64, `${fileName} should stay lightweight at 64px`);
  }
  assert.ok(seriesIconBytes < 60_000, "the complete local series icon set should stay below 60 KB");
  assert.doesNotMatch(style, /\.side-nav\s*\{/);
  assert.match(style, /\.module-view\s*\{[^}]*min-height:\s*calc\(100dvh - 74px\)[^}]*module-view-enter/s);
  assert.match(style, /\.module-view\[hidden\]\s*\{[^}]*display:\s*none !important/s);
  assert.match(style, /\.topbar\s*\{[^}]*position:\s*sticky/s);
  assert.match(style, /\.save-actions button\s*\{[^}]*min-width:\s*96px[^}]*white-space:\s*nowrap/s);
  assert.match(style, /\.save-actions \.danger-action\s*\{[^}]*min-width:\s*96px[^}]*border-color:\s*#d95b65[^}]*background:\s*#fff3f4[^}]*color:\s*#b32634/s);
  assert.match(html, /class="danger-action" id="clearBtn" aria-label="清空全部图鉴登记（需要确认）"/);
  assert.match(app, /const confirmed=confirm\(`此操作无法撤销，建议先导出进度作为备份。[\s\S]*?if\(!confirmed\)return;state\.owned=\{\}/);
  assert.match(progressSource, /const confirmed = window\.confirm\(`此操作无法撤销，建议先导出进度作为备份。[\s\S]*?if \(!confirmed\) return false;[\s\S]*?setOwned\(\{\}\)/);
  assert.match(style, /\.search-box\s*\{[^}]*min-width:\s*240px[^}]*flex:\s*1 1 300px/s);
  assert.match(style, /\.source-filter-toggle\s*\{[^}]*min-width:\s*190px[^}]*min-height:\s*48px/s);
  assert.match(style, /\.source-filter-toggle\.active\s*\{[^}]*background:\s*#f6f2ff/s);
  assert.match(style, /\.pet-source-label\s*\{[^}]*background:\s*#fff6dc/s);
  assert.match(style, /\.back-to-top\s*\{[^}]*position:\s*fixed[^}]*right:\s*max\(18px,[^}]*bottom:\s*max\(18px,[^}]*width:\s*48px[^}]*background:\s*#fffdf8[^}]*opacity:\s*0/s);
  assert.match(style, /\.back-to-top::after\s*\{[^}]*content:\s*attr\(aria-label\)[^}]*right:\s*calc\(100% \+ 10px\)[^}]*opacity:\s*0/s);
  assert.match(style, /\.back-to-top::after\s*\{[^}]*display:\s*none/s);
  assert.match(style, /\.back-to-top\.is-visible\s*\{[^}]*opacity:\s*1[^}]*pointer-events:\s*auto/s);
  assert.match(style, /\.topbar-status\s*\{[^}]*display:\s*flex/s);
  assert.match(style, /\.planner-section, \.collection-section, \.roadmap-section\s*\{[^}]*padding:\s*112px max\(86px,/s);
  assert.doesNotMatch(style, /\.plan-insights|\.plan-insight|\.tip-box/);
  assert.match(style, /\.planner-section, \.collection-section, \.roadmap-section\s*\{[^}]*background:\s*var\(--paper\)/s);
  assert.doesNotMatch(style, /\.planner-section, \.collection-section, \.roadmap-section\s*\{[^}]*background:\s*linear-gradient/s);
  assert.match(style, /\.module-tabs a\.active::after\s*\{[^}]*opacity:\s*1/s);
  assert.match(style, /\.route-pet-avatar\s*\{[^}]*width:\s*72px[^}]*background:\s*#f0ecff/s);
  assert.match(style, /\.route-step\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*center/s);
  assert.match(style, /\.route-index\s*\{[^}]*position:\s*absolute[^}]*top:\s*18px[^}]*left:\s*18px/s);
  assert.match(style, /\.route-pair\s*\{[^}]*width:\s*100%[^}]*justify-content:\s*center/s);
  assert.match(style, /\.route-pair img\s*\{[^}]*object-fit:\s*contain[^}]*translate3d\(1px,2px,0\)/s);
  assert.match(style, /\.route-step > strong\s*\{[^}]*text-align:\s*center/s);
  assert.match(style, /\.section-heading\.compact\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\) minmax\(360px,620px\)/s);
  assert.match(style, /\.resources-section\s*\{[^}]*justify-content:\s*flex-end[^}]*padding:\s*14px/s);
  assert.match(style, /\.wiki-reference\s*\{[^}]*display:\s*inline-flex[^}]*color:\s*#8b8498/s);
  assert.doesNotMatch(style, /\.resource-links\s*\{/);
  assert.match(style, /\.pet-info h3\s*\{[^}]*font-size:\s*16px/s);
  assert.match(style, /\.pet-info-trigger\s*\{[^}]*border-radius:\s*50%/s);
  assert.match(style, /\.pet-evolution-tooltip\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(style, /\.pet-group-tooltip\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(style, /\.pet-form-label\s*\{[^}]*background:\s*#fff6dc/s);
  assert.match(style, /\.availability-tag\.season-limited\s*\{[^}]*#fff0c7/s);
  assert.match(style, /\.availability-tag\.permanent\s*\{[^}]*#ece9f0/s);
  assert.match(style, /\.inheritance-tag\s*\{[^}]*#fff6d8/s);
  assert.match(style, /\.egg-group-filter-panel,\s*\.series-filter-panel\s*\{[^}]*background:\s*#f7f3eb/s);
  assert.match(style, /\.series-filter-panel\s*\{[^}]*background:\s*#f4f1fa/s);
  assert.match(style, /\.series-filter-list button\.active\s*\{[^}]*background:\s*var\(--purple\)/s);
  assert.match(style, /\.pet-series-list > span\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(style, /\.series-filter-list button\s*\{[^}]*padding:\s*4px 10px 4px 4px/s);
  assert.match(style, /\.series-filter-icon\s*\{[^}]*width:\s*30px[^}]*height:\s*30px/s);
  assert.match(style, /\.pet-series-icon\s*\{[^}]*width:\s*22px[^}]*height:\s*22px/s);
  assert.match(style, /\.season-tag\s*\{[^}]*min-width:\s*30px[^}]*font:\s*850 11px\/1/s);
  assert.match(style, /\.nest-card, \.recommendation-panel\s*\{[^}]*background:\s*#fffefa/s);
  assert.match(style, /\.nest-slot strong\s*\{[^}]*width:\s*max-content[^}]*max-width:\s*min\(190px,22vw\)[^}]*white-space:\s*normal[^}]*overflow:\s*visible[^}]*text-overflow:\s*clip/s);
  assert.doesNotMatch(style, /\.nest-slot strong\s*\{[^}]*text-overflow:\s*ellipsis/s);
  assert.match(style, /\.nest-variant-mark\s*\{[^}]*right:\s*-8px[^}]*bottom:\s*-7px[^}]*width:\s*30px[^}]*height:\s*30px/s);
  assert.doesNotMatch(style, /\.nest-variant-mark\s*\{[^}]*(?:background|border|box-shadow):/s);
  assert.match(style, /\.nest-slot\.mother \.nest-shell\s*\{[^}]*background:\s*#f2d8de/s);
  assert.doesNotMatch(style, /\.nest-slot\.variant-(?:shiny|colorful|combo) \.nest-shell\s*\{/s);
  assert.match(app, /class="nest-variant-mark mark-\$\{slot\.variant\}"[^>]*aria-label="\$\{variantLabel\}"/);
  assert.match(app, /assets\/traits\/mark-\$\{slot\.variant\}\.png/);
  assert.match(style, /\.planner-grid\s*\{[^}]*minmax\(370px,\s*390px\)/s);
  assert.match(style, /\.panel-title span\s*\{[^}]*font-size:\s*20px/s);
  assert.match(style, /\.panel-title small\s*\{[^}]*font-size:\s*13px/s);
  assert.match(style, /\.egg-item strong\s*\{[^}]*font-size:\s*clamp\(15px,\.88vw,16px\)/s);
  assert.match(style, /\.egg-item small\s*\{[^}]*font-size:\s*clamp\(12px,\.72vw,13px\)/s);
  assert.match(style, /\.nest-map\s*\{[^}]*background:\s*#f4f0e7/s);
  assert.doesNotMatch(style, /\.nest-map::before/);
  assert.doesNotMatch(style, /\.map-grid\s*\{[^}]*mask-image/s);
  assert.match(style, /\.plan-options-bar\s*\{[^}]*display:\s*flex/s);
  assert.match(style, /\.plan-option-switch\s*\{[^}]*gap:\s*4px[^}]*background:\s*#f4f0e7/s);
  assert.match(style, /\.plan-option-switch button\s*\{[^}]*border:\s*0[^}]*background:\s*transparent/s);
  assert.match(style, /\.plan-option-switch button\.active\s*\{[^}]*background:\s*white[^}]*box-shadow:/s);
  assert.doesNotMatch(style, /\.plan-option-switch button(?::active|\.active)?::after/);
  assert.match(style, /\.plan-option-switch button small\s*\{[^}]*font:\s*850 12px\/1/s);
  assert.match(style, /\.plan-score strong\s*\{[^}]*font:\s*850 18px\/1/s);
  assert.match(style, /\.catalog-toolbar\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/s);
  assert.match(style, /\.pet-grid\s*\{[^}]*repeat\(auto-fit,\s*minmax\(min\(314px,\s*100%\),1fr\)\)/s);
  assert.doesNotMatch(style, /\.nest-card, \.recommendation-panel\s*\{[^}]*background:\s*#2a263d/s);
  assert.match(app, /evolutionInfo\(pet\)/);
  assert.match(style, /\.rare-row\s*\{[^}]*36px 36px/s);
  assert.match(style, /\.rare-row button\s*\{[^}]*height:\s*36px[^}]*font:\s*800 14px/s);
  assert.match(style, /\.rare-row \.gender-male\s*\{[^}]*var\(--male-blue\)/s);
  assert.match(style, /\.rare-row \.gender-female\s*\{[^}]*var\(--female-red\)/s);
  assert.match(style, /\.rare-row \.gender-male:not\(\.active\):hover:not\(:disabled\)\s*\{[^}]*color:\s*#245da9/s);
  assert.match(style, /\.rare-row \.gender-male\.active:hover:not\(:disabled\)\s*\{[^}]*background:\s*#2f66bc[^}]*color:\s*white/s);
  assert.match(style, /\.rare-row \.gender-female\.active:hover:not\(:disabled\)\s*\{[^}]*background:\s*#c84959[^}]*color:\s*white/s);
  assert.match(style, /\.planner-section::before[^\{]*\{[^}]*width:\s*min\(1280px,[^}]*linear-gradient/s);
  assert.match(style, /\.planner-section::after[^\{]*\{[^}]*rotate\(45deg\)[^}]*background:\s*var\(--paper\)/s);
  assert.match(style, /\.planner-section, \.collection-section, \.roadmap-section\s*\{[^}]*border-top:\s*0/s);
  assert.match(style, /\.variant-mark img\s*\{[^}]*width:\s*26px[^}]*object-fit:\s*contain/s);
  assert.match(style, /\.pet-card\.missing-rare \.pet-visual > img\s*\{[^}]*opacity:\s*\.92[^}]*saturate\(\.78\)/s);
  assert.doesNotMatch(style, /\.pet-card\.missing-rare \.pet-visual > img\s*\{[^}]*grayscale/s);

  const context = { window: {} };
  vm.runInNewContext(data, context);
  vm.runInNewContext(plannerCore, context);
  const database = context.window.ROCO_DATA;
  const pets = database.pets;
  const plannerApi = context.window.ROCO_PLANNER;
  assert.equal(database.schemaVersion, 7);
  assert.equal(pets.length, 59);
  assert.equal(new Set(pets.map((pet) => pet.key)).size, 59);
  assert.equal(new Set(pets.map((pet) => pet.name)).size, 57);
  assert.equal(database.series.length, 18, "the current catalog should expose all represented pet series");
  assert.ok(pets.every((pet) => Array.isArray(pet.series) && pet.series.length), "every catalog card should have at least one series");
  assert.ok(pets.some((pet) => pet.series.length > 1), "dual-series pets should retain both filter values");
  assert.ok(database.series.includes("火") && database.series.includes("地") && database.series.includes("龙"));
  assert.equal(typeof plannerApi.createPlanner, "function");
  assert.equal(typeof plannerApi.isEggTarget, "function");
  const planner = plannerApi.createPlanner(pets);
  const syntheticPets = [
    { key: "测试父本", name: "测试父本", form: "", season: "S3", groups: ["测试组"], maleTargets: ["测试普通母本甲", "测试普通母本乙", "彩色候选"], flags: 1, availability: "season-limited", availabilityReason: "测试", offspringKey: "测试父本" },
    { key: "测试普通母本甲", name: "测试普通母本甲", form: "", season: "S3", groups: ["测试组"], maleTargets: [], flags: 1, availability: "season-limited", availabilityReason: "测试", offspringKey: "测试普通母本甲" },
    { key: "测试普通母本乙", name: "测试普通母本乙", form: "", season: "S3", groups: ["测试组"], maleTargets: [], flags: 1, availability: "season-limited", availabilityReason: "测试", offspringKey: "测试普通母本乙" },
    { key: "彩色候选", name: "彩色候选", form: "", season: "S3", groups: ["测试组"], maleTargets: [], flags: 1, availability: "season-limited", availabilityReason: "测试", offspringKey: "彩色候选" },
  ];
  const syntheticPlanner = plannerApi.createPlanner(syntheticPets);
  const syntheticOwned = { 测试父本: plannerApi.OWN.SHINY_M, 彩色候选: plannerApi.OWN.COLOR_F };
  const rareMotherPlan = syntheticPlanner.makeAutoPlan(syntheticOwned, 3, "all", 0);
  const rareMotherSlot = rareMotherPlan.slots.find((slot) => slot.role === "mother" && slot.pet.key === "彩色候选");
  assert.equal(rareMotherPlan.kind, "shiny", "覆盖更多未拥有异色时应选择异色方案");
  assert.equal(rareMotherSlot?.variant, "colorful", "同等兼容数量下应先选已登记的炫彩母本，且不得降级显示为普通母本");
  const roadmapOwned = { ...syntheticOwned, 测试普通母本甲: plannerApi.OWN.SHINY_F, 测试普通母本乙: plannerApi.OWN.SHINY_F };
  const rareMotherRoadmap = syntheticPlanner.buildRoadmap(roadmapOwned, "all", "shiny", "shiny");
  assert.equal(rareMotherRoadmap[0]?.motherVariant, "colorful", "后续收集路线也应保留已登记的炫彩母本形态");
  const hybridPets = [
    { key: "father-a", name: "father-a", form: "", season: "S3", groups: ["father-a"], maleTargets: ["target-1", "target-2", "target-3", "target-4"], flags: 1, availability: "season-limited", availabilityReason: "test", offspringKey: "father-a" },
    { key: "father-b", name: "father-b", form: "", season: "S3", groups: ["father-b"], maleTargets: ["target-1", "target-2", "target-5"], flags: 1, availability: "season-limited", availabilityReason: "test", offspringKey: "father-b" },
    { key: "father-c", name: "father-c", form: "", season: "S3", groups: ["father-c"], maleTargets: ["target-3", "target-4", "target-6"], flags: 1, availability: "season-limited", availabilityReason: "test", offspringKey: "father-c" },
    ...Array.from({ length: 6 }, (_, index) => ({
      key: `target-${index + 1}`,
      name: `target-${index + 1}`,
      form: "",
      season: "S3",
      groups: ["target"],
      maleTargets: [],
      flags: 1,
      availability: "season-limited",
      availabilityReason: "test",
      offspringKey: `target-${index + 1}`,
    })),
  ];
  const hybridPlanner = plannerApi.createPlanner(hybridPets);
  const hybridOwned = {
    "father-a": plannerApi.OWN.COMBO_M,
    "father-b": plannerApi.OWN.COMBO_M,
    "father-c": plannerApi.OWN.COMBO_M,
  };
  const exactHybridPlan = hybridPlanner.makeAutoPlan(hybridOwned, 8, "all", 0);
  const heuristicHybridPlan = hybridPlanner.makeAutoPlan(hybridOwned, 8, "all", 1);
  assert.equal(exactHybridPlan.slots.filter((slot) => slot.role === "father").length, 2, "the exact branch should find the non-greedy two-father combination");
  assert.equal(exactHybridPlan.pairedMothers, 6, "the exact branch should cover all six mothers when greedy coverage stops at five");
  assert.equal(new Set(exactHybridPlan.edges.flatMap((edge) => [edge.father.pet.key, edge.mother.pet.key])).size, 8, "the exact branch should connect every selected father and mother");
  assert.ok(exactHybridPlan.pairedMothers > heuristicHybridPlan.pairedMothers, "the exact first option should improve a known greedy counterexample");
  const battlePassPets = pets.filter((pet) => plannerApi.isBattlePassPet(pet));
  assert.equal(battlePassPets.length, 6, "current database should identify all six battle-pass pets");
  assert.deepEqual(Array.from(battlePassPets.map((pet) => pet.name)).sort(), ["爆焰喷喷", "疾光千兽", "离心舞者", "绒仙子", "胡桃王子", "雪怪"].sort());
  assert.ok(battlePassPets.every((pet) => !pet.groups.length), "battle-pass collection targets should not be treated as hatchable targets");
  assert.equal(pets.filter((pet) => !plannerApi.isBattlePassPet(pet)).length, 53, "excluding battle-pass pets should update the collection denominator");
  assert.doesNotMatch(plannerCore, /utilization/, "recommendation must not include nest utilization");
  const fullNestOwned = {
    [pets.find((pet) => pet.id === 20).key]: plannerApi.OWN.COMBO_M,
    [pets.find((pet) => pet.id === 39).key]: plannerApi.OWN.COMBO_M,
  };
  const fullNestPlan = planner.makeAutoPlan(fullNestOwned, 10, "all", 0);
  const planOptions = planner.makeAutoPlanOptions(fullNestOwned, 10, "all");
  const planOptionSignatures = planOptions.map((option) => [
    ...option.slots.map((slot) => `${slot.role}:${slot.pet.key}:${slot.variant}`).sort(),
    ...option.edges.map((edge) => `${edge.father.pet.key}>${edge.mother.pet.key}`).sort(),
  ].join("|"));
  assert.ok(planOptions.length > 1 && planOptions.length <= 5, "a feasible roster should expose a compact row of alternative plans");
  assert.equal(new Set(planOptionSignatures).size, planOptions.length, "alternative plan buttons must not repeat the same roster and pairing graph");
  assert.ok(planOptions.every((option) => option.slots.length === 10), "every selectable plan should keep all configured nests in use");
  assert.ok(planOptions.every((option, index) => index === 0 || planOptions[index - 1].recommendation >= option.recommendation), "selectable plans should be ordered by recommendation");
  const connectedMothers = new Set(fullNestPlan.edges.map((edge) => edge.mother.pet.key));
  const connectedSlots = new Set(fullNestPlan.edges.flatMap((edge) => [
    `${edge.father.role}:${edge.father.pet.key}:${edge.father.variant}`,
    `${edge.mother.role}:${edge.mother.pet.key}:${edge.mother.variant}`,
  ]));
  assert.equal(fullNestPlan.slots.length, 10, "a feasible plan should use all configured nests");
  assert.equal(connectedMothers.size, fullNestPlan.slots.filter((slot) => slot.role === "mother").length, "every mother in a full plan should connect to a father");
  assert.equal(connectedSlots.size, fullNestPlan.slots.length, "every used nest should take part in the plan");
  assert.equal(fullNestPlan.recommendation, 96, "a full nest layout must not receive recommendation points for utilization");
  const limitedPlan = planner.makeAutoPlan({ "红绒十字": plannerApi.OWN.SHINY_M }, 10, "all", 0);
  assert.equal(limitedPlan.targetTier, "season-limited", "现有父本能推进限时异色时，必须先选择限时目标");
  assert.ok(limitedPlan.slots.filter((slot) => slot.role === "mother").every((slot) => slot.pet.availability === "season-limited"));
  const afterLimited = Object.fromEntries(pets.filter((pet) => pet.availability === "season-limited" && plannerApi.isEggTarget(pet)).map((pet) => [pet.key, plannerApi.OWN.SHINY_F]));
  afterLimited["红绒十字"] = (afterLimited["红绒十字"] || 0) | plannerApi.OWN.SHINY_M;
  const permanentPlan = planner.makeAutoPlan(afterLimited, 10, "all", 0);
  assert.equal(permanentPlan.targetTier, "permanent", "限时可繁育目标集齐后，才应进入常驻补全阶段");
  assert.ok(permanentPlan.slots.some((slot) => slot.role === "mother" && slot.pet.name === "雅丹鬃"));
  const permanentNames = pets.filter((pet) => pet.availability === "permanent").map((pet) => pet.name).sort();
  assert.deepEqual(Array.from(permanentNames), ["爆焰喷喷", "疾光千兽", "离心舞者", "绒仙子", "胡桃王子", "雅丹鬃", "雪怪"].sort());
  assert.equal(pets.find((pet) => pet.name === "雅丹鬃").availabilityReason, "常驻捕捉触发");
  assert.ok(pets.filter((pet) => permanentNames.includes(pet.name) && pet.name !== "雅丹鬃").every((pet) => !pet.groups.length), "战令常驻异色应保留为不可繁育图鉴卡");
  const eggGroups = new Set(pets.flatMap((pet) => pet.groups));
  assert.equal(eggGroups.size, 14, "蛋组筛选应覆盖当前全部 14 个蛋组");
  assert.ok([...eggGroups].every((group) => pets.some((pet) => pet.groups.includes(group))), "每个筛选蛋组都应有可见精灵");
  assert.ok(pets.some((pet) => !pet.groups.length), "无蛋组筛选应能展示不可繁育目标");
  assert.equal(petFiles.filter((name) => /\.(?:webp|png)$/i.test(name)).length, 59);
  const armorForms = pets.filter((pet) => pet.name === "千棘盔");
  const mouseForms = pets.filter((pet) => pet.name === "遁地鼠");
  assert.deepEqual(Array.from(armorForms.map((pet) => pet.form)).sort(), ["本来的样子", "磨损的样子"].sort());
  assert.deepEqual(Array.from(mouseForms.map((pet) => pet.form)).sort(), ["储水时的样子", "枯水期的样子"].sort());
  assert.equal(new Set(armorForms.map((pet) => pet.baseId)).size, 2);
  assert.equal(new Set(mouseForms.map((pet) => pet.baseId)).size, 2);
  assert.equal(armorForms.filter((pet) => pet.legacyKey === "千棘盔").length, 1, "旧千棘盔登记只应迁移到原卡片");
  const originalArmor = armorForms.find((pet) => pet.form === "本来的样子");
  const wornArmor = armorForms.find((pet) => pet.form === "磨损的样子");
  assert.equal(wornArmor.offspringKey, originalArmor.key, "磨损母本的蛋应孵出本来的样子");
  assert.match(wornArmor.offspringReason, /后天形成/);
  assert.equal(plannerApi.isBreedable(wornArmor), true, "磨损形态仍能作为亲本繁育");
  assert.equal(plannerApi.isEggTarget(wornArmor), false, "磨损形态不能作为可原样孵出的目标");
  assert.equal(plannerApi.isEggTarget(originalArmor), true);
  assert.ok(planner.maleParents({ [wornArmor.key]: plannerApi.OWN.SHINY_M }, "shiny").some((parent) => parent.pet.key === wornArmor.key), "磨损父本仍应能传递珍稀特征");
  assert.ok(!limitedPlan.slots.some((slot) => slot.role === "mother" && slot.pet.key === wornArmor.key), "推荐蛋单不得把磨损形态作为孵化结果");
  assert.equal(mouseForms.filter((pet) => pet.legacyKey === "遁地鼠").length, 1, "旧遁地鼠登记只应迁移到原卡片");
  const whitePlatinum = pets.find((pet) => pet.name === "白金独角兽");
  assert.ok(whitePlatinum, "最终形态白金独角兽应被纳入登记目标");
  assert.deepEqual(Array.from(whitePlatinum.groups).sort(), ["动物组", "巨灵组"].sort());
  assert.ok(whitePlatinum.evolutionChain.includes("小独角兽"));
  assert.ok(whitePlatinum.evolutionChain.includes("白金独角兽"));
  assert.ok(!pets.some((pet) => ["恶魔狼王", "奇丽果", "雪影冰灵"].includes(pet.name)), "首领形态不应单独占登记卡片");
  assert.ok(shinyMark.length > 100_000);
  assert.ok(colorfulMark.length > 100_000);
  assert.ok(comboMark.length > 100_000);
  assert.equal(shinyMark[25], 6, "异色标识应为带透明通道的 RGBA PNG");
  assert.equal(colorfulMark[25], 6, "炫彩标识应为带透明通道的 RGBA PNG");
  assert.equal(comboMark[25], 6, "异色炫彩标识应为带透明通道的 RGBA PNG");
  await Promise.all(pets.map((pet) => access(new URL(`../offline/assets/pets/${pet.image || `${pet.id}.webp`}`, import.meta.url))));
});

test("nest reach includes the center-to-corner diagonal of a 3x3 neighborhood", () => {
  const adjacent = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= 2;
  const center = { x: 2, y: 2 };

  assert.equal(adjacent(center, { x: 0, y: 0 }), true, "紧挨父本的斜角母本应当有效");
  assert.equal(adjacent(center, { x: 4, y: 2 }), true, "横向紧邻应当有效");
  assert.equal(adjacent(center, { x: 2, y: 4 }), true, "纵向紧邻应当有效");
  assert.equal(adjacent(center, { x: 2, y: 6 }), false, "隔开一整窝后应当无效");
});

test("coexisting traits are represented independently", () => {
  const SHINY_M = 1, COLOR_F = 8, COMBO_M = 16, COMBO_F = 32;
  const ownsShiny = (mask) => Boolean(mask & (1 | 2 | COMBO_M | COMBO_F));
  const ownsColorful = (mask) => Boolean(mask & (4 | COLOR_F | COMBO_M | COMBO_F));
  const ownsCombo = (mask) => Boolean(mask & (COMBO_M | COMBO_F));

  assert.equal(ownsShiny(COMBO_M), true);
  assert.equal(ownsColorful(COMBO_M), true);
  assert.equal(ownsCombo(COMBO_M), true);
  assert.equal(ownsCombo(SHINY_M | COLOR_F), false);
  assert.equal(Boolean((SHINY_M | COLOR_F) & SHINY_M), true);
  assert.equal(Boolean((SHINY_M | COLOR_F) & COLOR_F), true);
});
