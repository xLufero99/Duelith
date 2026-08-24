import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { torneos, bracket } from "../data/mockData";

const equiposInscritos = [
  { id: 1, nombre: "Los Titanes", capitan: "lufero", miembros: 5, fechaInscripcion: "2026-08-10" },
  { id: 2, nombre: "Dark Forces", capitan: "shadowboss", miembros: 5, fechaInscripcion: "2026-08-11" },
  { id: 3, nombre: "Neon Hawks", capitan: "neon_pro", miembros: 5, fechaInscripcion: "2026-08-12" },
  { id: 4, nombre: "Alpha Squad", capitan: "alpha_king", miembros: 5, fechaInscripcion: "2026-08-13" },
  { id: 5, nombre: "Shadow Wolves", capitan: "wolf_x", miembros: 5, fechaInscripcion: "2026-08-14" },
];

const partidos = [
  { id: 1, equipo1: "Los Titanes", equipo2: "Dark Forces", ronda: "Cuartos de Final", estado: "FINALIZADO", ganador: "Los Titanes" },
  { id: 2, equipo1: "Neon Hawks", equipo2: "Shadow Wolves", ronda: "Cuartos de Final", estado: "FINALIZADO", ganador: "Neon Hawks" },
  { id: 3, equipo1: "Alpha Squad", equipo2: "Crimson Blade", ronda: "Cuartos de Final", estado: "PENDIENTE", ganador: null },
  { id: 4, equipo1: "Storm Riders", equipo2: "Ghost Protocol", ronda: "Cuartos de Final", estado: "EN_JUEGO", ganador: null },
  { id: 5, equipo1: "Los Titanes", equipo2: "Neon Hawks", ronda: "Semifinal", estado: "PENDIENTE", ganador: null },
];

const tabs = ["Información", "Equipos", "Bracket", "Partidos"];

interface ReportarModalProps {
  onClose: () => void;
}

function ReportarModal({ onClose }: ReportarModalProps) {
  const [ganador, setGanador] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ borderRadius: 16, padding: 36, maxWidth: 440, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white" }}>
            Reportar Resultado
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 24 }}>
          Selecciona el equipo ganador del partido: <strong style={{ color: "white" }}>Los Titanes vs Neon Hawks</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {["Los Titanes", "Neon Hawks"].map((eq) => (
            <button
              key={eq}
              onClick={() => setGanador(eq)}
              style={{
                padding: "14px 20px",
                borderRadius: 10,
                border: `2px solid ${ganador === eq ? "#6C2BD9" : "rgba(108,43,217,0.2)"}`,
                background: ganador === eq ? "rgba(108,43,217,0.2)" : "rgba(22,33,62,0.5)",
                color: "white",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {ganador === eq && <span style={{ color: "#10B981" }}>✓</span>}
              {eq}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: "center", opacity: ganador ? 1 : 0.5 }} disabled={!ganador} onClick={onClose}>
            Confirmar resultado
          </button>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function BracketView() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      {showModal && <ReportarModal onClose={() => setShowModal(false)} />}
      <div style={{ overflowX: "auto", padding: "8px 0" }}>
        <div style={{ display: "flex", gap: 0, minWidth: 700, alignItems: "center" }}>
          {bracket.rondas.map((ronda, ri) => (
            <div key={ronda.nombre} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ minWidth: 180, padding: "0 12px" }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 11, color: "#6C2BD9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, textAlign: "center" }}>
                  {ronda.nombre}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ri === 0 ? 12 : ri === 1 ? 60 : 0,
                    justifyContent: "center",
                    minHeight: ri === 0 ? "auto" : ri === 1 ? 300 : 400,
                  }}
                >
                  {ronda.partidos.map((partido) => (
                    <div
                      key={partido.id}
                      style={{
                        background: "rgba(22,33,62,0.9)",
                        border: "1px solid rgba(108,43,217,0.3)",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      {[partido.equipo1, partido.equipo2].map((eq, ei) => (
                        <div
                          key={ei}
                          style={{
                            padding: "10px 14px",
                            background: partido.ganador === eq ? "rgba(108,43,217,0.2)" : "transparent",
                            borderBottom: ei === 0 ? "1px solid rgba(108,43,217,0.2)" : "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: partido.ganador === eq ? 700 : 400, fontSize: 12, color: partido.ganador === eq ? "white" : "#94A3B8" }}>
                            {eq}
                          </span>
                          {partido.ganador === eq && <span style={{ color: "#10B981", fontSize: 12 }}>✓</span>}
                        </div>
                      ))}
                      {partido.estado === "PENDIENTE" && (
                        <button
                          onClick={() => setShowModal(true)}
                          style={{
                            width: "100%",
                            padding: "6px",
                            background: "rgba(108,43,217,0.15)",
                            border: "none",
                            borderTop: "1px solid rgba(108,43,217,0.2)",
                            color: "#A78BFA",
                            fontSize: 11,
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Reportar resultado
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {ri < bracket.rondas.length - 1 && (
                <div style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "100%", height: 2, background: "linear-gradient(90deg, rgba(108,43,217,0.5), rgba(0,212,255,0.3))" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TorneoDetalle() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Información");
  const [inscribirOpen, setInscribirOpen] = useState(false);
  const torneo = torneos.find((t) => t.id === Number(id)) ?? torneos[0];
  const pct = Math.round((torneo.equiposInscritos / torneo.limiteEquipos) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" />

      {inscribirOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setInscribirOpen(false)}
        >
          <div className="glass-card" style={{ borderRadius: 16, padding: 36, maxWidth: 400, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 16 }}>Inscribir Equipo</h3>
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>Selecciona el equipo que deseas inscribir en <strong style={{ color: "white" }}>{torneo.nombre}</strong>:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[{ id: 1, nombre: "Los Titanes", juego: "Valorant" }, { id: 2, nombre: "Dark Forces", juego: "CS2" }].map((eq) => (
                <div key={eq.id} style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(108,43,217,0.12)", border: "1px solid rgba(108,43,217,0.25)", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{eq.nombre}</span>
                  <span style={{ color: "#64748B", fontSize: 13 }}>{eq.juego}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setInscribirOpen(false)}>Inscribir</button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setInscribirOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#64748B" }}>
          <Link to="/torneos" style={{ color: "#94A3B8", textDecoration: "none" }}>Torneos</Link>
          <span>›</span>
          <span style={{ color: "white" }}>{torneo.nombre}</span>
        </div>

        {/* Tournament header */}
        <div
          className="glass-card"
          style={{
            borderRadius: 16,
            padding: "32px 36px",
            marginBottom: 28,
            background: "linear-gradient(135deg, rgba(108,43,217,0.12) 0%, rgba(22,33,62,0.85) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 28 }}>🏆</span>
                <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 26, color: "white" }}>
                  {torneo.nombre}
                </h1>
                <Badge estado={torneo.estado} />
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>🎮 {torneo.juego}</span>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>👥 {torneo.equiposInscritos}/{torneo.limiteEquipos} equipos</span>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>📅 {new Date(torneo.fechaInicio).toLocaleDateString("es")} – {new Date(torneo.fechaFin).toLocaleDateString("es")}</span>
                <span style={{ color: "#F59E0B", fontSize: 14, fontWeight: 600 }}>💰 {torneo.premio}</span>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>Equipos inscritos</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? "#EF4444" : "#10B981" }}>{torneo.equiposInscritos}/{torneo.limiteEquipos}</span>
                </div>
                <div style={{ height: 6, background: "#1A1A2E", borderRadius: 4, overflow: "hidden", maxWidth: 300 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6C2BD9, #00D4FF)", borderRadius: 4 }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {torneo.estado === "EN_REGISTRO" && (
                <button className="btn-primary" onClick={() => setInscribirOpen(true)}>+ Inscribir Equipo</button>
              )}
              <button className="btn-secondary">Cerrar inscripciones</button>
              <button className="btn-secondary">⚡ Generar Bracket</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(22,33,62,0.5)", padding: 4, borderRadius: 10, width: "fit-content" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "tab-active" : "tab-inactive"}
              style={{ padding: "8px 20px", fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.2s" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 32 }}>
          {activeTab === "Información" && (
            <div>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 16 }}>
                Sobre el torneo
              </h3>
              <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{torneo.descripcion}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { label: "Fecha de inicio", value: new Date(torneo.fechaInicio).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }), icon: "📅" },
                  { label: "Fecha de cierre", value: new Date(torneo.fechaFin).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }), icon: "🏁" },
                  { label: "Premio total", value: torneo.premio, icon: "💰" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "rgba(108,43,217,0.08)", border: "1px solid rgba(108,43,217,0.18)", borderRadius: 12, padding: "20px 24px" }}>
                    <p style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</p>
                    <p style={{ color: "#64748B", fontSize: 12, marginBottom: 4, fontFamily: "Montserrat, sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Equipos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>
                  Equipos Inscritos ({equiposInscritos.length})
                </h3>
                <input className="input-field" placeholder="🔍 Buscar equipo..." style={{ maxWidth: 220 }} />
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Equipo", "Capitán", "Miembros", "Fecha inscripción"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(108,43,217,0.15)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {equiposInscritos.map((eq, i) => (
                    <tr key={eq.id} style={{ borderBottom: "1px solid rgba(108,43,217,0.08)", transition: "background 0.2s" }}>
                      <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>{i + 1}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{eq.nombre}</span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 14 }}>{eq.capitan}</td>
                      <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 14 }}>{eq.miembros}</td>
                      <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 13 }}>{new Date(eq.fechaInscripcion).toLocaleDateString("es")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Bracket" && <BracketView />}

          {activeTab === "Partidos" && (
            <div>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 20 }}>Partidos del Torneo</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {partidos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "rgba(108,43,217,0.06)",
                      border: "1px solid rgba(108,43,217,0.15)",
                      borderRadius: 12,
                      padding: "18px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ color: "#64748B", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600, textTransform: "uppercase", minWidth: 100 }}>{p.ronda}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: p.ganador === p.equipo1 ? "white" : "#94A3B8" }}>{p.equipo1}</span>
                        <span style={{ color: "#6C2BD9", fontWeight: 800, fontSize: 12 }}>VS</span>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: p.ganador === p.equipo2 ? "white" : "#94A3B8" }}>{p.equipo2}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {p.ganador && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>Ganador: {p.ganador}</span>}
                      <Badge estado={p.estado} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
