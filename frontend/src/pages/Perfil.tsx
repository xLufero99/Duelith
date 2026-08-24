import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Perfil() {
  const [form, setForm] = useState({ gamertag: "LuferoX", email: "lufe@mail.com", username: "lufero" });
  const [saved, setSaved] = useState(false);

  const stats = [
    { label: "Torneos jugados", value: "5", icon: "🏆" },
    { label: "Partidos jugados", value: "18", icon: "⚔️" },
    { label: "Victorias", value: "13", icon: "✅" },
    { label: "Ratio de victorias", value: "72%", icon: "📈" },
    { label: "Equipos activos", value: "2", icon: "🛡️" },
    { label: "Premios ganados", value: "$250 USD", icon: "💰" },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px" }}>
        <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 28, color: "white", marginBottom: 32 }}>
          👤 Mi Perfil
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 28 }}>
          {/* Profile form */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 32 }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 12,
                  boxShadow: "0 0 30px rgba(108,43,217,0.4)",
                }}
              >
                L
              </div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>lufero</p>
              <p style={{ color: "#64748B", fontSize: 13 }}>Miembro desde agosto 2026</p>
              <button style={{ marginTop: 10, background: "rgba(108,43,217,0.15)", border: "1px solid rgba(108,43,217,0.3)", borderRadius: 6, padding: "6px 16px", color: "#A78BFA", fontSize: 12, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                📷 Cambiar avatar
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { key: "username", label: "Nombre de usuario", disabled: true },
                { key: "email", label: "Email", disabled: false },
                { key: "gamertag", label: "Gamertag", disabled: false },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>
                    {f.label}
                    {f.disabled && <span style={{ color: "#64748B", fontSize: 11, marginLeft: 8 }}>(no editable)</span>}
                  </label>
                  <input
                    className="input-field"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    disabled={f.disabled}
                    style={{ opacity: f.disabled ? 0.6 : 1, cursor: f.disabled ? "not-allowed" : "text" }}
                  />
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
            >
              {saved ? "✅ Cambios guardados" : "Guardar cambios"}
            </button>

            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#EF4444", marginBottom: 6 }}>Zona de peligro</p>
              <button className="btn-danger" style={{ width: "100%", fontSize: 13 }}>🔒 Cambiar contraseña</button>
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
              📊 Estadísticas
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(108,43,217,0.08)",
                    border: "1px solid rgba(108,43,217,0.18)",
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <p style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</p>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 22, color: "white", marginBottom: 4 }}>{s.value}</p>
                  <p style={{ color: "#64748B", fontSize: 12 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15, color: "white", marginBottom: 14 }}>
              Actividad reciente
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { accion: "Ganó partido vs Dark Forces", torneo: "Copa Duelith Verano 2026", fecha: "24 ago", color: "#10B981" },
                { accion: "Inscribió Los Titanes", torneo: "Valorant Ranked Series", fecha: "22 ago", color: "#00D4FF" },
                { accion: "Creó equipo Los Titanes", torneo: "", fecha: "10 ago", color: "#6C2BD9" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid rgba(108,43,217,0.1)" : "none",
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{item.accion}</p>
                    {item.torneo && <p style={{ fontSize: 12, color: "#64748B" }}>{item.torneo}</p>}
                  </div>
                  <span style={{ fontSize: 12, color: "#64748B" }}>{item.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
