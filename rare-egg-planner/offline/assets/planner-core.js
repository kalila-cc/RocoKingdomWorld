/* Generated from app/planner-core.ts. Run npm run build:offline; do not edit by hand. */
window.ROCO_PLANNER = (() => {
  const exports = {};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARGET_LABEL = exports.VARIANT_LABEL = exports.EXACT_PARENT_LIMIT = exports.NEST_GRID_STEP = exports.AUTO_PRIORITY = exports.FLAG = exports.OWN = void 0;
exports.petKey = petKey;
exports.petLabel = petLabel;
exports.isBattlePassPet = isBattlePassPet;
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
function prefersCandidate(candidate, current) {
    const candidateRank = [
        Number(candidate.fillsRequestedNests),
        Number(candidate.allNestsConnected),
        candidate.priorityTargets,
        candidate.distinctTargets,
        candidate.pairedMothers,
        candidate.connectedSlots,
        candidate.edges.length,
        -candidate.maleCount,
    ];
    const currentRank = [
        Number(current.fillsRequestedNests),
        Number(current.allNestsConnected),
        current.priorityTargets,
        current.distinctTargets,
        current.pairedMothers,
        current.connectedSlots,
        current.edges.length,
        -current.maleCount,
    ];
    for (let index = 0; index < candidateRank.length; index += 1) {
        if (candidateRank[index] !== currentRank[index])
            return candidateRank[index] > currentRank[index];
    }
    return false;
}
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
exports.EXACT_PARENT_LIMIT = 5;
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
function isBattlePassPet(pet) {
    return pet.availabilityReason.includes("战令");
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
function motherVariantValue(kind, fatherVariant, motherVariant) {
    if (!canProduce(kind, fatherVariant, motherVariant))
        return -1;
    const father = variantTraits(fatherVariant);
    const mother = variantTraits(motherVariant);
    const combinedTraits = Number(father.shiny || mother.shiny) + Number(father.colorful || mother.colorful);
    const motherTraits = Number(mother.shiny) + Number(mother.colorful);
    return combinedTraits * 100 + motherTraits * 10;
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
const exactPlacementPatternCache = new Map();
function exactPlacementPatterns(totalCount, fatherCount) {
    const cacheKey = `${totalCount}:${fatherCount}`;
    const cached = exactPlacementPatternCache.get(cacheKey);
    if (cached)
        return cached;
    const positions = layoutPositions(totalCount);
    const adjacent = Array.from({ length: totalCount }, () => Array(totalCount).fill(false));
    for (let first = 0; first < totalCount; first += 1) {
        for (let second = first + 1; second < totalCount; second += 1) {
            adjacent[first][second] = adjacent[second][first] = Math.max(Math.abs(positions[first].x - positions[second].x), Math.abs(positions[first].y - positions[second].y)) <= exports.NEST_GRID_STEP;
        }
    }
    const patterns = [];
    const seen = new Set();
    const usedPositions = Array(totalCount).fill(false);
    const fatherPositionIndexes = Array(fatherCount).fill(-1);
    const visit = (fatherIndex) => {
        if (fatherIndex < fatherCount) {
            for (let positionIndex = 0; positionIndex < totalCount; positionIndex += 1) {
                if (usedPositions[positionIndex])
                    continue;
                usedPositions[positionIndex] = true;
                fatherPositionIndexes[fatherIndex] = positionIndex;
                visit(fatherIndex + 1);
                usedPositions[positionIndex] = false;
            }
            return;
        }
        const motherPositions = Array.from({ length: totalCount }, (_, positionIndex) => positionIndex)
            .filter((positionIndex) => !usedPositions[positionIndex])
            .map((positionIndex) => {
            let neighborMask = 0;
            fatherPositionIndexes.forEach((fatherPositionIndex, index) => {
                if (adjacent[positionIndex][fatherPositionIndex])
                    neighborMask |= 1 << index;
            });
            return { positionIndex, neighborMask };
        })
            .sort((a, b) => a.neighborMask - b.neighborMask || a.positionIndex - b.positionIndex);
        const signature = motherPositions.map((item) => item.neighborMask).join(",");
        if (seen.has(signature))
            return;
        seen.add(signature);
        patterns.push({
            fatherPositionIndexes: [...fatherPositionIndexes],
            motherPositionIndexes: motherPositions.map((item) => item.positionIndex),
            neighborMasks: motherPositions.map((item) => item.neighborMask),
        });
    };
    visit(0);
    exactPlacementPatternCache.set(cacheKey, patterns);
    return patterns;
}
function countBits(value) {
    let count = 0;
    while (value) {
        value &= value - 1;
        count += 1;
    }
    return count;
}
function forEachCombination(items, count, visit) {
    const chosen = [];
    const choose = (start) => {
        if (chosen.length === count) {
            visit([...chosen]);
            return;
        }
        const remaining = count - chosen.length;
        for (let index = start; index <= items.length - remaining; index += 1) {
            chosen.push(items[index]);
            choose(index + 1);
            chosen.pop();
        }
    };
    choose(0);
}
function createPlanner(pets) {
    const petMap = new Map(pets.map((pet) => [petKey(pet), pet]));
    const exactPlanCache = new Map();
    function sameEggGroup(father, mother) {
        return father.maleTargets.includes(petKey(mother)) || Boolean(commonGroup(father, mother) !== "同蛋组" && isBreedable(father) && isBreedable(mother));
    }
    function canPair(father, mother) {
        return sameEggGroup(father.pet, mother.pet) && canProduce(mother.targetKind, father.variant, mother.variant);
    }
    function bestMotherVariant(owned, target, father, kind) {
        return availableMotherVariants(owned[petKey(target)])
            .filter((variant) => canProduce(kind, father.variant, variant))
            .sort((a, b) => motherVariantValue(kind, father.variant, b) - motherVariantValue(kind, father.variant, a))[0];
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
    function optimizeLayout(roster, salt) {
        const positions = layoutPositions(roster.length);
        const itemIndexes = roster.map((_, index) => index);
        const adjacentPositionPairs = [];
        const pairable = Array.from({ length: roster.length }, () => Array(roster.length).fill(false));
        for (let first = 0; first < positions.length; first += 1) {
            for (let second = first + 1; second < positions.length; second += 1) {
                if (Math.max(Math.abs(positions[first].x - positions[second].x), Math.abs(positions[first].y - positions[second].y)) <= exports.NEST_GRID_STEP) {
                    adjacentPositionPairs.push([first, second]);
                }
            }
        }
        for (let first = 0; first < roster.length; first += 1) {
            for (let second = first + 1; second < roster.length; second += 1) {
                if (roster[first].role === roster[second].role)
                    continue;
                const father = roster[first].role === "father" ? roster[first] : roster[second];
                const mother = roster[first].role === "mother" ? roster[first] : roster[second];
                pairable[first][second] = pairable[second][first] = canPair(father, mother);
            }
        }
        const scoreArrangement = (arrangement) => {
            let coveredMotherMask = 0;
            let connectedSlotMask = 0;
            let edges = 0;
            adjacentPositionPairs.forEach(([firstPosition, secondPosition]) => {
                const firstItem = arrangement[firstPosition];
                const secondItem = arrangement[secondPosition];
                if (!pairable[firstItem][secondItem])
                    return;
                edges += 1;
                connectedSlotMask |= (1 << firstItem) | (1 << secondItem);
                const motherIndex = roster[firstItem].role === "mother" ? firstItem : secondItem;
                coveredMotherMask |= 1 << motherIndex;
            });
            let coveredMothers = 0;
            while (coveredMotherMask) {
                coveredMotherMask &= coveredMotherMask - 1;
                coveredMothers += 1;
            }
            let connectedSlots = 0;
            while (connectedSlotMask) {
                connectedSlotMask &= connectedSlotMask - 1;
                connectedSlots += 1;
            }
            return connectedSlots * 1000 + coveredMothers * 100 + edges * 8;
        };
        const starts = [
            itemIndexes,
            ...Array.from({ length: Math.min(11, Math.max(3, roster.length)) }, (_, restart) => [...itemIndexes].sort((a, b) => {
                const score = (itemIndex) => {
                    const item = roster[itemIndex];
                    return hashText(`${petKey(item.pet)}:${item.role}:${item.variant}:${salt}:${restart}`);
                };
                return score(a) - score(b);
            })),
        ];
        let bestArrangement = [];
        let globalBestScore = -1;
        starts.forEach((start) => {
            const arrangement = [...start];
            let bestScore = scoreArrangement(arrangement);
            while (true) {
                let nextSwap = null;
                let nextScore = bestScore;
                for (let first = 0; first < arrangement.length; first += 1) {
                    for (let second = first + 1; second < arrangement.length; second += 1) {
                        [arrangement[first], arrangement[second]] = [arrangement[second], arrangement[first]];
                        const score = scoreArrangement(arrangement);
                        [arrangement[first], arrangement[second]] = [arrangement[second], arrangement[first]];
                        if (score > nextScore) {
                            nextSwap = [first, second];
                            nextScore = score;
                        }
                    }
                }
                if (!nextSwap)
                    break;
                [arrangement[nextSwap[0]], arrangement[nextSwap[1]]] = [arrangement[nextSwap[1]], arrangement[nextSwap[0]]];
                bestScore = nextScore;
            }
            if (bestScore > globalBestScore) {
                bestArrangement = [...arrangement];
                globalBestScore = bestScore;
            }
        });
        return bestArrangement.map((itemIndex, positionIndex) => ({
            ...roster[itemIndex],
            x: positions[positionIndex].x,
            y: positions[positionIndex].y,
        }));
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
    function rankMotherCandidates(chosenMales, targets, owned, kind, salt, isMissingObjective, isCurrentTier) {
        const ranked = targets
            .map((pet) => {
            const variants = availableMotherVariants(owned[petKey(pet)]);
            const scoredVariants = variants.map((variant) => {
                let profile = 0;
                let traitValue = 0;
                chosenMales.forEach((father, fatherIndex) => {
                    if (!sameEggGroup(father.pet, pet) || !canProduce(kind, father.variant, variant))
                        return;
                    profile |= 1 << fatherIndex;
                    traitValue += Math.max(0, motherVariantValue(kind, father.variant, variant));
                });
                return { variant, profile, compatible: countBits(profile), traitValue };
            }).sort((a, b) => b.compatible - a.compatible || b.traitValue - a.traitValue);
            const bestVariant = scoredVariants[0];
            const futureReach = pet.maleTargets.filter((name) => {
                const future = petMap.get(name);
                return future ? isMissingObjective(future) && isEggTarget(future) && isCurrentTier(future) : false;
            }).length;
            return {
                pet,
                variant: bestVariant.variant,
                compatible: bestVariant.compatible,
                traitValue: bestVariant.traitValue,
                futureReach,
                tieBreaker: hashText(`${petKey(pet)}:${salt}`) % 97,
                profile: bestVariant.profile,
            };
        })
            .filter((item) => item.compatible > 0)
            .sort((a, b) => b.compatible - a.compatible
            || b.traitValue - a.traitValue
            || b.futureReach - a.futureReach
            || b.tieBreaker - a.tieBreaker);
        return ranked;
    }
    function expandMotherCandidates(primaryCandidates, secondaryCandidates, count, salt) {
        if (!primaryCandidates.length || count <= 0)
            return [];
        const selected = [...primaryCandidates, ...secondaryCandidates].slice(0, count);
        const duplicatePool = [...primaryCandidates].sort((a, b) => b.compatible - a.compatible
            || b.traitValue - a.traitValue
            || ((b.tieBreaker + salt) % 97) - ((a.tieBreaker + salt) % 97));
        let duplicateIndex = salt % duplicatePool.length;
        while (selected.length < count) {
            selected.push(duplicatePool[duplicateIndex % duplicatePool.length]);
            duplicateIndex += 1;
        }
        return selected;
    }
    function candidateMetrics(slots, edges, nestCount, maleCount, isPriorityTarget) {
        const connectedMotherSlots = new Set(edges.map((edge) => edge.mother));
        const connectedSlots = new Set(edges.flatMap((edge) => [edge.father, edge.mother])).size;
        const connectedTargets = new Set([...connectedMotherSlots].map((slot) => petKey(slot.pet)));
        const priorityTargets = new Set([...connectedMotherSlots].filter((slot) => isPriorityTarget(slot.pet)).map((slot) => petKey(slot.pet))).size;
        const fillsRequestedNests = slots.length === nestCount;
        return {
            slots,
            edges,
            fillsRequestedNests,
            allNestsConnected: fillsRequestedNests && connectedSlots === slots.length,
            pairedMothers: connectedMotherSlots.size,
            priorityTargets,
            distinctTargets: connectedTargets.size,
            connectedSlots,
            maleCount,
        };
    }
    function assignmentWeights(profile, pattern) {
        return pattern.neighborMasks.map((neighborMask) => {
            const fatherMask = profile & neighborMask;
            const edges = countBits(fatherMask);
            return { fatherMask, value: Number(edges > 0) * 1000 + edges };
        });
    }
    function exactAssignmentScore(pattern, profileCounts, fatherCount) {
        const motherCount = pattern.motherPositionIndexes.length;
        const fullMotherMask = (1 << motherCount) - 1;
        const fatherStates = 1 << fatherCount;
        const fullFatherMask = fatherStates - 1;
        let scores = new Int16Array((1 << motherCount) * fatherStates);
        scores.fill(-1);
        scores[0] = 0;
        profileCounts.forEach((rawCount, profile) => {
            const copies = Math.min(rawCount, motherCount);
            const weights = assignmentWeights(profile, pattern);
            for (let copy = 0; copy < copies; copy += 1) {
                const next = scores.slice();
                for (let occupied = 0; occupied <= fullMotherMask; occupied += 1) {
                    for (let connectedFathers = 0; connectedFathers < fatherStates; connectedFathers += 1) {
                        const stateIndex = occupied * fatherStates + connectedFathers;
                        const current = scores[stateIndex];
                        if (current < 0)
                            continue;
                        for (let slotIndex = 0; slotIndex < motherCount; slotIndex += 1) {
                            const slotBit = 1 << slotIndex;
                            if (occupied & slotBit)
                                continue;
                            const weight = weights[slotIndex];
                            const nextMotherMask = occupied | slotBit;
                            const nextFatherMask = connectedFathers | weight.fatherMask;
                            const nextIndex = nextMotherMask * fatherStates + nextFatherMask;
                            const nextScore = current + weight.value;
                            if (nextScore > next[nextIndex])
                                next[nextIndex] = nextScore;
                        }
                    }
                }
                scores = next;
            }
        });
        let best = { rank: -1, fatherMask: 0 };
        for (let fatherMask = 0; fatherMask < fatherStates; fatherMask += 1) {
            const score = scores[fullMotherMask * fatherStates + fatherMask];
            if (score < 0)
                continue;
            const pairedMothers = Math.floor(score / 1000);
            const edges = score % 1000;
            const connectedSlots = pairedMothers + countBits(fatherMask);
            const allNestsConnected = pairedMothers === motherCount && fatherMask === fullFatherMask;
            const rank = Number(allNestsConnected) * 1000000000 + pairedMothers * 1000000 + connectedSlots * 1000 + edges;
            if (rank > best.rank)
                best = { rank, fatherMask };
        }
        return best;
    }
    function reconstructExactProfiles(pattern, profileCounts, fatherCount, targetFatherMask) {
        const motherCount = pattern.motherPositionIndexes.length;
        const fullMotherMask = (1 << motherCount) - 1;
        const fatherStates = 1 << fatherCount;
        const profiles = [...profileCounts.entries()].flatMap(([profile, count]) => Array(Math.min(count, motherCount)).fill(profile));
        const layers = [new Int16Array((1 << motherCount) * fatherStates)];
        layers[0].fill(-1);
        layers[0][0] = 0;
        profiles.forEach((profile, profileIndex) => {
            const previous = layers[profileIndex];
            const next = previous.slice();
            const weights = assignmentWeights(profile, pattern);
            for (let occupied = 0; occupied < fullMotherMask; occupied += 1) {
                for (let connectedFathers = 0; connectedFathers < fatherStates; connectedFathers += 1) {
                    const stateIndex = occupied * fatherStates + connectedFathers;
                    const current = previous[stateIndex];
                    if (current < 0)
                        continue;
                    for (let slotIndex = 0; slotIndex < motherCount; slotIndex += 1) {
                        const slotBit = 1 << slotIndex;
                        if (occupied & slotBit)
                            continue;
                        const weight = weights[slotIndex];
                        const nextMotherMask = occupied | slotBit;
                        const nextFatherMask = connectedFathers | weight.fatherMask;
                        const nextIndex = nextMotherMask * fatherStates + nextFatherMask;
                        const nextScore = current + weight.value;
                        if (nextScore > next[nextIndex])
                            next[nextIndex] = nextScore;
                    }
                }
            }
            layers.push(next);
        });
        const assignment = Array(motherCount).fill(0);
        let occupied = fullMotherMask;
        let connectedFathers = targetFatherMask;
        for (let profileIndex = profiles.length; profileIndex > 0 && occupied; profileIndex -= 1) {
            const currentLayer = layers[profileIndex];
            const previousLayer = layers[profileIndex - 1];
            const currentIndex = occupied * fatherStates + connectedFathers;
            if (currentLayer[currentIndex] === previousLayer[currentIndex])
                continue;
            const profile = profiles[profileIndex - 1];
            const weights = assignmentWeights(profile, pattern);
            let found = false;
            for (let slotIndex = 0; slotIndex < motherCount; slotIndex += 1) {
                const slotBit = 1 << slotIndex;
                if (!(occupied & slotBit))
                    continue;
                const previousMotherMask = occupied ^ slotBit;
                const weight = weights[slotIndex];
                for (let previousFatherMask = 0; previousFatherMask < fatherStates; previousFatherMask += 1) {
                    if ((previousFatherMask | weight.fatherMask) !== connectedFathers)
                        continue;
                    const previousIndex = previousMotherMask * fatherStates + previousFatherMask;
                    const previousScore = previousLayer[previousIndex];
                    if (previousScore < 0 || previousScore + weight.value !== currentLayer[currentIndex])
                        continue;
                    assignment[slotIndex] = profile;
                    occupied = previousMotherMask;
                    connectedFathers = previousFatherMask;
                    found = true;
                    break;
                }
                if (found)
                    break;
            }
        }
        return occupied === 0 && connectedFathers === 0 && assignment.every((profile) => profile > 0) ? assignment : null;
    }
    function makeExactCandidate(males, targets, secondaryTargets, owned, nestCount, kind, salt, isMissingObjective, isCurrentTier) {
        let best = null;
        let bestTieScore = -1;
        const maxMales = Math.min(males.length, nestCount - 1, exports.EXACT_PARENT_LIMIT);
        for (let maleCount = 1; maleCount <= maxMales; maleCount += 1) {
            forEachCombination(males, maleCount, (chosenMales) => {
                const rankedTargets = rankMotherCandidates(chosenMales, targets, owned, kind, salt, isMissingObjective, isCurrentTier);
                if (!rankedTargets.length)
                    return;
                const rankedSecondaryTargets = rankMotherCandidates(chosenMales, secondaryTargets, owned, kind, salt, isMissingObjective, () => true);
                const motherCount = nestCount - maleCount;
                const expandedTargets = expandMotherCandidates(rankedTargets, rankedSecondaryTargets, motherCount, salt);
                if (expandedTargets.length !== motherCount)
                    return;
                const candidatesByProfile = new Map();
                expandedTargets.forEach((item) => {
                    const candidates = candidatesByProfile.get(item.profile) || [];
                    candidates.push(item);
                    candidatesByProfile.set(item.profile, candidates);
                });
                const profileCounts = new Map([...candidatesByProfile].map(([profile, candidates]) => [profile, candidates.length]));
                const totalCount = maleCount + motherCount;
                const patterns = exactPlacementPatterns(totalCount, maleCount);
                let selectedPattern = null;
                let selectedScore = -1;
                let selectedFatherMask = 0;
                patterns.forEach((pattern) => {
                    const result = exactAssignmentScore(pattern, profileCounts, maleCount);
                    if (result.rank > selectedScore) {
                        selectedScore = result.rank;
                        selectedFatherMask = result.fatherMask;
                        selectedPattern = pattern;
                    }
                });
                if (!selectedPattern)
                    return;
                const pattern = selectedPattern;
                const assignedProfiles = reconstructExactProfiles(pattern, profileCounts, maleCount, selectedFatherMask);
                if (!assignedProfiles)
                    return;
                const profileOffsets = new Map();
                const assignment = assignedProfiles.map((profile) => {
                    const offset = profileOffsets.get(profile) || 0;
                    profileOffsets.set(profile, offset + 1);
                    return candidatesByProfile.get(profile)[offset];
                });
                const positions = layoutPositions(totalCount);
                const slots = [
                    ...chosenMales.map((father, fatherIndex) => ({
                        pet: father.pet,
                        variant: father.variant,
                        targetKind: kind,
                        role: "father",
                        x: positions[pattern.fatherPositionIndexes[fatherIndex]].x,
                        y: positions[pattern.fatherPositionIndexes[fatherIndex]].y,
                    })),
                    ...assignment.map((mother, motherIndex) => ({
                        pet: mother.pet,
                        variant: mother.variant,
                        targetKind: kind,
                        role: "mother",
                        x: positions[pattern.motherPositionIndexes[motherIndex]].x,
                        y: positions[pattern.motherPositionIndexes[motherIndex]].y,
                    })),
                ];
                const edges = buildEdges(slots);
                const candidate = candidateMetrics(slots, edges, nestCount, maleCount, isCurrentTier);
                const tied = best && !prefersCandidate(candidate, best) && !prefersCandidate(best, candidate);
                if (!best || prefersCandidate(candidate, best) || (tied && selectedScore > bestTieScore)) {
                    best = candidate;
                    bestTieScore = selectedScore;
                }
            });
            const nextMaleCount = maleCount + 1;
            const nextMaximumMothers = nestCount - nextMaleCount;
            const currentBest = best;
            if (currentBest?.fillsRequestedNests && currentBest.allNestsConnected && currentBest.pairedMothers > nextMaximumMothers)
                break;
        }
        return best;
    }
    function effectiveMaleParents(owned, kind, targets) {
        return maleParents(owned, kind).filter((father) => targets.some((target) => sameEggGroup(father.pet, target) && Boolean(bestMotherVariant(owned, target, father, kind))));
    }
    function canUseExactSearch(owned, focus, kind, objective, targetTier) {
        const targets = pets.filter((pet) => !ownsKind(owned[petKey(pet)], objective)
            && isEggTarget(pet)
            && tierMatches(pet, objective, targetTier)
            && seasonMatches(pet, focus));
        const parentCount = effectiveMaleParents(owned, kind, targets).length;
        return parentCount > 0 && parentCount <= exports.EXACT_PARENT_LIMIT;
    }
    function makePlan(owned, nestCount, focus, kind, salt, objective = kind, targetTier = "all", exactSearch = false) {
        const isMissingObjective = (pet) => !ownsKind(owned[petKey(pet)], objective);
        const isCurrentTier = (pet) => tierMatches(pet, objective, targetTier);
        const targets = pets.filter((pet) => isMissingObjective(pet) && isEggTarget(pet) && isCurrentTier(pet) && seasonMatches(pet, focus));
        const secondaryTargets = objective === "shiny" && targetTier === "season-limited"
            ? pets.filter((pet) => isMissingObjective(pet) && isEggTarget(pet) && pet.availability === "permanent" && seasonMatches(pet, focus))
            : [];
        const allMissing = pets.filter((pet) => isMissingObjective(pet) && isEggTarget(pet) && isCurrentTier(pet));
        const males = effectiveMaleParents(owned, kind, targets);
        const direct = new Set();
        males.forEach((father) => father.pet.maleTargets.forEach((name) => {
            const target = petMap.get(name);
            if (target && isMissingObjective(target) && isEggTarget(target) && isCurrentTier(target) && bestMotherVariant(owned, target, father, kind))
                direct.add(name);
        }));
        if (!males.length || !targets.length) {
            return { objective, targetTier, slots: [], edges: [], pairedMothers: 0, targetCount: targets.length, directCount: direct.size, uncovered: allMissing.length };
        }
        const exactCacheKey = exactSearch && males.length <= exports.EXACT_PARENT_LIMIT
            ? [
                nestCount,
                focus,
                kind,
                objective,
                targetTier,
                ...Object.entries(owned).filter(([, mask]) => mask).sort(([a], [b]) => a.localeCompare(b)).map(([key, mask]) => `${key}:${mask}`),
            ].join("|")
            : "";
        if (exactCacheKey) {
            const cached = exactPlanCache.get(exactCacheKey);
            if (cached)
                return cached;
        }
        let best = exactCacheKey
            ? makeExactCandidate(males, targets, secondaryTargets, owned, nestCount, kind, salt, isMissingObjective, isCurrentTier)
            : null;
        if (!best) {
            const maxMales = Math.min(males.length, nestCount - 1, exports.EXACT_PARENT_LIMIT);
            for (let maleCount = 1; maleCount <= maxMales; maleCount += 1) {
                const chosenMales = chooseMales(males, targets, owned, kind, maleCount, salt);
                const motherCount = nestCount - chosenMales.length;
                const rankedTargets = rankMotherCandidates(chosenMales, targets, owned, kind, salt, isMissingObjective, isCurrentTier);
                const rankedSecondaryTargets = rankMotherCandidates(chosenMales, secondaryTargets, owned, kind, salt, isMissingObjective, () => true);
                const chosenTargets = expandMotherCandidates(rankedTargets, rankedSecondaryTargets, motherCount, salt);
                const roster = [
                    ...chosenMales.map((parent) => ({ pet: parent.pet, variant: parent.variant, targetKind: kind, role: "father" })),
                    ...chosenTargets.map((item) => ({ pet: item.pet, variant: item.variant, targetKind: kind, role: "mother" })),
                ];
                const slots = optimizeLayout(roster, salt);
                const edges = buildEdges(slots);
                const candidate = candidateMetrics(slots, edges, nestCount, chosenMales.length, isCurrentTier);
                if (!best || prefersCandidate(candidate, best))
                    best = candidate;
            }
        }
        const slots = best?.slots || [];
        const edges = best?.edges || [];
        const pairedMothers = new Set(edges.map((edge) => edge.mother)).size;
        const result = { objective, targetTier, slots, edges, pairedMothers, targetCount: targets.length, directCount: direct.size, uncovered: allMissing.length - direct.size };
        if (exactCacheKey) {
            exactPlanCache.set(exactCacheKey, result);
            if (exactPlanCache.size > 48)
                exactPlanCache.delete(exactPlanCache.keys().next().value);
        }
        return result;
    }
    function recommendationFor(plan, kind) {
        if (!plan.slots.length || !plan.pairedMothers)
            return 0;
        const base = { combo: 82, shiny: 72, colorful: 64 }[kind];
        const motherSlots = plan.slots.filter((slot) => slot.role === "mother").length;
        const coverage = plan.pairedMothers / Math.max(1, motherSlots);
        const connectivity = Math.min(1, plan.edges.length / Math.max(1, plan.pairedMothers));
        const urgency = plan.targetTier === "season-limited" ? 4 : plan.targetTier === "permanent" ? -6 : 0;
        return Math.min(99, Math.max(1, Math.round(base + coverage * 7 + connectivity * 4 + urgency)));
    }
    function makeAutoPlan(owned, nestCount, focus, salt) {
        const finalize = (selected, objective, targetTier) => {
            const plan = salt === 0 && canUseExactSearch(owned, focus, selected.kind, objective, targetTier)
                ? makePlan(owned, nestCount, focus, selected.kind, salt, objective, targetTier, true)
                : selected.plan;
            return { ...plan, kind: selected.kind, recommendation: recommendationFor(plan, selected.kind) };
        };
        const distinctMotherTargets = (plan, priorityOnly = false) => new Set(plan.edges
            .filter((edge) => !priorityOnly || tierMatches(edge.mother.pet, plan.objective, plan.targetTier))
            .map((edge) => petKey(edge.mother.pet))).size;
        const rankedShinyPlans = (targetTier) => ["combo", "shiny"]
            .map((kind) => ({ kind, plan: makePlan(owned, nestCount, focus, kind, salt, "shiny", targetTier) }))
            .filter(({ plan }) => plan.slots.length > 0 && plan.pairedMothers > 0)
            .sort((a, b) => distinctMotherTargets(b.plan, true) - distinctMotherTargets(a.plan, true)
            || distinctMotherTargets(b.plan) - distinctMotherTargets(a.plan)
            || b.plan.pairedMothers - a.plan.pairedMothers
            || b.plan.edges.length - a.plan.edges.length
            || exports.AUTO_PRIORITY.indexOf(a.kind) - exports.AUTO_PRIORITY.indexOf(b.kind));
        for (const targetTier of ["season-limited", "permanent"]) {
            const selected = rankedShinyPlans(targetTier)[0];
            if (selected)
                return finalize(selected, "shiny", targetTier);
        }
        let firstFallback = null;
        for (const kind of exports.AUTO_PRIORITY) {
            const plan = makePlan(owned, nestCount, focus, kind, salt, kind);
            if (!firstFallback)
                firstFallback = { kind, plan };
            if (plan.slots.length > 0 && plan.pairedMothers > 0)
                return finalize({ kind, plan }, kind, "all");
        }
        const selected = firstFallback;
        return finalize(selected, selected.kind, "all");
    }
    function makeAutoPlanOptions(owned, nestCount, focus, limit = 5) {
        const candidates = [];
        const seen = new Set();
        const optionLimit = Math.max(1, Math.min(8, Math.floor(limit)));
        const attempts = Math.max(24, optionLimit * 8);
        const maxStagnantAttempts = Math.max(6, optionLimit);
        let stagnantAttempts = 0;
        const signatureFor = (plan) => [
            plan.kind,
            plan.objective,
            plan.targetTier,
            ...plan.slots.map((slot) => `${slot.role}:${petKey(slot.pet)}:${slot.variant}:${slot.x},${slot.y}`).sort(),
            ...plan.edges.map((edge) => `${petKey(edge.father.pet)}>${petKey(edge.mother.pet)}`).sort(),
        ].join("|");
        const addCandidate = (plan, salt) => {
            const connectedSlots = new Set(plan.edges.flatMap((edge) => [edge.father, edge.mother])).size;
            if (plan.slots.length !== nestCount || connectedSlots !== plan.slots.length)
                return false;
            const signature = signatureFor(plan);
            if (seen.has(signature))
                return false;
            seen.add(signature);
            candidates.push({ plan, salt });
            return true;
        };
        for (let salt = 0; salt < attempts && candidates.length < optionLimit; salt += 1) {
            const plan = makeAutoPlan(owned, nestCount, focus, salt);
            if (!addCandidate(plan, salt)) {
                stagnantAttempts += 1;
                if (stagnantAttempts >= maxStagnantAttempts)
                    break;
                continue;
            }
            stagnantAttempts = 0;
        }
        if (!candidates.length)
            return [makeAutoPlan(owned, nestCount, focus, 0)];
        if (candidates.length < optionLimit) {
            const base = candidates[0].plan;
            const maxX = Math.max(...base.slots.map((slot) => slot.x));
            const maxY = Math.max(...base.slots.map((slot) => slot.y));
            const transforms = [
                (slot) => ({ x: maxX - slot.x, y: slot.y }),
                (slot) => ({ x: slot.x, y: maxY - slot.y }),
                (slot) => ({ x: maxX - slot.x, y: maxY - slot.y }),
            ];
            transforms.forEach((transform, index) => {
                if (candidates.length >= optionLimit)
                    return;
                const slotMap = new Map();
                const slots = base.slots.map((slot) => {
                    const position = transform(slot);
                    const transformed = { ...slot, ...position };
                    slotMap.set(slot, transformed);
                    return transformed;
                });
                const edges = base.edges.map((edge) => ({
                    ...edge,
                    father: slotMap.get(edge.father),
                    mother: slotMap.get(edge.mother),
                }));
                addCandidate({ ...base, slots, edges }, attempts + index);
            });
        }
        return candidates
            .sort((a, b) => {
            const distinctTargets = (plan, priorityOnly = false) => new Set(plan.edges
                .filter((edge) => !priorityOnly || tierMatches(edge.mother.pet, plan.objective, plan.targetTier))
                .map((edge) => petKey(edge.mother.pet))).size;
            return distinctTargets(b.plan, true) - distinctTargets(a.plan, true)
                || distinctTargets(b.plan) - distinctTargets(a.plan)
                || b.plan.pairedMothers - a.plan.pairedMothers
                || b.plan.recommendation - a.plan.recommendation
                || b.plan.edges.length - a.plan.edges.length
                || a.salt - b.salt;
        })
            .slice(0, optionLimit)
            .map(({ plan }) => plan);
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
    return { petMap, maleParents, makeAutoPlan, makeAutoPlanOptions, buildRoadmap };
}

  return exports;
})();
