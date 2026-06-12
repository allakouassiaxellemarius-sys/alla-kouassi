import { useState, useEffect, useCallback } from "react";
import "./SplashScreen.css";
import { playSound } from "../utils/sound";

const sequence = [
  { status: "Initialisation", text: "Connexion à l'arène. Vérification des équipes. Chargement du mode compétition.", score: "0 — 0", badge: "Boot sequence" },
  { status: "Présentation", text: "Bienvenue sur Compete.gg. Les joueurs entrent dans l'arène eFootball.", score: "1 — 0", badge: "Match intro" },
  { status: "Montée en tension", text: "Les formations sont prêtes. Le duel commence. La pression monte sur le terrain.", score: "2 — 1", badge: "Live action" },
  { status: "Call to action", text: "Rejoignez un tournoi, créez votre équipe et suivez vos matchs en temps réel.", score: "3 — 2", badge: "Prêt à jouer" },
];

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [index, setIndex] = useState(2);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % sequence.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { playSound("efootball"); }, []);

  const handleEnter = useCallback(() => {
    if (entered) return;
    setEntered(true);
    setFadeOut(true);
    setTimeout(onFinish, 600);
  }, [entered, onFinish]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") handleEnter();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleEnter]);

  const current = sequence[index];

  return (
    <div className={`ss-page${fadeOut ? " fade-out" : ""}`}>
      <header className="ss-topbar">
        <div className="ss-brand">
          <div className="ss-brand-badge">GG</div>
          <div className="ss-brand-text">
            <strong>Compete.gg</strong>
            <span>Plateforme tournois eFootball</span>
          </div>
        </div>
        <div className="ss-top-actions">
          <button className="ss-pill" onClick={handleEnter}>Passer l'intro</button>
        </div>
      </header>

      <div className="ss-hero">
        <div className="ss-copy">
          <div className="ss-eyebrow">Mode ouverture tournoi</div>
          <h1 className="ss-h1">
            Entrez dans
            <span className="ss-accent"> la compétition</span>
          </h1>
          <p className="ss-lead">
            Bienvenue sur Compete.gg. Créez votre équipe, inscrivez-vous aux tournois eFootball,
            jouez vos matchs et suivez vos résultats en temps réel.
          </p>
          <div className="ss-cta-row">
            <button className="ss-btn ss-btn-primary" onClick={handleEnter}>
              ▶ Entrer sur la plateforme
            </button>
            <button className="ss-btn ss-btn-secondary" onClick={async () => {
              try {
                if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                else await document.exitFullscreen();
              } catch { /* plein écran non disponible */ }
            }}>
              ⛶ Plein écran
            </button>
          </div>
        </div>

        <div className="ss-stage">
          <div className="ss-screen">
            <div className="ss-arena">
              <div className="ss-pitch">
                <div className="ss-lane" />
                <div className="ss-lane" />
                <div className="ss-lane" />
                <div className="ss-lane" />
                <div className="ss-ball" />
                <div className="ss-pulse-ring" />
                <div className="ss-player a ss-p1" />
                <div className="ss-player a ss-p2" />
                <div className="ss-player a ss-p3" />
                <div className="ss-player b ss-p4" />
                <div className="ss-player b ss-p5" />
                <div className="ss-player b ss-p6" />
              </div>
            </div>
            <div className="ss-hud">
              <div className="ss-hud-top">
                <div className="ss-scoreboard">
                  <div className="ss-team">
                    <span className="ss-dot" style={{ background: "#00e7ff" }} />
                    <span>Alpha</span>
                  </div>
                  <div className="ss-score">{current.score}</div>
                  <div className="ss-team">
                    <span className="ss-dot" style={{ background: "#c8ff00" }} />
                    <span>Omega</span>
                  </div>
                </div>
                <div className="ss-tag">
                  Statut : <strong>{current.status}</strong>
                </div>
              </div>
              <div className="ss-hud-bottom">
                <div className="ss-ticker">
                  <small>Flux tournoi</small>
                  <span>{current.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ss-bottom-bar">
        <div className="ss-marquee">
          <div className="ss-marquee-track">
            <span><strong>Compete.gg</strong> — Tournois eFootball — Matchs en direct — Équipes — Classements — Dashboard joueur — Organisateur —</span>
            <span><strong>Compete.gg</strong> — Tournois eFootball — Matchs en direct — Équipes — Classements — Dashboard joueur — Organisateur —</span>
          </div>
        </div>
        <div className="ss-status-panel">
          <div>
            <strong>Plateforme eFootball</strong>
            <span>Créez, participez et suivez vos compétitions en temps réel.</span>
          </div>
          <div className="ss-mini-badge">{current.badge}</div>
        </div>
      </div>
    </div>
  );
}
