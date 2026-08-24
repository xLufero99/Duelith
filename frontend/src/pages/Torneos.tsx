import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import TorneoCard from "../components/TorneoCard";
import { listar } from "../api/torneoApi";
import type { EstadoTorneo, TorneoResponse } from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

const estados = ["Todos", "EN_REGISTRO", "EN_CURSO", "FINALIZADO", "CANCELADO"];
const juegos = ["Todos", "Valorant", "League of Legends", "CS2", "Fortnite", "DOTA 2"];

export default function Torneos() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [juegoFiltro, setJuegoFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const usuario = usuarioStorage.get<{ nombreUsuario: string; rol?: string }>();
  const autenticado = !!tokenStorage.get();
  const puedeGestionar = usuario?.rol === "ADMIN" || usuario?.rol === "ORGANIZADOR";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    listar({
      estado: estadoFiltro === "Todos" ? undefined : (estadoFiltro as EstadoTorneo),
      juego: juegoFiltro === "Todos" ? undefined : juegoFiltro,
    })
      .then(setTorneos)
      .catch((err: Error) => {
        if (err.name !== "CanceledError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [estadoFiltro, juegoFiltro]);

  const filtered = useMemo(
    () =>
      torneos.filter((t) =>
        t.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [torneos, busqueda],
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 6 }}>
              Torneos
            </h1>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              {loading ? "Cargando..." : `${filtered.length} torneo${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {autenticado && puedeGestionar && (
            <Link to="/admin" className="btn-primary" style={{ textDecoration: "none", fontSize: 14 }}>
              + Crear Torneo
            </Link>
          )}
        </div>

        {/* Filters */}
        <div
          className="glass-card"
          style={{
            borderRadius: 12,
            padding: "18px 24px",
            marginBottom: 32,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {/* Estado filter */}
            <div style={{ position: "relative" }}>
              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                style={{
                  background: "#1A1A2E",
                  border: "1px solid #334155",
                  color: estadoFiltro !== "Todos" ? "white" : "#64748B",
                  padding: "9px 36px 9px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                {estados.map((e) => (
                  <option key={e} value={e}>{e === "Todos" ? "Estado: Todos" : e.replace("_", " ")}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>▾</span>
            </div>

            {/* Juego filter */}
            <div style={{ position: "relative" }}>
              <select
                value={juegoFiltro}
                onChange={(e) => setJuegoFiltro(e.target.value)}
                style={{
                  background: "#1A1A2E",
                  border: "1px solid #334155",
                  color: juegoFiltro !== "Todos" ? "white" : "#64748B",
                  padding: "9px 36px 9px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                {juegos.map((j) => (
                  <option key={j} value={j}>{j === "Todos" ? "Juego: Todos" : j}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B", pointerEvents: "none" }}>▾</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B" }}>🔍</span>
            <input
              className="input-field"
              style={{ paddingLeft: 40 }}
              placeholder="Buscar torneo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="glass-card"
            style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 28, border: "1px solid rgba(239,68,68,0.35)" }}
          >
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          </div>
        )}

        {/* Grid */}
        {!error && filtered.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {filtered.map((t) => (
              <TorneoCard key={t.id} torneo={t} />
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div style={{ textAlign: "center", padding: "80px 32px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎮</div>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 8 }}>
                No hay torneos
              </h3>
              <p style={{ color: "#64748B", fontSize: 15 }}>Prueba con otros filtros de búsqueda.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
