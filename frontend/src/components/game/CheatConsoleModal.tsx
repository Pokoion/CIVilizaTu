import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { BUILDINGS, TECHS } from "../../utils/Constants";
import "../../styles/CheatConsoleModal.css";

const CHEAT_CODES = [
    {
        code: "eraiki_guztiak",
        action: (ctx: any) => {
            if (!ctx.selectedCity) {
                ctx.setMessage("❌ Aukeratu hiri bat lehenik!");
                return false;
            }
            ctx.setCities((prev: any) =>
                prev.map((city: any) =>
                    city.id === ctx.selectedCity.id
                        ? { ...city, buildings: BUILDINGS.map((b: any) => b.id) }
                        : city
                )
            );
            ctx.setMessage("🏛️ Eraikin guztiak eraiki dira aukeratutako hirian!");
            return true;
        }
    },
    {
        code: "berehalako_porrota",
        action: (ctx: any) => {
            ctx.setGameStatus("defeat");
            ctx.setVictoryType(null);
            ctx.setMessage("💀 Berehalako porrota!");
            return true;
        }
    },
    {
        code: "berehalako_garaipena",
        action: (ctx: any, arg?: string) => {
            let type: "science" | "culture" | "conquest" = "conquest";
            if (arg === "1") type = "science";
            if (arg === "2") type = "culture";
            ctx.setGameStatus("victory");
            ctx.setVictoryType(type);
            ctx.setMessage(`🏆 Berehalako garaipena (${type})!`);
            return true;
        }
    },
    {
        code: "tanke_eskuadroia",
        action: (ctx: any) => {
            if (!ctx.selectedCity) {
                ctx.setMessage("❌ Aukeratu hiri bat lehenik!");
                return false;
            }
            ctx.setCities((prev: any) =>
                prev.map((city: any) =>
                    city.id === ctx.selectedCity.id
                        ? {
                            ...city,
                            training: [
                                ...(Array.isArray(city.training) ? city.training : []),
                                ...Array.from({ length: 5 }).map((_, i) => ({
                                    id: `cheat-tank-training-${city.id}-${Date.now()}-${i}`,
                                    type: "tankea",
                                    turnsLeft: 0
                                }))
                            ]
                        }
                        : city
                )
            );
            ctx.setMessage("🛡️ 5 tanke gehitu dira hiriko kuartelean (produkzioan)!");
            return true;
        }
    },
    {
        code: "teknologia_aurreratua",
        action: (ctx: any, arg?: string) => {
            let target = "player";
            if (arg === "1") target = "ai";
            const unlockedTechs = target === "player" ? ctx.unlockedTechs : ctx.aiUnlockedTechs;
            const setUnlockedTechs = target === "player" ? ctx.setUnlockedTechs : ctx.setAiUnlockedTechs;

            const techsToUnlock = TECHS
                .map(t => t.id)
                .filter(id => id !== "espaziontzia" && !unlockedTechs.includes(id));
            if (techsToUnlock.length === 0) {
                ctx.setMessage(
                    target === "player"
                        ? "Teknologia guztiak badituzu jada (espaziontzia izan ezik)!"
                        : "AI-ak teknologia guztiak baditu jada (espaziontzia izan ezik)!"
                );
                return false;
            }
            setUnlockedTechs((prev: any) => [...prev, ...techsToUnlock]);
            ctx.setMessage(
                target === "player"
                    ? "🔬 Zure zibilizazioak teknologia guztiak ikasi ditu (espaziontzia izan ezik)!"
                    : "🤖 AI-ak teknologia guztiak ikasi ditu (espaziontzia izan ezik)!"
            );
            return true;
        }
    },
    {
        code: "maila_igo",
        action: (ctx: any) => {
            if (!ctx.selectedCity) {
                ctx.setMessage("❌ Aukeratu hiri bat lehenik!");
                return false;
            }
            ctx.setCities((prev: any) =>
                prev.map((city: any) => {
                    if (city.id !== ctx.selectedCity.id) return city;
                    let nextEra = city.era;
                    if (city.era === "Antzinaroa") nextEra = "Erdi Aroa";
                    else if (city.era === "Erdi Aroa") nextEra = "Aro Modernoa";
                    else if (city.era === "Aro Modernoa") nextEra = "Aro Modernoa";
                    return { ...city, era: nextEra };
                })
            );
            ctx.setMessage("🏰 Hiriko aroa igo da!");
            return true;
        }
    },
    {
        code: "baliabide_maximoak",
        action: (ctx: any, arg?: string) => {
            // 0 = player (por defecto), 1 = ai
            let target = "player";
            if (arg === "1") target = "ai";
            if (target === "player") {
                ctx.setResources((r: any) => ({
                    ...r,
                    food: 9999,
                    gold: 9999,
                    culture: 5000,
                    science: 9999,
                    natural_resources: 9999
                }));
                ctx.setMessage("💰 Zure baliabide guztiak maximoan!");
            } else if (target === "ai") {
                if (!ctx.setAiResources) {
                    ctx.setMessage("❌ AI baliabideak ezin dira aldatu!");
                    return false;
                }
                ctx.setAiResources((r: any) => ({
                    ...r,
                    food: 9999,
                    gold: 9999,
                    culture: 9999,
                    science: 9999,
                    natural_resources: 9999
                }));
                ctx.setMessage("💰 AI-ren baliabide guztiak maximoan!");
            }
            return true;
        }
    },
    {
        code: "mugimendu_infinitua",
        action: (ctx: any, arg?: string) => {
            let target = "player";
            if (arg === "1") target = "ai";
            ctx.setUnits((prev: any) =>
                prev.map((u: any) =>
                    (target === "player" && u.owner === "player") || (target === "ai" && u.owner === "ai")
                        ? {
                            ...u,
                            movement_points: 9999,
                            movement_points_left: 9999
                        }
                        : u
                )
            );
            ctx.setMessage(
                target === "player"
                    ? "🏃‍♂️ Zure unitate guztiek mugimendu infinitua dute!"
                    : "🏃‍♂️ AI-ren unitate guztiek mugimendu infinitua dute!"
            );
            return true;
        }
    },
    {
        code: "aro_modernoa",
        action: (ctx: any, arg?: string) => {
            let target = "player";
            if (arg === "1") target = "ai";
            if (target === "player") {
                ctx.setPlayerEra("Aro Modernoa");
                ctx.setMessage("⏩ Zure aroa Aro Modernoan jarri da!");
            } else {
                ctx.setAiEra("Aro Modernoa");
                ctx.setMessage("⏩ AI-ren aroa Aro Modernoan jarri da!");
            }
            return true;
        }
    },
    {
        code: "mapa_agertu",
        action: (ctx: any, arg?: string) => {
            // 0 = player (por defecto), 1 = ai
            let target = "player";
            if (arg === "1") target = "ai";
            ctx.setMapState((prev: any) => {
                if (!prev.tiles) return prev;
                const height = prev.tiles.length;
                const width = prev.tiles[0]?.length || 0;
                // El fog correcto según el target
                if (target === "player") {
                    const fog_of_war_player = Array.from({ length: height }, () =>
                        Array.from({ length: width }, () => true)
                    );
                    return { ...prev, fog_of_war_player };
                } else {
                    const fog_of_war_ai = Array.from({ length: height }, () =>
                        Array.from({ length: width }, () => true)
                    );
                    return { ...prev, fog_of_war_ai };
                }
            });
            ctx.setMessage(
                target === "player"
                    ? "🌍 Mapa osoa agerrarazi da (PLAYER)!"
                    : "🌍 Mapa osoa agerrarazi da (AI)!"
            );
            return true;
        }
    },
];

interface CheatConsoleModalProps {
    open: boolean;
    onClose: () => void;
}

const CheatConsoleModal: React.FC<CheatConsoleModalProps> = ({ open, onClose }) => {
    const [cheatInput, setCheatInput] = useState("");
    const ctx = useGame();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    const handleCheatInput = (e: React.FormEvent) => {
        e.preventDefault();
        const [cmd, arg] = cheatInput.trim().toLowerCase().split(" ");
        const cheat = CHEAT_CODES.find(c => c.code === cmd);
        if (cheat) {
            const result = cheat.action(ctx, arg);
            if (result) ctx.setCheatsUsed((prev: string[]) => [...prev, cmd]);
        } else {
            ctx.setMessage("Cheat ezezaguna.");
        }
        setCheatInput("");
        onClose();
    };

    if (!open) return null;

    return (
        <div className="cheat-console-backdrop" onClick={onClose}>
            <form
                className="cheat-console-modal"
                onSubmit={handleCheatInput}
                onClick={e => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    tabIndex={0}
                // ...styles...
                >
                    ×
                </button>
                <span>CHEAT CONSOLE</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={cheatInput}
                    onChange={e => setCheatInput(e.target.value)}
                    placeholder="Idatzi cheat code bat..."
                />
                <button type="submit">OK</button>
                <span className="hint">(ESC sakatu edo kanpoan itzuli isteko)</span>
            </form>
        </div>
    );
};

export default CheatConsoleModal;