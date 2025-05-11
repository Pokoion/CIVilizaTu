import React, { createContext, useContext, useState, useEffect } from "react";
import { MapState, UnitProps, CityProps } from "../types";
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
        movement_points_left: u.movement_points, // Restaurar puntos de movimiento
      }))
    );

    // Actualiza ciudades y recursos en un solo paso para evitar estados desfasados
    setCities((prevCities) => {
      // Primero, actualiza los turnsLeft de training
      const updatedCities = prevCities.map((city) => ({
        ...city,
        training: Array.isArray(city.training)
          ? city.training.map((unit) => ({
              ...unit,
              turnsLeft: unit.turnsLeft > 0 ? unit.turnsLeft - 1 : 0,
            }))
          : [],
      }));

      // Suma la producción de todas las ciudades actualizadas
      setResources((prevResources) => {
        const totalProduction = updatedCities.reduce(
          (acc, city) => {
            acc.food += city.production.food || 0;
            acc.gold += city.production.gold || 0;
            acc.culture += city.production.culture || 0;
            acc.science += city.production.science || 0;
            acc.natural_resources += city.production.natural_resources || 0;
            return acc;
          },
          { ...prevResources }
        );
        return totalProduction;
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
