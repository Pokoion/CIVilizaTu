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
import { BUILDINGS, CITY_ERAS_BY_ID, TECHS } from '../../utils/Constants';
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

    // Usa el contexto global para selectedVisibleObject
    const {
        message, setMessage,
        turn, endTurn, currentPlayer,
        selectedCity, cities, setCities, units, setUnits, resources, playerEra, civilization, unlockedTechs,
        selectedVisibleObject, setSelectedVisibleObject // <-- usa el del contexto
    } = useGame();

    const handleAttackEnemy = (attacker: UnitProps, defender: UnitProps) => {
        setShowBattle(true);
        setSelectedUnit(attacker);
        setSelectedEnemyUnit(defender);
    };

    const handleFoundCity = (kolono: UnitProps) => {
        setShowFoundCityView(true);
        setKolonoToFoundCity(kolono);
    };

    const confirmFoundCity = (cityName: string) => {
        if (!kolonoToFoundCity) return;

        const { position } = kolonoToFoundCity;

        // Siempre usar la era del jugador
        const era = playerEra || "Antzinaroa";

        // Obtener la info de la era desde Constants, con fallback seguro
        const eraInfo = CITY_ERAS_BY_ID[era] || CITY_ERAS_BY_ID["Antzinaroa"];
        let production = { ...eraInfo.base_production };

        // Sumar bonus de edificios construidos en la ciudad más reciente del jugador (si existe)
        const playerCities = cities.filter(city => city.owner === 'player');
        let buildings: string[] = [];
        if (playerCities.length > 0) {
            buildings = playerCities[playerCities.length - 1].buildings || [];
        }

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

        // Crear una nueva ciudad con la era y la producción adecuada
        const newCity: CityProps = {
            id: `city-${Date.now()}`,
            name: cityName || `Hiria ${playerCities.length + 1}`,
            position,
            population: 1,
            owner: 'player',
            buildings: [],
            production,
            defense: 50,
            health: 100,
            era,
            training: []
        };

        setCities([...cities, newCity]);
        setUnits(units.filter((unit) => unit.id !== kolonoToFoundCity.id));
        setSelectedUnit(null);
        setSelectedTile(null);
        setShowFoundCityView(false);
        setKolonoToFoundCity(null);
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
                        <div className="player-info-block">
                            <div style={{ marginBottom: 8 }}>
                                <b>Era:</b> {playerEra}
                            </div>
                            <div style={{ marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <img
                                    src={`/images/civilizations/${civilization}.png`}
                                    alt={civilization}
                                    style={{ width: 128, height: 148, borderRadius: "50%", border: "2px solid #ccc" }}
                                />
                                <span style={{ fontWeight: 500, fontSize: "1.2em", marginTop: 8 }}>{civilization}</span>
                            </div>
                            <div>
                                <b>Teknologiak:</b> {unlockedTechs.length} / {TECHS.length}
                            </div>
                        </div>
                    </div>
                    <div className="ui-center">
                        <Map2
                            setSelectedUnit={setSelectedUnit}
                            setSelectedTile={setSelectedTile}
                            setSelectedEnemyUnit={setSelectedEnemyUnit}
                            setSelectedVisibleObject={setSelectedVisibleObject}
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
                            selectedVisibleObject={selectedVisibleObject}
                            setSelectedVisibleObject={setSelectedVisibleObject}
                        />
                        {cityViewCity && (
                            <CityView cityId={cityViewCity.id} onClose={() => setCityViewCity(null)} />
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