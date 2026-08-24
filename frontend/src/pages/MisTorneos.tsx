import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { actualizarTorneo, borrarTorneo, misTorneos } from "../api/torneoApi";
import type { CrearTorneoRequest, EstadoTorneo, TorneoResponse } from "../types";
import { ApiError } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

const juegos = ["Valorant", "League of Legends", "CS2", "Fortnite", "DOTA 2"];
const limites = [2, 4, 8, 16, 32, 64];

const coloresEstado: Record<EstadoTorneo, { color: string; bg: string }> = {
  EN_REGISTRO: { color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  INSCRIPCIONES_CERRADAS: { color: "#FBBF24", bg: "rgba(245,158,11,0.12)" },
  EN_CURSO: { color: "#00D4FF", bg: "rgba(0,212,255,0.12)" },
  FINALIZADO: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  CANCELADO: { color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

const formVacio = {
  nombre: "",
  juego: juegos[0],
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  limiteEquipos: 8,
  premio: "",
};

export default function MisTorneos() {
  const { usuario, autenticado, rol } = useAuth();
  const esAdmin = rol === "ADMIN";
  const puedeCrear = esAdmin || rol === "ORGANIZADOR";

  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Edicion
  const [editando, setEditando] = useState<TorneoResponse | null>(null);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<number | null>(null);

  useEffect(() => {
    if (!autenticado) {
      setLoading(false);
      return;
    }
    let alive = true;
    misTorneos()
      .then((lista) => alive && setTorneos(lista))
      .catch((err: Error) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [autenticado]);

  const abrirEdicion = (t: TorneoResponse) => {
    setError("");
    setMensaje("");
    setEditando(t);
    setForm({
      nombre: t.nombre,
      juego: t.juego,
      descripcion: t.descripcion ?? "",
      fechaInicio: t.fechaInicio,
      fechaFin: t.fechaFin,
      limiteEquipos: t.limiteEquipos,
      premio: t.premio ?? "",
    });
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setError("");
    setGuardando(true);
    try {
      const payload: CrearTorneoRequest = {
        nombre: form.nombre.trim(),
        juego: form.juego,
        descripcion: form.descripcion.trim() || undefined,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        limiteEquipos: form.limiteEquipos,
        premio: form.premio.trim() || undefined,
      };
      const actualizado = await actualizarTorneo(editando.id, payload);
      setTorneos((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)));
      setEditando(null);
      setMensaje(`✓ Torneo "${actualizado.nombre}" actualizado`);
      setTimeout(() => setMensaje(""), 3500);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errores).length > 0) {
        setError(Object.values(err.errores).join(" · "));
      } else {
        setError(err instanceof Error ? err.message : "No se pudo actualizar el torneo");
      }
    } finally {
      setGuardando(false);
    }
  };

  const confirmarBorrado = async (t: TorneoResponse) => {
    if (!window.confirm(`¿Eliminar el torneo "${t.nombre}"? Esta accion no se puede deshacer.`)) {
      return;
    }
    setError("");
    setBorrandoId(t.id);
    try {
      await borrarTorneo(t.id);
      setTorneos((prev) => prev.filter((x) => x.id !== t.id));
      setMensaje(`✓ Torneo "${t.nombre}" eliminado`);
      setTimeout(() => setMensaje(""), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el torneo");
    } finally {
      setBorrandoId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 6 }}>
              🗂️ Mis Torneos
            </h1>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              {esAdmin
                ? "Como ADMIN ves todos los torneos de la plataforma"
                : loading
                  ? "Cargando..."
                  : `${torneos.length} torneo${torneos.length !== 1 ? "s" : ""} creado${torneos.length !== 1 ? "s" : ""} por ti`}
            </p>
          </div>
          {puedeCrear && (
            <Link to="/admin" className="btn-primary" style={{ textDecoration: "none", fontSize: 14 }}>
              + Crear Torneo
            </Link>
          )}
        </div>

        {/* Mensajes */}
        {error && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(239,68,68,0.35)" }}>
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          </div>
        )}
        {mensaje && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(16,185,129,0.35)" }}>
            <p style={{ color: "#34D399", fontSize: 14 }}>{mensaje}</p>
          </div>
        )}

        {!autenticado ? (
          <div className="glass-card" style={{ borderRadius: 16, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 15, marginBottom: 16 }}>Debes iniciar sesión para ver tus torneos.</p>
            <Link to="/login" className="btn-primary" style={{ textDecoration: "none", fontSize: 14 }}>Iniciar Sesión</Link>
          </div>
        ) : loading ? (
          <p style={{ color: "#94A3B8", fontSize: 15 }}>Cargando tus torneos...</p>
        ) : torneos.length === 0 ? (
          <div className="glass-card" style={{ borderRadius: 16, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🏆</p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 8 }}>
              Todavía no has creado ningún torneo
            </p>
            {puedeCrear ? (
              <Link to="/admin" className="btn-primary" style={{ textDecoration: "none", fontSize: 14 }}>
                Crear tu primer torneo
              </Link>
            ) : (
              <>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 16 }}>
                  Conviértete en organizador para crear y gestionar tus propios torneos.
                </p>
                <Link to="/perfil" className="btn-secondary" style={{ textDecoration: "none", fontSize: 14 }}>
                  🔓 Convertirse en Organizador
                </Link>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {torneos.map((t) => {
              const esCreador = usuario?.id === t.creadoPorId;
              const puedeGestionar = esCreador || esAdmin;
              const c = coloresEstado[t.estado];
              return (
                <div key={t.id} className="glass-card" style={{ borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Titulo + estado */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <Link to={`/torneos/${t.id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white" }}>{t.nombre}</h3>
                    </Link>
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: c.color,
                        background: c.bg,
                        border: `1px solid ${c.color}44`,
                      }}
                    >
                      {t.estado}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#94A3B8" }}>
                    <span>🎮 {t.juego}</span>
                    <span>📅 {t.fechaInicio} → {t.fechaFin}</span>
                    <span>🛡️ {t.equiposInscritos}/{t.limiteEquipos} equipos</span>
                    {t.premio && <span>🎁 {t.premio}</span>}
                    {esAdmin && !esCreador && (
                      <span style={{ color: "#64748B", fontSize: 12 }}>creado por {t.creadoPorNombre}</span>
                    )}
                  </div>

                  {/* Acciones */}
                  {puedeGestionar && (
                    <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                      <button className="btn-secondary" onClick={() => abrirEdicion(t)} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
                        ✏️ Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => confirmarBorrado(t)}
                        disabled={borrandoId === t.id}
                        style={{ flex: 1, justifyContent: "center", fontSize: 13, opacity: borrandoId === t.id ? 0.7 : 1 }}
                      >
                        {borrandoId === t.id ? "Eliminando..." : "🗑️ Borrar"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de edicion */}
      {editando && (
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
          onClick={() => !guardando && setEditando(null)}
        >
          <div
            className="glass-card"
            style={{ borderRadius: 16, padding: 32, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 20 }}>
              ✏️ Editar "{editando.nombre}"
            </h3>

            <form onSubmit={guardarEdicion} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Juego</label>
                <select className="input-field" style={{ appearance: "none" }} value={form.juego} onChange={(e) => setForm({ ...form, juego: e.target.value })}>
                  {[...new Set([form.juego, ...juegos])].map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  className="input-field"
                  rows={3}
                  style={{ resize: "vertical" }}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha inicio</label>
                  <input className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Fecha fin</label>
                  <input className="input-field" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Límite de equipos</label>
                  <select
                    className="input-field"
                    style={{ appearance: "none" }}
                    value={form.limiteEquipos}
                    onChange={(e) => setForm({ ...form, limiteEquipos: Number(e.target.value) })}
                  >
                    {(limites.includes(form.limiteEquipos)
                      ? limites
                      : [...limites, form.limiteEquipos].sort((a, b) => a - b)
                    ).map((l) => (
                      <option key={l} value={l}>{l} equipos</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Premio</label>
                  <input className="input-field" value={form.premio} onChange={(e) => setForm({ ...form, premio: e.target.value })} />
                </div>
              </div>

              {error && <p style={{ color: "#F87171", fontSize: 13 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="submit" className="btn-primary" disabled={guardando} style={{ flex: 1, justifyContent: "center", opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditando(null)} disabled={guardando}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "#94A3B8",
  fontSize: 12,
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 500,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
} as const;
