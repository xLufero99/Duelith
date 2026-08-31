import { Link, useSearchParams } from "react-router-dom";

/** Pagina mostrada tras pagar con exito en el widget de Wompi. */
export default function DonacionExito() {
  const [params] = useSearchParams();
  const reference = params.get("reference");

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div
        style={{
          background: "#12121A",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 20,
          maxWidth: 440,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64 }}>🎉</div>
        <h1 style={{ margin: "16px 0 8px", color: "#fff", fontWeight: 800 }}>
          ¡Gracias por tu apoyo!
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.6 }}>
          Tu donación ayuda a DUELITH a seguir creciendo. Pronto recibirás la
          confirmación en tu correo.
        </p>
        {reference && (
          <p style={{ color: "#64748B", fontSize: 12, marginTop: 16 }}>
            Referencia: <span style={{ color: "#A78BFA" }}>{reference}</span>
          </p>
        )}
        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: 24,
            padding: "12px 24px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
