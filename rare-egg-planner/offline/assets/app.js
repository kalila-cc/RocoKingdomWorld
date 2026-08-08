(function () {
  "use strict";

  const PETS = window.ROCO_DATA.pets;
  const {
    AUTO_PRIORITY, OWN, TARGET_LABEL, VARIANT_LABEL,
    availableMotherVariants: motherVariants,
    commonGroup, createPlanner, isBreedable: breedable, isEggTarget,
    migrateOwnedMap, ownsKind, petKey, petLabel,
    seasonMatches, slotPoint: point,
  } = window.ROCO_PLANNER;
  const PLANNER = createPlanner(PETS);
  const PET_MAP = new Map(PETS.map((pet) => [pet.key||pet.name, pet]));
  const STORAGE_KEY = "roco-rare-nest-planner-v2";
  const LEGACY_KEY = "roco-shiny-nest-planner-v1";
  const SEASON_KEYS = Array.from(new Set(PETS.map((pet)=>String(pet.season||"").match(/^S\d+/)?.[0]).filter(Boolean))).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));
  const EGG_GROUPS = Array.from(new Set(PETS.flatMap((pet)=>pet.groups||[]))).sort((a,b)=>a.localeCompare(b,"zh-CN"));
  const LATEST_SEASON = PETS.map((pet)=>pet.season).filter(Boolean).sort((a,b)=>Number(String(b).match(/^S(\d+)/)?.[1]||0)-Number(String(a).match(/^S(\d+)/)?.[1]||0))[0] || "未知赛季";
  const state = { owned:{}, nestCount:10, focus:"all", search:"", season:"all", group:"all", view:"all", salt:0 };

  function $(id) { return document.getElementById(id); }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]); }
  function image(pet) { return `<img src="assets/pets/${escapeHtml(pet.image||`${pet.id}.webp`)}" alt="${escapeHtml(petLabel(pet))}" loading="lazy">`; }
  function evolutionInfo(pet) { const chain=Array.isArray(pet.evolutionChain)?pet.evolutionChain:[],groups=Array.isArray(pet.groups)?pet.groups:[],offspring=pet.offspringKey&&pet.offspringKey!==petKey(pet)?PET_MAP.get(pet.offspringKey):null;const chainText=chain.join(" → "),groupText=groups.length?groups.join(" · "):"无可用蛋组",offspringText=offspring?petLabel(offspring):"",aria=`${petLabel(pet)}，异色时效：${pet.availabilityReason||"赛季限时异色"}，蛋组：${groups.length?groups.join("、"):"无可用蛋组"}${offspring?`，繁育后代：${offspringText}；${pet.offspringReason||"该形态不遗传"}`:""}${chain.length>1?`，进化链：${chainText}`:""}`;return`<span class="pet-info-trigger" tabindex="0" aria-label="${escapeHtml(aria)}">i<span class="pet-evolution-tooltip" role="tooltip">${pet.form?`<span class="pet-tooltip-section"><strong>地区形态</strong><span>${escapeHtml(pet.form)}</span></span>`:""}<span class="pet-tooltip-section"><strong>异色时效</strong><span>${escapeHtml(pet.availabilityReason||"赛季限时异色")}</span></span><span class="pet-tooltip-section"><strong>所在蛋组</strong><span>${escapeHtml(groupText)}</span></span>${offspring?`<span class="pet-tooltip-section offspring-result"><strong>繁育后代</strong><span>${escapeHtml(offspringText)}<small>${escapeHtml(pet.offspringReason||"该形态不遗传")}</small></span></span>`:""}${chain.length>1?`<span class="pet-tooltip-section"><strong>进化链与附加形态</strong><span>${escapeHtml(chainText)}</span></span>`:""}</span></span>`; }
  function maleParents(kind) { return PLANNER.maleParents(state.owned,kind); }
  function makeAutoPlan() { return PLANNER.makeAutoPlan(state.owned,state.nestCount,state.focus,state.salt); }
  function buildRoadmap(kind,objective) { return PLANNER.buildRoadmap(state.owned,state.focus,kind,objective); }

  function load() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const saved = current ? JSON.parse(current) : JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
      if (saved && saved.owned) state.owned = migrateOwnedMap(PETS,saved.owned);
      if (saved && saved.nestCount) state.nestCount = Math.max(2,Math.min(10,saved.nestCount));
      if (saved && saved.focus) state.focus = saved.focus;
    } catch { $("saveStatus").textContent = "浏览器未开放本地存储，可用导出进度备份"; }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify({version:4,owned:state.owned,nestCount:state.nestCount,focus:state.focus,savedAt:new Date().toISOString()}));
      $("saveStatus").textContent = "更改后已自动保存到本机";
    } catch { $("saveStatus").textContent = "本地存储不可用，请用导出进度备份"; }
  }

  function renderPlan(plan) {
    const kindLabel=TARGET_LABEL[plan.kind];
    const nextStep=buildRoadmap(plan.kind,plan.objective)[0],coverageLabel=plan.targetTier==="season-limited"?"限时目标覆盖":plan.targetTier==="permanent"?"常驻目标覆盖":TARGET_LABEL[plan.objective]+"目标覆盖",comboOpportunities=plan.kind==="combo"?plan.pairedMothers:0;
    let advice;if(nextStep){const unlockCopy=nextStep.unlocks>0?`，可再解锁 ${nextStep.unlocks} 个后续目标`:"，继续扩展同蛋组路线";advice=`优先孵出 ${petLabel(nextStep.target)} 并保留${kindLabel}公体，接入${nextStep.group}${unlockCopy}`;}else if(!plan.slots.length){advice=AUTO_PRIORITY.some((kind)=>maleParents(kind).length)?"切换目标赛季，或补充能够连接新蛋组的珍稀母体":"先登记一只可繁育的异色炫彩公体，系统才能生成覆盖路线";}else if(plan.targetCount>0&&plan.pairedMothers>=plan.targetCount){advice="当前目标已经全部覆盖，按本轮摆法继续孵化即可";}else{advice="当前可用亲本已充分利用；补充新的同蛋组珍稀公体可继续扩大覆盖";}
    $("metricCoverageLabel").textContent=coverageLabel;$("metricCoverage").textContent=`${plan.pairedMothers} / ${plan.targetCount}`;$("metricUtilization").textContent=`${plan.slots.length} / ${state.nestCount}`;$("metricCombo").textContent=`${comboOpportunities} 窝`;$("metricAdvice").textContent=advice;
    $("recommendationScore").textContent=plan.recommendation?plan.recommendation+"%":"--";
    $("recommendationKind").textContent=plan.targetTier==="season-limited"?"限时异色优先":plan.targetTier==="permanent"?"常驻异色补全":kindLabel+"方案";
    $("planScore").setAttribute("aria-label","当前方案推荐度 "+plan.recommendation+"%");
    $("panelTarget").textContent=plan.targetTier==="season-limited"?"赛季限时目标":plan.targetTier==="permanent"?"常驻目标低优补位":"蛋种跟随母体";
    let html='<div class="map-grid"></div><svg class="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
    plan.edges.forEach((edge)=>{const start=point(edge.father),end=point(edge.mother);html+=`<line x1="${start.left}" y1="${start.top}" x2="${end.left}" y2="${end.top}"></line>`;});
    html+='</svg>';
    plan.slots.forEach((slot)=>{const p=point(slot),groupText=slot.pet.groups.length?slot.pet.groups.join(" · "):"无可用蛋组",label=petLabel(slot.pet),aria=`${label}，${VARIANT_LABEL[slot.variant]}${slot.role==="father"?"公体":"母体"}，蛋组：${slot.pet.groups.length?slot.pet.groups.join("、"):"无可用蛋组"}`;html+=`<div class="nest-slot ${slot.role} variant-${slot.variant}" style="--left:${p.left}%;--top:${p.top}%" tabindex="0" aria-label="${escapeHtml(aria)}"><div class="nest-shell">${image(slot.pet)}</div><span class="gender-pin">${slot.role==="father"?"♂":"♀"}</span><strong title="${escapeHtml(label)}">${escapeHtml(label)}</strong><small>${VARIANT_LABEL[slot.variant]}${slot.role==="father"?"公体":"母体"}</small><span class="pet-group-tooltip" role="tooltip"><b>所在蛋组</b>${escapeHtml(groupText)}</span></div>`;});
    if(!plan.slots.length){const hasMale=AUTO_PRIORITY.some((kind)=>maleParents(kind).length);html+=`<div class="map-empty-state"><span class="empty-symbol">♂</span><h3>${hasMale?"当前赛季暂无可孵目标":"先登记可传递珍稀特征的公体"}</h3><p>${hasMale?"切换目标赛季或检查已有记录，系统会继续按异色炫彩、异色、炫彩自动降级寻找方案。":"可登记异色炫彩公体；也可用异色公体搭配目标炫彩母体，反向亦可。"}</p><a href="#collection">去登记图鉴 →</a></div>`;}
    html+='<div class="distance-key"><span></span> 实线代表同蛋组且横、竖或斜角紧邻</div>';
    const map=$("nestMap");map.className="nest-map "+(plan.slots.length?"has-plan":"empty");map.innerHTML=html;
    const motherKeys=Array.from(new Set(plan.edges.map((edge)=>petKey(edge.mother.pet))));
    $("eggList").innerHTML=motherKeys.length?motherKeys.map((key,index)=>{const mother=PET_MAP.get(key),edges=plan.edges.filter((edge)=>petKey(edge.mother.pet)===key),fathers=Array.from(new Set(edges.map((edge)=>petKey(edge.father.pet)))),motherVariant=edges[0].mother.variant,group=commonGroup(PET_MAP.get(fathers[0]),mother);return`<div class="egg-item"><span class="egg-number">${String(index+1).padStart(2,"0")}</span>${image(mother)}<div><strong>${escapeHtml(petLabel(mother))}${kindLabel}蛋</strong><small>${VARIANT_LABEL[motherVariant]}母体 · ${escapeHtml(group)} · 接入 ${fathers.length} 只公体</small></div></div>`;}).join(""):'<p class="panel-empty">登记图鉴后，具体蛋单会出现在这里。</p>';
  }
  function renderRoute(kind,objective) {
    const steps=buildRoadmap(kind,objective);$("routeKind").textContent=TARGET_LABEL[kind];
    if(steps.length){$("routeArea").innerHTML=`<div class="route-track">${steps.map((step,index)=>`<article class="route-step"><span class="route-index">${index+1}</span><div class="route-pair"><div class="variant-${step.source.variant}">${image(step.source.pet)}<small aria-label="${VARIANT_LABEL[step.source.variant]}公体" title="${VARIANT_LABEL[step.source.variant]}公体">♂</small></div><span>＋</span><div class="variant-${step.motherVariant}">${image(step.target)}<small aria-label="${VARIANT_LABEL[step.motherVariant]}母体" title="${VARIANT_LABEL[step.motherVariant]}母体">♀</small></div></div><strong>${escapeHtml(petLabel(step.source.pet))} → ${escapeHtml(petLabel(step.target))}</strong><p>${escapeHtml(step.group)} · ${step.target.availability==="season-limited"?"限时优先":"常驻低优"} · 新开 ${step.unlocks} 个后续目标</p></article>`).join("")}</div>`;}else{const female=PETS.find((pet)=>motherVariants(state.owned[petKey(pet)]).length>1&&breedable(pet));$("routeArea").innerHTML=`<div class="route-empty"><div><span>01</span><i>♀</i></div><p>${female?`你已有 ${escapeHtml(petLabel(female))} 的珍稀母体，系统会寻找可推进异色收集的同蛋组公体。`:"登记至少一只可繁育的异色、炫彩或异色炫彩后，这里会生成扩散顺序。"}</p></div>`;}
  }
  function renderCatalog() {
    const query=state.search.trim().toLowerCase();
    const visible=PETS.filter((pet)=>{const key=petKey(pet);if(query&&(pet.name+(pet.form||"")+pet.groups.join("")+(pet.availabilityReason||"")+(pet.offspringReason||"")).toLowerCase().indexOf(query)<0)return false;if(!seasonMatches(pet,state.season))return false;if(state.group==="none"&&pet.groups.length)return false;if(state.group!=="all"&&state.group!=="none"&&!pet.groups.includes(state.group))return false;if(state.view==="owned"&&!state.owned[key])return false;if(state.view==="missing"&&ownsKind(state.owned[key],"shiny"))return false;return true;});
    const rows=[{variant:"shiny",label:"异色",male:OWN.SHINY_M,female:OWN.SHINY_F},{variant:"colorful",label:"炫彩",male:OWN.COLOR_M,female:OWN.COLOR_F},{variant:"combo",label:"异色炫彩",male:OWN.COMBO_M,female:OWN.COMBO_F}];
    $("petGrid").innerHTML=visible.map((pet)=>{const key=petKey(pet),mask=state.owned[key]||0,disabled=!breedable(pet),femaleOnly=Boolean(pet.flags&4),hasOffspringOverride=Boolean(pet.offspringKey&&pet.offspringKey!==key);return`<article class="pet-card ${mask?"has-rare":"missing-rare"} ${disabled?"unbreedable":""}"><div class="pet-visual">${image(pet)}<span class="season-tag">${pet.season.slice(0,2)}</span><span class="availability-tag ${pet.availability}">${pet.availability==="permanent"?"常驻 · 低优":"限时 · 优先"}</span>${mask?'<span class="owned-tag">已登记</span>':""}${disabled?'<span class="lock-tag">不可繁育</span>':""}${hasOffspringOverride?'<span class="inheritance-tag">后代为原形态</span>':""}</div><div class="pet-info"><h3><span class="pet-name">${escapeHtml(pet.name)}</span>${evolutionInfo(pet)}</h3>${pet.form?`<span class="pet-form-label">地区形态 · ${escapeHtml(pet.form)}</span>`:""}<p>${pet.groups.length?escapeHtml(pet.groups.join(" · ")):"无可用蛋组"}</p></div><div class="rare-picker" data-pet="${escapeHtml(key)}" aria-label="${escapeHtml(petLabel(pet))}珍稀形态与性别">${rows.map((row)=>`<div class="rare-row variant-${row.variant}"><div class="variant-label"><span class="variant-mark mark-${row.variant}" aria-hidden="true"><img src="assets/traits/mark-${row.variant}.png" alt=""></span><span>${row.label}</span></div><button type="button" data-bit="${row.male}" ${femaleOnly?"disabled":""} class="gender-button gender-male ${mask&row.male?"active":""}" aria-pressed="${Boolean(mask&row.male)}" title="${femaleOnly?"此精灵仅有母性":row.label+"公体"}">♂</button><button type="button" data-bit="${row.female}" class="gender-button gender-female ${mask&row.female?"active":""}" aria-pressed="${Boolean(mask&row.female)}" title="${row.label}母体">♀</button></div>`).join("")}</div></article>`;}).join("");
    $("eggGroupResult").textContent=visible.length;
    $("noResults").hidden=Boolean(visible.length);
  }
  function renderStats() {
    const shiny=PETS.filter((pet)=>ownsKind(state.owned[petKey(pet)],"shiny")).length,color=PETS.filter((pet)=>ownsKind(state.owned[petKey(pet)],"colorful")).length,combo=PETS.filter((pet)=>ownsKind(state.owned[petKey(pet)],"combo")).length,other=PETS.filter((pet)=>!ownsKind(state.owned[petKey(pet)],"shiny")&&!isEggTarget(pet)).length,limitedMissing=PETS.filter((pet)=>pet.availability==="season-limited"&&isEggTarget(pet)&&!ownsKind(state.owned[petKey(pet)],"shiny")).length;
    $("heroOwned").textContent=$("statOwned").textContent=shiny;$("heroMale").textContent=$("statMale").textContent=color;$("heroReach").textContent=$("statMissing").textContent=combo;$("statOther").textContent=other;$("nestValue").textContent=state.nestCount;
    document.querySelectorAll("[data-pet-total]").forEach((node)=>{node.textContent=PETS.length;});
    $("limitedMissingCount").textContent=limitedMissing;
    document.querySelectorAll("#focusSwitch button").forEach((button)=>button.classList.toggle("active",button.dataset.focus===state.focus));
  }
  function renderAll(){const plan=makeAutoPlan();renderStats();renderPlan(plan);renderRoute(plan.kind,plan.objective);renderCatalog();}
  function toast(message){const el=$("toast");el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true;},2200);}

  $("petGrid").addEventListener("click",(event)=>{const button=event.target.closest("button[data-bit]");if(!button)return;const picker=button.closest(".rare-picker"),key=picker.dataset.pet,pet=PET_MAP.get(key),bit=Number(button.dataset.bit);if((pet.flags&4)&&(bit===OWN.SHINY_M||bit===OWN.COLOR_M||bit===OWN.COMBO_M))return;state.owned[key]=(state.owned[key]||0)^bit;save();renderAll();});
  $("nestMinus").addEventListener("click",()=>{state.nestCount=Math.max(2,state.nestCount-1);save();renderAll();});
  $("nestPlus").addEventListener("click",()=>{state.nestCount=Math.min(10,state.nestCount+1);save();renderAll();});
  $("refreshPlan").addEventListener("click",()=>{state.salt++;renderAll();});
  $("focusSwitch").addEventListener("click",(event)=>{const button=event.target.closest("button[data-focus]");if(!button)return;state.focus=button.dataset.focus;save();renderAll();});
  $("searchInput").addEventListener("input",(event)=>{state.search=event.target.value;renderCatalog();});
  ["seasonFilter","viewFilter"].forEach((id)=>$(id).addEventListener("click",(event)=>{const button=event.target.closest("button[data-value]");if(!button)return;state[id==="seasonFilter"?"season":"view"]=button.dataset.value;$(id).querySelectorAll("button").forEach((item)=>item.classList.toggle("active",item===button));renderCatalog();}));
  $("eggGroupFilter").addEventListener("click",(event)=>{const button=event.target.closest("button[data-group]");if(!button)return;state.group=button.dataset.group;$("eggGroupFilter").querySelectorAll("button").forEach((item)=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});renderCatalog();});
  $("clearBtn").addEventListener("click",()=>{if(!confirm(`确定清空全部 ${PETS.length} 只精灵的异色、炫彩与组合形态记录吗？`))return;state.owned={};save();renderAll();toast("拥有记录已清空");});
  $("exportBtn").addEventListener("click",()=>{const payload=JSON.stringify({version:4,owned:state.owned,nestCount:state.nestCount,focus:state.focus,exportedAt:new Date().toISOString()},null,2),url=URL.createObjectURL(new Blob([payload],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="roco-rare-egg-progress.json";a.click();URL.revokeObjectURL(url);toast("进度文件已导出");});
  $("importBtn").addEventListener("click",()=>$("importInput").click());
  $("importInput").addEventListener("change",(event)=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const payload=JSON.parse(String(reader.result));if(!payload.owned)throw new Error();state.owned=migrateOwnedMap(PETS,payload.owned);if(payload.nestCount)state.nestCount=Math.max(2,Math.min(10,payload.nestCount));if(payload.focus)state.focus=payload.focus;save();renderAll();toast("进度已恢复");}catch{toast("无法识别这个进度文件");}};reader.readAsText(file);event.target.value="";});

  $("focusSwitch").innerHTML=['<button class="active" data-focus="all">全部</button>',...SEASON_KEYS.map((season)=>`<button data-focus="${escapeHtml(season)}">${escapeHtml(season)}</button>`)].join("");
  $("seasonFilter").innerHTML=['<button class="active" data-value="all">全部赛季</button>',...SEASON_KEYS.map((season)=>`<button data-value="${escapeHtml(season)}">${escapeHtml(season)}</button>`)].join("");
  $("eggGroupFilter").innerHTML=[{value:"all",label:"全部蛋组",count:PETS.length},...EGG_GROUPS.map((group)=>({value:group,label:group,count:PETS.filter((pet)=>pet.groups.includes(group)).length})),{value:"none",label:"无蛋组",count:PETS.filter((pet)=>!pet.groups.length).length}].map((item,index)=>`<button type="button" class="${index===0?"active":""}" data-group="${escapeHtml(item.value)}" aria-pressed="${index===0}"><span>${escapeHtml(item.label)}</span><small>${item.count}</small></button>`).join("");
  const sideNav=document.querySelector(".side-nav"),sideNavLinks=Array.from(sideNav?.querySelectorAll('a[href^="#"]')||[]),sideNavSections=sideNavLinks.map((link)=>document.getElementById(link.hash.slice(1))).filter(Boolean);
  const activateSection=(id)=>sideNavLinks.forEach((link)=>{const active=link.hash===`#${id}`;link.classList.toggle("active",active);if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
  sideNav?.addEventListener("click",(event)=>{const link=event.target.closest?.('a[href^="#"]');if(link)activateSection(link.hash.slice(1));});
  if("IntersectionObserver" in window){const sectionObserver=new IntersectionObserver((entries)=>{const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top-window.innerHeight*.18)-Math.abs(b.boundingClientRect.top-window.innerHeight*.18));if(visible[0])activateSection(visible[0].target.id);},{rootMargin:"-18% 0px -68% 0px",threshold:0});sideNavSections.forEach((section)=>sectionObserver.observe(section));}
  activateSection(window.location.hash.slice(1)||"top");
  const updatedAt=String(window.ROCO_DATA.updatedAt||"").replace("T"," ").replace(/Z$/,"");
  $("dataVersionText").innerHTML=`<strong>数据版本：</strong> ${escapeHtml(LATEST_SEASON)}，最终形态图鉴卡片 ${PETS.length} 张；炫彩可与异色叠加，同名地区形态按基础 ID 独立登记，但推荐器会另行判断该形态能否作为孵化结果遗传。雅丹鬃与各赛季战令精灵标记为常驻低优，其余赛季异色按限时优先。${updatedAt?`数据库更新时间 ${escapeHtml(updatedAt)}。`:""}本工具为非商业离线辅助。`;
  load();renderAll();
})();
