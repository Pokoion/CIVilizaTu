import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainMenu.css';
import { deleteGame, createGame, getSavedGames, getGameById } from '../services/gameService';

// Civilizaciones y escenarios desde GameInfo.json y carpeta de imágenes
const civilizations = [
  {
    id: "euskaldunak",
    name: "Euskaldunak",
    img: "/images/civilizations/euskaldunak.png",
    desc: "Defentsa sendoa eta gudari bereziak.",
    bonus: "Gudaria unitatea esklusiboa."
  },
  {
    id: "mongolak",
    name: "Mongolak",
    img: "/images/civilizations/mongolak.png",
    desc: "Mugikortasun handiko zaldunak. Lurraldeak azkar konkistatzeko aproposa.",
    bonus: "Arkari zalduna unitatea esklusiboa"
  },
  {
    id: "mayak",
    name: "Mayak",
    img: "/images/civilizations/mayak.png",
    desc: "Distantziako unitateetan indartsuak.",
    bonus: "Atlatl erabiltzailea unitatea esklusiboa."
  },
  {
    id: "bizantziarrak",
    name: "Bizantziarrak",
    img: "/images/civilizations/bizantziarrak.png",
    desc: "Suzko unitateetan espezialistak.",
    bonus: "Piromanoa unitatea esklusiboa."
  },
];

const defaultLeaderNames: Record<string, string> = {
  euskaldunak: "Sabino arana",
  mongolak: "Gengis Kan",
  mayak: "Halach Uinic",
  bizantziarrak: "Justiniano"
};

const mapTypes = [
  { id: 0, name: "Aurredefinitua" },
  { id: 1, name: "AA-k sortua (EZ DA GOMENDATZEN)" }
];

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [gameName, setGameName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [aiName, setAiName] = useState("");
  const [playerCiv, setPlayerCiv] = useState(civilizations[0].id);
  const [aiCiv, setAiCiv] = useState(civilizations[1].id);
  const [error, setError] = useState<string | null>(null);
  const [savedGames, setSavedGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [mapType, setMapType] = useState(1);

  // Info de civilización seleccionada
  const playerCivInfo = civilizations.find(c => c.id === playerCiv)!;
  const aiCivInfo = civilizations.find(c => c.id === aiCiv)!;

  const handleStartSetup = () => {
    setShowSetup(true);
    setShowLoad(false);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatingGame(true);

    // Validaciones...
    if (!gameName.trim()) {
      setError("Idatzi partidaren izena.");
      setCreatingGame(false);
      return;
    }
    if (!playerName.trim()) {
      setError("Idatzi zure lider izena.");
      setCreatingGame(false);
      return;
    }
    if (!aiName.trim()) {
      setError("Idatzi AI-ren lider izena.");
      setCreatingGame(false);
      return;
    }
    if (playerCiv === aiCiv) {
      setError("Ezin dira bi aldeek zibilizazio berdina aukeratu.");
      setCreatingGame(false);
      return;
    }

    try {
      const result = await createGame({
        name: gameName,
        scenario_id: mapTypes.find(mt => mt.id === mapType)?.name || "Aurredefinitua",
        playerCiv,
        aiCiv,
        playerName,
        aiName,
        map_size: { width: 50, height: 50 },
        map_type: mapType,
      });
      navigate('/game', { state: { partida: result, loaded: true } });
    } catch (err: any) {
      console.error("Errorea partida sortzean:", err?.response?.data || err.message);
      setError("Errorea partida sortzean. Saiatu berriro.");
    }
    setCreatingGame(false);
  };

  const handleDeleteGame = async (gameId: string) => {
    setPendingDeleteId(gameId);
  };

  const confirmDeleteGame = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteGame(pendingDeleteId);
      setSavedGames(games => games.filter(g => g.game_id !== pendingDeleteId));
    } catch (err) {
      alert("Errorea partida ezabatzean.");
    }
    setPendingDeleteId(null);
  };

  const cancelDeleteGame = () => {
    setPendingDeleteId(null);
  };

  const handleShowLoad = async () => {
    setShowLoad(true);
    setShowSetup(false);
    setLoadingGames(true);
    try {
      const games = await getSavedGames();
      setSavedGames(games);
    } catch (err) {
      setSavedGames([]);
    }
    setLoadingGames(false);
  };

  return (
    <div className="main-menu-bg">
      <div className="main-menu-glass">
        {!showSetup && !showLoad ? (
          <>
            <h1>Menu Nagusia</h1>
            <button className="main-menu-btn" onClick={handleStartSetup}>Partida Berria</button>
            <button className="main-menu-btn" onClick={handleShowLoad}>Partida Kargatu</button>
            <button className="main-menu-btn" onClick={() => {
              localStorage.removeItem('jwt_token');
              navigate('/login');
            }}>Irten</button>
          </>
        ) : null}

        {showSetup && (
          <form onSubmit={handleCreateGame} className="game-setup-form">
            <h2>Sortu Partida Berria</h2>
            {error && <div style={{ color: "#ffb3b3", fontWeight: "bold", marginBottom: 8 }}>{error}</div>}
            <label>
              Partidaren izena:
              <input
                type="text"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                placeholder="Adib: Nire partida"
                className="mainmenu-input"
                required
              />
            </label>
            <label>
              Zure izena (liderra):
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder={defaultLeaderNames[playerCiv]}
                className="mainmenu-input"
                required
              />
            </label>
            <div className="civilization-select">
              <span>Zure zibilizazioa:</span>
              <div className="civilization-list">
                {civilizations.map(civ => (
                  <label
                    key={civ.id}
                    className={`civ-card${playerCiv === civ.id ? ' selected' : ''}${aiCiv === civ.id ? ' disabled' : ''}`}
                    style={aiCiv === civ.id ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                  >
                    <input
                      type="radio"
                      name="player-civilization"
                      value={civ.id}
                      checked={playerCiv === civ.id}
                      onChange={() => setPlayerCiv(civ.id)}
                      disabled={aiCiv === civ.id}
                    />
                    <img src={civ.img} alt={civ.name} className="civ-img" />
                    <span>{civ.name}</span>
                  </label>
                ))}
              </div>
              <div className="civ-info">
                <strong>Info:</strong> {playerCivInfo.desc}
                <br />
                <span className="civ-bonus">{playerCivInfo.bonus}</span>
              </div>
            </div>
            <label>
              AI izena (liderra):
              <input
                type="text"
                value={aiName}
                onChange={e => setAiName(e.target.value)}
                placeholder={defaultLeaderNames[aiCiv]}
                className="mainmenu-input"
                required
              />
            </label>
            <div className="civilization-select">
              <span>AI zibilizazioa:</span>
              <div className="civilization-list">
                {civilizations.map(civ => (
                  <label
                    key={civ.id}
                    className={`civ-card${aiCiv === civ.id ? ' selected' : ''}${playerCiv === civ.id ? ' disabled' : ''}`}
                    style={playerCiv === civ.id ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                  >
                    <input
                      type="radio"
                      name="ai-civilization"
                      value={civ.id}
                      checked={aiCiv === civ.id}
                      onChange={() => setAiCiv(civ.id)}
                      disabled={playerCiv === civ.id}
                    />
                    <img src={civ.img} alt={civ.name} className="civ-img" />
                    <span>{civ.name}</span>
                  </label>
                ))}
              </div>
              <div className="civ-info">
                <strong>Info:</strong> {aiCivInfo.desc}
                <br />
                <span className="civ-bonus">{aiCivInfo.bonus}</span>
              </div>
            </div>
            <label>
              Mapa mota:
              <select
                value={mapType}
                onChange={e => setMapType(Number(e.target.value))}
                className="mainmenu-input"
              >
                {mapTypes.map(mt => (
                  <option key={mt.id} value={mt.id}>{mt.name}</option>
                ))}
              </select>
            </label>
            {creatingGame && (
              <div style={{ color: "#ffd700", fontWeight: "bold", marginTop: 12 }}>
                Partida sortzen... Itxaron mesedez.
              </div>
            )}
            {error && (
              <div
                style={{
                  color: "#ffb3b3",
                  fontWeight: "bold",
                  marginBottom: 8,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {error}
                <button
                  type="button"
                  className="main-menu-btn secondary"
                  style={{ marginLeft: 8, padding: "2px 10px", fontSize: "0.95em" }}
                  onClick={handleCreateGame}
                  disabled={creatingGame}
                >
                  Saiatu berriro
                </button>
              </div>
            )}
            <button type="submit" className="main-menu-btn" disabled={creatingGame}>
              {creatingGame ? "Kargatzen..." : "Hasi Partida"}
            </button>
            <button type="button" className="main-menu-btn secondary" onClick={() => setShowSetup(false)}>Atzera</button>
          </form>
        )}

        {showLoad && (
          <div className="load-game-container">
            <h2>Kargatu Partida</h2>
            {loadingGames ? (
              <div>Kargatzen...</div>
            ) : savedGames.length === 0 ? (
              <div style={{ color: "#ffd700", margin: "1rem" }}>Ez dago partidarik gordeta.</div>
            ) : (
              <div className="saved-games-list">
                {savedGames.map(game => (
                  <div key={game.game_id} className="saved-game-card">
                    <div>
                      <strong>{game.name}</strong>
                      <br />
                      <span style={{ fontSize: "0.95em" }}>
                        Eszenatokia: {game.scenario_id}<br />
                        Sortuta: {game.created_at?.slice(0, 19).replace('T', ' ')}
                        <br />
                        Azken aldaketa: {game.last_saved?.slice(0, 19).replace('T', ' ')}
                      </span>
                    </div>
                    <button
                      className="main-menu-btn"
                      style={{ marginTop: 8 }}
                      onClick={async () => {
                        try {
                          const partidaCompleta = await getGameById(game.game_id);
                          navigate('/game', { state: { partida: partidaCompleta, loaded: true } });
                        } catch (err) {
                          console.error("Errorea partida kargatzean:", err);
                          // Puedes mostrar un error al usuario aquí
                        }
                      }}
                    >
                      Kargatu
                    </button>
                    <button
                      className="main-menu-btn delete"
                      onClick={() => handleDeleteGame(game.game_id)}
                    >
                      Ezabatu
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button className="main-menu-btn secondary" onClick={() => setShowLoad(false)}>Atzera</button>
          </div>
        )}
      </div>
      {pendingDeleteId && (
        <div className="delete-confirm-dialog">
          <div className="delete-confirm-content">
            <p>Ziur zaude partida hau ezabatu nahi duzula?</p>
            <button className="main-menu-btn delete" onClick={confirmDeleteGame}>Bai, ezabatu</button>
            <button className="main-menu-btn secondary" onClick={cancelDeleteGame}>Ezabatu gabe utzi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;