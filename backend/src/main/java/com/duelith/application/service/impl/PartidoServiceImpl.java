package com.duelith.application.service.impl;

import com.duelith.application.dto.request.ReportarResultadoRequest;
import com.duelith.application.dto.response.PartidoResponse;
import com.duelith.application.exceptions.AccesoDenegadoException;
import com.duelith.application.exceptions.ConflictoException;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.PartidoMapper;
import com.duelith.domain.model.Equipo;
import com.duelith.domain.model.EstadoPartido;
import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.model.MiembroEquipo;
import com.duelith.domain.model.Partido;
import com.duelith.domain.model.RolEquipo;
import com.duelith.domain.repository.MiembroEquipoRepositoryPort;
import com.duelith.domain.repository.PartidoRepositoryPort;
import com.duelith.domain.repository.TorneoRepositoryPort;
import com.duelith.domain.service.PartidoServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Consulta y reporte de resultados del bracket.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PartidoServiceImpl implements PartidoServicePort {

    private final PartidoRepositoryPort partidoRepository;
    private final MiembroEquipoRepositoryPort miembroRepository;
    private final TorneoRepositoryPort torneoRepository;
    private final PartidoMapper partidoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PartidoResponse> misPartidos(Long usuarioId) {
        // Equipos donde el usuario es miembro confirmado (capitan o jugador).
        List<Long> misEquiposIds = miembroRepository.buscarPorUsuarioId(usuarioId).stream()
                .filter(m -> m.getRol() == RolEquipo.CAPITAN || m.getRol() == RolEquipo.JUGADOR)
                .map(m -> m.getEquipo().getId())
                .distinct()
                .toList();

        return partidoRepository
                .buscarProximosPorEquipos(misEquiposIds,
                        List.of(EstadoPartido.PENDIENTE, EstadoPartido.EN_JUEGO))
                .stream()
                .map(partidoMapper::toResponse)
                .toList();
    }

    /**
     * Reporte de resultado por un capitan.
     *
     * Concurrencia: se toma SELECT ... FOR UPDATE sobre el partido, de modo que
     * si dos capitanes (o el mismo dos veces) reportan a la vez, el segundo ve
     * el estado FINALIZADO/WALKOVER y recibe 409 en lugar de duplicar el avance.
     */
    @Override
    @Transactional
    public PartidoResponse reportarResultado(Long usuarioId, Long partidoId, ReportarResultadoRequest request) {
        Partido partido = partidoRepository.buscarPorIdConBloqueo(partidoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Partido", partidoId));

        if (partido.getEstado() == EstadoPartido.FINALIZADO
                || partido.getEstado() == EstadoPartido.WALKOVER) {
            throw new ConflictoException("El resultado de este partido ya fue reportado");
        }
        if (partido.getEquipo1() == null || partido.getEquipo2() == null) {
            throw new ReglaNegocioException("El partido aun no tiene ambos equipos definidos");
        }

        validarCapitanDeParticipante(usuarioId, partido);

        Equipo ganador = equipoGanadorValido(partido, request.getGanadorId());

        partido.setGanador(ganador);
        partido.setMarcador(request.getMarcador());
        partido.setFechaHora(OffsetDateTime.now());
        partido.setEstado(Boolean.TRUE.equals(request.getWalkover())
                ? EstadoPartido.WALKOVER
                : EstadoPartido.FINALIZADO);

        // Usuario que reporta (capitan de uno de los dos equipos).
        var reportador = miembroRepository.buscarPorEquipoYUsuario(
                        partido.getEquipo1().getId(), usuarioId)
                .map(MiembroEquipo::getUsuario)
                .or(() -> miembroRepository.buscarPorEquipoYUsuario(
                        partido.getEquipo2().getId(), usuarioId).map(MiembroEquipo::getUsuario))
                .orElseThrow();
        partido.setReportadoPor(reportador);

        // Avance automatico: el ganador pasa al siguiente partido del bracket.
        Partido siguiente = partido.getSiguientePartido();
        if (siguiente != null) {
            colocarEnSiguiente(siguiente, ganador);
            partidoRepository.guardar(siguiente);
            log.info("Equipo {} avanza al partido {} desde partido {}",
                    ganador.getId(), siguiente.getId(), partidoId);
        } else {
            // Era la final: el torneo termina.
            if (partido.getTorneo().getEstado() == EstadoTorneo.EN_CURSO) {
                partido.getTorneo().setEstado(EstadoTorneo.FINALIZADO);
                torneoRepository.guardar(partido.getTorneo());
                log.info("Torneo {} finalizado. Campeon: equipo {}",
                        partido.getTorneo().getId(), ganador.getId());
            }
        }

        return partidoMapper.toResponse(partidoRepository.guardar(partido));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartidoResponse> listarPorTorneo(Long torneoId) {
        return partidoRepository.buscarPorTorneoId(torneoId).stream()
                .map(partidoMapper::toResponse)
                .toList();
    }

    // ===================== helpers =====================

    /** Solo capitanes de alguno de los dos equipos pueden reportar. */
    private void validarCapitanDeParticipante(Long usuarioId, Partido partido) {
        boolean esCapitan =
                usuarioId.equals(partido.getEquipo1().getCapitan().getId())
                        || usuarioId.equals(partido.getEquipo2().getCapitan().getId());
        if (!esCapitan) {
            throw new AccesoDenegadoException("Solo el capitan de uno de los equipos puede reportar el resultado");
        }
    }

    private Equipo equipoGanadorValido(Partido partido, Long ganadorId) {
        if (!ganadorId.equals(partido.getEquipo1().getId())
                && !ganadorId.equals(partido.getEquipo2().getId())) {
            throw new ReglaNegocioException("El equipo ganador debe participar en este partido");
        }
        return ganadorId.equals(partido.getEquipo1().getId())
                ? partido.getEquipo1()
                : partido.getEquipo2();
    }

    private void colocarEnSiguiente(Partido siguiente, Equipo ganador) {
        if (siguiente.getEquipo1() == null) {
            siguiente.setEquipo1(ganador);
        } else if (siguiente.getEquipo2() == null) {
            siguiente.setEquipo2(ganador);
        } else {
            throw new ConflictoException("El siguiente partido ya tiene ambos equipos definidos");
        }
    }
}
