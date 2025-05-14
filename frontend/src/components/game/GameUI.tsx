import React, { useState } from 'react';
import Map2 from './Map2';
import InfoPanel from './InfoPanel';
import CityView from './CityView';
import TechTreeView from './TechTreeView';
import MiniMap from './MiniMap';
import BattleView from './BattleView';
import FoundCityView from './FoundCityView';
import CheatConsoleModal from './CheatConsoleModal';
import { UnitProps, TerrainType, CityProps } from '../../types';
import '../../styles/GameUI.css';
import { TECHS } from '../../utils/Constants';
import { useGame } from '../../context/GameContext';
import { useNavigate } from "react-router-dom";
import { saveGame } from '../../services/gameService';

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
    const [battleMode, setBattleMode] = useState<'full' | 'single'>('full');
    const [cheatOpen, setCheatOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Usa el contexto global para selectedVisibleObject y recursos
    const {
        message, setMessage,
        turn, endTurn, currentSide,
        selectedCity, cities, setCities, units, setUnits,
        resources, aiResources,
        playerEra, aiEra,
        civilization, aiCivilization,
        unlockedTechs, aiUnlockedTechs,
        selectedVisibleObject, setSelectedVisibleObject, checkVictoryOrDefeat,
        gameStatus, victoryType, confirmFoundCity, isLoaded, gameManager, visibleObjects,
        mapState, gameId, cheatsUsed
    } = useGame();

    // --- NUEVO: Deshabilitar botones y acciones si es turno de la IA ---
    const isPlayerTurn = currentSide === 'player';

    // Selecciona los datos según el bando activo
    const sideResources = React.useMemo(() => (
        currentSide === 'player' ? resources : aiResources
    ), [currentSide, resources, aiResources]);
    const sideEra = currentSide === 'player' ? playerEra : aiEra;
    const sideCivilization = currentSide === 'player' ? civilization : aiCivilization;
    const sideUnlockedTechs = currentSide === 'player' ? unlockedTechs : aiUnlockedTechs;

    const handleAttackEnemy = (attacker: UnitProps, defender: UnitProps, mode: 'full' | 'single') => {
        if (!isPlayerTurn) return;
        setShowBattle(true);
        setSelectedUnit(attacker);
        setSelectedEnemyUnit(defender);
        setBattleMode(mode);
    };

    const handleFoundCity = (kolono: UnitProps) => {
        if (!isPlayerTurn) return;
        setShowFoundCityView(true);
        setKolonoToFoundCity(kolono);
    };

    const handleSaveAndMenu = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            // Construye el game_state igual que en GameContext
            const game_state = gameManager.buildGameState
                ? gameManager.buildGameState({
                    turn,
                    currentSide,
                    unlockedTechs,
                    aiUnlockedTechs,
                    civilization,
                    aiCivilization,
                    playerEra,
                    aiEra,
                    resources,
                    aiResources,
                    cities,
                    units,
                    mapState,
                    visibleObjects,
                    cheatsUsed,
                })
                : {}; // fallback si no existe
            // Usa el id de partida si está en gameManager o contexto
            if (!gameId) throw new Error("No se encontró el ID de la partida.");
            await saveGame(gameId, game_state);
            navigate("/main-menu");
        } catch (err: any) {
            setSaveError("Error al guardar la partida.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    React.useEffect(() => {
        if (message) {
            const timeout = setTimeout(() => setMessage(""), 2500);
            return () => clearTimeout(timeout);
        }
    }, [message, setMessage]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setCheatOpen(open => !open);
            }
            if (e.key === "Escape") {
                setCheatOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!isLoaded) {
        return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Kargatzen...</div>;
    }

    const handleCloseBattle = () => {
        if (selectedUnit) {
            const updated = units.find(u => u.id === selectedUnit.id);
            setSelectedUnit(updated || null);
        }
        if (selectedEnemyUnit) {
            const updated = units.find(u => u.id === selectedEnemyUnit.id);
            setSelectedEnemyUnit(updated || null);
        }
        setShowBattle(false);
    };

    const cancelFoundCity = () => {
        setShowFoundCityView(false);
        setKolonoToFoundCity(null);
    };


    const handleUnitDeath = (unitId: string) => {
        setUnits(prev => prev.filter(u => u.id !== unitId));
        checkVictoryOrDefeat();
    };

    const handleUnitHealthChange = (unitId: string, newHealth: number) => {
        setUnits(prev =>
            prev.map(u => u.id === unitId ? { ...u, health: newHealth } : u)
        );
    };

    return (
        <>
            {typeof message === "string" && message.length > 0 && (
                <div className="game-message" onClick={() => setMessage("")}>
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
                            <span className="resource-value">{sideResources.gold}</span>
                        </div>
                        <div className="resource">
                            <img src="/images/resources/janaria.png" alt="Janaria" className="resource-icon" />
                            <span className="resource-name">Janaria:</span>
                            <span className="resource-value">{sideResources.food}</span>
                        </div>
                        <div className="resource">
                            <img src="/images/resources/kultura.png" alt="Kultura" className="resource-icon" />
                            <span className="resource-name">Kultura:</span>
                            <span className="resource-value">{sideResources.culture}</span>
                        </div>
                        <div className="resource">
                            <img src="/images/resources/baliabide_naturalak.png" alt="Baliabide Naturalak" className="resource-icon" />
                            <span className="resource-name">Baliabide Naturalak:</span>
                            <span className="resource-value">{sideResources.natural_resources}</span>
                        </div>
                        <div className="resource">
                            <img src="/images/resources/zientzia.png" alt="Zientzia" className="resource-icon" />
                            <span className="resource-name">Zientzia:</span>
                            <span className="resource-value">{sideResources.science}</span>
                        </div>
                    </div>
                    <div className="ui-top-right">
                        <span>Jokalaria: {currentSide === 'player' ? 'Player' : 'AI'}</span>
                    </div>
                </div>
                <div className="ui-main">
                    <div className="ui-left">
                        <MiniMap />
                        <div className="player-info-block">
                            <div style={{ marginBottom: 8 }}>
                                <b>Era:</b> {sideEra}
                            </div>
                            <div style={{ marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <img
                                    src={`/images/civilizations/${sideCivilization}.png`}
                                    alt={sideCivilization}
                                    style={{ width: 128, height: 148, borderRadius: "50%", border: "2px solid #ccc" }}
                                />
                                <span style={{ fontWeight: 500, fontSize: "1.2em", marginTop: 8 }}>{sideCivilization}</span>
                            </div>
                            <div>
                                <b>Teknologiak:</b> {sideUnlockedTechs.length} / {TECHS.length}
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
                    {isPlayerTurn && (
                        <button onClick={() => setShowTechTree(true)}>Teknologia zuhaitza</button>
                    )}
                    <button onClick={handleSaveAndMenu} disabled={saving} style={{ marginLeft: 8 }}>
                        {saving ? "Gordetzen..." : "Gorde eta itzuli menura"}
                    </button>
                    {saveError && <span style={{ color: "red", marginLeft: 8 }}>{saveError}</span>}
                </div>
            </div>
            {showBattle && selectedUnit && selectedEnemyUnit && (
                <BattleView
                    attacker={selectedUnit}
                    defender={selectedEnemyUnit}
                    mode={battleMode}
                    onClose={handleCloseBattle}
                    onUnitDeath={handleUnitDeath}
                    onUnitHealthChange={handleUnitHealthChange}
                />
            )}

            {
                showFoundCityView && kolonoToFoundCity && (
                    <FoundCityView
                        onConfirm={(cityName: string) => {
                            confirmFoundCity(
                                cityName,
                                kolonoToFoundCity.position,
                                kolonoToFoundCity.owner,
                                kolonoToFoundCity.id,
                                playerEra
                            );
                            cancelFoundCity();
                        }}
                        onCancel={cancelFoundCity}
                    />
                )
            }

            {/* MODAL DE VICTORIA/DERROTA */}
            {gameStatus === "victory" && victoryType === "science" && (
                <div className="victory-modal">
                    <div className="victory-content science-victory animate-pop">
                        <h1>🚀 GARAIPEN ZIENTIFIKOA</h1>
                        <p className="victory-desc">
                            <b>Espaziontzia</b> lortu duzu eta espaziora zoaz!<br />
                            <span style={{ fontSize: "2.5em" }}>🌌🛰️✨</span>
                        </p>
                        <div className="science-rocket"></div>
                        <button onClick={() => navigate("/main-menu")}>Menura itzuli</button>
                    </div>
                </div>
            )}
            {gameStatus === "victory" && victoryType === "culture" && (
                <div className="victory-modal">
                    <div className="victory-content culture-victory animate-pop">
                        <h1>🎨 GARAIPEN KULTURALA</h1>
                        <p className="victory-desc">
                            ¡Zure zibilizazioak <b>10000 kultura</b> lortu du eta mundu guztiak miresten du!<br />
                            <span style={{ fontSize: "2.5em" }}>🎭📚🎶</span>
                        </p>
                        <div className="culture-fireworks"></div>
                        <button onClick={() => navigate("/main-menu")}>Menura itzuli</button>
                    </div>
                </div>
            )}
            {gameStatus === "victory" && victoryType === "conquest" && (
                <div className="victory-modal">
                    <div className="victory-content conquest-victory animate-pop">
                        <h1>⚔️ GARAIPEN MILITARRA</h1>
                        <p className="victory-desc">
                            Etsai guztiak garaitu dituzu<br />
                            <span style={{ fontSize: "2.5em" }}>🏰🔥🏹</span>
                        </p>
                        <div className="conquest-swords"></div>
                        <button onClick={() => navigate("/main-menu")}>Menura itzuli</button>
                    </div>
                </div>
            )}
            {gameStatus === "defeat" && (
                <div className="victory-modal">
                    <div className="defeat-content animate-pop">
                        <h1>💀 DERROTA</h1>
                        <p className="victory-desc">
                            Zure zibilizazioak galdu egin du.<br />
                            <span style={{ fontSize: "2.5em" }}>☠️</span>
                        </p>
                        <button onClick={() => navigate("/main-menu")}>Menura itzuli</button>
                    </div>
                </div>
            )}
            <CheatConsoleModal open={cheatOpen} onClose={() => setCheatOpen(false)} />
        </>
    );
};

export default GameUI;