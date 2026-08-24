import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { crear, misEquipos } from "../api/equipoApi";
import type { EquipoResponse } from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

interface CrearEquipoModalProps {
  onClose: () => void;
  onCreado: (msg: string) => void;
}

function CrearEquipoModal({ onClose, onCreado }: CrearEquipoModalProps) {
  const [form, setForm] = useState({ nombre: "", juego: "Valorant" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const juegos = ["Valorant", "League of Legends", "CS2", "Fortnite", "DOTA 2"];

  const handleCrear = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    setError("");
    try {
      const eq = await crear({ nombre: form.nombre.trim(), juegoPrincipal: form.juego });
      onClose();
      onCreado(`Equipo "${eq.nombre}" creado correctamente`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el equipo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ borderRadius: 16, padding: 36, maxWidth: 420, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white" }}>🛡️ Crear Equipo</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>Nombre del equipo</label>
            <input className="input-field" placeholder="Los Titanes..." value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>Juego principal</label>
            <select
              className="input-field"
              value={form.juego}
              onChange={(e) => setForm({ ...form, juego: e.target.value })}
              style={{ appearance: "none" }}
            >
              {juegos.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
        {error && (
          <p style={{ color: "#F87171", fontSize: 13, marginTop: 16 }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: "center", opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={handleCrear}>
            {loading ? "Creando..." : "Crear Equipo"}
          </button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function Equipos() {
  const [showCrear, setShowCrear] = useState(false);
  const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const usuario = usuarioStorage.get<{ id: number; nombreUsuario: string; rol?: string }>();
  const autenticado = !!tokenStorage.get();

  const cargar = () => {
    setLoading(true);
    misEquipos()
      .then((eqs) => {
        setEquipos(eqs);
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />
      {showCrear && (
        <CrearEquipoModal
          onClose={() => setShowCrear(false)}
          onCreado={(msg) => {
            setMensaje(msg);
            cargar();
            setTimeout(() => setMensaje(""), 4000);
          }}
        />
      )}

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 6 }}>Mis Equipos</h1>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              {loading ? "Cargando..." : `${equipos.length} equipo${equipos.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowCrear(true)}>+ Crear Equipo</button>
        </div>

        {error && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 28, border: "1px solid rgba(239,68,68,0.35)" }}>
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          </div>
        )}

        {mensaje && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 28, border: "1px solid rgba(16,185,129,0.35)" }}>
            <p style={{ color: "#34D399", fontSize: 14 }}>✓ {mensaje}</p>
          </div>
        )}

        {!error && !loading && equipos.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 32px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 8 }}>Todavía no tienes equipos</h3>
            <p style={{ color: "#64748B", fontSize: 15 }}>Crea tu primer equipo o únete a uno desde su página.</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {equipos.map((eq) => {
            const miRol =
              eq.miembros.find((m) => m.usuarioId === usuario?.id)?.rol ??
              (eq.solicitudesPendientes.some((m) => m.usuarioId === usuario?.id)
                ? "SUPLENTE"
                : "JUGADOR");
            return (
              <div key={eq.id} className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <Link to={`/equipos/${eq.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🛡️
                      </div>
                      <div>
                        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>{eq.nombre}</h2>
                        <p style={{ color: "#64748B", fontSize: 13 }}>{eq.juegoPrincipal}</p>
                      </div>
                    </div>
                  </Link>
                  <Badge estado={miRol} />
                </div>

                {/* Members preview */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                    Miembros ({eq.miembros.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {eq.miembros.slice(0, 3).map((m) => (
                      <div key={m.usuarioId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(108,43,217,0.07)", borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.rol === "CAPITAN" ? "linear-gradient(135deg, #6C2BD9, #00D4FF)" : "rgba(108,43,217,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>
                            {m.nombreUsuario[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{m.gamertag || m.nombreUsuario}</span>
                        </div>
                        <Badge estado={m.rol} />
                      </div>
                    ))}
                    {eq.miembros.length > 3 && (
                      <p style={{ color: "#64748B", fontSize: 12, textAlign: "center" }}>+{eq.miembros.length - 3} más</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(108,43,217,0.12)" }}>
                  <Link to={`/equipos/${eq.id}`} className="btn-primary" style={{ textDecoration: "none", flex: 1, justifyContent: "center", fontSize: 13 }}>
                    {miRol === "CAPITAN" ? "⚙️ Gestionar" : "👁 Ver equipo"}
                  </Link>
                  {eq.solicitudesPendientes.length > 0 && miRol === "CAPITAN" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>
                      🔔 {eq.solicitudesPendientes.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
