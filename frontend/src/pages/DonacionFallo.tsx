import { Link } from "react-router-dom";

/** Pagina mostrada si el pago en el widget de Wompi fallo. */
export default function DonacionFallo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 24px" }}>
      <div
        style={{
          background: "#12121A",
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 20,
          maxWidth: 440,
          width: "100%",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64 }}>😔</div>
        <h1 style={{ margin: "16px 0 8px", color: "#fff", fontWeight: 800 }}>
          El pago no se completó
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.6 }}>
          La transacción fue rechazada o cancelada. Puedes intentarlo de nuevo
          cuando quieras. Si el dinero fue descontado, se revertirá
          automáticamente.
        </p>
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
