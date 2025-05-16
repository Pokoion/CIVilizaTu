import React from "react";
import { useGame } from "../../context/GameContext";
import "../../styles/AiLogConsole.css";

const AiLogConsole: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { aiLogs, clearAiLogs } = useGame();

  if (!open) return null;

  return (
    <div className="ai-log-console-backdrop">
      <div className="cheat-console-content" style={{ maxWidth: 700, maxHeight: 500, overflowY: "auto" }}>
        <h2>AI Log Console</h2>
        <button onClick={onClose} style={{ float: "right" }}>✖</button>
        <button onClick={clearAiLogs} style={{ float: "right", marginRight: 8 }}>Garbitu</button>
        <div style={{ clear: "both" }} />
        <div style={{ fontSize: 14 }}>
          {aiLogs.length === 0 && <div style={{ color: "#aaa" }}>Ez dago logik</div>}
          {aiLogs.map((log, idx) => (
            <div key={log.timestamp + "-" + idx} style={{ marginBottom: 12, borderBottom: "1px solid #333", paddingBottom: 8 }}>
              <div><b>Akzioa:</b> <pre style={{ display: "inline", color: "#ffd700" }}>{JSON.stringify(log.action, null, 2)}</pre></div>
              {log.reasoning && <div><b>Pentsamendua:</b> <span style={{ color: "#7fd" }}>{log.reasoning}</span></div>}
              {log.analysis && <div><b>Analisia:</b> <span style={{ color: "#7df" }}>{log.analysis}</span></div>}
              <div style={{ fontSize: 11, color: "#888" }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiLogConsole;