import { Link, useSearchParams } from "react-router-dom";

/** Pagina mostrada si el pago queda pendiente (ej: Nequi sin confirmar). */
export default function DonacionPendiente() {
  const [params] = useSearchParams();
  const reference = params.get("reference");

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div
        style={{
          background: "#12121A",
          border: "1px solid rgba(250,204,21,0.3)",
          borderRadius: 20,
          maxWidth: 440,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64 }}>⏳</div>
        <h1 style={{ margin: "16px 0 8px", color: "#fff", fontWeight: 800 }}>
          Pago pendiente
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.6 }}>
          Estamos esperando la confirmación de tu banco o de Nequi. Te
          notificaremos cuando el pago se confirme.
        </p>
        {reference && (
          <p style={{ color: "#64748B", fontSize: 12, marginTop: 16 }}>
            Referencia: <span style={{ color: "#FACC15" }}>{reference}</span>
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
