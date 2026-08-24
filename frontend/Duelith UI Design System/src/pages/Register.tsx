import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", gamertag: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const fields = [
    { key: "username", label: "Nombre de usuario", placeholder: "lufero", type: "text" },
    { key: "email", label: "Email", placeholder: "lufe@mail.com", type: "email" },
    { key: "password", label: "Contraseña", placeholder: "••••••••", type: "password" },
    { key: "gamertag", label: "Gamertag", placeholder: "LuferoX#1234", type: "text" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(108,43,217,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, background: "linear-gradient(135deg, #6C2BD9, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              DUELITH
            </span>
          </Link>
        </div>

        <div className="glass-card" style={{ borderRadius: 16, padding: "40px 36px" }}>
          <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 24, color: "white", marginBottom: 6 }}>
            Crear cuenta
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 32 }}>
            Únete a la comunidad e-sports más grande
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {fields.map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>
                  {f.label}
                </label>
                <input
                  className="input-field"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: loading ? 0.7 : 1, fontSize: 15 }}
            >
              {loading ? "Creando cuenta..." : "🚀 Registrarse"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid rgba(108,43,217,0.15)", marginTop: 28, paddingTop: 24, textAlign: "center" }}>
            <p style={{ color: "#64748B", fontSize: 14 }}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
