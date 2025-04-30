import React, { createContext, useContext, useState } from 'react';
import { MapState, UnitProps } from '../types';
import TurnManager from '../managers/TurnManager';
import GameManager from '../managers/GameManager';

type GameContextType = {
  mapState: MapState;
  setMapState: React.Dispatch<React.SetStateAction<MapState>>;
  units: UnitProps[];
  setUnits: React.Dispatch<React.SetStateAction<UnitProps[]>>;
  selectedUnitId: string | null;
  setSelectedUnitId: React.Dispatch<React.SetStateAction<string | null>>;
  turn: number;
  endTurn: () => void;
  currentPlayer: string;
  message: string | null;
  setMessage: (msg: string | null) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const turnManager = new TurnManager();
const gameManager = new GameManager();

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapState, setMapState] = useState<MapState>({
    map: { size: { width: 0, height: 0 }, tiles: [], fog_of_war: [] },
  });
  const [units, setUnits] = useState<UnitProps[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const endTurn = () => {
    turnManager.nextTurn(gameManager);
    setTurn(prev => prev + 1);
  
    // Recarga los puntos de movimiento usando GameManager
    setUnits(prevUnits => gameManager.reloadUnitsMovement(prevUnits));
  };

  const currentPlayer = turnManager.getCurrentPlayer();

  return (
    <GameContext.Provider value={{
      mapState, setMapState, units, setUnits, selectedUnitId, setSelectedUnitId,
      turn, endTurn, currentPlayer, message, setMessage,
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