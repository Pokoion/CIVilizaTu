import React, { useState } from "react";
import "../../styles/TechTreeView.css";
import { TECHS } from "../../utils/Constants";
import { useGame } from "../../context/GameContext";

const TechTreeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedTech, setSelectedTech] = useState<(typeof TECHS)[0] | null>(
    null
  );
  const { unlockedTechs } = useGame();

  // Calcular el tamaño dinámico del canvas
  const CANVAS_WIDTH = Math.max(...TECHS.map((tech) => tech.x)) + 300;
  const CANVAS_HEIGHT = Math.max(...TECHS.map((tech) => tech.y)) + 300;

  return (
    <div className="tech-tree-overlay">
      <div className="tech-tree-content">
        <h2 className="tech-tree-title">Teknologia Zuhaitza</h2>
        <div className="tech-tree-canvas">
          <svg
            className="tech-tree-svg"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          >
            {/* Dibujar conexiones entre tecnologías */}
            {TECHS.map((tech) =>
              tech.parents.map((parentId: string) => {
                const parent = TECHS.find((t) => t.id === parentId);
                if (!parent) return null;
                const isUnlocked = unlockedTechs.includes(parentId);
                return (
                  <line
                    key={`${tech.id}-${parentId}`}
                    x1={parent.x + 70}
                    y1={parent.y + 40}
                    x2={tech.x}
                    y2={tech.y + 40}
                    stroke={isUnlocked ? "#3182ce" : "#ccc"}
                    strokeWidth={3}
                    markerEnd={`url(#${isUnlocked ? "arrowhead-unlocked" : "arrowhead-locked"
                      })`}
                  />
                );
              })
            )}
            <defs>
              <marker
                id="arrowhead-unlocked"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#3182ce" />
              </marker>
              <marker
                id="arrowhead-locked"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ccc" />
              </marker>
            </defs>
          </svg>
          {/* Dibujar nodos de tecnologías */}
          {TECHS.map((tech) => (
            <div
              key={tech.id}
              className={`tech-node ${unlockedTechs.includes(tech.id) ? "unlocked" : "locked"
                }`}
              style={{
                left: tech.x,
                top: tech.y,
              }}
              onClick={() => setSelectedTech(tech)}
            >
              <img
                src={`/images/techs/${tech.id}.png`}
                alt={tech.name}
                className="tech-node-img"
              />
              <div className="tech-node-name">{tech.name}</div>
              <div className="tech-node-era">{tech.era}</div>
            </div>
          ))}
        </div>
        <button className="tech-tree-close-btn" onClick={onClose}>
          Itxi
        </button>
        {selectedTech && (
          <TechDetailView
            tech={selectedTech}
            onClose={() => setSelectedTech(null)}
          />
        )}
      </div>
    </div>
  );
};

// Helper para comparar eras
const ERA_ORDER = ["Antzinaroa", "Erdi Aroa", "Aro Modernoa"] as const;
type EraType = (typeof ERA_ORDER)[number];
function eraIndex(era: string): number {
  return ERA_ORDER.indexOf(era as EraType);
}

const TechDetailView: React.FC<{
  tech: (typeof TECHS)[0];
  onClose: () => void;
}> = ({ tech, onClose }) => {
  const {
    unlockedTechs,
    setUnlockedTechs,
    playerEra,
    resources,
    setResources,
    setPlayerEra,
    setUnits,
    checkVictoryOrDefeat
  } = useGame();
  const parentTechs = tech.parents
    .map((pid: string) => TECHS.find((t) => t.id === pid))
    .filter(Boolean);

  // Verificar si la tecnología está desbloqueada
  const isUnlocked = unlockedTechs.includes(tech.id);

  // NUEVO: Verificación especial para espaziontzia
  const isSpaceship = tech.id === "espaziontzia";

  // NUEVO: Comprobar si todas las demás tecnologías están desbloqueadas
  const otherTechs = TECHS.filter(t => t.id !== "espaziontzia");
  const allOtherTechsUnlocked = otherTechs.every(t => unlockedTechs.includes(t.id));

  // Verificar si todas las tecnologías padres están desbloqueadas
  // MODIFICADO: Añadir condición especial para espaziontzia
  const canUnlock = parentTechs.every((parent) =>
    unlockedTechs.includes(parent!.id)
  ) && (!isSpaceship || allOtherTechsUnlocked);

  // Permitir aprender tecnologías de la era actual o anteriores
  const isEraAllowed = eraIndex(tech.era) <= eraIndex(playerEra);

  // Verificar si el jugador tiene suficientes puntos de ciencia
  const hasEnoughScience = resources.science >= tech.cost.science;

  const handleUnlock = () => {
    if (canUnlock && isEraAllowed && hasEnoughScience && !isUnlocked) {
      // Reducir los puntos de ciencia gastados
      setResources((prev) => ({
        ...prev,
        science: prev.science - tech.cost.science,
        // Si la tecnología es nekazaritza, sumamos 100 de comida
        ...(tech.id === "nekazaritza" ? { food: prev.food + 100 } : {}),
      }));

      // Si la tecnología es penizilina, +30 vida a todas las unidades existentes
      if (tech.id === "penizilina") {
        setUnits((prev) =>
          prev.map((u) => ({
            ...u,
            health: (u.health ?? 100) + 30,
          }))
        );
      }

      if (tech.id === "artilleria") {
        setUnits(prev =>
          prev.map(u => ({
            ...u,
            strength: (u.strength ?? 0) + 10,
          }))
        );
      }

      if (tech.id === "burdina") {
        setUnits(prev =>
          prev.map(u => ({
            ...u,
            strength: (u.strength ?? 0) + 5,
          }))
        );
      }

      if (tech.id === "gurpila") {
        setUnits(prev =>
          prev.map(u => ({
            ...u,
            movement_points: (u.movement_points ?? 1) + 3,
            movement_points_left: (u.movement_points_left ?? u.movement_points ?? 1) + 3,
          }))
        );
      }

      setUnlockedTechs((prev) => {
        const newUnlocked = [...prev, tech.id];

        // Cambiar de era según el número de tecnologías desbloqueadas
        if (newUnlocked.length === 5) {
          setPlayerEra("Erdi Aroa");
        } else if (newUnlocked.length === 10) {
          setPlayerEra("Aro Modernoa");
        }

        return newUnlocked;
      });

    }
  };

  return (
    <div className="tech-detail-overlay">
      <div className="tech-detail-content">
        <button className="tech-detail-close-btn" onClick={onClose}>
          X
        </button>
        <img
          src={`/images/techs/${tech.id}.png`}
          alt={tech.name}
          className="tech-detail-img"
        />
        <h3 className="tech-detail-title">{tech.name}</h3>
        <div className="tech-detail-era">{tech.era}</div>
        <div className="tech-detail-desc">{tech.description}</div>
        <div className="tech-detail-cost">
          <b>Kostua:</b>
          <ul>
            <li>Zientzia: {tech.cost.science}</li>
          </ul>
        </div>
        {parentTechs.length > 0 && (
          <div className="tech-detail-req">
            <b>Beharrezkoa:</b>
            <ul>
              {parentTechs.map((parent) => (
                <li key={parent!.id}>{parent!.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* NUEVO: Mostrar requisito especial para Espaziontzia */}
        {isSpaceship && (
          <div className="tech-detail-special-req">
            <b>Baldintza berezia:</b> Teknologia guztiak desblokeatuta behar dira
          </div>
        )}

        {/* Mostrar el botón de desbloquear solo si no está desbloqueada, se cumplen las condiciones y es de la era actual o anterior */}
        {!isUnlocked && canUnlock && isEraAllowed && hasEnoughScience && (
          <button className="tech-detail-learn-btn" onClick={handleUnlock}>
            Ikasi Teknologia
          </button>
        )}

        {/* NUEVO: Mostrar mensaje específico si es espaziontzia y faltan tecnologías */}
        {!isUnlocked && isSpaceship && !allOtherTechsUnlocked && (
          <div className="tech-detail-era-warning">
            <b>Ezinezkoa:</b> Teknologia guztiak desblokeatu behar dituzu espaziontzia eraiki aurretik.
          </div>
        )}

        {/* Mostrar un mensaje si la tecnología es de una era futura */}
        {!isUnlocked && canUnlock && !isEraAllowed && (
          <div className="tech-detail-era-warning">
            <b>Ezinezkoa:</b> Ezin duzu etorkizuneko aro bateko teknologia
            ikasi.
          </div>
        )}
        {/* Mostrar un mensaje si no hay suficientes puntos de ciencia */}
        {!isUnlocked && canUnlock && isEraAllowed && !hasEnoughScience && (
          <div className="tech-detail-era-warning">
            <b>Ezinezkoa:</b> Ez duzu nahikoa zientzia puntu teknologia hau
            ikasteko.
          </div>
        )}
      </div>
    </div>
  );
};

export default TechTreeView;