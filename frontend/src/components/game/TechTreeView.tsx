import React, { useState } from 'react';
import '../../styles/TechTreeView.css';
import { TECHS } from '../../utils/Constants';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

const TechDetailView: React.FC<{
    tech: typeof TECHS[0];
    onClose: () => void;
  }> = ({ tech, onClose }) => {
    // Encuentra los nombres de los padres
    const parentTechs = tech.parents.map((pid: string) => TECHS.find(t => t.id === pid)).filter(Boolean);
  
    const handleUnlock = () => {
      // Aquí iría la lógica para desbloquear la tecnología
      alert(`Desbloqueado: ${tech.name}`);
      onClose();
    };
  
    return (
      <div className="tech-detail-overlay">
        <div className="tech-detail-content">
          <button className="tech-detail-close-btn" onClick={onClose}>X</button>
          <img src={tech.image} alt={tech.name} className="tech-detail-img" />
          <h3 className="tech-detail-title">{tech.name}</h3>
          <div className="tech-detail-era">{tech.era}</div>
          <div className="tech-detail-desc">{tech.description}</div>
          <div className="tech-detail-cost">
            <b>Beharrezkoa:</b>
            <ul>
              <li>Zientzia: {tech.cost?.science ?? '-'}</li>
              <li>Urrea: {tech.cost?.gold ?? '-'}</li>
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
          <button className="tech-detail-unlock-btn" onClick={handleUnlock}>
            Ikasi
          </button>
        </div>
      </div>
    );
  };

const TechTreeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedTech, setSelectedTech] = useState<typeof TECHS[0] | null>(null);

  return (
    <div className="tech-tree-overlay">
      <div className="tech-tree-content">
        <h2 className="tech-tree-title">Teknologia Zuhaitza</h2>
        <div
          className="tech-tree-canvas"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
        >
          {/* Flechas SVG */}
          <svg
            className="tech-tree-svg"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }}
          >
            {TECHS.map(tech =>
              tech.parents.map((parentId: string) => {
                const parent = TECHS.find(t => t.id === parentId);
                if (!parent) return null;
                return (
                  <line
                    key={tech.id + '-' + parentId}
                    x1={parent.x + 120}
                    y1={parent.y + 40}
                    x2={tech.x}
                    y2={tech.y + 40}
                    stroke="#3182ce"
                    strokeWidth={3}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })
            )}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3182ce" />
              </marker>
            </defs>
          </svg>
          {/* Nodos */}
          {TECHS.map(tech => (
            <div
              key={tech.id}
              className="tech-node"
              style={{
                left: tech.x,
                top: tech.y,
              }}
              title={tech.description}
              onClick={() => setSelectedTech(tech)}
            >
              <img src={tech.image} alt={tech.name} className="tech-node-img" />
              <div className="tech-node-name">{tech.name}</div>
              <div className="tech-node-desc">{tech.description}</div>
              <div className="tech-node-era tech-node-era-bottom">{tech.era}</div>
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

export default TechTreeView;