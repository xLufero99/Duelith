import { useState } from "react";
import { Link } from "react-router-dom";
import DonacionModal from "./DonacionModal";

export default function Footer() {
  const [donacionAbierta, setDonacionAbierta] = useState(false);

  return (
    <footer
      style={{
        background: "#0A0A0F",
        borderTop: "1px solid rgba(108,43,217,0.2)",
        padding: "48px 32px 32px",
        marginTop: 80,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DUELITH
            </span>
            <p style={{ color: "#64748B", fontSize: 14, marginTop: 12, lineHeight: 1.6, maxWidth: 240 }}>
              La plataforma de torneos e-sports donde los mejores jugadores compiten por la gloria.
            </p>
            <button
              onClick={() => setDonacionAbierta(true)}
              style={{
                marginTop: 16,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                color: "#fff",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              ❤️ Apoyar DUELITH
            </button>
          </div>
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#94A3B8", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>Plataforma</p>
            {["Torneos", "Equipos", "Rankings", "Noticias"].map((item) => (
              <p key={item} style={{ marginBottom: 10 }}>
                <Link to="/" style={{ color: "#64748B", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>
                  {item}
                </Link>
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#94A3B8", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>Soporte</p>
            {["Centro de ayuda", "Contacto", "Reportar problema", "FAQ"].map((item) => (
              <p key={item} style={{ marginBottom: 10 }}>
                <Link to="/" style={{ color: "#64748B", textDecoration: "none", fontSize: 14 }}>
                  {item}
                </Link>
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 13, color: "#94A3B8", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>Legal</p>
            {["Términos de uso", "Privacidad", "Cookies"].map((item) => (
              <p key={item} style={{ marginBottom: 10 }}>
                <Link to="/" style={{ color: "#64748B", textDecoration: "none", fontSize: 14 }}>
                  {item}
                </Link>
              </p>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(108,43,217,0.15)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#64748B", fontSize: 13 }}>© 2026 Duelith. Todos los derechos reservados.</p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Discord", "Twitter", "Twitch"].map((social) => (
              <a key={social} href="#" style={{ color: "#64748B", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}>
                {social}
              </a>
            ))}
          </div>
        </div>
        <DonacionModal
          abierto={donacionAbierta}
          onCerrar={() => setDonacionAbierta(false)}
        />
      </div>
    </footer>
  );
}
