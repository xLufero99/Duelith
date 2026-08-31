import { apiClient } from "../utils/apiClient";
import type {
  CrearDonacionRequest,
  DonacionResponse,
  DonacionResultadoResponse,
} from "../types";

// Endpoints: com.duelith.interfaces.controller.DonacionController

/** POST /donaciones/create. Publico; devuelve la URL del widget de Wompi. */
export async function crearDonacion(
  request: CrearDonacionRequest,
): Promise<DonacionResultadoResponse> {
  const { data } = await apiClient.post<DonacionResultadoResponse>(
    "/donaciones/create",
    request,
  );
  return data;
}

/** GET /donaciones/{referencia}. Consulta publica del estado. */
export async function estadoDonacion(
  referencia: string,
): Promise<DonacionResponse> {
  const { data } = await apiClient.get<DonacionResponse>(
    `/donaciones/${referencia}`,
  );
  return data;
}

/** GET /donaciones/mis-donaciones. Requiere autenticacion. */
export async function misDonaciones(): Promise<DonacionResponse[]> {
  const { data } = await apiClient.get<DonacionResponse[]>("/donaciones/mis-donaciones");
  return data;
}
