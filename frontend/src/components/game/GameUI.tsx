import React, { useState } from 'react';
import Map2 from './Map2';
import InfoPanel from './InfoPanel';
import CityView from './CityView';
import TechTreeView from './TechTreeView';
import { UnitProps, TerrainType, CityProps } from '../../types';
import '../../styles/GameUI.css';
import { useGame } from '../../context/GameContext';

const GameUI: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<UnitProps | null>(null);
    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number; type: TerrainType } | null>(null);
    const [cityViewCity, setCityViewCity] = useState<CityProps | null>(null);
    const [showTechTree, setShowTechTree] = useState(false);

    const { 
        message, setMessage, 
        turn, endTurn, currentPlayer, 
        selectedCity 
    } = useGame();

    return (
        <>
        {message && (
            <div className="game-message" onClick={() => setMessage(null)}>
                {message}
            </div>
        )}
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
                    <span>Jokalaria: {currentPlayer === 'player' ? 'Player' : 'AI'}</span>
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
                <InfoPanel
                    selectedUnit={selectedUnit}
                    selectedTile={selectedTile}
                    selectedCity={selectedCity}
                    onEnterCity={city => setCityViewCity(city)}
                />
                {cityViewCity && (
                    <CityView city={cityViewCity} onClose={() => setCityViewCity(null)} />
                )}
                {showTechTree && (
                    <TechTreeView onClose={() => setShowTechTree(false)} />
                )}
                </div>
            </div>
            <div className="ui-bottom">
                <button onClick={endTurn}>Txanda amaitu</button>
                <button onClick={() => setShowTechTree(true)}>Teknologia zuhaitza</button>
            </div>
        </div>
        </>
    );
};

export default GameUI;