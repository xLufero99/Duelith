import { Link } from "react-router-dom";
import Badge from "./Badge";

interface Torneo {
  id: number;
  nombre: string;
  juego: string;
  estado: string;
  equiposInscritos: number;
  limiteEquipos: number;
  fechaInicio: string;
  fechaFin: string;
  premio: string;
}

const gameColors: Record<string, string> = {
  Valorant: "#FF4655",
  "League of Legends": "#C89B3C",
  CS2: "#F0A500",
  Fortnite: "#00D4FF",
  "DOTA 2": "#C23C2A",
};

export default function TorneoCard({ torneo }: { torneo: Torneo }) {
  const pct = Math.round((torneo.equiposInscritos / torneo.limiteEquipos) * 100);
  const color = gameColors[torneo.juego] ?? "#6C2BD9";

  return (
    <Link to={`/torneos/${torneo.id}`} style={{ textDecoration: "none" }}>
      <div
        className="glass-card"
        style={{
          borderRadius: 12,
          padding: 24,
          cursor: "pointer",
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              color: color,
              letterSpacing: "0.05em",
            }}
          >
            {torneo.juego.toUpperCase()}
          </div>
          <Badge estado={torneo.estado} />
        </div>

        {/* Title */}
        <div>
          <h3
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: 17,
              color: "white",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {torneo.nombre}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "#94A3B8", fontSize: 13 }}>
              📅 {new Date(torneo.fechaInicio).toLocaleDateString("es", { day: "numeric", month: "short" })} – {new Date(torneo.fechaFin).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Equipos inscritos</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? "#EF4444" : "#10B981" }}>
              {torneo.equiposInscritos}/{torneo.limiteEquipos}
            </span>
          </div>
          <div style={{ height: 4, background: "#1A1A2E", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: pct >= 100 ? "#EF4444" : "linear-gradient(90deg, #6C2BD9, #00D4FF)",
                borderRadius: 4,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Prize */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid rgba(108,43,217,0.15)",
            marginTop: "auto",
          }}
        >
          <span style={{ color: "#64748B", fontSize: 13 }}>Premio</span>
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {torneo.premio}
          </span>
        </div>
      </div>
    </Link>
  );
}
