import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Navegacion segun el rol del usuario (AuthContext):
// - JUGADOR/CAPITAN: Torneos, Mis Equipos, Dashboard
// - ORGANIZADOR: Torneos, Mis Torneos, Mis Equipos, Dashboard
// - ADMIN: Torneos, Mis Torneos, Admin, Dashboard
const itemsPorRol = {
  JUGADOR: [
    { to: "/torneos", label: "Torneos" },
    { to: "/equipos", label: "Mis Equipos" },
    { to: "/dashboard", label: "Dashboard" },
  ],
  CAPITAN: [
    { to: "/torneos", label: "Torneos" },
    { to: "/equipos", label: "Mis Equipos" },
    { to: "/dashboard", label: "Dashboard" },
  ],
  ORGANIZADOR: [
    { to: "/torneos", label: "Torneos" },
    { to: "/mis-torneos", label: "Mis Torneos" },
    { to: "/equipos", label: "Mis Equipos" },
    { to: "/dashboard", label: "Dashboard" },
  ],
  ADMIN: [
    { to: "/torneos", label: "Torneos" },
    { to: "/mis-torneos", label: "Mis Torneos" },
    { to: "/admin", label: "Admin" },
    { to: "/dashboard", label: "Dashboard" },
  ],
} as const;

const itemsBase = itemsPorRol.JUGADOR;

export default function Navbar() {
  const { usuario, autenticado } = useAuth();
  const rol = usuario?.rol;
  const items =
    rol && rol in itemsPorRol ? itemsPorRol[rol as keyof typeof itemsPorRol] : itemsBase;
  const puedeCrear = rol === "ORGANIZADOR" || rol === "ADMIN";

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? "#A78BFA" : "#94A3B8",
    background: isActive ? "rgba(108,43,217,0.12)" : "transparent",
    textDecoration: "none",
    fontSize: 14,
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 8,
    transition: "all 0.2s",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(108,43,217,0.2)",
        padding: "14px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: 24,
              background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DUELITH
          </span>
        </Link>

        {autenticado ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {items.map((l) => (
              <NavLink key={l.to} to={l.to} style={linkStyle}>
                {l.label}
              </NavLink>
            ))}
            {puedeCrear && (
              <NavLink
                to="/admin"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: 14,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                  boxShadow: "0 0 16px rgba(108,43,217,0.35)",
                  transition: "all 0.2s",
                }}
              >
                🏆 Crear Torneo
              </NavLink>
            )}
            <NavLink to="/perfil" style={{ textDecoration: "none", marginLeft: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid rgba(108,43,217,0.3)",
                  background: "rgba(108,43,217,0.08)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {(usuario?.nombreUsuario || "U")[0].toUpperCase()}
                </div>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>
                  {usuario?.nombreUsuario}
                </span>
              </div>
            </NavLink>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              to="/torneos"
              style={{ color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}
            >
              Torneos
            </Link>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 18px" }}>
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "8px 18px" }}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
