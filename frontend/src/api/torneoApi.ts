import { apiClient } from "../utils/apiClient";
import type {
  BracketResponse,
  CrearTorneoRequest,
  EstadoTorneo,
  InscribirEquipoRequest,
  MessageResponse,
  TorneoDetalleResponse,
  TorneoResponse,
} from "../types";

// Endpoints: com.duelith.interfaces.controller.TorneoController

/** Exclusivo de administradores. El torneo inicia en EN_REGISTRO. */
export async function crear(request: CrearTorneoRequest): Promise<TorneoResponse> {
  const { data } = await apiClient.post<TorneoResponse>("/torneos", request);
  return data;
}

/** Consulta publica con filtros opcionales por estado y juego. */
export async function listar(filtros?: {
  estado?: EstadoTorneo;
  juego?: string;
}): Promise<TorneoResponse[]> {
  const { data } = await apiClient.get<TorneoResponse[]>("/torneos", { params: filtros });
  return data;
}

/** GET /torneos/mis-torneos. ORGANIZADOR: los suyos. ADMIN: todos. */
export async function misTorneos(): Promise<TorneoResponse[]> {
  const { data } = await apiClient.get<TorneoResponse[]>("/torneos/mis-torneos");
  return data;
}

/** PUT /torneos/{id}. Solo ADMIN o el ORGANIZADOR creador (@IsCreator). */
export async function actualizarTorneo(
  id: number,
  request: CrearTorneoRequest,
): Promise<TorneoResponse> {
  const { data } = await apiClient.put<TorneoResponse>(`/torneos/${id}`, request);
  return data;
}

/** DELETE /torneos/{id}. Solo ADMIN o el ORGANIZADOR creador; sin inscripciones ni partidos. */
export async function borrarTorneo(id: number): Promise<void> {
  await apiClient.delete(`/torneos/${id}`);
}

/** Datos del torneo y equipos inscritos. Consulta publica. */
export async function obtenerDetalle(id: number): Promise<TorneoDetalleResponse> {
  const { data } = await apiClient.get<TorneoDetalleResponse>(`/torneos/${id}`);
  return data;
}

/** Solo el capitan puede inscribir a su equipo (requiere EN_REGISTRO). */
export async function inscribirEquipo(
  torneoId: number,
  request: InscribirEquipoRequest,
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    `/torneos/${torneoId}/inscribir`,
    request,
  );
  return data;
}

/** Solo ADMIN: transicion manual EN_REGISTRO -> INSCRIPCIONES_CERRADAS. */
export async function cerrarInscripciones(torneoId: number): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`/torneos/${torneoId}/cerrar`);
  return data;
}

/** Solo ADMIN: genera el bracket de eliminacion directa y pasa a EN_CURSO. */
export async function generarBracket(torneoId: number): Promise<BracketResponse> {
  const { data } = await apiClient.post<BracketResponse>(`/torneos/${torneoId}/bracket`);
  return data;
}

/** Bracket agrupado por rondas. Consulta publica. */
export async function obtenerBracket(torneoId: number): Promise<BracketResponse> {
  const { data } = await apiClient.get<BracketResponse>(`/torneos/${torneoId}/bracket`);
  return data;
}
