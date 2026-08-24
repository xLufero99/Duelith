import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================
// Mini reproductor de musica flotante.
// - Boton en la esquina inferior derecha, visible en toda la app
// - Loop; sin autoplay forzado: si el navegador bloquea la
//   reanudacion automatica, queda en pausa listo para clic
// - Persistencia del estado en localStorage
// ============================================================

const STORAGE_KEY = "duelith_musica_sonando";
const CANCION = "/music/song1.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(false);

  // Al montar: reanudar si el usuario dejo la musica activa en su ultima visita.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || localStorage.getItem(STORAGE_KEY) !== "on") return;
    audio
      .play()
      .then(() => setSonando(true))
      .catch(() => {
        // Autoplay bloqueado por politicas del navegador hasta haber interaccion.
        localStorage.setItem(STORAGE_KEY, "off");
      });
  }, []);

  const alternar = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (sonando) {
      audio.pause();
      localStorage.setItem(STORAGE_KEY, "off");
      setSonando(false);
    } else {
      audio
        .play()
        .then(() => {
          localStorage.setItem(STORAGE_KEY, "on");
          setSonando(true);
        })
        .catch(() => {
          setSonando(false);
          localStorage.setItem(STORAGE_KEY, "off");
        });
    }
  }, [sonando]);

  return (
    <>
      <audio ref={audioRef} src={CANCION} loop preload="none" />
      <button
        type="button"
        onClick={alternar}
        aria-label={sonando ? "Pausar música" : "Reproducir música"}
        aria-pressed={sonando}
        title={sonando ? "Pausar música" : "Reproducir música"}
        className={`music-fab${sonando ? " music-fab-activa" : ""}`}
      >
        {sonando ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </>
  );
}
