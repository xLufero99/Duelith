// ============================================================
// Tipos que replican los DTOs del backend Spring Boot.
// Fuente: com.duelith.application.dto.*
// ============================================================

// ------------------------- Enums -------------------------

export type EstadoTorneo =
  | "EN_REGISTRO"
  | "INSCRIPCIONES_CERRADAS"
  | "EN_CURSO"
  | "FINALIZADO"
  | "CANCELADO";

export type EstadoPartido = "PENDIENTE" | "EN_JUEGO" | "FINALIZADO" | "WALKOVER";

export type RolEquipo = "CAPITAN" | "JUGADOR" | "SUPLENTE";

// ------------------------ Responses ------------------------

export interface UsuarioResponse {
  id: number;
  nombreUsuario: string;
  email: string;
  gamertag: string;
  rol: string; // ADMIN | JUGADOR
  creadoEn: string;
  activo: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // milisegundos
  usuario: UsuarioResponse;
}

export interface EquipoBasicoResponse {
  id: number;
  nombre: string;
  juegoPrincipal: string;
  capitanNombre: string;
  creadoEn: string;
}

export interface MiembroResponse {
  usuarioId: number;
  nombreUsuario: string;
  gamertag: string;
  rol: RolEquipo;
  fechaIngreso: string | null;
}

export interface EquipoResponse {
  id: number;
  nombre: string;
  juegoPrincipal: string;
  capitanId: number;
  capitanNombre: string;
  creadoEn: string;
  activo: boolean;
  miembros: MiembroResponse[];
  solicitudesPendientes: MiembroResponse[];
}

export interface TorneoResponse {
  id: number;
  nombre: string;
  juego: string;
  descripcion: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  limiteEquipos: number;
  estado: EstadoTorneo;
  premio: string;
  creadoPorId: number;
  creadoPorNombre: string;
  equiposInscritos: number;
  creadoEn: string;
}

export interface TorneoDetalleResponse extends TorneoResponse {
  equiposInscritosDetalle: EquipoBasicoResponse[];
}

export interface InscripcionResponse {
  id: number;
  torneoId: number;
  equipo: EquipoBasicoResponse;
  fechaInscripcion: string;
  confirmado: boolean;
}

export interface PartidoResponse {
  id: number;
  torneoId: number;
  ronda: number;
  numeroPartido: number;
  equipo1: EquipoBasicoResponse | null;
  equipo2: EquipoBasicoResponse | null;
  ganador: EquipoBasicoResponse | null;
  siguientePartidoId: number | null;
  estado: EstadoPartido;
  fechaHora: string | null;
  marcador: string | null;
  reportadoPorNombre: string | null;
}

export interface RondaResponse {
  numeroRonda: number;
  partidos: PartidoResponse[];
}

export interface BracketResponse {
  torneoId: number;
  nombreTorneo: string;
  estadoTorneo: EstadoTorneo;
  totalRondas: number;
  rondas: RondaResponse[];
}

export interface MessageResponse {
  mensaje: string;
}

// ------------------------- Requests -------------------------

export interface RegistroRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  gamertag?: string;
}

export interface LoginRequest {
  identificador: string; // email o nombre de usuario
  password: string;
}

export interface ActualizarPerfilRequest {
  nombreUsuario?: string;
  email?: string;
  gamertag?: string;
}

export interface CrearEquipoRequest {
  nombre: string;
  juegoPrincipal: string;
}

export interface CrearTorneoRequest {
  nombre: string;
  juego: string;
  descripcion?: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  limiteEquipos: number;
  premio?: string;
}

export interface InscribirEquipoRequest {
  equipoId: number;
}

export interface CambiarRolMiembroRequest {
  rol: RolEquipo;
}

export interface ReportarResultadoRequest {
  ganadorId: number;
  marcador?: string;
  walkover?: boolean;
}
