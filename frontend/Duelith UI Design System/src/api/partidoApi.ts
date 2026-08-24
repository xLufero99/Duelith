import { apiClient } from "../utils/apiClient";
import type { PartidoResponse, ReportarResultadoRequest } from "../types";

// Endpoints: com.duelith.interfaces.controller.PartidoController

/** Partidos pendientes o en juego donde participa un equipo del usuario. */
export async function misPartidos(): Promise<PartidoResponse[]> {
  const { data } = await apiClient.get<PartidoResponse[]>("/partidos/mis-partidos");
  return data;
}

/** Solo capitanes implicados. El ganador avanza; la final cierra el torneo. */
export async function reportarResultado(
  id: number,
  request: ReportarResultadoRequest,
): Promise<PartidoResponse> {
  const { data } = await apiClient.patch<PartidoResponse>(
    `/partidos/${id}/reportar`,
    request,
  );
  return data;
}

/** Todos los partidos del bracket ordenados por ronda. Consulta publica. */
export async function listarPorTorneo(torneoId: number): Promise<PartidoResponse[]> {
  const { data } = await apiClient.get<PartidoResponse[]>(`/torneos/${torneoId}/partidos`);
  return data;
}
