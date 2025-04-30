import React, { useState } from 'react';
import Map2 from './Map2';
import InfoPanel from './InfoPanel';
import { UnitProps, TerrainType } from '../../types';
import '../../styles/GameUI.css';
import TurnManager from '../../managers/TurnManager';
import GameManager from '../../managers/GameManager';

const turnManager = new TurnManager();
const gameManager = new GameManager();

const GameUI: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<UnitProps | null>(null);
    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number; type: TerrainType } | null>(null);
    const [turn, setTurn] = useState(1);

    const endTurn = () => {
        turnManager.nextTurn(gameManager);
        setTurn(prev => prev + 1);
        // Aquí podrías actualizar el estado de unidades si lo necesitas
    };

    return (
        <div className="game-ui">
            <div className="ui-top">
                <div className="ui-top-left">
                    <span>Txanda: {turn}</span>
                </div>
                <div className="ui-top-center">
                    <span>Urrea: 100</span>
                    <span>Janaria: 50</span>
                    <span>X: 100</span>
                </div>
                <div className="ui-top-right">
                    <span>Jokalaria: {turnManager.getCurrentPlayer() === 'player' ? 'Player' : 'AI'}</span>
                </div>
            </div>
            <div className="ui-main">
                <div className="ui-left">
                    <div className="minimap-placeholder">Minimapa</div>
                </div>
                <div className="ui-center">
                    <Map2 setSelectedUnit={setSelectedUnit} setSelectedTile={setSelectedTile} />
                </div>
                <div className="ui-right">
                    <InfoPanel selectedUnit={selectedUnit} selectedTile={selectedTile} />
                </div>
            </div>
            <div className="ui-bottom">
                <button onClick={endTurn}>Txanda amaitu</button>
                <button>Menú</button>
            </div>
        </div>
    );
};

export default GameUI;