import React, { useState } from 'react';
import Map2 from './Map2';
import InfoPanel from './InfoPanel';
import CityView from './CityView';
import TechTreeView from './TechTreeView';
import MiniMap from './MiniMap';
import BattleView from './BattleView';
import { UnitProps, TerrainType, CityProps } from '../../types';
import '../../styles/GameUI.css';
import { useGame } from '../../context/GameContext';

const GameUI: React.FC = () => {
    const [selectedUnit, setSelectedUnit] = useState<UnitProps | null>(null);
    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number; type: TerrainType } | null>(null);
    const [cityViewCity, setCityViewCity] = useState<CityProps | null>(null);
    const [showTechTree, setShowTechTree] = useState(false);
    const [selectedEnemyUnit, setSelectedEnemyUnit] = useState<UnitProps | null>(null);
    const [showBattle, setShowBattle] = useState(false);

    const handleAttackEnemy = (attacker: UnitProps, defender: UnitProps) => {
        setShowBattle(true);
        setSelectedUnit(attacker);
        setSelectedEnemyUnit(defender);
    };

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
                    <MiniMap />
                </div>
                <div className="ui-center">
                    <Map2
                        setSelectedUnit={setSelectedUnit}
                        setSelectedTile={setSelectedTile}
                        setSelectedEnemyUnit={setSelectedEnemyUnit}
                    />
                </div>
                <div className="ui-right">
                    <InfoPanel
                        selectedUnit={selectedUnit}
                        selectedEnemyUnit={selectedEnemyUnit}
                        selectedTile={selectedTile}
                        selectedCity={selectedCity}
                        onEnterCity={city => setCityViewCity(city)}
                        onAttackEnemy={handleAttackEnemy}
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
        {showBattle && selectedUnit && selectedEnemyUnit && (
            <BattleView
                attacker={selectedUnit}
                defender={selectedEnemyUnit}
                onClose={() => setShowBattle(false)}
            />
        )}
        </>
    );
};

export default GameUI;