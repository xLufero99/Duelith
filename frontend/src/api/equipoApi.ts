import { apiClient } from "../utils/apiClient";
import type {
  CambiarRolMiembroRequest,
  CrearEquipoRequest,
  EquipoResponse,
  MessageResponse,
} from "../types";

// Endpoints: com.duelith.interfaces.controller.EquipoController

/** Crea un equipo; el usuario autenticado queda como capitan. */
export async function crear(request: CrearEquipoRequest): Promise<EquipoResponse> {
  const { data } = await apiClient.post<EquipoResponse>("/equipos", request);
  return data;
}

/** Equipos donde el usuario tiene membresia (incluye solicitudes pendientes). */
export async function misEquipos(): Promise<EquipoResponse[]> {
  const { data } = await apiClient.get<EquipoResponse[]>("/equipos/mis-equipos");
  return data;
}

/** Detalle de equipo: miembros confirmados y solicitudes pendientes. */
export async function obtenerPorId(id: number): Promise<EquipoResponse> {
  const { data } = await apiClient.get<EquipoResponse>(`/equipos/${id}`);
  return data;
}

/** Crea una solicitud pendiente hasta que el capitan acepte. */
export async function solicitarUnirse(id: number): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`/equipos/${id}/unirse`);
  return data;
}

/** El capitan acepta una solicitud o cambia el rol de un miembro. */
export async function aceptarMiembro(
  id: number,
  usuarioId: number,
  request?: CambiarRolMiembroRequest,
): Promise<EquipoResponse> {
  const { data } = await apiClient.put<EquipoResponse>(
    `/equipos/${id}/miembros/${usuarioId}`,
    request ?? {},
  );
  return data;
}

/** El capitan expulsa a un miembro o rechaza una solicitud pendiente. */
export async function expulsarMiembro(id: number, usuarioId: number): Promise<MessageResponse> {
  const { data } = await apiClient.delete<MessageResponse>(
    `/equipos/${id}/miembros/${usuarioId}`,
  );
  return data;
}

/** Transfiere la capitania a un miembro confirmado. */
export async function transferirCapitania(
  id: number,
  usuarioId: number,
): Promise<EquipoResponse> {
  const { data } = await apiClient.put<EquipoResponse>(
    `/equipos/${id}/transferir/${usuarioId}`,
  );
  return data;
}

/** Sale del equipo; si es el unico integrante el equipo se disuelve. */
export async function abandonar(id: number): Promise<MessageResponse> {
  const { data } = await apiClient.delete<MessageResponse>(`/equipos/${id}/abandonar`);
  return data;
}
