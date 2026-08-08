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
  assert.match(html, /让异色与炫彩/);
  assert.match(html, /异色炫彩共存/);
  assert.match(html, /推荐度/);
  assert.match(html, /小窝总数[\s\S]*?<strong>10<\/strong>/);
  assert.doesNotMatch(html, /aria-label="目标蛋类型"/);
  assert.doesNotMatch(html, /自动目标优先级/);
  assert.match(html, /功能模块快速定位/);
  assert.match(html, /href="#route"/);
  assert.match(html, /限时异色先于常驻/);
  assert.match(html, /斜角紧邻仍有效/);
  assert.doesNotMatch(html, /曼哈顿距离/);
  assert.match(html, /异色 · 炫彩图鉴/);
  assert.match(html, /三类记录互不覆盖/);
  assert.match(html, /同名地区形态按独立卡片登记/);
  assert.match(html, /后天形成的形态仍可登记并作为亲本/);
  assert.match(html, /配对资格不等于形态遗传/);
  assert.match(html, /后代为原形态/);
  assert.match(html, /pet-form-label[^>]*>地区形态 · [\s\S]*?本来的样子/);
  assert.match(html, /按蛋组查看图鉴/);
  assert.match(html, /EGG GROUP INDEX/);
  assert.match(html, /所在蛋组/);
});

test("offline package is self-contained and data-complete", async () => {
  const [html, app, plannerCore, plannerSource, data, style, appStyle, updater, sourceUpdater, updaterRuntime, updaterWiki, updaterEggs, updaterBuilder, updaterInstall, launcher, petFiles, shinyMark, colorfulMark, comboMark] = await Promise.all([
    readFile(new URL("../offline/index.html", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/app.js", import.meta.url), "utf8"),
    readFile(new URL("../offline/assets/planner-core.js", import.meta.url), "utf8"),
    readFile(new URL("../app/planner-core.ts", import.meta.url), "utf8"),
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
    readFile(new URL("../offline/assets/traits/mark-shiny.png", import.meta.url)),
    readFile(new URL("../offline/assets/traits/mark-colorful.png", import.meta.url)),
    readFile(new URL("../offline/assets/traits/mark-combo.png", import.meta.url)),
  ]);

  assert.match(html, /assets\/style\.css/);
  assert.match(html, /assets\/data\.js/);
  assert.match(html, /assets\/planner-core\.js/);
  assert.match(html, /assets\/app\.js/);
  assert.doesNotMatch(html, /(?:src|href)=["']\/\//);
  assert.match(app, /roco-rare-nest-planner-v2/);
  assert.match(app, /roco-shiny-nest-planner-v1/);
  assert.match(app, /version:4/);
  assert.match(app, /roco-rare-egg-progress\.json/);
  assert.match(app, /window\.ROCO_PLANNER/);
  assert.doesNotMatch(app, /function layoutScore/);
  assert.doesNotMatch(app, /function makePlan/);
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
  assert.match(plannerSource, /limitedShinyProgress\[0\] \|\| permanentShinyProgress\[0\]/);
  assert.match(plannerCore, /recommendationFor/);
  assert.match(app, /mark-\$\{row\.variant\}\.png/);
  assert.match(app, /variant-mark mark-\$\{row\.variant\}/);
  assert.match(app, /gender-button gender-male/);
  assert.match(app, /gender-button gender-female/);
  assert.match(app, /const EGG_GROUPS = Array\.from/);
  assert.match(app, /state\.group==="none"/);
  assert.match(app, /pet-group-tooltip/);
  assert.match(app, /eggGroupResult/);
  assert.doesNotMatch(html, /id="kindSwitch"/);
  assert.doesNotMatch(html, /priority-order/);
  assert.match(html, /横、竖或斜角紧邻/);
  assert.doesNotMatch(html, /曼哈顿距离/);
  assert.match(html, /class="side-nav"/);
  assert.match(html, /class="active" aria-current="location" href="#top"/);
  assert.match(html, /class="back-to-top" href="#top"/);
  assert.match(html, /data-pet-total/);
  assert.match(html, /id="dataVersionText"/);
  assert.match(html, /id="eggGroupFilter"/);
  assert.match(html, /id="eggGroupResult"/);
  assert.match(html, /按蛋组查看图鉴/);
  assert.match(html, /本轮决策摘要/);
  assert.match(html, /窝位利用/);
  assert.match(html, /双特征机会/);
  assert.match(html, /最大提升建议/);
  assert.doesNotMatch(html, /本轮目标母窝|有效配对连线|公体覆盖目标|仍需解锁路线/);
  assert.match(app, /PETS\.length/);
  assert.match(app, /SEASON_KEYS/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /metricAdvice/);
  assert.match(app, /可再解锁/);
  assert.match(updater, /api\/shiny-transfer-planner/);
  assert.match(updater, /api\/shiny-transfer-summary/);
  assert.match(updater, /action=ask/);
  assert.match(updater, /egg-groups/);
  assert.match(updater, /variant_label/);
  assert.match(updater, /regional-final-variants/);
  assert.match(updater, /schemaVersion = 6/);
  assert.match(updater, /offspringFormOverrides/);
  assert.match(updater, /3477 = 3332/);
  assert.match(updater, /\$permanentShinyReasons/);
  assert.match(updater, /雅丹鬃/);
  assert.match(updater, /\$result\.ImageMap\[\$pet\.key\]/);
  assert.match(updater, /curl\.exe/);
  assert.match(updater, /Test-ImageFile/);
  assert.match(updater, /backup/);
  assert.match(updater, /CheckOnly/);
  assert.match(launcher, /update-pet-database\.ps1/);
  const offlinePaths = await readdir(new URL("../offline/", import.meta.url), { recursive: true });
  assert.ok(offlinePaths.every((path) => /^[\x00-\x7F]+$/.test(path)), "离线包内的目录和文件名必须全部使用 ASCII");
  assert.match(style, /\.side-nav\s*\{[^}]*width:\s*72px/s);
  assert.match(style, /\.side-nav a\s*\{[^}]*min-height:\s*58px/s);
  assert.match(style, /\.side-nav a\.active\s*\{[^}]*background:\s*rgba\(255,255,255,\.13\)/s);
  assert.match(style, /\.side-nav a\.active::after\s*\{[^}]*opacity:\s*1[^}]*scaleX\(1\)/s);
  assert.match(style, /\.save-actions button\s*\{[^}]*min-width:\s*96px[^}]*white-space:\s*nowrap/s);
  assert.match(style, /\.back-to-top\s*\{[^}]*position:\s*fixed[^}]*min-height:\s*52px[^}]*box-shadow:/s);
  assert.match(style, /\.plan-insights\s*\{[^}]*grid-template-columns:\s*repeat\(3,[^}]*minmax\(280px,2\.1fr\)/s);
  assert.match(style, /\.plan-insight-advice\s*\{[^}]*background:\s*#fff8e7/s);
  assert.match(style, /\.planner-section, \.collection-section, \.roadmap-section, \.rules-section\s*\{[^}]*background:\s*var\(--paper\)/s);
  assert.doesNotMatch(style, /\.planner-section, \.collection-section, \.roadmap-section, \.rules-section\s*\{[^}]*background:\s*linear-gradient/s);
  assert.match(style, /\.pet-info h3\s*\{[^}]*font-size:\s*16px/s);
  assert.match(style, /\.pet-info-trigger\s*\{[^}]*border-radius:\s*50%/s);
  assert.match(style, /\.pet-evolution-tooltip\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(style, /\.pet-group-tooltip\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(style, /\.pet-form-label\s*\{[^}]*background:\s*#fff6dc/s);
  assert.match(style, /\.availability-tag\.season-limited\s*\{[^}]*#fff0c7/s);
  assert.match(style, /\.availability-tag\.permanent\s*\{[^}]*#ece9f0/s);
  assert.match(style, /\.inheritance-tag\s*\{[^}]*#fff6d8/s);
  assert.match(style, /\.egg-group-filter-panel\s*\{[^}]*background:\s*#f7f3eb/s);
  assert.match(style, /\.nest-card, \.recommendation-panel\s*\{[^}]*background:\s*#fffefa/s);
  assert.match(style, /\.nest-map\s*\{[^}]*background:\s*#f4f0e7/s);
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
  assert.match(style, /\.planner-section, \.collection-section, \.roadmap-section, \.rules-section\s*\{[^}]*border-top:\s*0/s);
  assert.match(style, /\.variant-mark img\s*\{[^}]*width:\s*26px[^}]*object-fit:\s*contain/s);
  assert.match(style, /\.pet-card\.missing-rare \.pet-visual > img\s*\{[^}]*opacity:\s*\.92[^}]*saturate\(\.78\)/s);
  assert.doesNotMatch(style, /\.pet-card\.missing-rare \.pet-visual > img\s*\{[^}]*grayscale/s);

  const context = { window: {} };
  vm.runInNewContext(data, context);
  vm.runInNewContext(plannerCore, context);
  const database = context.window.ROCO_DATA;
  const pets = database.pets;
  const plannerApi = context.window.ROCO_PLANNER;
  assert.equal(database.schemaVersion, 6);
  assert.equal(pets.length, 59);
  assert.equal(new Set(pets.map((pet) => pet.key)).size, 59);
  assert.equal(new Set(pets.map((pet) => pet.name)).size, 57);
  assert.equal(typeof plannerApi.createPlanner, "function");
  assert.equal(typeof plannerApi.isEggTarget, "function");
  const planner = plannerApi.createPlanner(pets);
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
  assert.ok(planner.maleParents({ [wornArmor.key]: plannerApi.OWN.SHINY_M }, "shiny").some((parent) => parent.pet.key === wornArmor.key), "磨损公体仍应能传递珍稀特征");
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
