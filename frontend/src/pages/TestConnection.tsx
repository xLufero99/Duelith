import { useState } from "react";
import Navbar from "../components/Navbar";
import { listar } from "../api/torneoApi";
import { ApiError } from "../utils/apiClient";
import type { TorneoResponse } from "../types";

type EstadoPrueba = "inactiva" | "cargando" | "exitosa" | "fallida";

interface Resultado {
  estado: EstadoPrueba;
  latenciaMs?: number;
  mensaje?: string;
  torneos?: TorneoResponse[];
}

const cardStyle = {
  background: "#12121C",
  border: "1px solid #232338",
  borderRadius: 12,
  padding: 24,
} as const;

export default function TestConnection() {
  const [resultado, setResultado] = useState<Resultado>({ estado: "inactiva" });

  const probar = async () => {
    setResultado({ estado: "cargando" });
    const inicio = performance.now();
    try {
      const torneos = await listar();
      setResultado({
        estado: "exitosa",
        latenciaMs: Math.round(performance.now() - inicio),
        mensaje: "Conexion exitosa con el backend",
        torneos,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setResultado({
        estado: "fallida",
        latenciaMs: Math.round(performance.now() - inicio),
        mensaje:
          apiError instanceof ApiError
            ? `HTTP ${apiError.status || "N/A"} - ${apiError.message}`
            : "Error inesperado al conectar",
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <Navbar authenticated username="lufero" />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        <h1
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            color: "white",
            marginBottom: 6,
          }}
        >
          Probar Conexion
        </h1>
        <p style={{ color: "#64748B", fontSize: 15, marginBottom: 32 }}>
          GET {`${import.meta.env.VITE_API_URL || "(proxy mismo origen)"}`}/api/torneos
        </p>

        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <button onClick={probar} disabled={resultado.estado === "cargando"} className="btn-primary">
            {resultado.estado === "cargando" ? "Probando..." : "Probar conexion"}
          </button>
        </div>

        {resultado.estado === "exitosa" && (
          <div style={{ ...cardStyle, borderColor: "#22C55E", marginBottom: 24 }}>
            <p style={{ color: "#22C55E", fontWeight: 700, fontSize: 16 }}>
              Conexion exitosa ({resultado.latenciaMs} ms)
            </p>
            <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 8 }}>
              {resultado.torneos?.length ?? 0} torneo(s) recibido(s) del backend
            </p>
          </div>
        )}

        {resultado.estado === "fallida" && (
          <div style={{ ...cardStyle, borderColor: "#EF4444", marginBottom: 24 }}>
            <p style={{ color: "#EF4444", fontWeight: 700, fontSize: 16 }}>Fallo la conexion</p>
            <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 8 }}>{resultado.mensaje}</p>
          </div>
        )}

        {(resultado.estado === "exitosa" || resultado.estado === "fallida") && (
          <div style={cardStyle}>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 12,
              }}
            >
              Respuesta cruda:
            </p>
            <pre
              style={{
                background: "#0A0A0F",
                border: "1px solid #232338",
                borderRadius: 8,
                padding: 16,
                overflowX: "auto",
                maxHeight: 400,
                overflowY: "auto",
                fontSize: 13,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {JSON.stringify(resultado.torneos ?? resultado.mensaje, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
