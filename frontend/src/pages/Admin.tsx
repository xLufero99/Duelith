import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { cerrarInscripciones, crear, generarBracket, listar } from "../api/torneoApi";
import type { EstadoTorneo, TorneoResponse } from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

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
  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [creando, setCreando] = useState(false);
  const [ejecutandoId, setEjecutandoId] = useState<number | null>(null);

  const usuario = usuarioStorage.get<{ id: number; nombreUsuario: string; rol?: string }>();
  const autenticado = !!tokenStorage.get();
  const esAdmin = usuario?.rol === "ADMIN" || usuario?.rol === "ORGANIZADOR";

  const cargar = () => {
    setLoading(true);
    listar()
      .then(setTorneos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (esAdmin) cargar();
    else setLoading(false);
  }, [esAdmin]);

  const mostrarMsg = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreando(true);
    try {
      const t = await crear({
        nombre: form.nombre,
        juego: form.juego,
        ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        limiteEquipos: form.limite,
        ...(form.premio.trim() ? { premio: form.premio.trim() } : {}),
      });
      mostrarMsg(`Torneo "${t.nombre}" creado exitosamente`);
      setForm({ nombre: "", juego: "Valorant", descripcion: "", fechaInicio: "2026-09-01", fechaFin: "2026-09-10", limite: 8, premio: "" });
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el torneo");
    } finally {
      setCreando(false);
    }
  };

  const ejecutarAccion = async (t: TorneoResponse, accion: () => Promise<unknown>, msg: string) => {
    setEjecutandoId(t.id);
    setError("");
    try {
      await accion();
      mostrarMsg(msg);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acción fallida");
    } finally {
      setEjecutandoId(null);
    }
  };

  const adminStats = [
    { label: "Torneos totales", value: String(torneos.length), icon: "🏆", color: "#00D4FF" },
    { label: "En registro", value: String(torneos.filter((t) => t.estado === "EN_REGISTRO").length), icon: "📝", color: "#10B981" },
    { label: "En curso", value: String(torneos.filter((t) => t.estado === "EN_CURSO").length), icon: "⚡", color: "#F59E0B" },
    { label: "Finalizados", value: String(torneos.filter((t) => t.estado === "FINALIZADO").length), icon: "✅", color: "#6C2BD9" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>⚙️</span>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 28, color: "white" }}>Panel de Administración</h1>
          </div>
          <p style={{ color: "#64748B", fontSize: 15 }}>Gestiona los torneos de la plataforma</p>
        </div>

        {!autenticado ? (
          <div className="glass-card" style={{ borderRadius: 12, padding: "24px 32px", textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 15, marginBottom: 16 }}>Debes iniciar sesión para acceder a este panel.</p>
            <Link to="/login" className="btn-primary" style={{ textDecoration: "none", fontSize: 14 }}>Iniciar Sesión</Link>
          </div>
        ) : !esAdmin ? (
          <div className="glass-card" style={{ borderRadius: 12, padding: "24px 32px", textAlign: "center", border: "1px solid rgba(239,68,68,0.35)" }}>
            <p style={{ color: "#F87171", fontSize: 15 }}>⚠️ Solo los administradores pueden gestionar torneos.</p>
          </div>
        ) : (
          <>
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

            {/* Mensajes */}
            {error && (
              <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(239,68,68,0.35)" }}>
                <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
              </div>
            )}
            {mensaje && (
              <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(16,185,129,0.35)" }}>
                <p style={{ color: "#34D399", fontSize: 14 }}>✓ {mensaje}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28 }}>
              {/* Create tournament form */}
              <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
                  ➕ Crear Torneo
                </h2>

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
                      <input className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha fin</label>
                      <input className="input-field" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} required />
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
                  <button type="submit" className="btn-primary" disabled={creando} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: creando ? 0.7 : 1 }}>
                    {creando ? "Creando..." : "🏆 Crear Torneo"}
                  </button>
                </form>
              </div>

              {/* Manage tournaments */}
              <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 24 }}>
                  ⚙️ Gestionar Torneos
                </h2>
                {loading ? (
                  <p style={{ color: "#64748B", fontSize: 14 }}>Cargando torneos...</p>
                ) : torneos.length === 0 ? (
                  <p style={{ color: "#64748B", fontSize: 14 }}>No hay torneos todavía. Crea el primero.</p>
                ) : (
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
                            <p style={{ color: "#64748B", fontSize: 12 }}>{t.juego} · {t.equiposInscritos}/{t.limiteEquipos} equipos{t.premio ? ` · ${t.premio}` : ""}</p>
                          </div>
                          <Badge estado={t.estado} />
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {t.estado === "EN_REGISTRO" && (
                            <button
                              disabled={ejecutandoId === t.id}
                              onClick={() =>
                                ejecutarAccion(
                                  t,
                                  () => cerrarInscripciones(t.id),
                                  `Inscripciones de "${t.nombre}" cerradas`,
                                )
                              }
                              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                            >
                              🔒 Cerrar inscripciones
                            </button>
                          )}
                          {t.estado === "INSCRIPCIONES_CERRADAS" && (
                            <button
                              disabled={ejecutandoId === t.id}
                              onClick={() =>
                                ejecutarAccion(
                                  t,
                                  () => generarBracket(t.id),
                                  `Bracket de "${t.nombre}" generado`,
                                )
                              }
                              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00D4FF", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer" }}
                            >
                              ⚡ Generar Bracket
                            </button>
                          )}
                          <Link
                            to={`/torneos/${t.id}`}
                            style={{ background: "rgba(108,43,217,0.12)", border: "1px solid rgba(108,43,217,0.25)", color: "#A78BFA", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}
                          >
                            👁 Ver detalle
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
