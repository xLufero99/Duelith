import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import {
  abandonar,
  aceptarMiembro,
  expulsarMiembro,
  obtenerPorId,
  transferirCapitania,
} from "../api/equipoApi";
import type { EquipoResponse, MiembroResponse } from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

export default function EquipoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const equipoId = Number(id);

  const [equipo, setEquipo] = useState<EquipoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showTransferir, setShowTransferir] = useState(false);
  const [nuevoCapitanId, setNuevoCapitanId] = useState<number | null>(null);
  const [ejecutando, setEjecutando] = useState(false);

  const usuario = usuarioStorage.get<{ id: number; nombreUsuario: string; rol?: string }>();
  const autenticado = !!tokenStorage.get();

  const cargar = useCallback(async () => {
    try {
      const eq = await obtenerPorId(equipoId);
      setEquipo(eq);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el equipo");
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const mostrarMsg = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 4000);
  };

  const ejecutar = async (accion: () => Promise<unknown>, msg: string) => {
    setEjecutando(true);
    setError("");
    try {
      await accion();
      mostrarMsg(msg);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acción fallida");
    } finally {
      setEjecutando(false);
    }
  };

  if (loading && !equipo) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 15 }}>Cargando equipo...</p>
      </div>
    );
  }

  if (!equipo) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
        <Navbar />
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px", textAlign: "center" }}>
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", maxWidth: 480, margin: "80px auto", border: "1px solid rgba(239,68,68,0.35)" }}>
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error || "Equipo no encontrado"}</p>
          </div>
        </main>
      </div>
    );
  }

  const soyCapitan = usuario?.id === equipo.capitanId;
  const miMiembro = equipo.miembros.find((m) => m.usuarioId === usuario?.id);
  const miRol = soyCapitan ? "CAPITAN" : miMiembro ? miMiembro.rol : "SUPLENTE";

  const confirmarTransferencia = async () => {
    if (!nuevoCapitanId) return;
    setShowTransferir(false);
    await ejecutar(
      () => transferirCapitania(equipoId, nuevoCapitanId),
      "Capitanía transferida",
    );
  };

  const salirDelEquipo = async () => {
    setEjecutando(true);
    setError("");
    try {
      await abandonar(equipoId);
      navigate("/equipos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo abandonar el equipo");
      setEjecutando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "#64748B" }}>
          <Link to="/equipos" style={{ color: "#94A3B8", textDecoration: "none" }}>Mis Equipos</Link>
          <span>›</span>
          <span style={{ color: "white" }}>{equipo.nombre}</span>
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

        {/* Header */}
        <div className="glass-card" style={{ borderRadius: 16, padding: "28px 32px", marginBottom: 24, background: "linear-gradient(135deg, rgba(108,43,217,0.12), rgba(22,33,62,0.85))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #6C2BD9, #00D4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🛡️</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 24, color: "white" }}>{equipo.nombre}</h1>
                  {!equipo.activo && <Badge estado="CANCELADO" />}
                </div>
                <p style={{ color: "#64748B", fontSize: 14 }}>🎮 {equipo.juegoPrincipal} · {equipo.miembros.length} miembros</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {(soyCapitan || miMiembro) && (
                <button className="btn-danger" style={{ fontSize: 13 }} disabled={ejecutando} onClick={salirDelEquipo}>
                  🚪 {soyCapitan ? "Disolver / Salir" : "Abandonar equipo"}
                </button>
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
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {equipo.miembros.map((m: MiembroResponse) => (
                <div
                  key={m.usuarioId}
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
                      {m.nombreUsuario[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{m.gamertag || m.nombreUsuario}</p>
                      <p style={{ color: "#64748B", fontSize: 12 }}>@{m.nombreUsuario}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge estado={m.rol} />
                    {soyCapitan && m.rol !== "CAPITAN" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            setNuevoCapitanId(m.usuarioId);
                            setShowTransferir(true);
                          }}
                          disabled={ejecutando}
                          title="Transferir capitanía"
                          style={{ background: "rgba(108,43,217,0.15)", border: "1px solid rgba(108,43,217,0.3)", borderRadius: 6, padding: "4px 8px", color: "#A78BFA", fontSize: 13, cursor: "pointer" }}
                        >
                          👑
                        </button>
                        <button
                          disabled={ejecutando}
                          title="Expulsar"
                          onClick={() => ejecutar(() => expulsarMiembro(equipoId, m.usuarioId), `@${m.nombreUsuario} fue retirado del equipo`)}
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
            {soyCapitan && equipo.solicitudesPendientes.length > 0 && (
              <div className="glass-card" style={{ borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white", marginBottom: 16 }}>
                  🔔 Solicitudes Pendientes ({equipo.solicitudesPendientes.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {equipo.solicitudesPendientes.map((s) => (
                    <div
                      key={s.usuarioId}
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
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "white" }}>{s.gamertag || s.nombreUsuario}</p>
                        <p style={{ color: "#64748B", fontSize: 11 }}>@{s.nombreUsuario}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-success"
                          style={{ padding: "5px 12px", fontSize: 12 }}
                          disabled={ejecutando}
                          onClick={() => ejecutar(() => aceptarMiembro(equipoId, s.usuarioId), `@${s.nombreUsuario} ahora es jugador del equipo`)}
                        >
                          ✓ Aceptar
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          disabled={ejecutando}
                          title="Rechazar solicitud"
                          onClick={() => ejecutar(() => expulsarMiembro(equipoId, s.usuarioId), `Solicitud de @${s.nombreUsuario} rechazada`)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card" style={{ borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white", marginBottom: 16 }}>📊 Información</h2>
              {[
                { label: "Juego principal", value: equipo.juegoPrincipal },
                { label: "Capitán", value: equipo.capitanNombre },
                { label: "Miembros confirmados", value: String(equipo.miembros.length) },
                { label: "Fundado", value: new Date(equipo.creadoEn).toLocaleDateString("es") },
                { label: "Activo", value: equipo.activo ? "Sí" : "No" },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(108,43,217,0.1)" }}>
                  <span style={{ color: "#94A3B8", fontSize: 14 }}>{stat.label}</span>
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "white" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal transferir */}
        {showTransferir && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={() => setShowTransferir(false)}
          >
            <div className="glass-card" style={{ borderRadius: 16, padding: 36, maxWidth: 380, width: "100%" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 12 }}>👑 Transferir Capitanía</h3>
              <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>Selecciona el nuevo capitán:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {equipo.miembros.filter((m) => m.rol !== "CAPITAN").map((m) => (
                  <div
                    key={m.usuarioId}
                    onClick={() => setNuevoCapitanId(m.usuarioId)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      background: nuevoCapitanId === m.usuarioId ? "rgba(108,43,217,0.25)" : "rgba(108,43,217,0.1)",
                      border: `2px solid ${nuevoCapitanId === m.usuarioId ? "#6C2BD9" : "rgba(108,43,217,0.25)"}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{m.gamertag || m.nombreUsuario}</span>
                    <Badge estado={m.rol} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center", opacity: nuevoCapitanId ? 1 : 0.5 }} disabled={!nuevoCapitanId || ejecutando} onClick={confirmarTransferencia}>
                  Confirmar
                </button>
                <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowTransferir(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
