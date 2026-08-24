import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { convertirOrganizador as convertirApi, obtenerPerfil } from "../api/authApi";
import type { AuthResponse, UsuarioResponse } from "../types";
import { tokenStorage, usuarioStorage } from "../utils/apiClient";

// ============================================================
// Contexto de autenticacion global.
// Fuente de verdad: el usuario en memoria, sincronizado con
// localStorage para que sobreviva recargas de pagina.
// ============================================================

interface AuthContextValue {
  usuario: UsuarioResponse | null;
  rol: string | null;
  autenticado: boolean;
  /** Guarda la sesion tras login/registro y actualiza el contexto. */
  iniciarSesion: (res: AuthResponse) => void;
  /** Reemplaza el usuario en contexto y localStorage. */
  actualizarUsuario: (usuario: UsuarioResponse) => void;
  /** PATCH /auth/convertir-organizador. Devuelve el usuario con el nuevo rol. */
  convertirOrganizador: () => Promise<UsuarioResponse>;
  /** Reconsulta GET /auth/me (ej: al montar la app con token guardado). */
  refrescar: () => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(() =>
    tokenStorage.get() ? usuarioStorage.get<UsuarioResponse>() : null,
  );

  // Token presente pero usuario ausente (o desactualizado): recuperar perfil.
  useEffect(() => {
    if (tokenStorage.get()) {
      refrescar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciarSesion = useCallback((res: AuthResponse) => {
    tokenStorage.set(res.token);
    usuarioStorage.set(res.usuario);
    setUsuario(res.usuario);
  }, []);

  const actualizarUsuario = useCallback((nuevo: UsuarioResponse) => {
    usuarioStorage.set(nuevo);
    setUsuario(nuevo);
  }, []);

  const convertirOrganizador = useCallback(async () => {
    const actualizado = await convertirApi();
    usuarioStorage.set(actualizado);
    setUsuario(actualizado);
    return actualizado;
  }, []);

  const refrescar = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const actual = await obtenerPerfil();
      usuarioStorage.set(actual);
      setUsuario(actual);
    } catch {
      // El interceptor de apiClient ya gestiona el 401 (limpia + redirect).
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    tokenStorage.clear();
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      rol: usuario?.rol ?? null,
      autenticado: !!usuario && !!tokenStorage.get(),
      iniciarSesion,
      actualizarUsuario,
      convertirOrganizador,
      refrescar,
      cerrarSesion,
    }),
    [
      usuario,
      iniciarSesion,
      actualizarUsuario,
      convertirOrganizador,
      refrescar,
      cerrarSesion,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
