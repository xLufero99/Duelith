import { useState } from "react";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { torneos } from "../data/mockData";

const adminStats = [
  { label: "Usuarios totales", value: "2,418", icon: "👥", color: "#6C2BD9" },
  { label: "Torneos totales", value: "87", icon: "🏆", color: "#00D4FF" },
  { label: "Torneos activos", value: "3", icon: "⚡", color: "#10B981" },
  { label: "Premios repartidos", value: "$48K", icon: "💰", color: "#F59E0B" },
];

const juegos = ["Valorant", "League of Legends", "CS2", "Fortnite", "DOTA 2", "Apex Legends"];
const limites = [4, 8, 16, 32];

export default function Admin() {
  const [form, setForm] = useState({
    nombre: "",
    juego: "Valorant",
    descripcion: "",
    fechaInicio: "2026-09-01",
    fechaFin: "2026-09-10",
    limite: 8,
    premio: "",
  });
  const [creado, setCreado] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreado(true);
    setForm({ nombre: "", juego: "Valorant", descripcion: "", fechaInicio: "2026-09-01", fechaFin: "2026-09-10", limite: 8, premio: "" });
    setTimeout(() => setCreado(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" isAdmin />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>⚙️</span>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 28, color: "white" }}>Panel de Administración</h1>
          </div>
          <p style={{ color: "#64748B", fontSize: 15 }}>Gestiona torneos, usuarios y la plataforma</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {adminStats.map((s) => (
            <div key={s.label} className="glass-card" style={{ borderRadius: 12, padding: "22px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</div>
                <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28 }}>
          {/* Create tournament form */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
              ➕ Crear Torneo
            </h2>

            {creado && (
              <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#10B981", fontSize: 20 }}>✅</span>
                <p style={{ color: "#10B981", fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14 }}>Torneo creado exitosamente</p>
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nombre</label>
                <input className="input-field" placeholder="Copa Duelith Verano 2026" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Juego</label>
                <select className="input-field" style={{ appearance: "none" }} value={form.juego} onChange={(e) => setForm({ ...form, juego: e.target.value })}>
                  {juegos.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Descripción</label>
                <textarea
                  className="input-field"
                  placeholder="Describe el torneo..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha inicio</label>
                  <input className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha fin</label>
                  <input className="input-field" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Límite de equipos</label>
                  <select className="input-field" style={{ appearance: "none" }} value={form.limite} onChange={(e) => setForm({ ...form, limite: Number(e.target.value) })}>
                    {limites.map((l) => <option key={l} value={l}>{l} equipos</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Premio</label>
                  <input className="input-field" placeholder="$500 USD" value={form.premio} onChange={(e) => setForm({ ...form, premio: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
                🏆 Crear Torneo
              </button>
            </form>
          </div>

          {/* Manage tournaments */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
              ⚙️ Gestionar Torneos
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {torneos.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "rgba(108,43,217,0.06)",
                    border: "1px solid rgba(108,43,217,0.15)",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "white", marginBottom: 3 }}>{t.nombre}</p>
                      <p style={{ color: "#64748B", fontSize: 12 }}>{t.juego} · {t.equiposInscritos}/{t.limiteEquipos} equipos · {t.premio}</p>
                    </div>
                    <Badge estado={t.estado} />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {t.estado === "EN_REGISTRO" && (
                      <button
                        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                      >
                        🔒 Cerrar inscripciones
                      </button>
                    )}
                    {(t.estado === "EN_REGISTRO" || t.estado === "EN_CURSO") && (
                      <button
                        style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                      >
                        ⚡ Generar Bracket
                      </button>
                    )}
                    {t.estado !== "CANCELADO" && t.estado !== "FINALIZADO" && (
                      <button
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                      >
                        🗑️ Cancelar
                      </button>
                    )}
                    <button
                      style={{ background: "rgba(108,43,217,0.12)", border: "1px solid rgba(108,43,217,0.25)", color: "#A78BFA", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                    >
                      👁 Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
