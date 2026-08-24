import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { miEquipos } from "../data/mockData";

function CrearEquipoModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ nombre: "", juego: "Valorant" });
  const juegos = ["Valorant", "League of Legends", "CS2", "Fortnite", "DOTA 2"];
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
            <input className="input-field" placeholder="Los Titanes..." value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
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
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Crear Equipo</button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function Equipos() {
  const [showCrear, setShowCrear] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" />
      {showCrear && <CrearEquipoModal onClose={() => setShowCrear(false)} />}

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 6 }}>Mis Equipos</h1>
            <p style={{ color: "#64748B", fontSize: 15 }}>{miEquipos.length} equipo{miEquipos.length !== 1 ? "s" : ""} activo{miEquipos.length !== 1 ? "s" : ""}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCrear(true)}>+ Crear Equipo</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {miEquipos.map((eq) => (
            <div key={eq.id} className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
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
                        fontWeight: 700,
                      }}
                    >
                      🛡️
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>{eq.nombre}</h2>
                      <p style={{ color: "#64748B", fontSize: 13 }}>{eq.juego}</p>
                    </div>
                  </div>
                </div>
                <Badge estado={eq.rol} />
              </div>

              {/* Members preview */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                  Miembros ({eq.miembros.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {eq.miembros.slice(0, 3).map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(108,43,217,0.07)", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.rol === "CAPITAN" ? "linear-gradient(135deg, #6C2BD9, #00D4FF)" : "rgba(108,43,217,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                          {m.username[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{m.gamertag}</span>
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
                  {eq.rol === "CAPITAN" ? "⚙️ Gestionar" : "👁 Ver equipo"}
                </Link>
                {eq.rol === "CAPITAN" && (
                  <button className="btn-secondary" style={{ fontSize: 13 }}>✏️ Editar</button>
                )}
                {eq.solicitudesPendientes.length > 0 && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#EF4444", fontWeight: 600 }}>
                    🔔 {eq.solicitudesPendientes.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
