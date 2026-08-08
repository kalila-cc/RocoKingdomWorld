/* Generated from app/planner-core.ts. Run npm run build:offline; do not edit by hand. */
window.ROCO_PLANNER = (() => {
  const exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARGET_LABEL = exports.VARIANT_LABEL = exports.NEST_GRID_STEP = exports.AUTO_PRIORITY = exports.FLAG = exports.OWN = void 0;
exports.petKey = petKey;
exports.petLabel = petLabel;
exports.migrateOwnedMap = migrateOwnedMap;
exports.ownsKind = ownsKind;
exports.availableMotherVariants = availableMotherVariants;
exports.isBreedable = isBreedable;
exports.offspringKey = offspringKey;
exports.isEggTarget = isEggTarget;
exports.seasonMatches = seasonMatches;
exports.commonGroup = commonGroup;
exports.slotPoint = slotPoint;
exports.createPlanner = createPlanner;
exports.OWN = {
    SHINY_M: 1,
    SHINY_F: 2,
    COLOR_M: 4,
    COLOR_F: 8,
    COMBO_M: 16,
    COMBO_F: 32,
};
exports.FLAG = {
    BREEDABLE: 1,
    RULE_NON_BREEDABLE: 2,
    FEMALE_ONLY: 4,
    MALE_ONLY: 8,
    NO_EGG_GROUP: 16,
    EXCLUDED: 32,
};
exports.AUTO_PRIORITY = ["combo", "shiny", "colorful"];
exports.NEST_GRID_STEP = 2;
exports.VARIANT_LABEL = {
    normal: "普通",
    shiny: "异色",
    colorful: "炫彩",
    combo: "异色炫彩",
};
exports.TARGET_LABEL = {
    shiny: "异色",
    colorful: "炫彩",
    combo: "异色炫彩",
};
function petKey(pet) {
    return pet.key || pet.name;
}
function petLabel(pet) {
    return pet.form ? `${pet.name}（${pet.form}）` : pet.name;
}
function migrateOwnedMap(pets, source) {
    const migrated = { ...(source || {}) };
    const splitNames = new Set(pets.filter((pet) => petKey(pet) !== pet.name).map((pet) => pet.name));
    pets.forEach((pet) => {
        if (pet.legacyKey && petKey(pet) !== pet.legacyKey && migrated[petKey(pet)] === undefined && migrated[pet.legacyKey] !== undefined) {
            migrated[petKey(pet)] = migrated[pet.legacyKey];
        }
    });
    splitNames.forEach((name) => { delete migrated[name]; });
    return migrated;
}
function ownsKind(mask, kind) {
    const value = mask || 0;
    if (kind === "shiny")
        return Boolean(value & (exports.OWN.SHINY_M | exports.OWN.SHINY_F | exports.OWN.COMBO_M | exports.OWN.COMBO_F));
    if (kind === "colorful")
        return Boolean(value & (exports.OWN.COLOR_M | exports.OWN.COLOR_F | exports.OWN.COMBO_M | exports.OWN.COMBO_F));
    return Boolean(value & (exports.OWN.COMBO_M | exports.OWN.COMBO_F));
}
function availableMotherVariants(mask) {
    const value = mask || 0;
    const variants = ["normal"];
    if (value & exports.OWN.SHINY_F)
        variants.push("shiny");
    if (value & exports.OWN.COLOR_F)
        variants.push("colorful");
    if (value & exports.OWN.COMBO_F)
        variants.push("combo");
    return variants;
}
function isBreedable(pet) {
    return Boolean(pet.flags & exports.FLAG.BREEDABLE) && !Boolean(pet.flags & exports.FLAG.RULE_NON_BREEDABLE);
}
function offspringKey(pet) {
    return pet.offspringKey || petKey(pet);
}
function isEggTarget(pet) {
    return isBreedable(pet) && offspringKey(pet) === petKey(pet);
}
function seasonMatches(pet, focus) {
    return focus === "all" || pet.season.startsWith(focus);
}
function commonGroup(a, b) {
    return a.groups.find((group) => b.groups.includes(group)) || "同蛋组";
}
function slotPoint(slot) {
    return { left: 12 + (slot.x / 6) * 76, top: 20 + (slot.y / 4) * 60 };
}
function variantTraits(variant) {
    return { shiny: variant === "shiny" || variant === "combo", colorful: variant === "colorful" || variant === "combo" };
}
function canProduce(kind, fatherVariant, motherVariant) {
    const father = variantTraits(fatherVariant);
    const mother = variantTraits(motherVariant);
    const shiny = father.shiny || mother.shiny;
    const colorful = father.colorful || mother.colorful;
    return kind === "shiny" ? shiny : kind === "colorful" ? colorful : shiny && colorful;
}
function tierMatches(pet, objective, targetTier) {
    return objective !== "shiny" || targetTier === "all" || pet.availability === targetTier;
}
function hashText(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function nestsAreAdjacent(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= exports.NEST_GRID_STEP;
}
function layoutPositions(count) {
    const distributions = {
        1: [1], 2: [2], 3: [3], 4: [4], 5: [2, 3],
        6: [3, 3], 7: [3, 4], 8: [4, 4], 9: [3, 3, 3], 10: [3, 4, 3],
    };
    const rows = distributions[count] || [count];
    const yValues = rows.length === 1 ? [2] : rows.length === 2 ? [1, 3] : [0, 2, 4];
    return rows.flatMap((items, rowIndex) => {
        const start = items === 4 ? 0 : items === 3 ? (rowIndex % 2 === 0 ? 1 : 0) : items === 2 ? (rowIndex % 2 === 0 ? 2 : 1) : 3;
        return Array.from({ length: items }, (_, index) => ({ x: start + index * 2, y: yValues[rowIndex] }));
    });
}
function createPlanner(pets) {
    const petMap = new Map(pets.map((pet) => [petKey(pet), pet]));
    function sameEggGroup(father, mother) {
        return father.maleTargets.includes(petKey(mother)) || Boolean(commonGroup(father, mother) !== "同蛋组" && isBreedable(father) && isBreedable(mother));
    }
    function canPair(father, mother) {
        return sameEggGroup(father.pet, mother.pet) && canProduce(mother.targetKind, father.variant, mother.variant);
    }
    function bestMotherVariant(owned, target, father, kind) {
        return availableMotherVariants(owned[petKey(target)]).find((variant) => canProduce(kind, father.variant, variant));
    }
    function maleParents(owned, kind) {
        const parents = [];
        pets.forEach((pet) => {
            if (!isBreedable(pet))
                return;
            const mask = owned[petKey(pet)] || 0;
            if ((kind === "shiny" || kind === "combo") && (mask & exports.OWN.SHINY_M))
                parents.push({ pet, variant: "shiny" });
            if ((kind === "colorful" || kind === "combo") && (mask & exports.OWN.COLOR_M))
                parents.push({ pet, variant: "colorful" });
            if (mask & exports.OWN.COMBO_M)
                parents.push({ pet, variant: "combo" });
        });
        return parents;
    }
    function layoutScore(slots) {
        let edges = 0;
        const covered = new Set();
        for (let i = 0; i < slots.length; i += 1) {
            for (let j = i + 1; j < slots.length; j += 1) {
                const a = slots[i];
                const b = slots[j];
                if (a.role === b.role)
                    continue;
                const father = a.role === "father" ? a : b;
                const mother = a.role === "mother" ? a : b;
                if (nestsAreAdjacent(a, b) && canPair(father, mother)) {
                    edges += 1;
                    covered.add(petKey(mother.pet));
                }
            }
        }
        return covered.size * 100 + edges * 8;
    }
    function optimizeLayout(roster) {
        const positions = layoutPositions(roster.length);
        let slots = roster.map((item, index) => ({ ...item, x: positions[index].x, y: positions[index].y }));
        let bestScore = layoutScore(slots);
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 0; i < slots.length; i += 1) {
                for (let j = i + 1; j < slots.length; j += 1) {
                    const candidate = slots.map((slot) => ({ ...slot }));
                    const point = { x: candidate[i].x, y: candidate[i].y };
                    candidate[i].x = candidate[j].x;
                    candidate[i].y = candidate[j].y;
                    candidate[j].x = point.x;
                    candidate[j].y = point.y;
                    const score = layoutScore(candidate);
                    if (score > bestScore) {
                        slots = candidate;
                        bestScore = score;
                        improved = true;
                    }
                }
            }
        }
        return slots;
    }
    function buildEdges(slots) {
        const edges = [];
        for (let i = 0; i < slots.length; i += 1) {
            for (let j = i + 1; j < slots.length; j += 1) {
                const a = slots[i];
                const b = slots[j];
                if (a.role === b.role)
                    continue;
                const father = a.role === "father" ? a : b;
                const mother = a.role === "mother" ? a : b;
                if (nestsAreAdjacent(a, b) && canPair(father, mother))
                    edges.push({ father, mother, group: commonGroup(father.pet, mother.pet) });
            }
        }
        return edges;
    }
    function chooseMales(males, targets, owned, kind, count, salt) {
        const chosen = [];
        const remaining = [...males];
        const covered = new Set();
        while (chosen.length < count && remaining.length) {
            remaining.sort((a, b) => {
                const score = (parent) => parent.pet.maleTargets.reduce((sum, name) => {
                    const target = petMap.get(name);
                    if (!target || !targets.includes(target) || covered.has(name) || !bestMotherVariant(owned, target, parent, kind))
                        return sum;
                    return sum + 20 + target.maleTargets.length * 0.25;
                }, 0) + (parent.variant === "combo" ? 2 : 0) + ((hashText(`${petKey(parent.pet)}-${parent.variant}-${salt}`) % 100) / 10000);
                return score(b) - score(a);
            });
            const next = remaining.shift();
            if (!next)
                break;
            chosen.push(next);
            next.pet.maleTargets.forEach((name) => covered.add(name));
        }
        return chosen;
    }
    function makePlan(owned, nestCount, focus, kind, salt, objective = kind, targetTier = "all") {
        const isMissingObjective = (pet) => !ownsKind(owned[petKey(pet)], objective);
        const isCurrentTier = (pet) => tierMatches(pet, objective, targetTier);
        const targets = pets.filter((pet) => isMissingObjective(pet) && isEggTarget(pet) && isCurrentTier(pet) && seasonMatches(pet, focus));
        const allMissing = pets.filter((pet) => isMissingObjective(pet) && isEggTarget(pet) && isCurrentTier(pet));
        const males = maleParents(owned, kind);
        const direct = new Set();
        males.forEach((father) => father.pet.maleTargets.forEach((name) => {
            const target = petMap.get(name);
            if (target && isMissingObjective(target) && isEggTarget(target) && isCurrentTier(target) && bestMotherVariant(owned, target, father, kind))
                direct.add(name);
        }));
        if (!males.length || !targets.length) {
            return { objective, targetTier, slots: [], edges: [], pairedMothers: 0, targetCount: targets.length, directCount: direct.size, uncovered: allMissing.length };
        }
        let best = null;
        const maxMales = Math.min(males.length, nestCount - 1, 5);
        for (let maleCount = 1; maleCount <= maxMales; maleCount += 1) {
            const chosenMales = chooseMales(males, targets, owned, kind, maleCount, salt);
            const motherCount = nestCount - chosenMales.length;
            const chosenTargets = targets
                .map((pet) => {
                const variants = availableMotherVariants(owned[petKey(pet)]);
                const scoredVariants = variants.map((variant) => ({
                    variant,
                    compatible: chosenMales.filter((father) => sameEggGroup(father.pet, pet) && canProduce(kind, father.variant, variant)).length,
                })).sort((a, b) => b.compatible - a.compatible || (a.variant === "normal" ? -1 : 1));
                const bestVariant = scoredVariants[0];
                const futureReach = pet.maleTargets.filter((name) => {
                    const future = petMap.get(name);
                    return future ? isMissingObjective(future) && isEggTarget(future) && isCurrentTier(future) : false;
                }).length;
                return { pet, variant: bestVariant.variant, compatible: bestVariant.compatible, score: bestVariant.compatible * 100 + futureReach * 2 + (hashText(`${petKey(pet)}:${salt}`) % 97) / 100 };
            })
                .filter((item) => item.compatible > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, motherCount);
            const roster = [
                ...chosenMales.map((parent) => ({ pet: parent.pet, variant: parent.variant, targetKind: kind, role: "father" })),
                ...chosenTargets.map((item) => ({ pet: item.pet, variant: item.variant, targetKind: kind, role: "mother" })),
            ];
            const slots = optimizeLayout(roster);
            const edges = buildEdges(slots);
            const pairedMothers = new Set(edges.map((edge) => petKey(edge.mother.pet))).size;
            const score = pairedMothers * 1000 + edges.length * 20 - chosenMales.length * 2;
            if (!best || score > best.score)
                best = { slots, edges, score };
        }
        const slots = best?.slots || [];
        const edges = best?.edges || [];
        const pairedMothers = new Set(edges.map((edge) => petKey(edge.mother.pet))).size;
        return { objective, targetTier, slots, edges, pairedMothers, targetCount: targets.length, directCount: direct.size, uncovered: allMissing.length - direct.size };
    }
    function recommendationFor(plan, kind, nestCount) {
        if (!plan.slots.length || !plan.pairedMothers)
            return 0;
        const base = { combo: 82, shiny: 72, colorful: 64 }[kind];
        const utilization = plan.slots.length / nestCount;
        const motherSlots = plan.slots.filter((slot) => slot.role === "mother").length;
        const coverage = plan.pairedMothers / Math.max(1, motherSlots);
        const connectivity = Math.min(1, plan.edges.length / Math.max(1, plan.pairedMothers * 2));
        const urgency = plan.targetTier === "season-limited" ? 4 : plan.targetTier === "permanent" ? -6 : 0;
        return Math.min(99, Math.max(1, Math.round(base + utilization * 5 + coverage * 7 + connectivity * 4 + urgency)));
    }
    function makeAutoPlan(owned, nestCount, focus, salt) {
        const rankedShinyPlans = (targetTier) => ["combo", "shiny"]
            .map((kind) => ({ kind, plan: makePlan(owned, nestCount, focus, kind, salt, "shiny", targetTier) }))
            .filter(({ plan }) => plan.slots.length > 0 && plan.pairedMothers > 0)
            .sort((a, b) => b.plan.pairedMothers - a.plan.pairedMothers || b.plan.edges.length - a.plan.edges.length || exports.AUTO_PRIORITY.indexOf(a.kind) - exports.AUTO_PRIORITY.indexOf(b.kind));
        const limitedShinyProgress = rankedShinyPlans("season-limited");
        const permanentShinyProgress = rankedShinyPlans("permanent");
        const fallback = exports.AUTO_PRIORITY.map((kind) => ({ kind, plan: makePlan(owned, nestCount, focus, kind, salt, kind) }));
        const selected = limitedShinyProgress[0] || permanentShinyProgress[0] || fallback.find(({ plan }) => plan.slots.length > 0 && plan.pairedMothers > 0) || fallback[0];
        return { ...selected.plan, kind: selected.kind, recommendation: recommendationFor(selected.plan, selected.kind, nestCount) };
    }
    function buildRoadmap(owned, focus, kind, objective) {
        const activeMales = maleParents(owned, kind);
        const remaining = new Set(pets.filter((pet) => !ownsKind(owned[petKey(pet)], objective) && isEggTarget(pet) && seasonMatches(pet, focus)).map((pet) => petKey(pet)));
        const steps = [];
        for (let index = 0; index < 8; index += 1) {
            let best = null;
            for (const source of activeMales) {
                for (const targetName of source.pet.maleTargets) {
                    if (!remaining.has(targetName))
                        continue;
                    const target = petMap.get(targetName);
                    if (!target)
                        continue;
                    const motherVariant = bestMotherVariant(owned, target, source, kind);
                    if (!motherVariant)
                        continue;
                    const unlocks = target.maleTargets.filter((name) => remaining.has(name)).length;
                    const limitedUnlocks = target.maleTargets.filter((name) => remaining.has(name) && petMap.get(name)?.availability === "season-limited").length;
                    const urgency = target.availability === "season-limited" ? 10000 : 0;
                    const score = urgency + limitedUnlocks * 100 + unlocks * 10 + (target.season.startsWith(focus) ? 3 : 0) + target.groups.length;
                    if (!best || score > best.score)
                        best = { source, target, motherVariant, unlocks, group: commonGroup(source.pet, target), score };
                }
            }
            if (!best)
                break;
            steps.push(best);
            activeMales.push({ pet: best.target, variant: kind });
            remaining.delete(petKey(best.target));
        }
        return steps;
    }
    return { petMap, maleParents, makeAutoPlan, buildRoadmap };
}

  return exports;
})();
