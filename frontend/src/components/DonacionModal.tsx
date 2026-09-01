import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { crearDonacion } from "../api/donacionApi";
import { useAuth } from "../context/AuthContext";
import type { MetodoPagoDonacion } from "../types";

// ============================================================
// Modal de donacion a DUELITH con pasarela Wompi (Nequi/PSE).
// Flujo (widget de Wompi):
//   1. Se inicializa Wompi JS (script en <head>) que genera
//      sessionId y deviceId (identificadores cliente anti-fraude).
//   2. El usuario elige monto, metodo y email.
//   3. POST /donaciones/create -> backend valida y crea la tx.
//   4. El backend devuelve redirectUrl del widget de Wompi.
//   5. Redirigimos al usuario a esa URL para completar el pago.
// La validacion REAL del monto siempre ocurre en el backend.
// ============================================================

const MONTOS_PREDEFINIDOS = [5000, 10000, 25000, 50000];

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 10000000;

const METODO_ICONO: Record<MetodoPagoDonacion, string> = {
  NEQUI: "📱",
  PSE: "🏦",
};

export default function DonacionModal({
  abierto,
  onCerrar,
}: {
  abierto: boolean;
  onCerrar: () => void;
}) {
  const { usuario } = useAuth();
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(5000);
  const [otroValor, setOtroValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoPagoDonacion>("NEQUI");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [fullName, setFullName] = useState(usuario?.nombreUsuario ?? "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>("");
  const deviceIdRef = useRef<string>("");

  // Cargar Wompi JS (en <head>) y generar identificadores al abrir el modal.
  useEffect(() => {
    if (!abierto) return;
    cargarWompiJS();
    sessionIdRef.current = generarId();
    deviceIdRef.current = generarId();
    setError(null);
    setMontoSeleccionado(5000);
    setOtroValor("");
    if (usuario?.email) setEmail(usuario.email);
    if (usuario?.nombreUsuario) setFullName(usuario.nombreUsuario);
  }, [abierto, usuario]);

  const monto = useMemo(() => {
    if (montoSeleccionado !== null) return montoSeleccionado;
    const n = Number(otroValor.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [montoSeleccionado, otroValor]);

  const montoFormateado = useMemo(() => formatearCOP(monto), [monto]);

  if (!abierto) return null;

  function seleccionarMonto(v: number) {
    setMontoSeleccionado(v);
    setOtroValor("");
    setError(null);
  }

  function manejarOtroValor(raw: string) {
    const soloDigitos = raw.replace(/[^0-9]/g, "");
    setOtroValor(formatearCOP(Number(soloDigitos || 0)));
    setMontoSeleccionado(null);
    setError(null);
  }

  function validar(): string | null {
    if (monto < MIN_AMOUNT) {
      return `La donación mínima es de $${formatearCOP(MIN_AMOUNT)} COP.`;
    }
    if (monto > MAX_AMOUNT) {
      return `La donación máxima es de $${formatearCOP(MAX_AMOUNT)} COP.`;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Ingresa un email válido.";
    }
    if (fullName.trim().length < 2) {
      return "Ingresa tu nombre completo.";
    }
    return null;
  }

  async function donar() {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const resultado = await crearDonacion({
        amount: monto,
        email: email.trim(),
        fullName: fullName.trim(),
        paymentMethod: metodo,
        sessionId: sessionIdRef.current,
        deviceId: deviceIdRef.current,
      });
      if (resultado.success && resultado.redirectUrl) {
        window.location.href = resultado.redirectUrl;
      } else {
        setError("No se pudo iniciar el pago. Intenta de nuevo.");
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Error al procesar el pago. Intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      onClick={onCerrar}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#12121A",
          border: "1px solid rgba(108,43,217,0.3)",
          borderRadius: 20,
          maxWidth: 460,
          width: "100%",
          padding: 28,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 22 }}>
            ❤️ Apoyar a DUELITH
          </h2>
          <button
            onClick={onCerrar}
            style={btnCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <p style={{ color: "#94A3B8", fontSize: 14, margin: "8px 0 20px" }}>
          Tu donación nos ayuda a seguir creciendo.
        </p>

        {/* Monto */}
        <p style={label}>Monto a donar</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MONTOS_PREDEFINIDOS.map((v) => {
            const activo = montoSeleccionado === v;
            return (
              <button
                key={v}
                onClick={() => seleccionarMonto(v)}
                style={{ ...btnMonto, ...(activo ? btnMontoActivo : {}) }}
              >
                ${v.toLocaleString("es-CO")}
              </button>
            );
          })}
        </div>
        <input
          value={otroValor}
          onChange={(e) => manejarOtroValor(e.target.value)}
          placeholder="Otro valor"
          inputMode="numeric"
          style={input}
        />
        <p style={{ color: "#64748B", fontSize: 12, margin: "4px 0 0" }}>
          Mínimo ${MIN_AMOUNT.toLocaleString("es-CO")} – Máximo ${MAX_AMOUNT.toLocaleString("es-CO")} COP
        </p>

        {/* Metodo de pago */}
        <p style={{ ...label, marginTop: 20 }}>Método de pago</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(["NEQUI", "PSE"] as MetodoPagoDonacion[]).map((m) => {
            const activo = metodo === m;
            return (
              <button
                key={m}
                onClick={() => setMetodo(m)}
                style={{ ...btnMetodo, ...(activo ? btnMontoActivo : {}) }}
              >
                <span style={{ fontSize: 20 }}>{METODO_ICONO[m]}</span>
                <span>{m === "NEQUI" ? "Nequi" : "PSE"}</span>
              </button>
            );
          })}
        </div>

        {/* Nombre completo */}
        <p style={{ ...label, marginTop: 20 }}>Nombre completo</p>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
          style={input}
        />

        {/* Email */}
        <p style={{ ...label, marginTop: 20 }}>Email del donante</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          style={input}
        />

        {error && (
          <p style={{ color: "#F87171", fontSize: 13, marginTop: 14 }}>{error}</p>
        )}

        <button
          onClick={donar}
          disabled={cargando}
          style={{
            ...botonDonar,
            background: "linear-gradient(135deg, #6C2BD9, #00D4FF)",
            cursor: cargando ? "not-allowed" : "pointer",
            opacity: cargando ? 0.6 : 1,
          }}
        >
          {cargando ? "Procesando..." : `Donar ${montoFormateado} COP`}
        </button>
        <p style={{ color: "#475569", fontSize: 11, textAlign: "center", marginTop: 14 }}>
          Pago seguro procesado por Wompi 🇨🇴 · Nequi o PSE
        </p>
      </div>
    </div>
  );
}

function generarId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

/**
 * Carga el script de Wompi JS en <head> con la public key, solo si aun no
 * esta presente. La public key es publica y solo se usa en el frontend.
 */
function cargarWompiJS() {
  const jsUrl =
    import.meta.env.VITE_WOMPI_JS_URL || "https://cdn.wompi.co/libs/js/v1.js";
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";
  if (document.getElementById("wompi-js")) return;

  const script = document.createElement("script");
  script.id = "wompi-js";
  script.type = "text/javascript";
  script.src = jsUrl;
  script.dataset.integrationType = "IFRAME";
  script.dataset.publicKey = publicKey;
  script.async = true;
  document.head.appendChild(script);
}

function formatearCOP(n: number): string {
  return "$" + n.toLocaleString("es-CO");
}

const label: CSSProperties = {
  color: "#CBD5E1",
  fontSize: 13,
  fontWeight: 600,
  margin: "0 0 8px",
};

const input: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 10,
  background: "#0A0A0F",
  border: "1px solid rgba(108,43,217,0.3)",
  color: "#fff",
  fontSize: 14,
  outline: "none",
};

const btnMonto: CSSProperties = {
  background: "#1A1A24",
  color: "#CBD5E1",
  border: "1px solid rgba(108,43,217,0.25)",
  borderRadius: 10,
  padding: "14px 0",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const btnMontoActivo: CSSProperties = {
  background: "rgba(108,43,217,0.25)",
  border: "1px solid #6C2BD9",
  color: "#fff",
};

const btnMetodo: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "#1A1A24",
  color: "#CBD5E1",
  border: "1px solid rgba(108,43,217,0.25)",
  borderRadius: 10,
  padding: "12px 0",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const botonDonar: CSSProperties = {
  width: "100%",
  marginTop: 20,
  border: "none",
  borderRadius: 12,
  padding: "14px 0",
  color: "#fff",
  fontSize: 16,
  fontWeight: 800,
};

const btnCerrar: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94A3B8",
  fontSize: 18,
  cursor: "pointer",
};
