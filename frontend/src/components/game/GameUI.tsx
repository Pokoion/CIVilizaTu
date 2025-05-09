import React, { useState } from 'react';
import Map2 from './Map2';
import InfoPanel from './InfoPanel';
import CityView from './CityView';
import TechTreeView from './TechTreeView';
import MiniMap from './MiniMap';
import BattleView from './BattleView';
import FoundCityView from './FoundCityView';
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

    // Estados para FoundCityView
    const [showFoundCityView, setShowFoundCityView] = useState(false);
    const [kolonoToFoundCity, setKolonoToFoundCity] = useState<UnitProps | null>(null);

    const { 
        message, setMessage, 
        turn, endTurn, currentPlayer, 
        selectedCity, cities, setCities, units, setUnits, resources
    } = useGame();

    const handleAttackEnemy = (attacker: UnitProps, defender: UnitProps) => {
        setShowBattle(true);
        setSelectedUnit(attacker);
        setSelectedEnemyUnit(defender);
    };

    const handleFoundCity = (kolono: UnitProps) => {
        // Mostrar FoundCityView y guardar el kolono seleccionado
        setShowFoundCityView(true);
        setKolonoToFoundCity(kolono);
    };

    const confirmFoundCity = (cityName: string) => {
        if (!kolonoToFoundCity) return;

        const { position } = kolonoToFoundCity;

        // Crear una nueva ciudad con el nombre proporcionado
        const newCity: CityProps = {
            id: `city-${Date.now()}`,
            name: cityName || `Hiria ${cities.length + 1}`, // Usar el nombre ingresado o un nombre por defecto
            position,
            population: 1,
            owner: 'player',
            buildings: [],
            production: {
                food: 0,
                gold: 0,
                culture: 0,
                science: 0,
                natural_resources: 0,
            }
        };

        // Actualizar el estado global
        setCities([...cities, newCity]);
        setUnits(units.filter((unit) => unit.id !== kolonoToFoundCity.id)); // Eliminar el Kolono
        setSelectedUnit(null); // Deseleccionar la unidad
        setSelectedTile(null); // Deseleccionar el tile
        setShowFoundCityView(false); // Cerrar FoundCityView
        setKolonoToFoundCity(null); // Limpiar el kolono seleccionado
    };

    const cancelFoundCity = () => {
        setShowFoundCityView(false);
        setKolonoToFoundCity(null);
    };

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
                    <div className="resource">
                        <img src="/images/resources/urrea.png" alt="Urrea" className="resource-icon" />
                        <span className="resource-name">Urrea:</span>
                        <span className="resource-value">{resources.gold}</span>
                    </div>
                    <div className="resource">
                        <img src="/images/resources/janaria.png" alt="Janaria" className="resource-icon" />
                        <span className="resource-name">Janaria:</span>
                        <span className="resource-value">{resources.food}</span>
                    </div>
                    <div className="resource">
                        <img src="/images/resources/kultura.png" alt="Kultura" className="resource-icon" />
                        <span className="resource-name">Kultura:</span>
                        <span className="resource-value">{resources.culture}</span>
                    </div>
                    <div className="resource">
                        <img src="/images/resources/baliabide_naturalak.png" alt="Baliabide Naturalak" className="resource-icon" />
                        <span className="resource-name">Baliabide Naturalak:</span>
                        <span className="resource-value">{resources.natural_resources}</span>
                    </div>
                    <div className="resource">
                        <img src="/images/resources/zientzia.png" alt="Zientzia" className="resource-icon" />
                        <span className="resource-name">Zientzia:</span>
                        <span className="resource-value">{resources.science}</span>
                    </div>
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
                        onFoundCity={handleFoundCity}
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

        {/* FoundCityView */}
        {showFoundCityView && (
            <FoundCityView
                onConfirm={confirmFoundCity}
                onCancel={cancelFoundCity}
            />
        )}
        </>
    );
};

export default GameUI;