package com.duelith.application.service.impl;

import com.duelith.application.dto.request.CambiarRolMiembroRequest;
import com.duelith.application.dto.request.CrearEquipoRequest;
import com.duelith.application.dto.response.EquipoResponse;
import com.duelith.application.dto.response.MiembroResponse;
import com.duelith.application.exceptions.AccesoDenegadoException;
import com.duelith.application.exceptions.ConflictoException;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.EquipoMapper;
import com.duelith.domain.model.Equipo;
import com.duelith.domain.model.MiembroEquipo;
import com.duelith.domain.model.RolEquipo;
import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.EquipoRepositoryPort;
import com.duelith.domain.repository.MiembroEquipoRepositoryPort;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.domain.service.EquipoServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Gestion de equipos.
 *
 * Convencion de solicitudes: al pedir entrar, el usuario queda registrado como
 * SUPLENTE (pendiente). El capitan lo "acepta" cambiando su rol a JUGADOR.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EquipoServiceImpl implements EquipoServicePort {

    /** Limite de miembros confirmados por equipo. */
    public static final int MAX_MIEMBROS = 5;

    private final EquipoRepositoryPort equipoRepository;
    private final MiembroEquipoRepositoryPort miembroRepository;
    private final UsuarioRepositoryPort usuarioRepository;
    private final EquipoMapper equipoMapper;

    @Override
    @Transactional
    public EquipoResponse crear(Long usuarioId, CrearEquipoRequest request) {
        Usuario fundador = obtenerUsuario(usuarioId);
        if (equipoRepository.existeNombre(request.getNombre())) {
            throw new ConflictoException("Ya existe un equipo con ese nombre");
        }

        Equipo equipo = Equipo.builder()
                .nombre(request.getNombre())
                .capitan(fundador)
                .juegoPrincipal(request.getJuegoPrincipal())
                .creadoEn(OffsetDateTime.now())
                .activo(true)
                .build();
        equipo = equipoRepository.guardar(equipo);

        // El fundador entra automaticamente como capitan.
        miembroRepository.guardar(MiembroEquipo.builder()
                .equipo(equipo)
                .usuario(fundador)
                .rol(RolEquipo.CAPITAN)
                .fechaIngreso(OffsetDateTime.now())
                .build());

        log.info("Equipo creado: {} (id={}) por usuario {}", equipo.getNombre(), equipo.getId(), usuarioId);
        return armarRespuesta(equipo);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipoResponse obtenerPorId(Long equipoId) {
        Equipo equipo = obtenerEquipo(equipoId);
        return armarRespuesta(equipo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipoResponse> misEquipos(Long usuarioId) {
        // Equipos donde el usuario tiene membresia (confirmada o pendiente).
        Set<Long> idsVistos = new LinkedHashSet<>();
        return miembroRepository.buscarPorUsuarioId(usuarioId).stream()
                .map(m -> m.getEquipo().getId())
                .filter(idsVistos::add)
                .map(this::obtenerEquipo)
                .map(this::armarRespuesta)
                .toList();
    }

    @Override
    @Transactional
    public void solicitarUnirse(Long usuarioId, Long equipoId) {
        Usuario solicitante = obtenerUsuario(usuarioId);
        Equipo equipo = obtenerEquipo(equipoId);
        if (!Boolean.TRUE.equals(equipo.getActivo())) {
            throw new ReglaNegocioException("El equipo no esta activo");
        }
        if (miembroRepository.buscarPorEquipoYUsuario(equipoId, usuarioId).isPresent()) {
            throw new ConflictoException("Ya eres miembro o ya tienes una solicitud pendiente en este equipo");
        }

        miembroRepository.guardar(MiembroEquipo.builder()
                .equipo(equipo)
                .usuario(solicitante)
                .rol(RolEquipo.SUPLENTE) // solicitud pendiente hasta que el capitan acepte
                .fechaIngreso(OffsetDateTime.now())
                .build());
        log.info("Solicitud de ingreso: usuario {} -> equipo {}", usuarioId, equipoId);
    }

    @Override
    @Transactional
    public EquipoResponse aceptarMiembro(Long capitanId, Long equipoId, Long usuarioIdObjetivo,
                                         CambiarRolMiembroRequest request) {
        Equipo equipo = obtenerEquipo(equipoId);
        validarCapitan(equipo, capitanId);

        MiembroEquipo miembro = obtenerMiembro(equipoId, usuarioIdObjetivo);
        RolEquipo nuevoRol = (request == null || request.getRol() == null) ? RolEquipo.JUGADOR : request.getRol();

        if (nuevoRol == RolEquipo.CAPITAN) {
            throw new ReglaNegocioException("La capitania se transfiere con el endpoint de transferencia");
        }
        if (miembro.getRol() == RolEquipo.CAPITAN) {
            throw new ReglaNegocioException("No puedes cambiar el rol del capitan");
        }

        // Aceptar una solicitud pendiente consume cupo de miembros confirmados.
        if (miembro.getRol() == RolEquipo.SUPLENTE && nuevoRol != RolEquipo.SUPLENTE) {
            long confirmados = miembroRepository.contarMiembrosConfirmados(equipoId);
            if (confirmados >= MAX_MIEMBROS) {
                throw new ReglaNegocioException("El equipo esta lleno (" + MAX_MIEMBROS + " miembros maximo)");
            }
        }

        miembro.setRol(nuevoRol);
        miembro.setFechaIngreso(OffsetDateTime.now());
        miembroRepository.guardar(miembro);
        log.info("Miembro {} del equipo {} ahora es {}", usuarioIdObjetivo, equipoId, nuevoRol);

        return armarRespuesta(equipo);
    }

    @Override
    @Transactional
    public void expulsarMiembro(Long capitanId, Long equipoId, Long usuarioIdObjetivo) {
        Equipo equipo = obtenerEquipo(equipoId);
        validarCapitan(equipo, capitanId);

        MiembroEquipo miembro = obtenerMiembro(equipoId, usuarioIdObjetivo);
        if (miembro.getRol() == RolEquipo.CAPITAN) {
            throw new ReglaNegocioException("El capitan no puede ser expulsado; transfiere la capitania primero");
        }

        miembroRepository.eliminar(miembro);
        log.info("Miembro {} expulsado del equipo {}", usuarioIdObjetivo, equipoId);
    }

    @Override
    @Transactional
    public EquipoResponse transferirCapitania(Long capitanActualId, Long equipoId, Long nuevoCapitanId) {
        Equipo equipo = obtenerEquipo(equipoId);
        validarCapitan(equipo, capitanActualId);
        if (capitanActualId.equals(nuevoCapitanId)) {
            throw new ReglaNegocioException("Ya eres el capitan de este equipo");
        }

        Usuario nuevoCapitan = obtenerUsuario(nuevoCapitanId);
        MiembroEquipo membresiaNueva = obtenerMiembro(equipoId, nuevoCapitanId);
        if (membresiaNueva.getRol() == RolEquipo.SUPLENTE) {
            throw new ReglaNegocioException("El nuevo capitan debe ser un miembro confirmado del equipo");
        }

        // Intercambio de roles: el anterior capitan pasa a JUGADOR.
        MiembroEquipo membresiaAnterior = obtenerMiembro(equipoId, capitanActualId);
        membresiaAnterior.setRol(RolEquipo.JUGADOR);
        membresiaNueva.setRol(RolEquipo.CAPITAN);
        equipo.setCapitan(nuevoCapitan);

        miembroRepository.guardar(membresiaAnterior);
        miembroRepository.guardar(membresiaNueva);
        equipoRepository.guardar(equipo);
        log.info("Capitania del equipo {} transferida a usuario {}", equipoId, nuevoCapitanId);

        return armarRespuesta(equipo);
    }

    @Override
    @Transactional
    public void abandonar(Long usuarioId, Long equipoId) {
        Equipo equipo = obtenerEquipo(equipoId);
        MiembroEquipo miembro = obtenerMiembro(equipoId, usuarioId);

        if (miembro.getRol() == RolEquipo.CAPITAN) {
            long confirmados = miembroRepository.contarMiembrosConfirmados(equipoId);
            if (confirmados > 1) {
                throw new ReglaNegocioException(
                        "Debes transferir la capitania antes de abandonar el equipo");
            }
            // Ultimo integrante: se disuelve el equipo.
            miembroRepository.eliminar(miembro);
            equipo.setActivo(false);
            equipoRepository.guardar(equipo);
            log.info("Equipo {} disuelto por su capitan {}", equipoId, usuarioId);
            return;
        }

        miembroRepository.eliminar(miembro);
        log.info("Usuario {} abandono el equipo {}", usuarioId, equipoId);
    }

    // ===================== helpers =====================

    private Usuario obtenerUsuario(Long id) {
        return usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", id));
    }

    private Equipo obtenerEquipo(Long id) {
        return equipoRepository.buscarPorId(id)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Equipo", id));
    }

    private MiembroEquipo obtenerMiembro(Long equipoId, Long usuarioId) {
        return miembroRepository.buscarPorEquipoYUsuario(equipoId, usuarioId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Miembro del equipo", usuarioId));
    }

    private void validarCapitan(Equipo equipo, Long usuarioId) {
        if (!usuarioId.equals(equipo.getCapitan().getId())) {
            throw new AccesoDenegadoException("Solo el capitan puede realizar esta operacion");
        }
    }

    /** Arma la respuesta separando miembros confirmados de solicitudes pendientes. */
    private EquipoResponse armarRespuesta(Equipo equipo) {
        List<MiembroEquipo> todos = miembroRepository.buscarPorEquipoId(equipo.getId()).stream()
                .sorted(Comparator.comparing(MiembroEquipo::getFechaIngreso,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        List<MiembroResponse> confirmados = todos.stream()
                .filter(m -> m.getRol() != RolEquipo.SUPLENTE)
                .map(this::aMiembroResponse)
                .toList();
        List<MiembroResponse> pendientes = todos.stream()
                .filter(m -> m.getRol() == RolEquipo.SUPLENTE)
                .map(this::aMiembroResponse)
                .toList();

        EquipoResponse response = equipoMapper.toResponse(equipo);
        response.setMiembros(confirmados);
        response.setSolicitudesPendientes(pendientes);
        return response;
    }

    private MiembroResponse aMiembroResponse(MiembroEquipo m) {
        return MiembroResponse.builder()
                .usuarioId(m.getUsuario().getId())
                .nombreUsuario(m.getUsuario().getNombreUsuario())
                .gamertag(m.getUsuario().getGamertag())
                .rol(m.getRol())
                .fechaIngreso(m.getFechaIngreso())
                .build();
    }
}
