import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import {
  cerrarInscripciones,
  generarBracket,
  inscribirEquipo,
  obtenerBracket,
  obtenerDetalle,
} from "../api/torneoApi";
import { listarPorTorneo, reportarResultado } from "../api/partidoApi";
import { misEquipos } from "../api/equipoApi";
import type {
  BracketResponse,
  EquipoResponse,
  PartidoResponse,
  TorneoDetalleResponse,
} from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

const tabs = ["Información", "Equipos", "Bracket", "Partidos"];

function nombreRonda(numero: number, total: number): string {
  if (numero === total && total > 0) return "Final";
  if (numero === total - 1) return "Semifinal";
  if (numero === total - 2) return "Cuartos de Final";
  return `Ronda ${numero}`;
}

interface ReportarModalProps {
  partido: PartidoResponse;
  onClose: () => void;
  onConfirm: (ganadorId: number, marcador?: string) => Promise<void>;
}

function ReportarModal({ partido, onClose, onConfirm }: ReportarModalProps) {
  const [ganadorId, setGanadorId] = useState<number | null>(null);
  const [marcador, setMarcador] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const opciones = [
    { id: partido.equipo1?.id, nombre: partido.equipo1?.nombre },
    { id: partido.equipo2?.id, nombre: partido.equipo2?.nombre },
  ].filter((o): o is { id: number; nombre: string } => o.id != null);

  const confirmar = async () => {
    if (!ganadorId) return;
    setLoading(true);
    setError("");
    try {
      await onConfirm(ganadorId, marcador.trim() || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo reportar el resultado");
    } finally {
      setLoading(false);
    }
  };

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
          Selecciona el equipo ganador del partido:{" "}
          <strong style={{ color: "white" }}>
            {partido.equipo1?.nombre ?? "Por definir"} vs {partido.equipo2?.nombre ?? "Por definir"}
          </strong>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {opciones.map((op) => (
            <button
              key={op.id}
              onClick={() => setGanadorId(op.id)}
              style={{
                padding: "14px 20px",
                borderRadius: 10,
                border: `2px solid ${ganadorId === op.id ? "#6C2BD9" : "rgba(108,43,217,0.2)"}`,
                background: ganadorId === op.id ? "rgba(108,43,217,0.2)" : "rgba(22,33,62,0.5)",
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
              {ganadorId === op.id && <span style={{ color: "#10B981" }}>✓</span>}
              {op.nombre}
            </button>
          ))}
        </div>
        <input
          className="input-field"
          placeholder="Marcador (opcional, ej: 13-7)"
          value={marcador}
          onChange={(e) => setMarcador(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        {error && (
          <p style={{ color: "#F87171", fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center", opacity: ganadorId && !loading ? 1 : 0.5 }}
            disabled={!ganadorId || loading}
            onClick={confirmar}
          >
            {loading ? "Reportando..." : "Confirmar resultado"}
          </button>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

interface PropsBracket {
  bracket: BracketResponse | null;
  puedeReportar: boolean;
  onReportar: (p: PartidoResponse) => void;
}

function BracketView({ bracket, puedeReportar, onReportar }: PropsBracket) {
  if (!bracket || bracket.rondas.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🗺️</div>
        <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "white", marginBottom: 6 }}>
          Bracket no generado
        </h3>
        <p style={{ color: "#64748B", fontSize: 14 }}>
          El bracket aparecerá cuando un administrador lo genere.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: "auto", padding: "8px 0" }}>
        <div style={{ display: "flex", gap: 0, minWidth: 700, alignItems: "center" }}>
          {bracket.rondas.map((ronda, ri) => (
            <div key={ronda.numeroRonda} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ minWidth: 180, padding: "0 12px" }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 11, color: "#6C2BD9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, textAlign: "center" }}>
                  {nombreRonda(ronda.numeroRonda, bracket.totalRondas)}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ri === 0 ? 12 : ri === 1 ? 60 : 24,
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
                      {[partido.equipo1?.nombre ?? "Por definir", partido.equipo2?.nombre ?? "Por definir"].map((eqNombre, ei) => (
                        <div
                          key={ei}
                          style={{
                            padding: "10px 14px",
                            background: partido.ganador?.nombre === eqNombre ? "rgba(108,43,217,0.2)" : "transparent",
                            borderBottom: ei === 0 ? "1px solid rgba(108,43,217,0.2)" : "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: partido.ganador?.nombre === eqNombre ? 700 : 400, fontSize: 12, color: partido.ganador?.nombre === eqNombre ? "white" : "#94A3B8" }}>
                            {eqNombre}
                          </span>
                          {partido.marcador && (
                            <span style={{ color: "#00D4FF", fontSize: 11, fontWeight: 700 }}>{partido.marcador}</span>
                          )}
                        </div>
                      ))}
                      {puedeReportar && partido.estado !== "FINALIZADO" && partido.estado !== "WALKOVER" && (
                        <button
                          onClick={() => onReportar(partido)}
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
  const torneoId = Number(id);
  const [activeTab, setActiveTab] = useState("Información");
  const [inscribirOpen, setInscribirOpen] = useState(false);
  const [torneo, setTorneo] = useState<TorneoDetalleResponse | null>(null);
  const [bracket, setBracket] = useState<BracketResponse | null>(null);
  const [partidosTorneo, setPartidosTorneo] = useState<PartidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionMsg, setAccionMsg] = useState("");

  const usuario = usuarioStorage.get<{ id: number; rol: string }>();
  const autenticado = !!tokenStorage.get();
  const esAdmin = usuario?.rol === "ADMIN" || usuario?.rol === "ORGANIZADOR";

  const cargarTodo = useCallback(async () => {
    try {
      const [detalle, brkt, parts] = await Promise.all([
        obtenerDetalle(torneoId),
        obtenerBracket(torneoId),
        listarPorTorneo(torneoId),
      ]);
      setTorneo(detalle);
      setBracket(brkt);
      setPartidosTorneo(parts);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el torneo");
    } finally {
      setLoading(false);
    }
  }, [torneoId]);

  useEffect(() => {
    setLoading(true);
    cargarTodo();
  }, [cargarTodo]);

  // ---- Acciones ----
  const [misEquiposLista, setMisEquiposLista] = useState<EquipoResponse[]>([]);

  const abrirModalInscripcion = async () => {
    setAccionMsg("");
    setInscribirOpen(true);
    try {
      setMisEquiposLista(await misEquipos());
    } catch (err) {
      setAccionMsg(err instanceof Error ? err.message : "Error al cargar tus equipos");
    }
  };

  const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [inscripcionError, setInscripcionError] = useState("");

  const confirmarInscripcion = async () => {
    if (!equipoSeleccionado) return;
    setInscribiendo(true);
    setInscripcionError("");
    try {
      const res = await inscribirEquipo(torneoId, { equipoId: equipoSeleccionado });
      setAccionMsg(res.mensaje);
      setInscribirOpen(false);
      setEquipoSeleccionado(null);
      await cargarTodo();
    } catch (err) {
      setInscripcionError(err instanceof Error ? err.message : "No se pudo inscribir");
    } finally {
      setInscribiendo(false);
    }
  };

  const [ejecutando, setEjecutando] = useState(false);

  const ejecutarAdmin = async (accion: () => Promise<unknown>) => {
    setEjecutando(true);
    setAccionMsg("");
    setError("");
    try {
      const res = await accion();
      setAccionMsg((res as { mensaje?: string } | null)?.mensaje ?? "Operación realizada");
      await cargarTodo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acción fallida");
    } finally {
      setEjecutando(false);
    }
  };

  const [partidoAReportar, setPartidoAReportar] = useState<PartidoResponse | null>(null);

  const confirmarResultado = async (ganadorId: number, marcador?: string) => {
    if (!partidoAReportar) return;
    await reportarResultado(partidoAReportar.id, { ganadorId, ...(marcador ? { marcador } : {}) });
    await cargarTodo();
  };

  const pct = torneo ? Math.round((torneo.equiposInscritos / torneo.limiteEquipos) * 100) : 0;

  if (loading && !torneo) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 15 }}>Cargando torneo...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      {/* Modal inscribir */}
      {inscribirOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setInscribirOpen(false)}
        >
          <div className="glass-card" style={{ borderRadius: 16, padding: 36, maxWidth: 400, width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20, color: "white", marginBottom: 16 }}>Inscribir Equipo</h3>
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>Selecciona el equipo que deseas inscribir en <strong style={{ color: "white" }}>{torneo?.nombre}</strong>:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {(() => {
                const inscritos = new Set(torneo?.equiposInscritosDetalle.map((e) => e.id) ?? []);
                const disponibles = misEquiposLista.filter(
                  (eq) => !inscritos.has(eq.id) && eq.juegoPrincipal.toLowerCase() === (torneo?.juego ?? "").toLowerCase(),
                );
                if (disponibles.length === 0) {
                  return (
                    <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                      No tienes equipos de {torneo?.juego} disponibles para inscribir.
                    </p>
                  );
                }
                return disponibles.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => setEquipoSeleccionado(eq.id)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      background: equipoSeleccionado === eq.id ? "rgba(108,43,217,0.25)" : "rgba(108,43,217,0.12)",
                      border: `2px solid ${equipoSeleccionado === eq.id ? "#6C2BD9" : "rgba(108,43,217,0.25)"}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{eq.nombre}</span>
                    <span style={{ color: "#64748B", fontSize: 13 }}>{eq.juegoPrincipal}</span>
                  </div>
                ));
              })()}
            </div>
            {inscripcionError && (
              <p style={{ color: "#F87171", fontSize: 13, marginBottom: 16 }}>{inscripcionError}</p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center", opacity: equipoSeleccionado && !inscribiendo ? 1 : 0.5 }}
                disabled={!equipoSeleccionado || inscribiendo}
                onClick={confirmarInscripcion}
              >
                {inscribiendo ? "Inscribiendo..." : "Inscribir"}
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setInscribirOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reportar */}
      {partidoAReportar && (
        <ReportarModal
          partido={partidoAReportar}
          onClose={() => setPartidoAReportar(null)}
          onConfirm={confirmarResultado}
        />
      )}

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#64748B" }}>
          <Link to="/torneos" style={{ color: "#94A3B8", textDecoration: "none" }}>Torneos</Link>
          <span>›</span>
          <span style={{ color: "white" }}>{torneo?.nombre}</span>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(239,68,68,0.35)" }}>
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          </div>
        )}
        {accionMsg && (
          <div className="glass-card" style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 20, border: "1px solid rgba(16,185,129,0.35)" }}>
            <p style={{ color: "#34D399", fontSize: 14 }}>✓ {accionMsg}</p>
          </div>
        )}

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
                  {torneo?.nombre}
                </h1>
                <Badge estado={torneo?.estado ?? ""} />
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>🎮 {torneo?.juego}</span>
                <span style={{ color: "#94A3B8", fontSize: 14 }}>👥 {torneo?.equiposInscritos}/{torneo?.limiteEquipos} equipos</span>
                {torneo?.fechaInicio && torneo?.fechaFin && (
                  <span style={{ color: "#94A3B8", fontSize: 14 }}>
                    📅 {new Date(torneo.fechaInicio).toLocaleDateString("es")} – {new Date(torneo.fechaFin).toLocaleDateString("es")}
                  </span>
                )}
                {torneo?.premio && (
                  <span style={{ color: "#F59E0B", fontSize: 14, fontWeight: 600 }}>💰 {torneo.premio}</span>
                )}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>Equipos inscritos</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? "#EF4444" : "#10B981" }}>
                    {torneo?.equiposInscritos}/{torneo?.limiteEquipos}
                  </span>
                </div>
                <div style={{ height: 6, background: "#1A1A2E", borderRadius: 4, overflow: "hidden", maxWidth: 300 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6C2BD9, #00D4FF)", borderRadius: 4 }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {autenticado && torneo?.estado === "EN_REGISTRO" && (
                <button className="btn-primary" onClick={abrirModalInscripcion}>+ Inscribir Equipo</button>
              )}
              {esAdmin && torneo?.estado === "EN_REGISTRO" && (
                <button className="btn-secondary" disabled={ejecutando} onClick={() => ejecutarAdmin(() => cerrarInscripciones(torneoId))}>
                  Cerrar inscripciones
                </button>
              )}
              {esAdmin && (torneo?.estado === "INSCRIPCIONES_CERRADAS") && (
                <button className="btn-secondary" disabled={ejecutando} onClick={() => ejecutarAdmin(() => generarBracket(torneoId))}>
                  ⚡ Generar Bracket
                </button>
              )}
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
              <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{torneo?.descripcion || "Sin descripción."}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { label: "Fecha de inicio", value: torneo?.fechaInicio ? new Date(torneo.fechaInicio).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: "📅" },
                  { label: "Fecha de cierre", value: torneo?.fechaFin ? new Date(torneo.fechaFin).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: "🏁" },
                  { label: "Premio total", value: torneo?.premio || "—", icon: "💰" },
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
                  Equipos Inscritos ({torneo?.equiposInscritosDetalle.length ?? 0})
                </h3>
                <input className="input-field" placeholder="🔍 Buscar equipo..." style={{ maxWidth: 220 }} disabled />
              </div>
              {(torneo?.equiposInscritosDetalle.length ?? 0) > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "Equipo", "Capitán", "Juego", "Fundado"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(108,43,217,0.15)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {torneo!.equiposInscritosDetalle.map((eq, i) => (
                      <tr key={eq.id} style={{ borderBottom: "1px solid rgba(108,43,217,0.08)", transition: "background 0.2s" }}>
                        <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 14 }}>{i + 1}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <Link to={`/equipos/${eq.id}`} style={{ textDecoration: "none" }}>
                            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white" }}>{eq.nombre}</span>
                          </Link>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 14 }}>{eq.capitanNombre}</td>
                        <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: 14 }}>{eq.juegoPrincipal}</td>
                        <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 13 }}>{new Date(eq.creadoEn).toLocaleDateString("es")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                  Aún no hay equipos inscritos en este torneo.
                </p>
              )}
            </div>
          )}

          {activeTab === "Bracket" && (
            <BracketView
              bracket={bracket}
              puedeReportar={autenticado}
              onReportar={(p) => setPartidoAReportar(p)}
            />
          )}

          {activeTab === "Partidos" && (
            <div>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "white", marginBottom: 20 }}>Partidos del Torneo</h3>
              {partidosTorneo.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {partidosTorneo.map((p) => (
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
                        <span style={{ color: "#64748B", fontSize: 12, fontFamily: "Montserrat, sans-serif", fontWeight: 600, textTransform: "uppercase", minWidth: 100 }}>
                          {nombreRonda(p.ronda, bracket?.totalRondas ?? p.ronda)}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: p.ganador?.id === p.equipo1?.id ? "white" : "#94A3B8" }}>
                            {p.equipo1?.nombre ?? "Por definir"}
                          </span>
                          <span style={{ color: "#6C2BD9", fontWeight: 800, fontSize: 12 }}>
                            {p.marcador ? p.marcador : "VS"}
                          </span>
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: p.ganador?.id === p.equipo2?.id ? "white" : "#94A3B8" }}>
                            {p.equipo2?.nombre ?? "Por definir"}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {p.ganador && (
                          <span style={{ color: "#10B981", fontSize: 12, fontWeight: 600 }}>Ganador: {p.ganador.nombre}</span>
                        )}
                        <Badge estado={p.estado} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                  Todavía no hay partidos generados para este torneo.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
