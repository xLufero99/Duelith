interface BadgeProps {
  estado: string;
}

const config: Record<string, { bg: string; color: string; border: string; label: string }> = {
  EN_REGISTRO: { bg: "rgba(16,185,129,0.15)", color: "#10B981", border: "rgba(16,185,129,0.4)", label: "En Registro" },
  EN_CURSO: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "rgba(245,158,11,0.4)", label: "En Curso" },
  FINALIZADO: { bg: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "rgba(59,130,246,0.4)", label: "Finalizado" },
  CANCELADO: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "rgba(239,68,68,0.4)", label: "Cancelado" },
  CAPITAN: { bg: "rgba(108,43,217,0.2)", color: "#A78BFA", border: "rgba(108,43,217,0.5)", label: "Capitán" },
  JUGADOR: { bg: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "rgba(0,212,255,0.35)", label: "Jugador" },
  PENDIENTE: { bg: "rgba(100,116,139,0.15)", color: "#94A3B8", border: "rgba(100,116,139,0.3)", label: "Pendiente" },
  EN_JUEGO: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "rgba(245,158,11,0.4)", label: "En Juego" },
};

export default function Badge({ estado }: BadgeProps) {
  const c = config[estado] ?? { bg: "rgba(100,116,139,0.15)", color: "#94A3B8", border: "rgba(100,116,139,0.3)", label: estado };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
