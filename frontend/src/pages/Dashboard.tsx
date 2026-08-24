import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Badge from "../components/Badge";
import { misEquipos } from "../api/equipoApi";
import { listar } from "../api/torneoApi";
import { misPartidos } from "../api/partidoApi";
import type { EquipoResponse, TorneoResponse, UsuarioResponse } from "../types";
import { usuarioStorage } from "../utils/apiClient";

export default function Dashboard() {
  const [usuario] = useState<UsuarioResponse | null>(() =>
    usuarioStorage.get<UsuarioResponse>(),
  );
  const [equipos, setEquipos] = useState<EquipoResponse[]>([]);
  const [torneos, setTorneos] = useState<TorneoResponse[]>([]);
  const [partidos, setPartidos] = useState<Awaited<ReturnType<typeof misPartidos>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([misEquipos(), listar(), misPartidos()])
      .then(([eq, tn, pt]) => {
        if (!alive) return;
        setEquipos(eq);
        setTorneos(tn);
        setPartidos(pt);
      })
      .catch((err: Error) => alive && setError(err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const activeTorneos = torneos
    .filter((t) => t.estado === "EN_REGISTRO" || t.estado === "EN_CURSO")
    .slice(0, 3);

  const solicitudesPendientes = equipos.reduce(
    (acc, eq) => acc + eq.solicitudesPendientes.length,
    0,
  );

  const statCards = [
    { label: "Mis equipos", value: String(equipos.length), icon: "🛡️", color: "#6C2BD9" },
    { label: "Torneos activos", value: String(activeTorneos.length || torneos.filter((t) => t.estado === "EN_REGISTRO" || t.estado === "EN_CURSO").length), icon: "🏆", color: "#00D4FF" },
    { label: "Partidos programados", value: String(partidos.length), icon: "⚔️", color: "#F59E0B" },
    { label: "Solicitudes pendientes", value: String(solicitudesPendientes), icon: "⏳", color: "#10B981" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar
        authenticated
        username={usuario?.nombreUsuario ?? ""}
        isAdmin={usuario?.rol === "ADMIN"}
      />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px" }}>
        {/* Error */}
        {error && (
          <div
            className="glass-card"
            style={{ borderRadius: 12, padding: "16px 24px", marginBottom: 28, border: "1px solid rgba(239,68,68,0.35)" }}
          >
            <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
              }}
            >
              {(usuario?.nombreUsuario ?? "U")[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 24, color: "white" }}>
                Bienvenido,{" "}
                <span style={{ background: "linear-gradient(135deg, #6C2BD9, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {usuario?.nombreUsuario ?? "..."}
                </span>
              </h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>{usuario?.gamertag} • Gamertag activo</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          {statCards.map((s) => (
            <div
              key={s.label}
              className="glass-card"
              style={{ borderRadius: 12, padding: "24px 20px", display: "flex", gap: 16, alignItems: "center" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${s.color}22`,
                  border: `1px solid ${s.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 26, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 28, marginBottom: 32 }}>
          {/* My teams */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "white" }}>
                🛡️ Mis Equipos
              </h2>
              <Link to="/equipos" style={{ color: "#A78BFA", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                Ver todos →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {equipos.slice(0, 4).map((eq) => {
                const miRol =
                  eq.miembros.find((m) => m.usuarioId === usuario?.id)?.rol ??
                  (eq.solicitudesPendientes.some((m) => m.usuarioId === usuario?.id)
                    ? "SUPLENTE"
                    : "JUGADOR");
                return (
                  <Link key={eq.id} to={`/equipos/${eq.id}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "rgba(108,43,217,0.08)",
                        border: "1px solid rgba(108,43,217,0.18)",
                        borderRadius: 10,
                        padding: "14px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white", marginBottom: 3 }}>
                          {eq.nombre}
                        </p>
                        <p style={{ color: "#64748B", fontSize: 12 }}>
                          {eq.juegoPrincipal} · {eq.miembros.length} miembros
                        </p>
                      </div>
                      <Badge estado={miRol} />
                    </div>
                  </Link>
                );
              })}
              {!loading && equipos.length === 0 && (
                <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  Todavía no perteneces a ningún equipo.
                </p>
              )}
              <Link
                to="/equipos"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px dashed rgba(108,43,217,0.35)",
                  color: "#6C2BD9",
                  textDecoration: "none",
                  fontSize: 13,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                + Crear nuevo equipo
              </Link>
            </div>
          </div>

          {/* Active tournaments */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "white" }}>
                🏆 Torneos Activos
              </h2>
              <Link to="/torneos" style={{ color: "#A78BFA", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                Ver todos →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeTorneos.map((t) => (
                <Link key={t.id} to={`/torneos/${t.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "rgba(108,43,217,0.08)",
                      border: "1px solid rgba(108,43,217,0.18)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: "white", marginBottom: 3 }}>
                        {t.nombre}
                      </p>
                      <p style={{ color: "#64748B", fontSize: 12 }}>
                        {t.juego} · {t.equiposInscritos}/{t.limiteEquipos} equipos{t.premio ? ` · ${t.premio}` : ""}
                      </p>
                    </div>
                    <Badge estado={t.estado} />
                  </div>
                </Link>
              ))}
              {!loading && activeTorneos.length === 0 && (
                <p style={{ color: "#64748B", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                  No hay torneos activos por ahora.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming matches */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 17, color: "white" }}>
              ⚔️ Mis Partidos
            </h2>
          </div>
          {partidos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {partidos.map((p) => (
                <Link key={p.id} to={`/torneos/${p.torneoId}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "rgba(108,43,217,0.06)",
                      border: "1px solid rgba(108,43,217,0.15)",
                      borderRadius: 12,
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ color: "#64748B", fontSize: 11, fontFamily: "Montserrat, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Ronda {p.ronda}
                      </span>
                      <Badge estado={p.estado} />
                    </div>
                    <div style={{ textAlign: "center", margin: "12px 0" }}>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 13, color: "white", marginBottom: 4 }}>
                        {p.equipo1?.nombre ?? "Por definir"}
                      </p>
                      <p style={{ color: "#6C2BD9", fontWeight: 700, fontSize: 11 }}>VS</p>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 13, color: "white", marginTop: 4 }}>
                        {p.equipo2?.nombre ?? "Por definir"}
                      </p>
                    </div>
                    <p style={{ color: "#64748B", fontSize: 11, textAlign: "center", marginTop: 10 }}>
                      📅 {p.fechaHora ? new Date(p.fechaHora).toLocaleDateString("es", { day: "numeric", month: "short" }) : "Por agendar"}
                    </p>
                    {p.ganador && (
                      <p style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#10B981", fontWeight: 600 }}>
                        Ganador: {p.ganador.nombre}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !loading && (
              <p style={{ color: "#64748B", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                No tienes partidos pendientes. ¡Cuando tu equipo compita aparecerán aquí!
              </p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
