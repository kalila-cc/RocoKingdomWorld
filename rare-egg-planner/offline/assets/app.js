(function () {
  "use strict";

  const PETS = window.ROCO_DATA.pets;
  const {
    AUTO_PRIORITY, OWN, TARGET_LABEL, VARIANT_LABEL,
    availableMotherVariants: motherVariants,
    commonGroup, createPlanner, isBattlePassPet, isBreedable: breedable, isEggTarget,
    migrateOwnedMap, ownsKind, petKey, petLabel,
    seasonMatches, slotPoint: point,
  } = window.ROCO_PLANNER;
  const NON_BATTLE_PASS_PETS = PETS.filter((pet)=>!isBattlePassPet(pet));
  const PLANNERS = { all:createPlanner(PETS), noBattlePass:createPlanner(NON_BATTLE_PASS_PETS) };
  const PET_MAP = new Map(PETS.map((pet) => [pet.key||pet.name, pet]));
  const STORAGE_KEY = "roco-rare-nest-planner-v2";
  const LEGACY_KEY = "roco-shiny-nest-planner-v1";
  const SEASON_KEYS = Array.from(new Set(PETS.map((pet)=>String(pet.season||"").match(/^S\d+/)?.[0]).filter(Boolean))).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
  const EGG_GROUPS = Array.from(new Set(PETS.flatMap((pet)=>pet.groups||[]))).sort((a,b)=>a.localeCompare(b,"zh-CN"));
  const PET_SERIES = Array.isArray(window.ROCO_DATA.series)?window.ROCO_DATA.series:Array.from(new Set(PETS.flatMap((pet)=>pet.series||[]))).sort((a,b)=>a.localeCompare(b,"zh-CN"));
  const SERIES_ICONS = {"普通":"normal.png","火":"fire.png","水":"water.png","草":"grass.png","电":"electric.png","冰":"ice.png","武":"martial.png","毒":"poison.png","地":"ground.png","萌":"cute.png","翼":"wing.png","光":"light.png","恶":"dark.png","幽":"ghost.png","幻":"illusion.png","机械":"mechanical.png","虫":"bug.png","龙":"dragon.png"};
  const state = { owned:{}, nestCount:10, focus:"all", excludeBattlePass:false, search:"", season:"all", group:"all", series:"all", view:"all", gender:"all", selectedPlan:0 };
  let cachedPlanOptions = null;

  function $(id) { return document.getElementById(id); }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]); }
  function image(pet) { return `<img src="assets/pets/${escapeHtml(pet.image||`${pet.id}.webp`)}" alt="${escapeHtml(petLabel(pet))}" loading="lazy">`; }
  function seriesIcon(series,className) { const fileName=SERIES_ICONS[series];return fileName?`<img class="${className}" src="assets/series/${escapeHtml(fileName)}" alt="" width="64" height="64" loading="lazy">`:""; }
  function evolutionInfo(pet) { const chain=Array.isArray(pet.evolutionChain)?pet.evolutionChain:[],groups=Array.isArray(pet.groups)?pet.groups:[],series=Array.isArray(pet.series)?pet.series:[],offspring=pet.offspringKey&&pet.offspringKey!==petKey(pet)?PET_MAP.get(pet.offspringKey):null;const chainText=chain.join(" → "),groupText=groups.length?groups.join(" · "):"无可用蛋组",seriesText=series.map((item)=>`${item}系`).join(" · "),offspringText=offspring?petLabel(offspring):"",aria=`${petLabel(pet)}，系别：${series.join("、")}，异色获取信息：${pet.availabilityReason||"赛季限时异色"}，蛋组：${groups.length?groups.join("、"):"无可用蛋组"}${offspring?`，繁育后代：${offspringText}；${pet.offspringReason||"该形态不遗传"}`:""}${chain.length>1?`，进化链：${chainText}`:""}`;return`<span class="pet-info-trigger" tabindex="0" aria-label="${escapeHtml(aria)}">i<span class="pet-evolution-tooltip" role="tooltip">${pet.form?`<span class="pet-tooltip-section"><strong>地区形态</strong><span>${escapeHtml(pet.form)}</span></span>`:""}<span class="pet-tooltip-section"><strong>所属系别</strong><span>${escapeHtml(seriesText)}</span></span><span class="pet-tooltip-section"><strong>异色获取信息</strong><span>${escapeHtml(pet.availabilityReason||"赛季限时异色")}</span></span><span class="pet-tooltip-section"><strong>所在蛋组</strong><span>${escapeHtml(groupText)}</span></span>${offspring?`<span class="pet-tooltip-section offspring-result"><strong>繁育后代</strong><span>${escapeHtml(offspringText)}<small>${escapeHtml(pet.offspringReason||"该形态不遗传")}</small></span></span>`:""}${chain.length>1?`<span class="pet-tooltip-section"><strong>进化链及其他形态</strong><span>${escapeHtml(chainText)}</span></span>`:""}</span></span>`; }
  function activePets() { return state.excludeBattlePass ? NON_BATTLE_PASS_PETS : PETS; }
  function activePlanner() { return state.excludeBattlePass ? PLANNERS.noBattlePass : PLANNERS.all; }
  function maleParents(kind) { return activePlanner().maleParents(state.owned,kind); }
  function makePlanOptions() { if(!cachedPlanOptions)cachedPlanOptions=activePlanner().makeAutoPlanOptions(state.owned,state.nestCount,state.focus);return cachedPlanOptions; }
  function resetPlanOptions() { cachedPlanOptions=null;state.selectedPlan=0; }
  function buildRoadmap(kind,objective) { return activePlanner().buildRoadmap(state.owned,state.focus,kind,objective); }

  function load() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const saved = current ? JSON.parse(current) : JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
      if (saved && saved.owned) state.owned = migrateOwnedMap(PETS,saved.owned);
      if (saved && saved.nestCount) state.nestCount = Math.max(2,Math.min(10,saved.nestCount));
      if (saved && saved.focus) state.focus = saved.focus;
      if (saved && typeof saved.excludeBattlePass === "boolean") state.excludeBattlePass = saved.excludeBattlePass;
    } catch { $("saveStatus").textContent = "本机存储不可用，请导出进度作为备份"; }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify({version:5,owned:state.owned,nestCount:state.nestCount,focus:state.focus,excludeBattlePass:state.excludeBattlePass,savedAt:new Date().toISOString()}));
      $("saveStatus").textContent = "已自动保存到本机";
    } catch { $("saveStatus").textContent = "本机存储不可用，请导出进度作为备份"; }
  }

  function renderPlan(plan,planOptions) {
    const kindLabel=TARGET_LABEL[plan.kind];
    $("planOptionsStatus").textContent=planOptions.length>1?`共 ${planOptions.length} 个方案，可直接切换`:"当前仅生成 1 个可用方案";
    $("planOptions").innerHTML=planOptions.map((option,index)=>`<button type="button" class="${state.selectedPlan===index?"active":""}" data-plan-index="${index}" aria-pressed="${state.selectedPlan===index}"><span>方案 ${index+1}</span><small>${option.recommendation?option.recommendation+"%":"暂无"}</small></button>`).join("");
    $("recommendationScore").textContent=plan.recommendation?plan.recommendation+"%":"--";
    $("recommendationKind").textContent=plan.targetTier==="season-limited"?"限时异色优先":plan.targetTier==="permanent"?"常驻异色补全":kindLabel+"方案";
    $("planScore").setAttribute("aria-label","当前方案推荐度 "+plan.recommendation+"%");
    $("panelTarget").textContent=plan.targetTier==="season-limited"?"赛季限时优先":plan.targetTier==="permanent"?"补充常驻目标":"后代种类由母本决定";
    let html='<div class="map-grid"></div><svg class="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
    plan.edges.forEach((edge)=>{const start=point(edge.father),end=point(edge.mother);html+=`<line x1="${start.left}" y1="${start.top}" x2="${end.left}" y2="${end.top}"></line>`;});
    html+='</svg>';
    plan.slots.forEach((slot)=>{const p=point(slot),groupText=slot.pet.groups.length?slot.pet.groups.join(" · "):"无可用蛋组",label=petLabel(slot.pet),variantLabel=VARIANT_LABEL[slot.variant],variantMark=slot.variant==="normal"?"":`<span class="nest-variant-mark mark-${slot.variant}" aria-label="${variantLabel}" title="${variantLabel}"><img src="assets/traits/mark-${slot.variant}.png" alt=""></span>`,aria=`${label}，${variantLabel}${slot.role==="father"?"父本":"母本"}，蛋组：${slot.pet.groups.length?slot.pet.groups.join("、"):"无可用蛋组"}`;html+=`<div class="nest-slot ${slot.role} variant-${slot.variant}" style="--left:${p.left}%;--top:${p.top}%" tabindex="0" aria-label="${escapeHtml(aria)}"><div class="nest-shell">${image(slot.pet)}${variantMark}</div><span class="gender-pin">${slot.role==="father"?"♂":"♀"}</span><strong title="${escapeHtml(label)}">${escapeHtml(label)}</strong><small>${variantLabel}${slot.role==="father"?"父本":"母本"}</small><span class="pet-group-tooltip" role="tooltip"><b>所在蛋组</b>${escapeHtml(groupText)}</span></div>`;});
    if(!plan.slots.length){const hasMale=AUTO_PRIORITY.some((kind)=>maleParents(kind).length);html+=`<div class="map-empty-state"><span class="empty-symbol">♂</span><h3>${hasMale?"当前赛季暂无可推荐的孵蛋目标":"先登记一只可繁育的珍稀父本"}</h3><p>${hasMale?"可以切换目标赛季或检查图鉴登记；系统会依次尝试异色炫彩、异色和炫彩目标。":"登记一只可繁育的异色、炫彩或异色炫彩父本后，系统会自动寻找相容母本。"}</p><a data-module-target="catalog" href="#catalog">前往图鉴登记 →</a></div>`;}
    html+='<div class="distance-key"><span></span> 连线表示两只精灵同蛋组，且窝位横、竖或斜向相邻</div>';
    const map=$("nestMap");map.className="nest-map "+(plan.slots.length?"has-plan":"empty");map.innerHTML=html;
    const motherKeys=Array.from(new Set(plan.edges.map((edge)=>petKey(edge.mother.pet))));
    $("eggList").innerHTML=motherKeys.length?motherKeys.map((key,index)=>{const mother=PET_MAP.get(key),edges=plan.edges.filter((edge)=>petKey(edge.mother.pet)===key),fathers=Array.from(new Set(edges.map((edge)=>petKey(edge.father.pet)))),motherVariant=edges[0].mother.variant,group=commonGroup(PET_MAP.get(fathers[0]),mother);return`<div class="egg-item"><span class="egg-number">${String(index+1).padStart(2,"0")}</span>${image(mother)}<div><strong>${escapeHtml(petLabel(mother))}</strong><small>${VARIANT_LABEL[motherVariant]}母本 · ${escapeHtml(group)} · 可与 ${fathers.length} 只父本配对</small></div></div>`;}).join(""):'<p class="panel-empty">完成图鉴登记后，推荐目标会显示在这里。</p>';
  }
  function renderRoute(kind,objective) {
    const steps=buildRoadmap(kind,objective);$("routeKind").textContent=TARGET_LABEL[kind];
    if(steps.length){$("routeArea").innerHTML=`<div class="route-track">${steps.map((step,index)=>`<article class="route-step"><span class="route-index">${index+1}</span><div class="route-pair"><div class="route-pet-avatar route-father variant-${step.source.variant}">${image(step.source.pet)}<small aria-label="${VARIANT_LABEL[step.source.variant]}父本" title="${VARIANT_LABEL[step.source.variant]}父本">♂</small></div><span>＋</span><div class="route-pet-avatar route-mother variant-${step.motherVariant}">${image(step.target)}<small aria-label="${VARIANT_LABEL[step.motherVariant]}母本" title="${VARIANT_LABEL[step.motherVariant]}母本">♀</small></div></div><strong>${escapeHtml(petLabel(step.source.pet))} → ${escapeHtml(petLabel(step.target))}</strong><p>${escapeHtml(step.group)} · ${step.target.availability==="season-limited"?"限时目标":"常驻目标"} · 可衔接 ${step.unlocks} 个后续目标</p></article>`).join("")}</div>`;}else{const female=activePets().find((pet)=>motherVariants(state.owned[petKey(pet)]).length>1&&breedable(pet));$("routeArea").innerHTML=`<div class="route-empty"><div><span>01</span><i>♀</i></div><p>${female?`你已登记 ${escapeHtml(petLabel(female))} 的珍稀母本，系统会寻找能够帮助收集未拥有异色的同蛋组父本。`:"登记至少一只可繁育的异色、炫彩或异色炫彩亲本后，这里会显示后续收集顺序。"}</p></div>`;}
  }
  function renderCatalog() {
    const query=state.search.trim().toLowerCase();
    const catalogPets=activePets(),visible=catalogPets.filter((pet)=>{const key=petKey(pet),mask=state.owned[key]||0;if(query&&(pet.name+(pet.form||"")+pet.groups.join("")+(pet.series||[]).map((series)=>`${series}系`).join("")+(pet.availabilityReason||"")+(pet.offspringReason||"")).toLowerCase().indexOf(query)<0)return false;if(!seasonMatches(pet,state.season))return false;if(state.group==="none"&&pet.groups.length)return false;if(state.group!=="all"&&state.group!=="none"&&!pet.groups.includes(state.group))return false;if(state.series!=="all"&&!(pet.series||[]).includes(state.series))return false;if(state.view==="owned"&&!state.owned[key])return false;if(state.view==="missing"&&ownsKind(state.owned[key],"shiny"))return false;if(state.gender==="male"&&!(mask&(OWN.SHINY_M|OWN.COLOR_M|OWN.COMBO_M)))return false;if(state.gender==="female"&&!(mask&(OWN.SHINY_F|OWN.COLOR_F|OWN.COMBO_F)))return false;return true;});
    const rows=[{variant:"shiny",label:"异色",male:OWN.SHINY_M,female:OWN.SHINY_F},{variant:"colorful",label:"炫彩",male:OWN.COLOR_M,female:OWN.COLOR_F},{variant:"combo",label:"异色炫彩",male:OWN.COMBO_M,female:OWN.COMBO_F}];
    $("petGrid").innerHTML=visible.map((pet)=>{const key=petKey(pet),mask=state.owned[key]||0,disabled=!breedable(pet),femaleOnly=Boolean(pet.flags&4),hasOffspringOverride=Boolean(pet.offspringKey&&pet.offspringKey!==key),series=pet.series||[];return`<article class="pet-card ${mask?"has-rare":"missing-rare"} ${disabled?"unbreedable":""}"><div class="pet-visual">${image(pet)}<span class="season-tag">${pet.season.slice(0,2)}</span><span class="availability-tag ${pet.availability}">${pet.availability==="permanent"?"常驻 · 低优":"限时 · 优先"}</span>${mask?'<span class="owned-tag">已登记</span>':""}${disabled?'<span class="lock-tag">不可繁育</span>':""}${hasOffspringOverride?'<span class="inheritance-tag">后代不继承此形态</span>':""}</div><div class="pet-info"><h3><span class="pet-name">${escapeHtml(pet.name)}</span>${evolutionInfo(pet)}</h3>${pet.form?`<span class="pet-form-label">地区形态 · ${escapeHtml(pet.form)}</span>`:""}${isBattlePassPet(pet)?'<span class="pet-source-label">战令来源</span>':""}<span class="pet-series-list" aria-label="所属系别：${escapeHtml(series.map((item)=>`${item}系`).join("、"))}">${series.map((item)=>`<span>${seriesIcon(item,"pet-series-icon")}<span>${escapeHtml(item)}系</span></span>`).join("")}</span><p>${pet.groups.length?escapeHtml(pet.groups.join(" · ")):"无可用蛋组"}</p></div><div class="rare-picker" data-pet="${escapeHtml(key)}" aria-label="${escapeHtml(petLabel(pet))}珍稀形态与性别">${rows.map((row)=>`<div class="rare-row variant-${row.variant}"><div class="variant-label"><span class="variant-mark mark-${row.variant}" aria-hidden="true"><img src="assets/traits/mark-${row.variant}.png" alt=""></span><span>${row.label}</span></div><button type="button" data-bit="${row.male}" ${femaleOnly?"disabled":""} class="gender-button gender-male ${mask&row.male?"active":""}" aria-pressed="${Boolean(mask&row.male)}" title="${femaleOnly?"该精灵仅有雌性":row.label+"父本"}">♂</button><button type="button" data-bit="${row.female}" class="gender-button gender-female ${mask&row.female?"active":""}" aria-pressed="${Boolean(mask&row.female)}" title="${row.label}母本">♀</button></div>`).join("")}</div></article>`;}).join("");
    $("eggGroupResult").textContent=visible.length;
    $("noResults").hidden=Boolean(visible.length);
  }
  function renderEggGroupFilter(catalogPets) {
    $("eggGroupFilter").innerHTML=[{value:"all",label:"全部蛋组",count:catalogPets.length},...EGG_GROUPS.map((group)=>({value:group,label:group,count:catalogPets.filter((pet)=>pet.groups.includes(group)).length})),{value:"none",label:"无蛋组",count:catalogPets.filter((pet)=>!pet.groups.length).length}].map((item)=>`<button type="button" class="${item.value===state.group?"active":""}" data-group="${escapeHtml(item.value)}" aria-pressed="${item.value===state.group}"><span>${escapeHtml(item.label)}</span><small>${item.count}</small></button>`).join("");
  }
  function renderSeriesFilter(catalogPets) {
    $("seriesFilter").innerHTML=[{value:"all",label:"全部系别",count:catalogPets.length},...PET_SERIES.map((series)=>({value:series,label:`${series}系`,count:catalogPets.filter((pet)=>(pet.series||[]).includes(series)).length}))].map((item)=>`<button type="button" class="${item.value===state.series?"active":""}" data-series="${escapeHtml(item.value)}" aria-pressed="${item.value===state.series}">${item.value!=="all"?seriesIcon(item.value,"series-filter-icon"):""}<span>${escapeHtml(item.label)}</span><small>${item.count}</small></button>`).join("");
  }
  function renderStats() {
    const catalogPets=activePets(),shiny=catalogPets.filter((pet)=>ownsKind(state.owned[petKey(pet)],"shiny")).length,color=catalogPets.filter((pet)=>ownsKind(state.owned[petKey(pet)],"colorful")).length,combo=catalogPets.filter((pet)=>ownsKind(state.owned[petKey(pet)],"combo")).length,other=catalogPets.filter((pet)=>!ownsKind(state.owned[petKey(pet)],"shiny")&&!isEggTarget(pet)).length,limitedMissing=catalogPets.filter((pet)=>pet.availability==="season-limited"&&isEggTarget(pet)&&!ownsKind(state.owned[petKey(pet)],"shiny")).length;
    $("heroOwned").textContent=$("statOwned").textContent=shiny;$("heroMale").textContent=$("statMale").textContent=color;$("heroReach").textContent=$("statMissing").textContent=combo;$("statOther").textContent=other;$("nestValue").textContent=state.nestCount;
    document.querySelectorAll("[data-pet-total]").forEach((node)=>{node.textContent=catalogPets.length;});
    $("limitedMissingCount").textContent=limitedMissing;
    $("battlePassFilter").classList.toggle("active",state.excludeBattlePass);$("battlePassFilter").setAttribute("aria-pressed",String(state.excludeBattlePass));$("battlePassFilterStatus").textContent=state.excludeBattlePass?"当前不参与统计与推荐":"当前参与统计与推荐";
    document.querySelectorAll("#focusSwitch button").forEach((button)=>button.classList.toggle("active",button.dataset.focus===state.focus));
  }
  function renderAll(){const planOptions=makePlanOptions();state.selectedPlan=Math.min(state.selectedPlan,Math.max(0,planOptions.length-1));const plan=planOptions[state.selectedPlan];renderStats();renderPlan(plan,planOptions);renderRoute(plan.kind,plan.objective);renderEggGroupFilter(activePets());renderSeriesFilter(activePets());renderCatalog();}
  function toast(message){const el=$("toast");el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true;},2200);}

  $("petGrid").addEventListener("click",(event)=>{const button=event.target.closest("button[data-bit]");if(!button)return;const picker=button.closest(".rare-picker"),key=picker.dataset.pet,pet=PET_MAP.get(key),bit=Number(button.dataset.bit);if((pet.flags&4)&&(bit===OWN.SHINY_M||bit===OWN.COLOR_M||bit===OWN.COMBO_M))return;state.owned[key]=(state.owned[key]||0)^bit;resetPlanOptions();save();renderAll();});
  $("nestMinus").addEventListener("click",()=>{state.nestCount=Math.max(2,state.nestCount-1);resetPlanOptions();save();renderAll();});
  $("nestPlus").addEventListener("click",()=>{state.nestCount=Math.min(10,state.nestCount+1);resetPlanOptions();save();renderAll();});
  $("planOptions").addEventListener("click",(event)=>{const button=event.target.closest("button[data-plan-index]");if(!button)return;state.selectedPlan=Number(button.dataset.planIndex);renderAll();});
  $("focusSwitch").addEventListener("click",(event)=>{const button=event.target.closest("button[data-focus]");if(!button)return;state.focus=button.dataset.focus;resetPlanOptions();save();renderAll();});
  $("battlePassFilter").addEventListener("click",()=>{state.excludeBattlePass=!state.excludeBattlePass;resetPlanOptions();save();renderAll();});
  $("searchInput").addEventListener("input",(event)=>{state.search=event.target.value;renderCatalog();});
  ["seasonFilter","viewFilter","genderFilter"].forEach((id)=>$(id).addEventListener("click",(event)=>{const button=event.target.closest("button[data-value]");if(!button)return;const stateKey=id==="seasonFilter"?"season":id==="viewFilter"?"view":"gender";state[stateKey]=button.dataset.value;$(id).querySelectorAll("button").forEach((item)=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});renderCatalog();}));
  $("eggGroupFilter").addEventListener("click",(event)=>{const button=event.target.closest("button[data-group]");if(!button)return;state.group=button.dataset.group;$("eggGroupFilter").querySelectorAll("button").forEach((item)=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});renderCatalog();});
  $("seriesFilter").addEventListener("click",(event)=>{const button=event.target.closest("button[data-series]");if(!button)return;state.series=button.dataset.series;$("seriesFilter").querySelectorAll("button").forEach((item)=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});renderCatalog();});
  $("clearBtn").addEventListener("click",()=>{const confirmed=confirm(`此操作无法撤销，建议先导出进度作为备份。\n\n确定清空全部 ${PETS.length} 只精灵的异色、炫彩与异色炫彩登记吗？`);if(!confirmed)return;state.owned={};resetPlanOptions();save();renderAll();toast("图鉴登记已清空");});
  $("exportBtn").addEventListener("click",()=>{const payload=JSON.stringify({version:5,owned:state.owned,nestCount:state.nestCount,focus:state.focus,excludeBattlePass:state.excludeBattlePass,exportedAt:new Date().toISOString()},null,2),url=URL.createObjectURL(new Blob([payload],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="roco-rare-egg-progress.json";a.click();URL.revokeObjectURL(url);toast("进度文件已导出");});
  $("importBtn").addEventListener("click",()=>$("importInput").click());
  $("importInput").addEventListener("change",(event)=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const payload=JSON.parse(String(reader.result));if(!payload.owned)throw new Error();state.owned=migrateOwnedMap(PETS,payload.owned);if(payload.nestCount)state.nestCount=Math.max(2,Math.min(10,payload.nestCount));if(payload.focus)state.focus=payload.focus;if(typeof payload.excludeBattlePass==="boolean")state.excludeBattlePass=payload.excludeBattlePass;resetPlanOptions();save();renderAll();toast("进度导入成功");}catch{toast("无法识别该进度文件");}};reader.readAsText(file);event.target.value="";});

  $("focusSwitch").innerHTML=['<button class="active" data-focus="all">全部</button>',...SEASON_KEYS.map((season)=>`<button data-focus="${escapeHtml(season)}">${escapeHtml(season)}</button>`)].join("");
  $("seasonFilter").innerHTML=['<button class="active" data-value="all">全部赛季</button>',...SEASON_KEYS.map((season)=>`<button data-value="${escapeHtml(season)}">${escapeHtml(season)}</button>`)].join("");
  const moduleNavLinks=Array.from(document.querySelectorAll(".module-tabs a[data-module]")),moduleViews=Array.from(document.querySelectorAll("[data-module-view]")),backToTop=document.querySelector(".back-to-top"),pageTop=document.getElementById("page-top"),visitKey="roco-rare-egg-planner-visited-v1",legacyModules={top:"home",resources:"home",collection:"catalog",plan:"planner",route:"planner"};
  const moduleFromHash=(hash)=>{const value=hash.replace(/^#/,"");return ["home","catalog","planner"].includes(value)?value:legacyModules[value]||null;};
  const activateModule=(id,historyMode="none")=>{moduleViews.forEach((view)=>{view.hidden=view.dataset.moduleView!==id;});moduleNavLinks.forEach((link)=>{const active=link.dataset.module===id;link.classList.toggle("active",active);link.setAttribute("aria-selected",String(active));if(active)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");});if(historyMode!=="none")window.history[historyMode==="replace"?"replaceState":"pushState"](null,"",`${window.location.pathname}${window.location.search}#${id}`);window.requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"auto"}));};
  document.addEventListener("click",(event)=>{const link=event.target.closest?.("a[data-module],a[data-module-target]");if(!link)return;const target=link.dataset.module||link.dataset.moduleTarget;if(!target)return;event.preventDefault();activateModule(target,"push");});
  const requestedModule=moduleFromHash(window.location.hash);let initialModule=requestedModule||"home";try{const returningUser=localStorage.getItem(visitKey)==="1";localStorage.setItem(visitKey,"1");if(!requestedModule&&returningUser)initialModule="planner";}catch{}
  activateModule(initialModule,"replace");
  const syncModuleFromHistory=()=>activateModule(moduleFromHash(window.location.hash)||"home");window.addEventListener("hashchange",syncModuleFromHistory);window.addEventListener("popstate",syncModuleFromHistory);
  if("IntersectionObserver" in window&&pageTop&&backToTop){const topObserver=new IntersectionObserver(([entry])=>backToTop.classList.toggle("is-visible",!entry.isIntersecting),{threshold:0});topObserver.observe(pageTop);}else{backToTop?.classList.add("is-visible");}
  backToTop?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  load();renderAll();
})();
