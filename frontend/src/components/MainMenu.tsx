import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainMenu.css';
import { createGame } from '../services/gameService';

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

const scenario = { id: "debug-scenario", name: "Debug Eszenatokia" };

const difficulties = [
  { id: "easy", name: "Erraza" },
  { id: "normal", name: "Normala" },
  { id: "hard", name: "Zaila" }
];

const defaultLeaderNames: Record<string, string> = {
  euskaldunak: "Sabino arana",
  mongolak: "Gengis Kan",
  mayak: "Halach Uinic",
  bizantziarrak: "Justiniano"
};

const getSavedGames = () => {
  // Simulación: puedes cambiar esto por una petición real a backend o localStorage
  const saved = localStorage.getItem('savedGames');
  if (saved) return JSON.parse(saved);
  // Ejemplo de estructura de partida guardada
  return [
    {
      id: '1',
      name: 'Partida 1',
      date: '2025-05-13 18:00',
      civilization: 'euskaldunak',
      aiCivilization: 'mongolak',
      leader_name: 'Sabino arana',
      ai_leader_name: 'Gengis Kan',
      difficulty: 'normal',
      map_size: { width: 50, height: 50 }
    }
  ];
};

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [gameName, setGameName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [aiName, setAiName] = useState("");
  const [playerCiv, setPlayerCiv] = useState(civilizations[0].id);
  const [aiCiv, setAiCiv] = useState(civilizations[1].id);
  const [difficulty, setDifficulty] = useState(difficulties[1].id);
  const [error, setError] = useState<string | null>(null);
  const [savedGames, setSavedGames] = useState<any[]>([]);

  // Info de civilización seleccionada
  const playerCivInfo = civilizations.find(c => c.id === playerCiv)!;
  const aiCivInfo = civilizations.find(c => c.id === aiCiv)!;

  useEffect(() => {
    if (showLoad) {
      setSavedGames(getSavedGames());
    }
  }, [showLoad]);

  const handleStartSetup = () => {
    setShowSetup(true);
    setShowLoad(false);
  };

  const handleShowLoad = () => {
    setShowLoad(true);
    setShowSetup(false);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!gameName.trim()) {
      setError("Idatzi partidaren izena.");
      return;
    }
    if (!playerName.trim()) {
      setError("Idatzi zure lider izena.");
      return;
    }
    if (!aiName.trim()) {
      setError("Idatzi AI-ren lider izena.");
      return;
    }
    if (playerCiv === aiCiv) {
      setError("Ezin dira bi aldeek zibilizazio berdina aukeratu.");
      return;
    }

    try {
      const result = await createGame({
        name: gameName,
        scenario_id: scenario.id,
        playerCiv,
        aiCiv,
        playerName,
        aiName,
        difficulty,
        map_size: { width: 50, height: 50 },
      });
      console.log("Partida sortu da:", result);
      // No redirigir todavía
    } catch (err: any) {
      console.error("Errorea partida sortzean:", err?.response?.data || err.message);
      setError("Errorea partida sortzean.");
    }
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
              Zailtasuna:
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mainmenu-input">
                {difficulties.map(dif => (
                  <option key={dif.id} value={dif.id}>{dif.name}</option>
                ))}
              </select>
            </label>
            <label>
              Eszenatokia:
              <input type="text" value={scenario.name} disabled className="mainmenu-input" />
            </label>
            <label>
              Mapa tamaina:
              <input type="text" value="50 x 50" disabled className="mainmenu-input" />
            </label>
            <button type="submit" className="main-menu-btn">Hasi Partida</button>
            <button type="button" className="main-menu-btn secondary" onClick={() => setShowSetup(false)}>Atzera</button>
          </form>
        )}

        {showLoad && (
          <div className="load-game-container">
            <h2>Kargatu Partida</h2>
            {savedGames.length === 0 ? (
              <div style={{ color: "#ffd700", margin: "1rem" }}>Ez dago partida gordetarik.</div>
            ) : (
              <ul className="saved-games-list">
                {savedGames.map(game => (
                  <li key={game.id} className="saved-game-item">
                    <div>
                      <strong>{game.name}</strong> <span style={{ color: "#ffd700" }}>({game.date})</span>
                      <br />
                      <span style={{ fontSize: "0.95em" }}>
                        {game.leader_name} ({game.civilization}) vs {game.ai_leader_name} ({game.aiCivilization})<br />
                        Zailtasuna: {game.difficulty}, Mapa: {game.map_size.width}x{game.map_size.height}
                      </span>
                    </div>
                    <button
                      className="main-menu-btn"
                      style={{ margin: 0, padding: "8px 18px", fontSize: "1rem" }}
                      onClick={() => {
                        navigate('/game', { state: { ...game, loaded: true } });
                      }}
                    >
                      Kargatu
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="main-menu-btn secondary" onClick={() => setShowLoad(false)}>Atzera</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;