import { AiAction } from '../types';
import { moveUnitLogic } from './moveUnitLogic';
import { BUILDINGS, UNITS, TILE_TYPES, TECHS, CITY_ERAS_BY_ID } from '../utils/Constants';

export function applyAiAction(
    gameState: any,
    action: AiAction,
    aiLog?: (msg: string) => void
): any {
    switch (action.type) {
        case "moveUnit": {
            const pos = action.payload.position;
            const unitId = action.payload.unitId;
            if (!unitId) return gameState;
            if (!pos) return gameState;

            const unit = gameState.units.find((u: any) => u.id === unitId);
            const { updatedUnits, path, error } = moveUnitLogic({
                units: gameState.units,
                unitId,
                to: pos,
                mapTiles: gameState.mapState?.tiles,
                cities: gameState.cities,
                visibleObjects: gameState.visibleObjects,
                movementPointsLeft: unit?.movement_points_left,
                unitType: unit?.type,
                discoveredTiles: gameState.mapState?.fog_of_war_ai,
            });
            if (error) {
                if (aiLog) aiLog(`No puede mover la unidad: ${error}`);
                return gameState;
            }
            return {
                ...gameState,
                units: updatedUnits,
                aiMovePath: path,
            };
        }
        case "attackUnit": {
            const attackerId = action.payload.attackerId;
            const defenderId = action.payload.defenderId;
            if (!attackerId || !defenderId) {
                if (aiLog) aiLog("ERROR: attackerId o defenderId indefinido en attackUnit");
                return gameState;
            }
            const attacker = gameState.units.find((u: any) => u.id === attackerId);
            const defender = gameState.units.find((u: any) => u.id === defenderId);

            if (!attacker || !defender) {
                if (aiLog) aiLog("ERROR: No se encontró attacker o defender en units");
                return gameState;
            }

            const dx = Math.abs(attacker.position.x - defender.position.x);
            const dy = Math.abs(attacker.position.y - defender.position.y);
            const distance = Math.max(dx, dy);
            const attackerRange = attacker.range ?? 1;

            if (distance > attackerRange) {
                if (aiLog) aiLog("NO puede atacar: objetivo fuera de rango");
                return gameState;
            }

            const damage = attacker.strength ?? 10;
            const newHealth = (defender.health ?? 100) - damage;

            const updatedUnits = gameState.units.map((u: any) => {
                if (u.id === defenderId) {
                    return { ...u, health: newHealth };
                }
                if (u.id === attackerId) {
                    return { ...u, hasAttackedThisTurn: true, movement_points_left: 0 };
                }
                return u;
            }).filter((u: any) => u.health === undefined || u.health > 0);

            if (aiLog) aiLog(`Ataca la unidad ${defenderId} con ${attackerId}`);
            return {
                ...gameState,
                units: updatedUnits,
            };
        }
        case "attackCity": {
            if (aiLog) aiLog(`Ataca la ciudad ${action.payload.cityId} con la unidad ${action.payload.attackerId}`);
            return gameState;
        }
        case "foundCity": {
            const pos = action.payload.position;
            if (aiLog) aiLog(`Funda la ciudad ${action.payload.name} en (${pos?.x ?? "?"}, ${pos?.y ?? "?"})`);
            return gameState;
        }
        case "changeCityPopulationProduction": {
            const { cityId, change } = action.payload;
            if (!cityId || typeof change !== "boolean") {
                if (aiLog) aiLog("changeCityPopulationProduction: cityId o change inválido");
                return gameState;
            }
            const updatedCities = gameState.cities.map((city: any) =>
                city.id === cityId
                    ? { ...city, allowPopulationGrowth: change }
                    : city
            );
            if (aiLog) aiLog(`Cambia el modo de crecimiento de población en la ciudad ${cityId}`);
            return {
                ...gameState,
                cities: updatedCities,
            };
        }
        case "collectResource": {
            const { unitId, position } = action.payload;
            if (!position) {
                if (aiLog) aiLog("collectResource: posición no definida");
                return gameState;
            }
            const unit = gameState.units.find((u: any) => u.id === unitId);
            if (!unit) {
                if (aiLog) aiLog("collectResource: unidad no encontrada");
                return gameState;
            }
            if (unit.type !== "langile") {
                if (aiLog) aiLog("collectResource: la unidad no es un langile");
                return gameState;
            }
            if (!gameState.aiUnlockedTechs?.includes("nekazaritza")) {
                if (aiLog) aiLog("collectResource: la IA no tiene la tecnología nekazaritza");
                return gameState;
            }
            const resourceObj = gameState.visibleObjects?.find(
                (obj: any) => obj.position.x === position.x && obj.position.y === position.y
            );
            if (!resourceObj) {
                if (aiLog) aiLog("collectResource: no hay recurso en la posición indicada");
                return gameState;
            }
            const dx = Math.abs(unit.position.x - position.x);
            const dy = Math.abs(unit.position.y - position.y);
            if (Math.max(dx, dy) !== 1) {
                if (aiLog) aiLog("collectResource: el recurso no está adyacente al langile");
                return gameState;
            }
            const updatedVisibleObjects = gameState.visibleObjects.filter(
                (obj: any) => !(obj.position.x === position.x && obj.position.y === position.y)
            );
            if (aiLog) aiLog(`Recolecta recurso con unidad ${unitId} en (${position.x}, ${position.y})`);
            return {
                ...gameState,
                visibleObjects: updatedVisibleObjects,
            };
        }
        case "buildBuilding": {
            const { cityId, buildingType } = action.payload;
            if (!cityId || !buildingType) {
                if (aiLog) aiLog("buildBuilding: cityId o buildingType indefinido");
                return gameState;
            }
            const city = gameState.cities.find((c: any) => c.id === cityId);
            if (!city) {
                if (aiLog) aiLog("buildBuilding: ciudad no encontrada");
                return gameState;
            }
            const building = BUILDINGS.find(b => b.id === buildingType);
            if (!building) {
                if (aiLog) aiLog("buildBuilding: edificio no encontrado");
                return gameState;
            }
            if (building.requirement && !gameState.aiUnlockedTechs?.includes(building.requirement)) {
                if (aiLog) aiLog("buildBuilding: la IA no tiene la tecnología requerida");
                return gameState;
            }
            const cost = building.cost || {};
            const aiResources = gameState.aiResources || {};
            const resourceKeys = ["food", "gold", "culture", "science", "natural_resources"] as const;
            for (const key of resourceKeys) {
                const value = (cost as Record<typeof key, number | undefined>)[key];
                if (typeof value === "number" && (aiResources[key] ?? 0) < value) {
                    if (aiLog) aiLog(`buildBuilding: la IA no tiene suficientes recursos (${key})`);
                    return gameState;
                }
            }
            const updatedAiResources = { ...aiResources };
            for (const key of resourceKeys) {
                const value = (cost as Record<typeof key, number | undefined>)[key];
                if (typeof value === "number") {
                    updatedAiResources[key] = (updatedAiResources[key] ?? 0) - value;
                }
            }
            const updatedCities = gameState.cities.map((c: any) =>
                c.id === cityId
                    ? { ...c, buildings: [...c.buildings, buildingType] }
                    : c
            );
            if (aiLog) aiLog(`Construye el edificio ${buildingType} en la ciudad ${cityId}`);
            return {
                ...gameState,
                cities: updatedCities,
                aiResources: updatedAiResources,
            };
        }
        case "trainUnit": {
            const { cityId, unitType } = action.payload;
            if (!cityId || !unitType) {
                if (aiLog) aiLog("trainUnit: cityId o unitType indefinido");
                return gameState;
            }
            console.log("aaaaaaaa");
            console.log("el GameState en trainUnit", gameState);
            console.log("cities", gameState.ai.cities);
            const city = gameState.ai.cities.find((c: any) => c.id === cityId);
            if (!city) {
                if (aiLog) aiLog(`trainUnit: ciudad no encontrada (${cityId})`);
                return gameState;
            }
            const barracksCount = Array.isArray(city.buildings)
                ? city.buildings.filter((b: string) => b === "kuartela").length
                : 0;
            if (barracksCount === 0) {
                if (aiLog) aiLog("trainUnit: la ciudad no tiene cuarteles");
                return gameState;
            }
            if ((city.training?.length || 0) >= barracksCount) {
                if (aiLog) aiLog("trainUnit: ya está entrenando el máximo de unidades");
                return gameState;
            }
            const unitInfo = UNITS.find(u => u.id === unitType);
            if (!unitInfo) {
                if (aiLog) aiLog("trainUnit: unidad no encontrada");
                return gameState;
            }
            if (unitInfo.civilization && unitInfo.civilization !== gameState.aiCivilization) {
                if (aiLog) aiLog("trainUnit: la unidad requiere otra civilización");
                return gameState;
            }
            if (Array.isArray(unitInfo.requirement) && unitInfo.requirement.length > 0) {
                const hasAllTechs = unitInfo.requirement.every((techId: string) =>
                    gameState.aiUnlockedTechs?.includes(techId)
                );
                if (!hasAllTechs) {
                    if (aiLog) aiLog("trainUnit: la IA no tiene todas las tecnologías requeridas");
                    return gameState;
                }
            }
            let health = unitInfo.health ?? 100;
            let strength = unitInfo.strength ?? 0;
            let movementPoints = unitInfo.movementPoints ?? 1;
            let trainingTime = unitInfo.training_time ?? 3;
            let cost = { ...unitInfo.cost };

            if (gameState.aiUnlockedTechs?.includes("penizilina")) health += 30;
            if (gameState.aiUnlockedTechs?.includes("burdina")) strength += 5;
            if (gameState.aiUnlockedTechs?.includes("artilleria")) strength += 10;
            if (gameState.aiUnlockedTechs?.includes("gurpila")) movementPoints += 3;
            if (gameState.aiUnlockedTechs?.includes("arkitektura")) trainingTime = Math.max(1, trainingTime - 1);
            if (gameState.aiUnlockedTechs?.includes("industria")) trainingTime = Math.max(1, trainingTime - 1);

            const aiResources = gameState.aiResources || {};
            const resourceKeys = ["food", "gold", "culture", "science", "natural_resources"] as const;
            for (const key of resourceKeys) {
                const value = (cost as Record<typeof key, number | undefined>)[key];
                if (typeof value === "number" && (aiResources[key] ?? 0) < value) {
                    if (aiLog) aiLog(`trainUnit: la IA no tiene suficientes recursos (${key})`);
                    return gameState;
                }
            }
            const updatedAiResources = { ...aiResources };
            for (const key of resourceKeys) {
                const value = (cost as Record<typeof key, number | undefined>)[key];
                if (typeof value === "number") {
                    updatedAiResources[key] = (updatedAiResources[key] ?? 0) - value;
                }
            }
            const newTraining = [
                ...(city.training || []),
                {
                    id: `${cityId}-training-${Date.now()}`,
                    type: unitType,
                    turnsLeft: trainingTime,
                    health,
                    strength,
                    movementPoints,
                }
            ];
            const updatedCities = gameState.cities.map((c: any) =>
                c.id === cityId
                    ? { ...c, training: newTraining }
                    : c
            );
            if (aiLog) aiLog(`Entrena la unidad ${unitType} en la ciudad ${cityId} (${trainingTime} turnos, vida ${health}, fuerza ${strength}, movimiento ${movementPoints})`);
            return {
                ...gameState,
                cities: updatedCities,
                aiResources: updatedAiResources,
            };
        }
        case "deployUnit": {
            const { cityId, unitType, position } = action.payload;
            if (!cityId || !unitType || !position) {
                if (aiLog) aiLog("deployUnit: cityId, unitType o position indefinido");
                return gameState;
            }
            const city = gameState.cities.find((c: any) => c.id === cityId);
            if (!city) {
                if (aiLog) aiLog("deployUnit: ciudad no encontrada");
                return gameState;
            }
            const trainingIdx = city.training?.findIndex((u: any) => u.type === unitType && u.turnsLeft === 0);
            if (trainingIdx === undefined || trainingIdx === -1) {
                if (aiLog) aiLog("deployUnit: no hay unidad lista para desplegar");
                return gameState;
            }
            const dx = Math.abs(position.x - city.position.x);
            const dy = Math.abs(position.y - city.position.y);
            if (Math.max(dx, dy) !== 1 && !(dx === 1 && dy === 1)) {
                if (aiLog) aiLog("deployUnit: posición no adyacente a la ciudad");
                return gameState;
            }
            const occupied =
                gameState.units.some((u: any) => u.position.x === position.x && u.position.y === position.y) ||
                gameState.cities.some((c: any) => c.position.x === position.x && c.position.y === position.y) ||
                gameState.visibleObjects?.some((obj: any) => obj.position.x === position.x && obj.position.y === position.y);
            if (occupied) {
                if (aiLog) aiLog("deployUnit: la casilla está ocupada");
                return gameState;
            }
            const tileType = gameState.mapState?.tiles?.[position.y]?.[position.x];
            const unitDef = UNITS.find(u => u.id === unitType);
            if (!unitDef) {
                if (aiLog) aiLog("deployUnit: definición de unidad no encontrada");
                return gameState;
            }
            const isBoat = unitDef.id === "itsasontzia";
            const requiresBoat = TILE_TYPES[tileType]?.requiresBoat;
            if (isBoat && !requiresBoat) {
                if (aiLog) aiLog("deployUnit: barco solo en agua");
                return gameState;
            }
            if (!isBoat && requiresBoat) {
                if (aiLog) aiLog("deployUnit: unidad terrestre solo en tierra");
                return gameState;
            }
            const [trainingUnit] = city.training.splice(trainingIdx, 1);
            const newUnit = {
                id: `unit_${Date.now()}`,
                type: trainingUnit.type,
                position: { ...position },
                owner: "ai",
                movement_points: trainingUnit.movementPoints ?? unitDef.movementPoints ?? 1,
                movement_points_left: trainingUnit.movementPoints ?? unitDef.movementPoints ?? 1,
                health: trainingUnit.health ?? unitDef.health ?? 100,
                range: unitDef.range,
                strength: trainingUnit.strength ?? unitDef.strength ?? 10,
                direction: "default",
            };
            const updatedCities = gameState.cities.map((c: any) =>
                c.id === cityId
                    ? { ...c, training: [...city.training] }
                    : c
            );
            const updatedUnits = [...gameState.units, newUnit];
            if (aiLog) aiLog(`Despliega la unidad ${unitType} de la ciudad ${cityId} en (${position.x}, ${position.y})`);
            return {
                ...gameState,
                cities: updatedCities,
                units: updatedUnits,
            };
        }
        case "researchTech": {
            const { techId } = action.payload;
            const tech = TECHS.find(t => t.id === techId);
            if (!tech) {
                if (aiLog) aiLog("researchTech: tecnología no encontrada");
                return gameState;
            }
            if (gameState.aiUnlockedTechs?.includes(techId)) {
                if (aiLog) aiLog("researchTech: tecnología ya desbloqueada");
                return gameState;
            }
            const parentTechs = tech.parents.map((pid: string) => TECHS.find(t => t.id === pid)).filter(Boolean);
            const allParentsUnlocked = parentTechs.every(parent => gameState.aiUnlockedTechs?.includes(parent!.id));
            const isSpaceship = tech.id === "espaziontzia";
            const allOtherTechsUnlocked = TECHS.filter(t => t.id !== "espaziontzia").every(t => gameState.aiUnlockedTechs?.includes(t.id));
            if (!allParentsUnlocked || (isSpaceship && !allOtherTechsUnlocked)) {
                if (aiLog) aiLog("researchTech: requisitos de tecnologías padres no cumplidos");
                return gameState;
            }
            const ERA_ORDER = ["Antzinaroa", "Erdi Aroa", "Aro Modernoa"] as const;
            const eraIndex = (era: string) => ERA_ORDER.indexOf(era as typeof ERA_ORDER[number]);
            if (eraIndex(tech.era) > eraIndex(gameState.aiEra)) {
                if (aiLog) aiLog("researchTech: la era de la tecnología es futura");
                return gameState;
            }
            const aiResources = gameState.aiResources || {};
            if ((aiResources.science ?? 0) < tech.cost.science) {
                if (aiLog) aiLog("researchTech: no hay suficiente ciencia");
                return gameState;
            }
            let updatedUnits = gameState.units;
            let updatedAiResources = { ...aiResources, science: aiResources.science - tech.cost.science };
            if (tech.id === "nekazaritza") {
                updatedAiResources.food += 100;
            }
            if (tech.id === "penizilina") {
                updatedUnits = updatedUnits.map((u: any) => ({
                    ...u,
                    health: (u.health ?? 100) + 30,
                }));
            }
            if (tech.id === "artilleria") {
                updatedUnits = updatedUnits.map((u: any) => ({
                    ...u,
                    strength: (u.strength ?? 0) + 10,
                }));
            }
            if (tech.id === "burdina") {
                updatedUnits = updatedUnits.map((u: any) => ({
                    ...u,
                    strength: (u.strength ?? 0) + 5,
                }));
            }
            if (tech.id === "gurpila") {
                updatedUnits = updatedUnits.map((u: any) => ({
                    ...u,
                    movement_points: (u.movement_points ?? 1) + 3,
                    movement_points_left: (u.movement_points_left ?? u.movement_points ?? 1) + 3,
                }));
            }
            const newUnlockedTechs = [...(gameState.aiUnlockedTechs || []), tech.id];
            let newEra = gameState.aiEra;
            if (newUnlockedTechs.length === 5) newEra = "Erdi Aroa";
            else if (newUnlockedTechs.length === 10) newEra = "Aro Modernoa";

            if (aiLog) aiLog(`Investiga la tecnología ${tech.name}`);
            return {
                ...gameState,
                aiUnlockedTechs: newUnlockedTechs,
                aiEra: newEra,
                aiResources: updatedAiResources,
                units: updatedUnits,
            };
        }
        case "upgradeCityEra": {
            const { cityId } = action.payload;
            const city = gameState.cities.find((c: any) => c.id === cityId);
            if (!city) {
                if (aiLog) aiLog("upgradeCityEra: ciudad no encontrada");
                return gameState;
            }
            const currentEra = city.era || "Antzinaroa";
            const eraOrder = ["Antzinaroa", "Erdi Aroa", "Aro Modernoa"];
            const currentEraIdx = eraOrder.indexOf(currentEra);
            if (currentEraIdx === -1 || currentEraIdx === eraOrder.length - 1) {
                if (aiLog) aiLog("upgradeCityEra: era máxima alcanzada o era desconocida");
                return gameState;
            }
            const nextEra = eraOrder[currentEraIdx + 1];
            if (eraOrder.indexOf(gameState.aiEra) < eraOrder.indexOf(nextEra)) {
                if (aiLog) aiLog("upgradeCityEra: la IA no está en la era necesaria para mejorar la ciudad");
                return gameState;
            }
            const currentEraInfo = CITY_ERAS_BY_ID[currentEra];
            const nextEraInfo = CITY_ERAS_BY_ID[nextEra];
            if (!currentEraInfo || !nextEraInfo) {
                if (aiLog) aiLog("upgradeCityEra: info de era no encontrada");
                return gameState;
            }
            const cost = currentEraInfo.upgrade_cost;
            const aiResources = gameState.aiResources || {};
            if (
                aiResources.gold < cost.gold ||
                aiResources.natural_resources < cost.natural_resources
            ) {
                if (aiLog) aiLog("upgradeCityEra: no hay suficientes recursos");
                return gameState;
            }
            const updatedAiResources = {
                ...aiResources,
                gold: aiResources.gold - cost.gold,
                natural_resources: aiResources.natural_resources - cost.natural_resources,
            };
            const updatedCities = gameState.cities.map((c: any) =>
                c.id === cityId
                    ? {
                        ...c,
                        era: nextEra,
                        production: {
                            food: (c.production.food || 0) + (nextEraInfo.base_production.food || 0),
                            gold: (c.production.gold || 0) + (nextEraInfo.base_production.gold || 0),
                            culture: (c.production.culture || 0) + (nextEraInfo.base_production.culture || 0),
                            science: (c.production.science || 0) + (nextEraInfo.base_production.science || 0),
                            natural_resources: (c.production.natural_resources || 0) + (nextEraInfo.base_production.natural_resources || 0),
                        }
                    }
                    : c
            );
            if (aiLog) aiLog(`Mejora la era de la ciudad ${city.name} a ${nextEra}`);
            return {
                ...gameState,
                cities: updatedCities,
                aiResources: updatedAiResources,
            };
        }
        case "endTurn": {
            if (aiLog) aiLog("Termina su turno");
            return gameState;
        }
        default:
            if (aiLog) aiLog(`Realiza acción desconocida: ${action.type}`);
            return gameState;
    }
}