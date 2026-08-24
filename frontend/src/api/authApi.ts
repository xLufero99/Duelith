import { apiClient } from "../utils/apiClient";
import type {
  ActualizarPerfilRequest,
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  UsuarioResponse,
} from "../types";

// Endpoints: com.duelith.interfaces.controller.AuthController

/** Registra un usuario (rol JUGADOR) y devuelve el JWT de sesion iniciada. */
export async function registrar(request: RegistroRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", request);
  return data;
}

/** Inicia sesion con email o nombre de usuario. Devuelve el token JWT. */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", request);
  return data;
}

/** Datos del usuario autenticado. */
export async function obtenerPerfil(): Promise<UsuarioResponse> {
  const { data } = await apiClient.get<UsuarioResponse>("/auth/me");
  return data;
}

/** Actualiza username, email o gamertag. Campos omitidos no se modifican. */
export async function actualizarPerfil(
  request: ActualizarPerfilRequest,
): Promise<UsuarioResponse> {
  const { data } = await apiClient.put<UsuarioResponse>("/auth/me", request);
  return data;
}
