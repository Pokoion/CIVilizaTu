import React, { createContext, useContext, useState, useEffect } from "react";
import { MapState, UnitProps, CityProps, TrainingUnit, AiAction } from "../types";
import TurnManager from "../managers/TurnManager";
import GameManager from "../managers/GameManager";
import { loadMap, fetchNextAiAction } from "../services/api";
import { applyAiAction } from "../utils/aiActions";

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

  const runAiTurn = async () => {
    console.log("===> runAiTurn INICIO");
    setIsAiRunning(true);
    let continueAi = true;
    let actionCount = 0;

    while (continueAi) {
      actionCount++;
      console.log("===> runAiTurn ciclo", actionCount, "currentSide:", currentSide);
      const gameState = {
        units,
        cities,
        resources,
        aiResources,
        unlockedTechs,
        aiUnlockedTechs,
        playerEra,
        aiEra,
        civilization,
        aiCivilization,
        visibleObjects,
      };

      const action = await fetchNextAiAction(gameState);
      console.log("===> Acción IA recibida:", action);

      if (action.type === "endTurn") {
        continueAi = false;
      } else {
        const newState = applyAiAction(gameState, action);
        setUnits(newState.units);
        setCities(newState.cities);
        await new Promise(res => setTimeout(res, 1200)); // <-- retardo entre acciones
      }
    }

    setCurrentSide('player');
    setIsAiRunning(false);
    console.log("===> runAiTurn FIN. currentSide puesto a 'player'");
  };

  useEffect(() => {
    if (currentSide === 'ai' && !isAiRunning) {
      console.log("===> useEffect: Lanzando runAiTurn porque currentSide es 'ai'");
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
    if (unlockedTechs.includes("espaziontzia")) {
      setGameStatus("victory");
      setVictoryType("science");
      return;
    }
    if (resources.culture >= 10000) {
      setGameStatus("victory");
      setVictoryType("culture");
      return;
    }
    const enemyCities = cities.filter(c => c.owner !== "player");
    const enemyUnits = units.filter(u => u.owner !== "player");
    const playerCities = cities.filter(c => c.owner === "player");
    const playerUnits = units.filter(u => u.owner === "player");
    if (
      (playerCities.length > 0 || playerUnits.length > 0) &&
      enemyCities.length === 0 && enemyUnits.length === 0
    ) {
      setGameStatus("victory");
      setVictoryType("conquest");
      return;
    }
    if (playerCities.length === 0 && playerUnits.length === 0) {
      setGameStatus("defeat");
      setVictoryType(null);
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
    console.log("===> endTurn llamado. currentSide:", currentSide, "isAiRunning:", isAiRunning);
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
      console.log("===> setCurrentSide dentro de endTurn. prev:", prev, "next:", next);
      // NO LLAMES A runAiTurn AQUÍ
      return next;
    });

    setTimeout(() => {
      console.log("ESTADO DEL JUEGO AL CAMBIAR DE TURNO:", JSON.stringify({
        turn,
        currentSide,
        resources,
        aiResources,
        civilization,
        aiCivilization,
        playerEra,
        aiEra,
        unlockedTechs,
        aiUnlockedTechs,
        cities,
        units,
        visibleObjects,
        gameStatus,
        victoryType
      }, null, 2));
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}