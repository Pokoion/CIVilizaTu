import React, { createContext, useContext, useState, useEffect } from "react";
import { MapState, UnitProps, CityProps, TrainingUnit } from "../types";
import TurnManager from "../managers/TurnManager";
import GameManager from "../managers/GameManager";
import { loadMap } from "../services/api";

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
  currentPlayer: string;
  message: string | null;
  setMessage: (msg: string | null) => void;
  unlockedTechs: string[];
  setUnlockedTechs: React.Dispatch<React.SetStateAction<string[]>>;
  civilization: string;
  setCivilization: React.Dispatch<React.SetStateAction<string>>;
  playerEra: string;
  setPlayerEra: React.Dispatch<React.SetStateAction<string>>;
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
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const turnManager = new TurnManager();
const gameManager = new GameManager();

function buildGameSave({
  userId,
  name,
  scenarioId,
  isAutosave,
  cheatsUsed,
  turn,
  currentPlayer,
  unlockedTechs,
  units,
  cities,
  mapState,
}: {
  userId: string;
  name: string;
  scenarioId: string;
  isAutosave: boolean;
  cheatsUsed: string[];
  turn: number;
  currentPlayer: string;
  unlockedTechs: string[];
  units: UnitProps[];
  cities: CityProps[];
  mapState: MapState;
}) {
  return {
    user_id: userId,
    name,
    scenario_id: scenarioId,
    created_at: new Date().toISOString(),
    last_saved: new Date().toISOString(),
    is_autosave: isAutosave,
    cheats_used: cheatsUsed,
    game_state: {
      turn,
      current_player: currentPlayer,
      cheats_used: cheatsUsed,
      player: {
        resources: {
          food: 0,
          production: 0,
          science: 0,
          gold: 0,
        },
        cities: cities.map((city) => ({
          id: city.id,
          name: city.name,
          position: city.position,
          population: city.population,
          buildings: city.buildings,
          production: city.production,
          owner: city.owner,
          era: city.era,
          training: city.training,
        })),
        units: units.map((unit) => ({
          id: unit.id,
          type: unit.type,
          position: unit.position,
          movement_points: unit.movement_points,
          movement_points_left: unit.movement_points_left,
        })),
        technologies: unlockedTechs.map((techId) => ({
          id: techId,
          completed: true,
        })),
      },
      ai: {
        resources: {},
        cities: [],
        units: [],
        technologies: [],
      },
      map: {
        size: mapState.size,
        explored: [],
        visible_objects: [],
        fog_of_war_player: mapState.fog_of_war,
        fog_of_war_ai: [],
      },
    },
  };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mapState, setMapState] = useState<MapState>({
    size: { width: 0, height: 0 },
    tiles: [],
    fog_of_war: [],
  });
  const [units, setUnits] = useState<UnitProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityProps | null>(null);
  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>([]);
  const [camera, setCamera] = useState<{ offset: { x: number; y: number } }>({
    offset: { x: 0, y: 0 },
  });
  const [initialCameraOffset, setInitialCameraOffset] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [playerEra, setPlayerEra] = useState<string>("");
  const currentPlayer = turnManager.getCurrentPlayer();
  const [resources, setResources] = useState({
    food: 0,
    gold: 0,
    culture: 0,
    science: 0,
    natural_resources: 0,
  });
  const [civilization, setCivilization] = useState<string>("");
  const [visibleObjects, setVisibleObjects] = useState<
    { type: string; position: { x: number; y: number } }[]
  >([]);
  const [selectedVisibleObject, setSelectedVisibleObject] = useState<{
    type: string;
    position: { x: number; y: number };
  } | null>(null);
  const [deployingUnit, setDeployingUnit] = useState<null | { unit: TrainingUnit, city: CityProps }>(null);

  // Nueva función para actualizar una ciudad por id
  const updateCity = (cityId: string, changes: Partial<CityProps>) => {
    setCities((prevCities) =>
      prevCities.map((city) =>
        city.id === cityId ? { ...city, ...changes } : city
      )
    );
  };

  // Cargar datos desde la API al inicializar el contexto
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const {
          map,
          units,
          cities,
          unlockedTechs,
          turn,
          currentPlayer,
          playerEra,
          civilization,
          resources,
          visibleObjects,
        } = await loadMap();
        setMapState(map);
        setUnits(units);
        // Asegura que training siempre es array
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
        setTurn(turn);
        setPlayerEra(playerEra);
        setCivilization(civilization);
        setResources(resources);
        setVisibleObjects(visibleObjects);
      } catch (error) {
        console.error("Error al cargar el estado del juego:", error);
      }
    };

    loadGameState();
  }, []);

  const endTurn = () => {
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

    // --- LÓGICA DE PRODUCCIÓN Y CONSUMO EN UN SOLO PASO ---
    setCities((prevCities) => {
      const playerCities = prevCities.filter(city => city.owner === 'player');
      const hasEkonomia = unlockedTechs.includes("ekonomia");

      const totalProduction = playerCities.reduce(
        (acc, city) => {
          // Bonus de cultura por escuelas
          const schoolCount = city.buildings.filter(b => b === 'eskola').length;
          const schoolCultureBonus = schoolCount * city.population;

          // Bonus de cultura por unibertsitateak: +2 por habitante por cada una
          const uniCount = city.buildings.filter(b => b === 'unibertsitatea').length;
          const uniCultureBonus = uniCount * city.population * 2;

          // Bonus de oro por merkatua: +2 gold por cada mercado construido
          const marketCount = city.buildings.filter(b => b === 'merkatua').length;
          const marketGoldBonus = marketCount * 2;

          // Bonus de oro por ekonomia: +5 oro por ciudad si tienes la tecnología
          const ekonomiaGoldBonus = hasEkonomia ? 5 : 0;

          // Bonus de defensa por harresia: +50 por cada una
          const wallCount = city.buildings.filter(b => b === 'harresia').length;
          city.defense = (city.defense ?? 20) + wallCount * 50;

          acc.food += city.production.food || 0;
          acc.gold += (city.production.gold || 0) + marketGoldBonus + ekonomiaGoldBonus;
          acc.culture += (city.production.culture || 0) + schoolCultureBonus + uniCultureBonus;
          acc.science += city.production.science || 0;
          acc.natural_resources += city.production.natural_resources || 0;
          return acc;
        },
        { food: 0, gold: 0, culture: 0, science: 0, natural_resources: 0 }
      );

      const totalFoodNeeded = playerCities.reduce((sum, city) => sum + city.population, 0);
      console.log('[PRODUCCIÓN] +food:', totalProduction.food, '+gold:', totalProduction.gold, '+culture:', totalProduction.culture, '+science:', totalProduction.science, '+natural_resources:', totalProduction.natural_resources);

      // 2. Calcular consumo
      let newFood = resources.food + totalProduction.food;
      let newGold = resources.gold + totalProduction.gold;
      let newCulture = resources.culture + totalProduction.culture;
      let newScience = resources.science + totalProduction.science;
      let newNaturalResources = resources.natural_resources + totalProduction.natural_resources;

      console.log('[CONSUMO] -food:', totalFoodNeeded, 'food antes:', newFood);

      let updatedCities;
      if (newFood >= totalFoodNeeded) {
        updatedCities = prevCities.map(city =>
          city.allowPopulationGrowth
            ? { ...city, population: city.population + 1 }
            : city
        );
        newFood -= totalFoodNeeded;
        console.log('[RESULTADO] Crecen ciudades. Food después:', newFood);
      } else {
        // Quita 1 habitante a cada ciudad (mínimo 1)
        updatedCities = prevCities.map(city =>
          city.owner === 'player'
            ? { ...city, population: Math.max(1, city.population - 1) }
            : city
        );
        newFood = 0;
        console.log('[RESULTADO] No hay comida suficiente. Food después: 0');
      }

      // 3. Actualizar recursos solo una vez
      setResources({
        food: newFood,
        gold: newGold,
        culture: newCulture,
        science: newScience,
        natural_resources: newNaturalResources,
      });

      return updatedCities;
    });

    const saveJson = buildGameSave({
      userId: "665f1a2b3c4d5e6f7a8b9c0d",
      name: "Nire partida IA-ren aurka",
      scenarioId: "665f1a2b3c4d5e6f7a8b9c0e",
      isAutosave: false,
      cheatsUsed: [],
      turn,
      currentPlayer,
      unlockedTechs,
      units,
      cities,
      mapState,
    });

    console.log("GAME SAVE JSON (backend):", JSON.stringify(saveJson, null, 2));
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
        currentPlayer,
        message,
        setMessage,
        unlockedTechs,
        setUnlockedTechs,
        civilization,
        setCivilization,
        playerEra,
        setPlayerEra,
        resources,
        setResources,
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
