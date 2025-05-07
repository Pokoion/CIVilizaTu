import React, { createContext, useContext, useState } from 'react';
import { MapState, UnitProps, CityProps, Tech } from '../types';
import TurnManager from '../managers/TurnManager';
import GameManager from '../managers/GameManager';

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
  unlockedTechs: Tech[];
  setUnlockedTechs: React.Dispatch<React.SetStateAction<Tech[]>>;
  camera: { offset: { x: number, y: number } };
  setCamera: React.Dispatch<React.SetStateAction<{ offset: { x: number, y: number } }>>;
  initialCameraOffset: { x: number; y: number };
  setInitialCameraOffset: (offset: { x: number; y: number }) => void;
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
  unlockedTechs: Tech[];
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
        cities: cities.map(city => ({
          id: city.id,
          name: city.name,
          position: city.position,
          population: city.population,
        })),
        units: units.map(unit => ({
          id: unit.id,
          type: unit.type,
          position: unit.position,
          movement_points: unit.movement_points,
          movement_points_left: unit.movement_points_left,
        })),
        technologies: unlockedTechs.map(tech => ({
          id: tech.id,
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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapState, setMapState] = useState<MapState>({
    size: { width: 0, height: 0 }, tiles: [], fog_of_war: []
  });
  const [units, setUnits] = useState<UnitProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityProps | null>(null);
  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [unlockedTechs, setUnlockedTechs] = useState<Tech[]>([]);
  const [camera, setCamera] = useState<{ offset: { x: number, y: number } }>({
    offset: { x: 0, y: 0 }
  });
  const [initialCameraOffset, setInitialCameraOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentPlayer = turnManager.getCurrentPlayer();

  const endTurn = () => {
    turnManager.nextTurn(gameManager);
    setTurn(prev => prev + 1);

    setUnits(prevUnits => gameManager.reloadUnitsMovement(prevUnits));

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
      mapState
    });

    console.log("GAME SAVE JSON (backend):", JSON.stringify(saveJson, null, 2));
  };

  return (
    <GameContext.Provider value={{
      mapState, setMapState, units, setUnits, selectedUnitId, setSelectedUnitId,
      cities, setCities, selectedCity, setSelectedCity,
      turn, endTurn, currentPlayer, message, setMessage,
      unlockedTechs, setUnlockedTechs,
      camera, setCamera, initialCameraOffset, setInitialCameraOffset,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}