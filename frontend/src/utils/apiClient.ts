import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ============================================================
// Cliente HTTP central del frontend Duelith.
// - baseURL configurable (local / produccion / variable de entorno)
// - Adjunta el token JWT automaticamente (localStorage)
// - Normaliza los errores del backend (ErrorResponse)
// - En 401 limpia la sesion y redirige a /login
// ============================================================

// ===================== CONFIGURACIÓN DE API =====================
// 🔧 Descomenta la línea que necesites (solo debe haber una activa):

// 🔥 LOCAL (desarrollo en tu máquina)
// const API_BASE_URL = "http://localhost:8080";

// 🚀 PRODUCCIÓN (desplegado en Railway)
// const API_BASE_URL = "https://duelith-production.up.railway.app";

// 💡 Usar variable de entorno (alternativa recomendada):
//    Lee VITE_API_URL de .env.development / .env.production y cae a local.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
// ================================================================

const TOKEN_KEY = "duelith_token";
const USUARIO_KEY = "duelith_usuario";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  },
};

export const usuarioStorage = {
  get<T>(): T | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set(usuario: unknown): void {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  },
};

/** Error normalizado que lanzan todos los servicios API. */
export class ApiError extends Error {
  readonly status: number;
  /** Errores de validacion campo -> mensaje (400). */
  readonly errores: Record<string, string>;

  constructor(status: number, mensaje: string, errores: Record<string, string> = {}) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.errores = errores;
  }
}

function crearCliente(): AxiosInstance {
  // Todas las rutas de los servicios ya son relativas (/auth/..., /torneos/...),
  // el sufijo /api va aqui para no repetirlo en cada llamada.
  const baseURL = `${API_BASE_URL}/api`;

  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  // ---- Request: adjuntar JWT ----
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ---- Response: normalizar errores y manejar sesion expirada ----
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<{ mensaje?: string; error?: string; errores?: Record<string, string> }>) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;

      let mensaje =
        data?.mensaje ??
        data?.error ??
        error.message ??
        "Error de conexion con el servidor";
      if (status === 0) {
        mensaje = "No se pudo conectar con el backend. Verifica que este corriendo.";
      }

      // Sesion expirada o token invalido: limpiar y mandar a login.
      // Se omite para login/register para no interrumpir el flujo normal.
      const url = error.config?.url ?? "";
      const esAuthPublica = url.includes("/auth/login") || url.includes("/auth/register");
      if (status === 401 && !esAuthPublica) {
        tokenStorage.clear();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      return Promise.reject(
        new ApiError(status, mensaje, data?.errores ?? {}),
      );
    },
  );

  return client;
}

export const apiClient = crearCliente();
