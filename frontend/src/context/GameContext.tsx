import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { MapState, UnitProps, CityProps, TrainingUnit } from "../types";
import TurnManager from "../managers/TurnManager";
import GameManager from "../managers/GameManager";
import { loadMap, fetchNextAiAction } from "../services/api";
import { applyAiAction } from "../utils/aiActions";
import BattleView from "../components/game/BattleView";
import CityBattleView from "../components/game/CityBattleView";
import { CITY_ERAS_BY_ID, BUILDINGS, VISIBLE_OBJECTS_BY_ID } from "../utils/Constants";

type GameContextType = {
  mapState: MapState;
  setMapState: React.Dispatch<React.SetStateAction<MapState>>;
  units: UnitProps[];
  setUnits: React.Dispatch<React.SetStateAction<UnitProps[]>>;
  selectedUnitId: string | null;
  setSelectedUnitId: React.Dispatch<React.SetStateAction<string | null>>;
  cities: CityProps[];
  setCities: React.Dispatch<React.SetStateAction<CityProps[]>>;
  selectedCity: CityProps | null;
  setSelectedCity: React.Dispatch<React.SetStateAction<CityProps | null>>;
  turn: number;
  endTurn: () => void;
  message: string;
  setMessage: (msg: string) => void;
  unlockedTechs: string[];
  setUnlockedTechs: React.Dispatch<React.SetStateAction<string[]>>;
  aiUnlockedTechs: string[];
  setAiUnlockedTechs: React.Dispatch<React.SetStateAction<string[]>>;
  civilization: string;
  setCivilization: React.Dispatch<React.SetStateAction<string>>;
  aiCivilization: string;
  setAiCivilization: React.Dispatch<React.SetStateAction<string>>;
  playerEra: string;
  setPlayerEra: React.Dispatch<React.SetStateAction<string>>;
  aiEra: string;
  setAiEra: React.Dispatch<React.SetStateAction<string>>;
  resources: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  setResources: React.Dispatch<
    React.SetStateAction<{
      food: number;
      gold: number;
      culture: number;
      science: number;
      natural_resources: number;
    }>
  >;
  aiResources: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  setAiResources: React.Dispatch<
    React.SetStateAction<{
      food: number;
      gold: number;
      culture: number;
      science: number;
      natural_resources: number;
    }>
  >;
  camera: { offset: { x: number; y: number } };
  setCamera: React.Dispatch<
    React.SetStateAction<{ offset: { x: number; y: number } }>
  >;
  initialCameraOffset: { x: number; y: number };
  setInitialCameraOffset: (offset: { x: number; y: number }) => void;
  updateCity: (cityId: string, changes: Partial<CityProps>) => void;
  visibleObjects: { type: string; position: { x: number; y: number } }[];
  setVisibleObjects: React.Dispatch<
    React.SetStateAction<{ type: string; position: { x: number; y: number } }[]>
  >;
  selectedVisibleObject: {
    type: string;
    position: { x: number; y: number };
  } | null;
  setSelectedVisibleObject: React.Dispatch<
    React.SetStateAction<{
      type: string;
      position: { x: number; y: number };
    } | null>
  >;
  gameManager: GameManager;
  deployingUnit: { unit: TrainingUnit; city: CityProps } | null;
  setDeployingUnit: React.Dispatch<
    React.SetStateAction<{ unit: TrainingUnit; city: CityProps } | null>
  >;
  checkVictoryOrDefeat: () => void;
  gameStatus: "playing" | "victory" | "defeat" | null;
  setGameStatus: React.Dispatch<React.SetStateAction<"playing" | "victory" | "defeat" | null>>;
  victoryType: "science" | "culture" | "conquest" | null;
  setVictoryType: React.Dispatch<React.SetStateAction<"science" | "culture" | "conquest" | null>>;
  currentSide: 'player' | 'ai';
  setCurrentSide: React.Dispatch<React.SetStateAction<'player' | 'ai'>>;
  confirmFoundCity: (
    cityName: string,
    position: { x: number; y: number },
    owner: 'player' | 'ai',
    kolonoId: string,
    era: string,
    buildings?: string[],
    productionOverride?: Partial<CityProps['production']>
  ) => void;
  aiLog: (msg: string) => void;
  cheatsUsed: string[];
  setCheatsUsed: React.Dispatch<React.SetStateAction<string[]>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const turnManager = new TurnManager();
const gameManager = new GameManager();

function calculateResourcesForCities(cities: CityProps[], unlockedTechs: string[]) {
  let food = 0, gold = 0, culture = 0, science = 0, natural_resources = 0;
  const hasEkonomia = unlockedTechs.includes("ekonomia");
  for (const city of cities) {
    const schoolCount = city.buildings.filter(b => b === 'eskola').length;
    const schoolCultureBonus = schoolCount * city.population;
    const uniCount = city.buildings.filter(b => b === 'unibertsitatea').length;
    const uniCultureBonus = uniCount * city.population * 2;
    const marketCount = city.buildings.filter(b => b === 'merkatua').length;
    const marketGoldBonus = marketCount * 2;
    const ekonomiaGoldBonus = hasEkonomia ? 5 : 0;

    food += city.production.food || 0;
    gold += (city.production.gold || 0) + marketGoldBonus + ekonomiaGoldBonus;
    culture += (city.production.culture || 0) + schoolCultureBonus + uniCultureBonus;
    science += city.production.science || 0;
    natural_resources += city.production.natural_resources || 0;
  }
  return { food, gold, culture, science, natural_resources };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapState, setMapState] = useState<MapState>({
    size: { width: 0, height: 0 },
    tiles: [],
    fog_of_war_player: [],
    fog_of_war_ai: [],
  });
  const [units, setUnits] = useState<UnitProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityProps | null>(null);
  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState<string>("");
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [aiUnlockedTechs, setAiUnlockedTechs] = useState<string[]>([]);
  const [camera, setCamera] = useState<{ offset: { x: number; y: number } }>({
    offset: { x: 0, y: 0 },
  });
  const [initialCameraOffset, setInitialCameraOffset] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [playerEra, setPlayerEra] = useState<string>("");
  const [aiEra, setAiEra] = useState<string>("");
  const [resources, setResources] = useState({ food: 0, gold: 0, culture: 0, science: 0, natural_resources: 0 });
  const [aiResources, setAiResources] = useState({ food: 0, gold: 0, culture: 0, science: 0, natural_resources: 0 });
  const [civilization, setCivilization] = useState<string>("");
  const [aiCivilization, setAiCivilization] = useState<string>("");
  const [visibleObjects, setVisibleObjects] = useState<
    { type: string; position: { x: number; y: number } }[]
  >([]);
  const [selectedVisibleObject, setSelectedVisibleObject] = useState<{
    type: string;
    position: { x: number; y: number };
  } | null>(null);
  const [deployingUnit, setDeployingUnit] = useState<null | { unit: TrainingUnit, city: CityProps }>(null);
  const [gameStatus, setGameStatus] = useState<"playing" | "victory" | "defeat" | null>("playing");
  const [victoryType, setVictoryType] = useState<null | "science" | "culture" | "conquest">(null);
  const [currentSide, setCurrentSide] = useState<'player' | 'ai'>('player');
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [pendingAiAction, setPendingAiAction] = useState<any>(null);
  const [aiBattle, setAiBattle] = useState<{
    attacker: UnitProps;
    defender: UnitProps;
    mode: 'full' | 'single';
    onFinish: (result: { attackerHealth: number; defenderHealth: number }) => void;
  } | null>(null);
  const [aiCityBattle, setAiCityBattle] = useState<{
    attacker: UnitProps;
    city: CityProps;
    onFinish: (result: { attackerId: string; cityId: string; newDefense: number; newHealth: number }) => void;
  } | null>(null);
  const aiLog = (msg: string) => setMessage(`[AI] ${msg}`);
  const [cheatsUsed, setCheatsUsed] = useState<string[]>([]);

  const confirmFoundCity = (
    cityName: string,
    position: { x: number; y: number },
    owner: 'player' | 'ai',
    kolonoId: string,
    era: string,
    buildings: string[] = [],
    productionOverride?: Partial<CityProps['production']>
  ) => {
    const playerCities = cities.filter(city => city.owner === owner);
    const eraInfo = CITY_ERAS_BY_ID[era] || CITY_ERAS_BY_ID["Antzinaroa"];
    let production = { ...eraInfo.base_production, ...productionOverride };

    // (Opcional: añade bonus de edificios si es para el jugador)
    if (owner === 'player' && playerCities.length > 0) {
      buildings = playerCities[playerCities.length - 1].buildings || [];
      let totalCultureBonus = 0;
      let totalFoodBonus = 0;
      let totalGoldBonus = 0;
      buildings.forEach(buildingId => {
        const building = BUILDINGS.find(b => b.id === buildingId);
        if (!building) return;
        if (building.id === "aletegia") totalFoodBonus += 2;
        if (building.id === "merkatua") totalGoldBonus += 2;
        if (building.id === "eskola") totalCultureBonus += (playerCities[playerCities.length - 1]?.population || 1) * 1;
        if (building.id === "unibertsitatea") totalCultureBonus += (playerCities[playerCities.length - 1]?.population || 1) * 2;
      });
      production.food += totalFoodBonus;
      production.gold += totalGoldBonus;
      production.culture += totalCultureBonus;
    }

    const newCity: CityProps = {
      id: `city-${Date.now()}`,
      name: cityName || `Hiria ${playerCities.length + 1}`,
      position,
      population: 1,
      owner,
      buildings: [],
      production,
      defense: 50,
      health: 100,
      era,
      training: [],
      allowPopulationGrowth: false,
    };

    setCities(prev => [...prev, newCity]);
    setUnits(prev => prev.filter((unit) => unit.id !== kolonoId));
  };

  useEffect(() => {
    // Solo loguea cuando termina la acción AI y el estado está actualizado
    if (!isAiRunning && currentSide === "player") {
      logGameState();
    }
  }, [cities, units, isAiRunning, currentSide]);

  const logGameState = () => {
    const gameStateJson = {
      user_id: "debug-user",
      name: "Debug partida",
      scenario_id: "debug-scenario",
      created_at: new Date().toISOString(),
      last_saved: new Date().toISOString(),
      cheats_used: [],
      game_state: {
        turn,
        current_player: currentSide,
        cheats_used: [],
        player: {
          civilization,
          era: playerEra,
          leader_name: "Player",
          resources,
          cities: cities.filter(c => c.owner === "player"),
          units: units.filter(u => u.owner === "player"),
          technologies: unlockedTechs,
        },
        ai: {
          civilization: aiCivilization,
          era: aiEra,
          leader_name: "AI",
          resources: aiResources,
          cities: cities.filter(c => c.owner === "ai"),
          units: units.filter(u => u.owner === "ai"),
          technologies: aiUnlockedTechs,
        },
        map: {
          size: mapState.size,
          tiles: mapState.tiles,
          visible_objects: visibleObjects,
          fog_of_war_player: mapState.fog_of_war_player,
          fog_of_war_ai: mapState.fog_of_war_ai,
        }
      }
    };
    console.log("FAKEGAMESTATE JSON:", JSON.stringify(gameStateJson, null, 2));
  };

  const unitsRef = useRef(units);
  const citiesRef = useRef(cities);
  const mapStateRef = useRef(mapState);
  const visibleObjectsRef = useRef(visibleObjects);
  const aiUnlockedTechsRef = useRef(aiUnlockedTechs);
  const aiResourcesRef = useRef(aiResources);
  const aiEraRef = useRef(aiEra);

  useEffect(() => { unitsRef.current = units; }, [units]);
  useEffect(() => { citiesRef.current = cities; }, [cities]);
  useEffect(() => { mapStateRef.current = mapState; }, [mapState]);
  useEffect(() => { visibleObjectsRef.current = visibleObjects; }, [visibleObjects]);
  useEffect(() => { aiUnlockedTechsRef.current = aiUnlockedTechs; }, [aiUnlockedTechs]);
  useEffect(() => { aiResourcesRef.current = aiResources; }, [aiResources]);
  useEffect(() => { aiEraRef.current = aiEra; }, [aiEra]);

  const runAiTurn = async () => {
    setIsAiRunning(true);
    let continueAi = true;

    while (continueAi) {
      // Siempre usa los valores actuales de los refs
      const gameState = {
        units: unitsRef.current,
        cities: citiesRef.current,
        mapState: mapStateRef.current,
        visibleObjects: visibleObjectsRef.current,
        aiUnlockedTechs: aiUnlockedTechsRef.current,
        aiResources: aiResourcesRef.current,
        aiEra: aiEraRef.current,
      };
      const action = await fetchNextAiAction(gameState);

      if (action.type === "endTurn") {
        continueAi = false;
      } else if (action.type === "attackUnit") {
        const attacker = unitsRef.current.find(u => u.id === action.payload.attackerId);
        const defender = unitsRef.current.find(u => u.id === action.payload.defenderId);

        if (!attacker || !defender) {
          setPendingAiAction(null);
          continue;
        }

        if (attacker.hasAttackedThisTurn) {
          console.warn("AI intenta atacar dos veces con la misma unidad en el mismo turno");
          setPendingAiAction(null);
          continue;
        }

        // --- Comprobar fog of war ---
        const defenderVisible =
          mapStateRef.current.fog_of_war_ai?.[defender.position.y]?.[defender.position.x];
        if (!defenderVisible) {
          console.warn("AI intenta atacar a una unidad fuera de su visión (fog of war)");
          setPendingAiAction(null);
          continue;
        }

        // --- Comprobar rango del atacante ---
        const attackerRange = attacker.range ?? 1;
        const defenderRange = defender.range ?? 1;
        const dx = Math.abs(attacker.position.x - defender.position.x);
        const dy = Math.abs(attacker.position.y - defender.position.y);
        const distance = Math.max(dx, dy);
        const inAttackerRange = distance <= attackerRange;
        const inDefenderRange = distance <= defenderRange;

        if (!inAttackerRange) {
          console.warn("AI intenta atacar fuera de su rango");
          setPendingAiAction(null);
          continue;
        }

        const mode: 'full' | 'single' = (inAttackerRange && inDefenderRange) ? 'full' : 'single';
        await new Promise<void>(resolve => {
          setAiBattle({
            attacker,
            defender,
            mode,
            onFinish: ({ attackerHealth, defenderHealth }) => {
              setUnits(prev =>
                prev
                  .map(u =>
                    u.id === attacker.id
                      ? {
                        ...u,
                        health: attackerHealth,
                        hasAttackedThisTurn: true,
                        movement_points_left: 0
                      }
                      : u.id === defender.id
                        ? { ...u, health: defenderHealth }
                        : u
                  )
                  .filter(u => u.health === undefined || u.health > 0)
              );
              setAiBattle(null);
              setPendingAiAction(null);
              resolve();
            }
          });
        });
        // Aquí el bucle sigue y puede acabar el turno si toca
        continue;
      } else if (action.type === "attackCity") {
        const attacker = unitsRef.current.find(u => u.id === action.payload.attackerId);
        const city = citiesRef.current.find(c => c.id === action.payload.cityId);

        if (!attacker || !city) {
          setPendingAiAction(null);
          continue;
        }

        // No permitir atacar dos veces a ciudad en el mismo turno
        if (attacker.hasAttackedCityThisTurn) {
          console.warn("AI intenta atacar dos veces a la misma ciudad en el mismo turno");
          setPendingAiAction(null);
          continue;
        }

        // Comprobar rango
        const dx = Math.abs(attacker.position.x - city.position.x);
        const dy = Math.abs(attacker.position.y - city.position.y);
        const distance = Math.max(dx, dy);
        const attackerRange = attacker.range ?? 1;

        if (distance > attackerRange) {
          console.warn("AI intenta atacar ciudad fuera de su rango");
          setPendingAiAction(null);
          continue;
        }

        await new Promise<void>(resolve => {
          setAiCityBattle({
            attacker,
            city,
            onFinish: ({ attackerId, cityId, newDefense, newHealth }) => {
              setCities(prev =>
                prev
                  .map(c =>
                    c.id === cityId
                      ? { ...c, defense: newDefense, health: newHealth }
                      : c
                  )
                  .filter(c => !(c.id === cityId && newHealth <= 0))
              );
              setUnits(prev =>
                prev.map(u =>
                  u.id === attackerId
                    ? {
                      ...u,
                      hasAttackedCityThisTurn: true,
                      hasAttackedThisTurn: true,
                      movement_points_left: 0,
                    }
                    : u
                )
              );
              setAiCityBattle(null);
              setPendingAiAction(null);
              checkVictoryOrDefeat();
              resolve();
            }
          });
        });
        continue;
      } else if (action.type === "foundCity") {
        const kolono = unitsRef.current.find(u => u.id === action.payload.unitId);
        if (!kolono) {
          setPendingAiAction(null);
          continue;
        }
        if (!action.payload.name) {
          console.warn("No se ha proporcionado nombre para la ciudad");
          setPendingAiAction(null);
          continue;
        }

        confirmFoundCity(
          action.payload.name,
          kolono.position,
          kolono.owner,
          kolono.id,
          kolono.owner === "ai" ? aiEra : playerEra
        );
        setPendingAiAction(null);
        continue;
      } else {
        setPendingAiAction({ action, gameState });

        // Espera a que el efecto termine antes de continuar
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (!pendingAiAction) {
              clearInterval(interval);
              resolve(null);
            }
          }, 10);
        });

        // Espera un render para asegurar que los refs están actualizados
        await new Promise(res => setTimeout(res, 0));
      }
    }

    checkVictoryOrDefeat();
    setCurrentSide('player');
    setIsAiRunning(false);
  };

  useEffect(() => {
    if (pendingAiAction) {
      const { action, gameState } = pendingAiAction;
      const newState = applyAiAction(gameState, action, aiLog);

      if (newState.units) setUnits(newState.units);
      if (newState.cities) setCities(newState.cities);
      if (newState.visibleObjects) setVisibleObjects(newState.visibleObjects);

      // Añade estas líneas:
      if (newState.aiUnlockedTechs) setAiUnlockedTechs(newState.aiUnlockedTechs);
      if (newState.aiEra) setAiEra(newState.aiEra);
      if (newState.aiResources) setAiResources(newState.aiResources);

      // Sumar recurso si es collectResource
      if (
        action.type === "collectResource" &&
        newState.visibleObjects &&
        gameState.visibleObjects
      ) {
        // Encuentra el objeto recogido
        const removed = gameState.visibleObjects.find(
          (obj: any) =>
            !newState.visibleObjects.some(
              (o: any) => o.position.x === obj.position.x && o.position.y === obj.position.y
            )
        );
        if (removed) {
          const bonus = VISIBLE_OBJECTS_BY_ID[removed.type]?.bonus || {};
          setAiResources(prev => {
            // Suma cada recurso del bonus al estado actual
            const updated = { ...prev };
            const resourceKeys = ["food", "gold", "culture", "science", "natural_resources"] as const;
            for (const key of resourceKeys) {
              const value = (bonus as Record<typeof key, number | undefined>)[key];
              if (typeof value === "number") {
                updated[key] = (updated[key] || 0) + value;
              }
            }
            return updated;
          });
        }
      }

      if (newState.aiMovePath) {
        setMapState(prev => {
          const fog = prev.fog_of_war_ai.map(row => [...row]);
          for (const step of newState.aiMovePath) {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = step.row + dr;
                const nc = step.col + dc;
                if (
                  nr >= 0 &&
                  nr < fog.length &&
                  nc >= 0 &&
                  nc < fog[0].length
                ) {
                  fog[nr][nc] = true;
                }
              }
            }
          }
          return { ...prev, fog_of_war_ai: fog };
        });
      }

      setPendingAiAction(null);

    }
  }, [pendingAiAction]);

  useEffect(() => {
    if (currentSide === 'ai' && !isAiRunning) {
      runAiTurn();
    }
  }, [currentSide, isAiRunning]);

  const updateCity = (cityId: string, changes: Partial<CityProps>) => {
    setCities((prevCities) =>
      prevCities.map((city) =>
        city.id === cityId ? { ...city, ...changes } : city
      )
    );
  };

  useEffect(() => {
    if (isLoaded) {
      checkVictoryOrDefeat();
    }
  }, [isLoaded, unlockedTechs, resources.culture, cities, units]);

  const checkVictoryOrDefeat = () => {
    // Victoria por ciencia (jugador o AI)
    if (unlockedTechs.includes("espaziontzia")) {
      setGameStatus("victory");
      setVictoryType("science");
      return;
    }
    if (aiUnlockedTechs.includes("espaziontzia")) {
      setGameStatus("defeat");
      setVictoryType("science");
      return;
    }

    // Victoria por cultura (jugador o AI)
    if (resources.culture >= 10000) {
      setGameStatus("victory");
      setVictoryType("culture");
      return;
    }
    if (aiResources.culture >= 10000) {
      setGameStatus("defeat");
      setVictoryType("culture");
      return;
    }

    // Victoria por conquista (jugador o AI)
    const enemyCities = cities.filter(c => c.owner !== "player");
    const enemyUnits = units.filter(u => u.owner !== "player");
    const playerCities = cities.filter(c => c.owner === "player");
    const playerUnits = units.filter(u => u.owner === "player");

    // Jugador gana por conquista
    if (
      (playerCities.length > 0 || playerUnits.length > 0) &&
      enemyCities.length === 0 && enemyUnits.length === 0
    ) {
      setGameStatus("victory");
      setVictoryType("conquest");
      return;
    }
    // AI gana por conquista
    if (
      (enemyCities.length > 0 || enemyUnits.length > 0) &&
      playerCities.length === 0 && playerUnits.length === 0
    ) {
      setGameStatus("defeat");
      setVictoryType("conquest");
      return;
    }
  };

  useEffect(() => {
    const loadGameState = async () => {
      try {
        const {
          map,
          units,
          cities,
          unlockedTechs,
          aiUnlockedTechs,
          turn,
          playerEra,
          aiEra,
          civilization,
          aiCivilization,
          resources,
          aiResources,
          visibleObjects,
          currentSide,
        } = await loadMap();
        setMapState({
          ...map,
          fog_of_war_player: map.fog_of_war_player || [],
          fog_of_war_ai: map.fog_of_war_ai || [],
        });
        setUnits(units);
        setCities(
          cities.map((city) => ({
            ...city,
            training: Array.isArray(city.training)
              ? city.training
              : city.training
                ? [city.training]
                : [],
          }))
        );
        setUnlockedTechs(unlockedTechs);
        setAiUnlockedTechs(aiUnlockedTechs);
        setTurn(turn);
        setPlayerEra(playerEra);
        setAiEra(aiEra);
        setCivilization(civilization);
        setAiCivilization(aiCivilization);
        setResources(resources);
        setAiResources(aiResources);
        setVisibleObjects(visibleObjects);
        setCurrentSide(currentSide);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error al cargar el estado del juego:", error);
      }
    };

    loadGameState();
  }, []);

  const endTurn = () => {
    if (isAiRunning) return;
    turnManager.nextTurn(gameManager);
    setTurn((prev) => prev + 1);

    setUnits((prev) =>
      prev.map((u) => ({
        ...u,
        hasAttackedCityThisTurn: false,
        hasAttackedThisTurn: false,
        movement_points_left: u.movement_points,
      }))
    );

    setCities((prevCities) => {
      // PLAYER
      const playerCities = prevCities.filter(city => city.owner === 'player');
      const playerResources = calculateResourcesForCities(playerCities, unlockedTechs);

      const totalFoodNeeded = playerCities.reduce((sum, city) => sum + city.population, 0);
      let newFood = resources.food + playerResources.food;
      let newGold = resources.gold + playerResources.gold;
      let newCulture = resources.culture + playerResources.culture;
      let newScience = resources.science + playerResources.science;
      let newNaturalResources = resources.natural_resources + playerResources.natural_resources;

      let updatedCities;
      if (newFood >= totalFoodNeeded) {
        updatedCities = prevCities.map(city =>
          city.owner === 'player' && city.allowPopulationGrowth
            ? { ...city, population: city.population + 1 }
            : city
        );
        newFood -= totalFoodNeeded;
      } else {
        updatedCities = prevCities.map(city =>
          city.owner === 'player'
            ? { ...city, population: Math.max(1, city.population - 1) }
            : city
        );
        newFood = 0;
      }

      setResources({
        food: newFood,
        gold: newGold,
        culture: newCulture,
        science: newScience,
        natural_resources: newNaturalResources,
      });

      // SOLO SUMA LA PRODUCCIÓN DE LA IA CUANDO LE TOCA SU TURNO
      if (currentSide === 'player') {
        const aiCities = prevCities.filter(city => city.owner === 'ai');
        const aiResourcesProd = calculateResourcesForCities(aiCities, aiUnlockedTechs);

        setAiResources(prev => ({
          food: prev.food + aiResourcesProd.food,
          gold: prev.gold + aiResourcesProd.gold,
          culture: prev.culture + aiResourcesProd.culture,
          science: prev.science + aiResourcesProd.science,
          natural_resources: prev.natural_resources + aiResourcesProd.natural_resources,
        }));
      }

      checkVictoryOrDefeat();
      return updatedCities;
    });

    setCurrentSide(prev => {
      const next = prev === 'player' ? 'ai' : 'player';
      // NO LLAMES A runAiTurn AQUÍ
      return next;
    });

    setTimeout(() => {
      logGameState();
    }, 10);

  };

  return (
    <GameContext.Provider
      value={{
        mapState,
        setMapState,
        units,
        setUnits,
        selectedUnitId,
        setSelectedUnitId,
        cities,
        setCities,
        selectedCity,
        setSelectedCity,
        turn,
        endTurn,
        message,
        setMessage,
        unlockedTechs,
        setUnlockedTechs,
        aiUnlockedTechs,
        setAiUnlockedTechs,
        civilization,
        setCivilization,
        aiCivilization,
        setAiCivilization,
        playerEra,
        setPlayerEra,
        aiEra,
        setAiEra,
        resources,
        setResources,
        aiResources,
        setAiResources,
        camera,
        setCamera,
        initialCameraOffset,
        setInitialCameraOffset,
        updateCity,
        visibleObjects,
        setVisibleObjects,
        selectedVisibleObject,
        setSelectedVisibleObject,
        gameManager,
        deployingUnit,
        setDeployingUnit,
        checkVictoryOrDefeat,
        gameStatus,
        setGameStatus,
        victoryType,
        setVictoryType,
        currentSide,
        setCurrentSide,
        confirmFoundCity,
        aiLog,
        cheatsUsed,
        setCheatsUsed,
      }}
    >

      {aiBattle && (
        <BattleView
          attacker={aiBattle.attacker}
          defender={aiBattle.defender}
          mode={aiBattle.mode}
          onClose={() => { }}
          onUnitDeath={() => { }}
          onUnitHealthChange={() => { }}
          onFinish={aiBattle.onFinish}
        />
      )}
      {aiCityBattle && (
        <CityBattleView
          attacker={aiCityBattle.attacker}
          city={aiCityBattle.city}
          onFinish={aiCityBattle.onFinish}
        />
      )}
      {children}
    </GameContext.Provider>
  );
};

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}