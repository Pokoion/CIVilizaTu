import React, { useState } from 'react';
import '../../styles/TechTreeView.css';
import { TECHS } from '../../utils/Constants';
import { useGame } from '../../context/GameContext';

const TechTreeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedTech, setSelectedTech] = useState<typeof TECHS[0] | null>(null);
  const { unlockedTechs, playerEra, resources } = useGame(); // Obtener tecnologías desbloqueadas, era y recursos

  // Calcular el tamaño dinámico del canvas
  const CANVAS_WIDTH = Math.max(...TECHS.map(tech => tech.x)) + 300;
  const CANVAS_HEIGHT = Math.max(...TECHS.map(tech => tech.y)) + 300;

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
            {TECHS.map(tech =>
              tech.parents.map((parentId: string) => {
                const parent = TECHS.find((t) => t.id === parentId); // Buscar el objeto del padre
                if (!parent) return null; // Manejar el caso en que no se encuentre el padre
                const isUnlocked = unlockedTechs.includes(parentId); // Verificar si está desbloqueado
                return (
                  <line
                    key={`${tech.id}-${parentId}`}
                    x1={parent.x + 70}
                    y1={parent.y + 40}
                    x2={tech.x}
                    y2={tech.y + 40}
                    stroke={isUnlocked ? "#3182ce" : "#ccc"} // Línea desbloqueada o bloqueada
                    strokeWidth={3}
                    markerEnd={`url(#${isUnlocked ? "arrowhead-unlocked" : "arrowhead-locked"})`} // Marcador dinámico
                  />
                );
              })
            )}
            <defs>
              {/* Marcador para tecnologías desbloqueadas */}
              <marker id="arrowhead-unlocked" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3182ce" />
              </marker>
              {/* Marcador para tecnologías bloqueadas */}
              <marker id="arrowhead-locked" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ccc" />
              </marker>
            </defs>
          </svg>
          {/* Dibujar nodos de tecnologías */}
          {TECHS.map(tech => (
            <div
              key={tech.id}
              className={`tech-node ${unlockedTechs.includes(tech.id) ? 'unlocked' : 'locked'}`} // Clase según estado
              style={{
                left: tech.x,
                top: tech.y,
              }}
              onClick={() => setSelectedTech(tech)} // Evento para abrir el detalle
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
          <TechDetailView tech={selectedTech} onClose={() => setSelectedTech(null)} />
        )}
      </div>
    </div>
  );
};

const TechDetailView: React.FC<{
  tech: typeof TECHS[0];
  onClose: () => void;
}> = ({ tech, onClose }) => {
  const { unlockedTechs, setUnlockedTechs, playerEra, resources, setResources } = useGame(); // Obtener tecnologías desbloqueadas, era y recursos
  const parentTechs = tech.parents.map((pid: string) => TECHS.find(t => t.id === pid)).filter(Boolean);

  // Verificar si la tecnología está desbloqueada
  const isUnlocked = unlockedTechs.includes(tech.id);

  // Verificar si todas las tecnologías padres están desbloqueadas
  const canUnlock = parentTechs.every(parent => unlockedTechs.includes(parent!.id));

  // Verificar si la tecnología pertenece a la misma era que el jugador
  const isSameEra = tech.era === playerEra;

  // Verificar si el jugador tiene suficientes puntos de ciencia
  const hasEnoughScience = resources.science >= tech.cost.science;

  const handleUnlock = () => {
    if (canUnlock && isSameEra && hasEnoughScience) {
      // Restar los puntos de ciencia necesarios
      setResources(prev => ({
        ...prev,
        science: prev.science - tech.cost.science,
      }));

      // Desbloquear la tecnología
      setUnlockedTechs(prev => [...prev, tech.id]);
    }
  };

  return (
    <div className="tech-detail-overlay">
      <div className="tech-detail-content">
        <button className="tech-detail-close-btn" onClick={onClose}>X</button>
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
              {parentTechs.map(parent => (
                <li key={parent!.id}>{parent!.name}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Mostrar el botón de desbloquear solo si no está desbloqueada, se cumplen las condiciones y es de la misma era */}
        {!isUnlocked && canUnlock && isSameEra && hasEnoughScience && (
          <button className="tech-detail-learn-btn" onClick={handleUnlock}>
            Ikasi Teknologia
          </button>
        )}
        {/* Mostrar un mensaje si no está en la misma era */}
        {!isUnlocked && canUnlock && !isSameEra && (
          <div className="tech-detail-era-warning">
            <b>Ezinezkoa:</b> Aldatu {tech.era} erara teknologia hau ikasteko.
          </div>
        )}
        {/* Mostrar un mensaje si no hay suficientes puntos de ciencia */}
        {!isUnlocked && canUnlock && isSameEra && !hasEnoughScience && (
          <div className="tech-detail-era-warning">
            <b>Ezinezkoa:</b> Ez duzu nahikoa zientzia puntu teknologia hau ikasteko.
          </div>
        )}
      </div>
    </div>
  );
};

export default TechTreeView;