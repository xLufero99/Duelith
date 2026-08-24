import { NavLink, Link } from "react-router-dom";

interface NavbarProps {
  authenticated?: boolean;
  username?: string;
  isAdmin?: boolean;
}

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/torneos", label: "Torneos" },
  { to: "/equipos", label: "Mis Equipos" },
];

export default function Navbar({ authenticated = false, username = "", isAdmin = false }: NavbarProps) {
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

        {authenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} style={linkStyle}>
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" style={linkStyle}>
                Admin
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
                  {(username || "U")[0].toUpperCase()}
                </div>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>
                  {username}
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
