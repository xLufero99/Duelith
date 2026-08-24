import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identificador: "", contrasena: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 900);
  };

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
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(108,43,217,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, background: "linear-gradient(135deg, #6C2BD9, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              DUELITH
            </span>
          </Link>
        </div>

        <div
          className="glass-card"
          style={{ borderRadius: 16, padding: "40px 36px" }}
        >
          <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 24, color: "white", marginBottom: 6 }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 32 }}>
            Inicia sesión para continuar compitiendo
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>
                Usuario o Email
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="lufero o lufe@mail.com"
                value={form.identificador}
                onChange={(e) => setForm({ ...form, identificador: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>
                Contraseña
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: loading ? 0.7 : 1, fontSize: 15 }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid rgba(108,43,217,0.15)", marginTop: 28, paddingTop: 24, textAlign: "center" }}>
            <p style={{ color: "#64748B", fontSize: 14 }}>
              ¿No tienes cuenta?{" "}
              <Link to="/register" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
