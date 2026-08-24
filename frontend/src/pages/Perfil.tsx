import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { actualizarPerfil, obtenerPerfil } from "../api/authApi";
import { misEquipos } from "../api/equipoApi";
import { useAuth } from "../context/AuthContext";
import type { UsuarioResponse } from "../types";
import { ApiError, tokenStorage } from "../utils/apiClient";

export default function Perfil() {
  const navigate = useNavigate();
  const { actualizarUsuario, convertirOrganizador: convertirEnContexto, cerrarSesion } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [form, setForm] = useState({ nombreUsuario: "", email: "", gamertag: "" });
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [convertido, setConvertido] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  /** JUGADOR y CAPITAN pueden convertirse en organizador. */
  const puedeConvertirse = (r: string | undefined) => r === "JUGADOR" || r === "CAPITAN";

  useEffect(() => {
    let alive = true;
    Promise.all([obtenerPerfil(), misEquipos()])
      .then(([u, eqs]) => {
        if (!alive) return;
        setUsuario(u);
        actualizarUsuario(u);
        setForm({
          nombreUsuario: u.nombreUsuario,
          email: u.email,
          gamertag: u.gamertag ?? "",
        });
        setTotalEquipos(eqs.filter((eq) => eq.miembros.some((m) => m.usuarioId === u.id)).length);
      })
      .catch((err: Error) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const handleSave = async () => {
    if (!usuario) return;
    setError("");
    setSaved(false);
    setGuardando(true);
    try {
      const cambios: Record<string, string> = {};
      if (form.nombreUsuario !== usuario.nombreUsuario) cambios.nombreUsuario = form.nombreUsuario.trim();
      if (form.email !== usuario.email) cambios.email = form.email.trim();
      if ((form.gamertag || "") !== (usuario.gamertag ?? "")) cambios.gamertag = form.gamertag.trim();

      if (Object.keys(cambios).length === 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        return;
      }

      const actualizado = await actualizarPerfil(cambios);
      setUsuario(actualizado);
      actualizarUsuario(actualizado);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && Object.keys(err.errores).length > 0) {
        setError(Object.values(err.errores).join(" · "));
      } else {
        setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil");
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleConvertir = async () => {
    if (!usuario || !puedeConvertirse(usuario.rol)) return;
    setError("");
    setConvertido(false);
    setConvirtiendo(true);
    try {
      const actualizado = await convertirEnContexto();
      setUsuario(actualizado);
      setConvertido(true);
      setTimeout(() => setConvertido(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la conversión");
    } finally {
      setConvirtiendo(false);
    }
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate("/");
  };

  const esOrganizador = usuario?.rol === "ORGANIZADOR";
  const esAdmin = usuario?.rol === "ADMIN";

  const infoCuenta = [
    {
      label: "Rol",
      value: esAdmin ? "Administrador 👑" : esOrganizador ? "Organizador" : usuario?.rol === "CAPITAN" ? "Capitán" : "Jugador",
      icon: "🎭",
    },
    { label: "Equipos activos", value: String(totalEquipos), icon: "🛡️" },
    {
      label: "Miembro desde",
      value: usuario?.creadoEn ? new Date(usuario.creadoEn).toLocaleDateString("es", { month: "long", year: "numeric" }) : "—",
      icon: "📅",
    },
    { label: "Estado", value: usuario?.activo ? "Cuenta activa" : "Inactiva", icon: "✅" },
  ];

  if (loading && !usuario) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 15 }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

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
                {(usuario?.nombreUsuario ?? "U")[0].toUpperCase()}
              </div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>{usuario?.nombreUsuario}</p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  padding: "3px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                  letterSpacing: 0.5,
                  color: esAdmin ? "#FCA5A5" : esOrganizador ? "#86EFAC" : usuario?.rol === "CAPITAN" ? "#93C5FD" : "#94A3B8",
                  background: esAdmin
                    ? "rgba(239,68,68,0.12)"
                    : esOrganizador
                      ? "rgba(34,197,94,0.12)"
                      : usuario?.rol === "CAPITAN"
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(148,163,184,0.12)",
                  border: `1px solid ${
                    esAdmin
                      ? "rgba(239,68,68,0.3)"
                      : esOrganizador
                        ? "rgba(34,197,94,0.3)"
                        : usuario?.rol === "CAPITAN"
                          ? "rgba(59,130,246,0.3)"
                          : "rgba(148,163,184,0.3)"
                  }`,
                }}
              >
                {esAdmin ? "👑 ADMIN" : (usuario?.rol ?? "JUGADOR")}
              </span>
              {usuario?.gamertag && <p style={{ color: "#64748B", fontSize: 13 }}>{usuario.gamertag}</p>}
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
                Miembro desde{" "}
                {usuario?.creadoEn ? new Date(usuario.creadoEn).toLocaleDateString("es", { month: "long", year: "numeric" }) : "—"}
              </p>

              {/* Convertirse en Organizador */}
              <div style={{ marginTop: 16, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                {esAdmin ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 18px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "Montserrat, sans-serif",
                      color: "#FCA5A5",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    👑 Administrador · control total de la plataforma
                  </span>
                ) : esOrganizador ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 18px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "Montserrat, sans-serif",
                      color: "#86EFAC",
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    ✅ Eres Organizador · ya puedes crear torneos
                  </span>
                ) : (
                  <>
                    <button
                      className="btn-primary"
                      onClick={handleConvertir}
                      disabled={convirtiendo || !puedeConvertirse(usuario?.rol)}
                      style={{ justifyContent: "center", opacity: convirtiendo ? 0.7 : 1 }}
                    >
                      {convirtiendo ? "Convirtiendo..." : "🔓 Convertirse en Organizador"}
                    </button>
                    {convertido && (
                      <span style={{ color: "#4ADE80", fontSize: 13, fontWeight: 600 }}>
                        🎉 ¡Ahora eres Organizador! Ya puedes crear torneos.
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { key: "nombreUsuario", label: "Nombre de usuario", disabled: false },
                { key: "email", label: "Email", disabled: false },
                { key: "gamertag", label: "Gamertag", disabled: false },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#94A3B8", fontSize: 13, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 8 }}>
                    {f.label}
                  </label>
                  <input
                    className="input-field"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    disabled={loading || guardando}
                    type={f.key === "email" ? "email" : "text"}
                  />
                </div>
              ))}
            </div>

            {error && (
              <p style={{ color: "#F87171", fontSize: 13, marginTop: 16 }}>{error}</p>
            )}

            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={guardando}
              style={{ width: "100%", justifyContent: "center", marginTop: 24, opacity: guardando ? 0.7 : 1 }}
            >
              {guardando ? "Guardando..." : saved ? "✅ Cambios guardados" : "Guardar cambios"}
            </button>

            <button
              className="btn-secondary"
              onClick={handleCerrarSesion}
              style={{ width: "100%", justifyContent: "center", marginTop: 12, fontSize: 14 }}
            >
              🚪 Cerrar Sesión
            </button>

            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#EF4444", marginBottom: 6 }}>Zona de peligro</p>
              <button className="btn-danger" style={{ width: "100%", fontSize: 13 }} disabled title="Función no disponible todavía">
                🔒 Cambiar contraseña (próximamente)
              </button>
            </div>
          </div>

          {/* Account info */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 32 }}>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
              📊 Información de la cuenta
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {infoCuenta.map((s) => (
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
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 18, color: "white", marginBottom: 4 }}>{s.value}</p>
                  <p style={{ color: "#64748B", fontSize: 12 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, marginTop: 24 }}>
              Los datos mostrados provienen directamente del servidor. Al guardar cambios se actualizan en la base de datos al instante.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
