import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TorneoCard from "../components/TorneoCard";
import { listar } from "../api/torneoApi";
import type { TorneoResponse } from "../types";

const steps = [
  { icon: "🎮", num: "01", title: "Regístrate", desc: "Crea tu cuenta en segundos y configura tu perfil con tu gamertag." },
  { icon: "🛡️", num: "02", title: "Crea tu Equipo", desc: "Forma tu squad, invita a tus amigos y elige tu juego principal." },
  { icon: "🏆", num: "03", title: "Compite y Gana", desc: "Inscríbete en torneos, supera el bracket y llévate los premios." },
];

export default function Landing() {
  const [featured, setFeatured] = useState<TorneoResponse[]>([]);
  const [todos, setTodos] = useState<TorneoResponse[]>([]);

  useEffect(() => {
    listar()
      .then((lista) => {
        setTodos(lista);
        setFeatured(
          lista
            .filter((t) => t.estado === "EN_REGISTRO" || t.estado === "EN_CURSO")
            .slice(0, 3),
        );
      })
      .catch(() => {
        setTodos([]);
        setFeatured([]);
      });
  }, []);

  const stats = [
    { value: String(todos.length), label: "Torneos totales" },
    { value: String(todos.filter((t) => t.estado === "EN_REGISTRO").length), label: "Con inscripciones abiertas" },
    { value: String(todos.filter((t) => t.estado === "EN_CURSO").length), label: "En curso ahora" },
    { value: String(todos.filter((t) => t.estado === "FINALIZADO").length), label: "Torneos finalizados" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "100px 32px 80px",
          textAlign: "center",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(108,43,217,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            right: "10%",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 860, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(108,43,217,0.15)",
              border: "1px solid rgba(108,43,217,0.35)",
              borderRadius: 20,
              padding: "6px 16px",
              marginBottom: 24,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
              {featured.length > 0 ? `${featured.length} torneo${featured.length !== 1 ? "s" : ""} activo${featured.length !== 1 ? "s" : ""} ahora mismo` : "Próximos torneos muy pronto"}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(42px, 7vw, 80px)",
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #ffffff 30%, #6C2BD9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DOMINA EL TORNEO,
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DEMUESTRA TU PODER
            </span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#94A3B8",
              lineHeight: 1.7,
              maxWidth: 560,
              margin: "0 auto 40px",
            }}
          >
            La plataforma de torneos e-sports donde equipos de toda la región compiten por premios reales y la gloria eterna.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/torneos"
              className="btn-primary"
              style={{ textDecoration: "none", fontSize: 15, padding: "14px 32px" }}
            >
              🏆 Ver Torneos
            </Link>
            <Link
              to="/register"
              className="btn-secondary"
              style={{ textDecoration: "none", fontSize: 15, padding: "14px 32px" }}
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: "0 32px 72px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            background: "rgba(22,33,62,0.6)",
            border: "1px solid rgba(108,43,217,0.2)",
            borderRadius: 16,
            padding: "32px 48px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: 36,
                  background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 6,
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "#64748B", fontSize: 14 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured tournaments */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "white",
                  marginBottom: 6,
                }}
              >
                Torneos Destacados
              </h2>
              <p style={{ color: "#64748B", fontSize: 15 }}>Inscríbete antes de que se llenen los cupos</p>
            </div>
            <Link
              to="/torneos"
              className="btn-secondary"
              style={{ textDecoration: "none", fontSize: 14 }}
            >
              Ver todos →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {featured.map((t) => (
                <TorneoCard key={t.id} torneo={t} />
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748B", fontSize: 15, textAlign: "center", padding: "32px 0" }}>
              Aún no hay torneos publicados. Vuelve pronto.
            </p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 32,
                color: "white",
                marginBottom: 12,
              }}
            >
              ¿Cómo funciona?
            </h2>
            <p style={{ color: "#64748B", fontSize: 16 }}>Tres pasos para empezar a competir</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="glass-card"
                style={{
                  borderRadius: 16,
                  padding: 36,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -10,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 900,
                    fontSize: 80,
                    color: "rgba(108,43,217,0.06)",
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{step.icon}</div>
                <h3
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "white",
                    marginBottom: 12,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: -24,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6C2BD9",
                      fontSize: 24,
                      zIndex: 2,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 32px 80px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            background: "linear-gradient(135deg, rgba(108,43,217,0.3), rgba(0,212,255,0.1))",
            border: "1px solid rgba(108,43,217,0.4)",
            borderRadius: 20,
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: 36,
              color: "white",
              marginBottom: 16,
            }}
          >
            ¿Listo para dominar?
          </h2>
          <p style={{ color: "#94A3B8", fontSize: 17, marginBottom: 36 }}>
            Crea tu cuenta, arma tu equipo y empieza tu camino hacia la gloria.
          </p>
          <Link
            to="/register"
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: 16, padding: "16px 40px" }}
          >
            🚀 Registrarse gratis
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
