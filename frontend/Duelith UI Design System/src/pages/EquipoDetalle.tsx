import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { miEquipos } from "../data/mockData";

export default function EquipoDetalle() {
  const { id } = useParams();
  const equipo = miEquipos.find((e) => e.id === Number(id)) ?? miEquipos[0];
  const [showTransferir, setShowTransferir] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "#64748B" }}>
          <Link to="/equipos" style={{ color: "#94A3B8", textDecoration: "none" }}>Mis Equipos</Link>
          <span>›</span>
          <span style={{ color: "white" }}>{equipo.nombre}</span>
        </div>

        {/* Header */}
        <div className="glass-card" style={{ borderRadius: 16, padding: "28px 32px", marginBottom: 24, background: "linear-gradient(135deg, rgba(108,43,217,0.12), rgba(22,33,62,0.85))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #6C2BD9, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🛡️</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 24, color: "white" }}>{equipo.nombre}</h1>
                  <Badge estado={equipo.rol} />
                </div>
                <p style={{ color: "#64748B", fontSize: 14 }}>🎮 {equipo.juego} · {equipo.miembros.length} miembros</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {equipo.rol === "CAPITAN" && (
                <>
                  <button className="btn-secondary" style={{ fontSize: 13 }}>✏️ Editar nombre</button>
                  <button className="btn-danger" style={{ fontSize: 13 }}>🚪 Disolver equipo</button>
                </>
              )}
              {equipo.rol === "JUGADOR" && (
                <button className="btn-danger" style={{ fontSize: 13 }}>🚪 Abandonar equipo</button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Members list */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "white" }}>
                👥 Miembros ({equipo.miembros.length})
              </h2>
              {equipo.rol === "CAPITAN" && (
                <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>+ Invitar</button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {equipo.miembros.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: m.rol === "CAPITAN" ? "rgba(108,43,217,0.12)" : "rgba(108,43,217,0.05)",
                    border: `1px solid ${m.rol === "CAPITAN" ? "rgba(108,43,217,0.3)" : "rgba(108,43,217,0.1)"}`,
                    borderRadius: 10,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: m.rol === "CAPITAN" ? "linear-gradient(135deg, #6C2BD9, #00D4FF)" : "rgba(100,116,139,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {m.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{m.gamertag}</p>
                      <p style={{ color: "#64748B", fontSize: 12 }}>@{m.username}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge estado={m.rol} />
                    {equipo.rol === "CAPITAN" && m.rol !== "CAPITAN" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setShowTransferir(true)}
                          title="Transferir capitanía"
                          style={{ background: "rgba(108,43,217,0.15)", border: "1px solid rgba(108,43,217,0.3)", borderRadius: 6, padding: "4px 8px", color: "#A78BFA", fontSize: 13, cursor: "pointer" }}
                        >
                          👑
                        </button>
                        <button
                          title="Expulsar"
                          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "4px 8px", color: "#EF4444", fontSize: 13, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitudes + info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {equipo.rol === "CAPITAN" && equipo.solicitudesPendientes.length > 0 && (
              <div className="glass-card" style={{ borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white", marginBottom: 16 }}>
                  🔔 Solicitudes Pendientes ({equipo.solicitudesPendientes.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {equipo.solicitudesPendientes.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 10,
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "white" }}>{s.gamertag}</p>
                        <p style={{ color: "#64748B", fontSize: 11 }}>@{s.username}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-success" style={{ padding: "5px 12px", fontSize: 12 }}>✓ Aceptar</button>
                        <button className="btn-danger" style={{ padding: "5px 10px", fontSize: 12 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card" style={{ borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white", marginBottom: 16 }}>📊 Estadísticas</h2>
              {[
                { label: "Torneos disputados", value: "3" },
                { label: "Partidos jugados", value: "12" },
                { label: "Victorias", value: "8" },
                { label: "Ratio de victorias", value: "66.7%" },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(108,43,217,0.1)" }}>
                  <span style={{ color: "#94A3B8", fontSize: 14 }}>{stat.label}</span>
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "white" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showTransferir && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={() => setShowTransferir(false)}
          >
            <div className="glass-card" style={{ borderRadius: 16, padding: 36, maxWidth: 380, width: "100%" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 12 }}>👑 Transferir Capitanía</h3>
              <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>¿Estás seguro de que quieres transferir la capitanía? Esta acción no se puede deshacer.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowTransferir(false)}>Confirmar</button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowTransferir(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
