import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// ============================================================
// Cliente HTTP central del frontend Duelith.
// - baseURL desde VITE_API_URL (ej: http://localhost:8080)
// - Adjunta el token JWT automaticamente
// - Normaliza los errores del backend (ErrorResponse)
// - En 401 limpia la sesion y redirige a /login
// ============================================================

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
  // Con VITE_API_URL=http://localhost:8080 las peticiones van directas al
  // backend (CORS configurado). Si se deja vacio, usan el mismo origen y
  // el proxy de vite.config.ts las reenvia a Spring Boot sin CORS.
  const baseURL = `${import.meta.env.VITE_API_URL ?? ""}/api`;

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
