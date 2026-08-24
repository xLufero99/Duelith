package com.duelith.application.service.impl;

import com.duelith.application.dto.request.CrearTorneoRequest;
import com.duelith.application.dto.request.InscribirEquipoRequest;
import com.duelith.application.dto.response.BracketResponse;
import com.duelith.application.dto.response.EquipoBasicoResponse;
import com.duelith.application.dto.response.PartidoResponse;
import com.duelith.application.dto.response.RondaResponse;
import com.duelith.application.dto.response.TorneoDetalleResponse;
import com.duelith.application.dto.response.TorneoResponse;
import com.duelith.application.exceptions.AccesoDenegadoException;
import com.duelith.application.exceptions.ConflictoException;
import com.duelith.application.exceptions.RecursoNoEncontradoException;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.EquipoMapper;
import com.duelith.application.mapper.PartidoMapper;
import com.duelith.application.mapper.TorneoMapper;
import com.duelith.domain.model.Equipo;
import com.duelith.domain.model.EstadoPartido;
import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.model.Inscripcion;
import com.duelith.domain.model.Partido;
import com.duelith.domain.model.RolUsuario;
import com.duelith.domain.model.Torneo;
import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.EquipoRepositoryPort;
import com.duelith.domain.repository.InscripcionRepositoryPort;
import com.duelith.domain.repository.MiembroEquipoRepositoryPort;
import com.duelith.domain.repository.PartidoRepositoryPort;
import com.duelith.domain.repository.TorneoRepositoryPort;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.domain.service.TorneoServicePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Gestion de torneos y brackets de eliminacion directa.
 *
 * Concurrencia: las operaciones que cambian el estado del torneo o consumen
 * cupo de inscripcion usan SELECT ... FOR UPDATE sobre la fila del torneo.
 */
@Service("torneoService")
@RequiredArgsConstructor
@Slf4j
public class TorneoServiceImpl implements TorneoServicePort {

    private final TorneoRepositoryPort torneoRepository;
    private final InscripcionRepositoryPort inscripcionRepository;
    private final PartidoRepositoryPort partidoRepository;
    private final EquipoRepositoryPort equipoRepository;
    private final UsuarioRepositoryPort usuarioRepository;
    private final MiembroEquipoRepositoryPort miembroRepository;
    private final TorneoMapper torneoMapper;
    private final EquipoMapper equipoMapper;
    private final PartidoMapper partidoMapper;

    // ===================== CRUD / consulta =====================

    @Override
    @Transactional
    public TorneoResponse crear(Long adminId, CrearTorneoRequest request) {
        Usuario organizador = obtenerUsuario(adminId);
        validarOrganizadorOAdmin(organizador);

        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new ReglaNegocioException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        if (request.getFechaInicio().isBefore(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de inicio no puede estar en el pasado");
        }

        Torneo torneo = Torneo.builder()
                .nombre(request.getNombre())
                .juego(request.getJuego())
                .descripcion(request.getDescripcion())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .limiteEquipos(request.getLimiteEquipos())
                .estado(EstadoTorneo.EN_REGISTRO)
                .premio(request.getPremio())
                .creadoPor(organizador)
                .creadoEn(OffsetDateTime.now())
                .build();

        Torneo guardado = torneoRepository.guardar(torneo);
        log.info("Torneo creado: {} (id={}) por usuario {} ({})", guardado.getNombre(),
                guardado.getId(), adminId, organizador.getRol());
        return armarRespuesta(guardado);
    }

    @Override
    @Transactional
    public TorneoResponse actualizar(Long usuarioId, Long torneoId, CrearTorneoRequest request) {
        Usuario usuario = obtenerUsuario(usuarioId);
        Torneo torneo = torneoRepository.buscarPorIdConBloqueo(torneoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", torneoId));
        validarCreadorOAdmin(usuario, torneo);

        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new ReglaNegocioException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
        long inscritos = inscripcionRepository.contarPorTorneoId(torneoId);
        if (request.getLimiteEquipos() < inscritos) {
            throw new ConflictoException("El limite de equipos no puede ser menor a los "
                    + inscritos + " equipos ya inscritos");
        }

        torneo.setNombre(request.getNombre());
        torneo.setJuego(request.getJuego());
        torneo.setDescripcion(request.getDescripcion());
        torneo.setFechaInicio(request.getFechaInicio());
        torneo.setFechaFin(request.getFechaFin());
        torneo.setLimiteEquipos(request.getLimiteEquipos());
        torneo.setPremio(request.getPremio());

        Torneo actualizado = torneoRepository.guardar(torneo);
        log.info("Torneo {} actualizado por usuario {}", torneoId, usuarioId);
        return armarRespuesta(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long usuarioId, Long torneoId) {
        Usuario usuario = obtenerUsuario(usuarioId);
        Torneo torneo = torneoRepository.buscarPorIdConBloqueo(torneoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", torneoId));
        validarCreadorOAdmin(usuario, torneo);

        if (inscripcionRepository.contarPorTorneoId(torneoId) > 0) {
            throw new ConflictoException("No se puede eliminar: el torneo tiene equipos inscritos");
        }
        if (!partidoRepository.buscarPorTorneoId(torneoId).isEmpty()) {
            throw new ConflictoException("No se puede eliminar: el torneo tiene partidos generados");
        }

        torneoRepository.eliminar(torneo);
        log.info("Torneo {} eliminado por usuario {}", torneoId, usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TorneoResponse> listar(EstadoTorneo estado, String juego) {
        return torneoRepository.listarConFiltros(estado, juego).stream()
                .map(this::armarRespuesta)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TorneoResponse> listarPorCreador(Long creadorId) {
        return torneoRepository.buscarPorCreador(creadorId).stream()
                .map(this::armarRespuesta)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TorneoDetalleResponse obtenerDetalle(Long torneoId) {
        Torneo torneo = obtenerTorneo(torneoId);
        List<Inscripcion> inscripciones = inscripcionRepository.buscarPorTorneoId(torneoId);

        TorneoDetalleResponse detalle = torneoMapper.toDetalle(torneo);
        detalle.setEquiposInscritos(inscripciones.size());
        detalle.setEquiposInscritosDetalle(inscripciones.stream()
                .map(i -> equipoMapper.toBasico(i.getEquipo()))
                .toList());
        return detalle;
    }

    // ===================== inscripciones =====================

    @Override
    @Transactional
    public void inscribirEquipo(Long usuarioId, Long torneoId, InscribirEquipoRequest request) {
        // Bloquea la fila del torneo: dos capitanes inscritos a la vez no pueden
        // superar el limite de equipos.
        Torneo torneo = torneoRepository.buscarPorIdConBloqueo(torneoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.EN_REGISTRO) {
            throw new ConflictoException("El torneo no acepta inscripciones en su estado actual: "
                    + torneo.getEstado());
        }

        Equipo equipo = equipoRepository.buscarPorId(request.getEquipoId())
                .orElseThrow(() -> RecursoNoEncontradoException.de("Equipo", request.getEquipoId()));
        if (!Boolean.TRUE.equals(equipo.getActivo())) {
            throw new ReglaNegocioException("El equipo no esta activo");
        }
        // Solo el capitan puede inscribir a su equipo.
        if (!usuarioId.equals(equipo.getCapitan().getId())) {
            throw new AccesoDenegadoException("Solo el capitan puede inscribir al equipo en un torneo");
        }
        if (!equipo.getJuegoPrincipal().equalsIgnoreCase(torneo.getJuego())) {
            throw new ReglaNegocioException("El juego principal del equipo (" + equipo.getJuegoPrincipal()
                    + ") no coincide con el juego del torneo (" + torneo.getJuego() + ")");
        }
        if (inscripcionRepository.buscarPorTorneoYEquipo(torneoId, equipo.getId()).isPresent()) {
            throw new ConflictoException("El equipo ya esta inscrito en este torneo");
        }
        if (miembroRepository.contarMiembrosConfirmados(equipo.getId()) < 2) {
            throw new ReglaNegocioException("El equipo necesita al menos 2 miembros confirmados para competir");
        }

        inscripcionRepository.guardar(Inscripcion.builder()
                .torneo(torneo)
                .equipo(equipo)
                .fechaInscripcion(OffsetDateTime.now())
                .confirmado(true)
                .build());

        long inscritos = inscripcionRepository.contarPorTorneoId(torneoId);
        log.info("Equipo {} inscrito en torneo {} ({}/{})", equipo.getId(), torneoId,
                inscritos, torneo.getLimiteEquipos());

        // Cierre automatico al llenar el cupo.
        if (inscritos >= torneo.getLimiteEquipos()) {
            torneo.setEstado(EstadoTorneo.INSCRIPCIONES_CERRADAS);
            torneoRepository.guardar(torneo);
            log.info("Cupo completo: inscripciones cerradas automaticamente en torneo {}", torneoId);
        }
    }

    @Override
    @Transactional
    public void cerrarInscripciones(Long usuarioId, Long torneoId) {
        validarOrganizadorOAdmin(obtenerUsuario(usuarioId));
        Torneo torneo = torneoRepository.buscarPorIdConBloqueo(torneoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.EN_REGISTRO) {
            throw new ConflictoException("Solo se pueden cerrar inscripciones de un torneo EN_REGISTRO");
        }
        torneo.setEstado(EstadoTorneo.INSCRIPCIONES_CERRADAS);
        torneoRepository.guardar(torneo);
        log.info("Inscripciones cerradas manualmente en torneo {} por usuario {}", torneoId, usuarioId);
    }

    // ===================== bracket =====================

    @Override
    @Transactional
    public BracketResponse generarBracket(Long usuarioId, Long torneoId) {
        validarOrganizadorOAdmin(obtenerUsuario(usuarioId));
        Torneo torneo = torneoRepository.buscarPorIdConBloqueo(torneoId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", torneoId));

        if (torneo.getEstado() != EstadoTorneo.INSCRIPCIONES_CERRADAS) {
            throw new ConflictoException("El bracket se genera solo con inscripciones cerradas (estado actual: "
                    + torneo.getEstado() + ")");
        }
        if (!partidoRepository.buscarPorTorneoId(torneoId).isEmpty()) {
            throw new ConflictoException("El bracket de este torneo ya fue generado");
        }

        List<Equipo> equipos = inscripcionRepository.buscarConfirmadasPorTorneoId(torneoId).stream()
                .map(Inscripcion::getEquipo)
                .toList();
        int numEquipos = equipos.size();
        if (numEquipos < 2) {
            throw new ReglaNegocioException("Se necesitan al menos 2 equipos inscritos para generar el bracket");
        }

        // Orden aleatorio para imparcialidad.
        Collections.shuffle(equipos);

        int tamanoBracket = tamanoPotenciaDeDos(numEquipos);
        int totalRondas = Integer.numberOfTrailingZeros(tamanoBracket);

        // matriz[ronda][indice] con rondas 1..totalRondas.
        List<List<Partido>> matriz = new ArrayList<>(totalRondas + 1);
        OffsetDateTime ahora = OffsetDateTime.now();
        for (int ronda = 1; ronda <= totalRondas; ronda++) {
            int cantidad = tamanoBracket >> ronda;
            List<Partido> fila = new ArrayList<>(cantidad);
            for (int j = 0; j < cantidad; j++) {
                fila.add(Partido.builder()
                        .torneo(torneo)
                        .ronda(ronda)
                        .numeroPartido(j + 1)
                        .estado(EstadoPartido.PENDIENTE)
                        .creadoEn(ahora)
                        .build());
            }
            matriz.add(fila);
        }

        // Primera pasada: persistir todos para obtener IDs (IDENTITY).
        List<Partido> todos = matriz.stream().flatMap(List::stream).toList();
        partidoRepository.guardarTodos(todos);

        // Vincular cada partido con el siguiente (avance del ganador).
        for (int ronda = 1; ronda < totalRondas; ronda++) {
            List<Partido> actual = matriz.get(ronda - 1);
            List<Partido> siguiente = matriz.get(ronda);
            for (int j = 0; j < actual.size(); j++) {
                actual.get(j).setSiguientePartido(siguiente.get(j / 2));
            }
        }

        // Siembra clasica de bracket: los "byes" recaen junto a las mejores semillas.
        int[] orden = ordenSiembras(tamanoBracket);
        List<Partido> primeraRonda = matriz.get(0);
        Map<Long, Integer> avancesAutomaticos = new HashMap<>();
        for (int j = 0; j < primeraRonda.size(); j++) {
            Partido p = primeraRonda.get(j);
            int slotA = orden[2 * j];
            int slotB = orden[2 * j + 1];
            p.setEquipo1(slotA < numEquipos ? equipos.get(slotA) : null);
            p.setEquipo2(slotB < numEquipos ? equipos.get(slotB) : null);
        }

        // Resolver byes y propagar ganadores automaticos en cascada.
        for (int ronda = 1; ronda <= totalRondas; ronda++) {
            List<Partido> fila = matriz.get(ronda - 1);
            for (int j = 0; j < fila.size(); j++) {
                Partido p = fila.get(j);
                boolean bye = (p.getEquipo1() == null) ^ (p.getEquipo2() == null);
                boolean dobleBye = p.getEquipo1() == null && p.getEquipo2() == null
                        && avancesAutomaticos.getOrDefault(p.getId(), 0) == 2;
                if (bye || dobleBye) {
                    // Sin rival real: el presente avanza (en doble bye decide el lado 1).
                    p.setGanador(p.getEquipo1() != null ? p.getEquipo1() : p.getEquipo2());
                    p.setEstado(EstadoPartido.WALKOVER);
                    p.setFechaHora(ahora);
                    if (p.getSiguientePartido() != null) {
                        avanzarASiguiente(p, avancesAutomaticos);
                    }
                } else if (p.getGanador() != null) {
                    // Ganador proveniente de una ronda previa ya resuelta.
                    avanzarASiguiente(p, avancesAutomaticos);
                }
            }
        }

        partidoRepository.guardarTodos(todos);
        torneo.setEstado(EstadoTorneo.EN_CURSO);
        torneoRepository.guardar(torneo);
        log.info("Bracket generado para torneo {}: {} equipos, {} rondas", torneoId, numEquipos, totalRondas);

        return obtenerBracket(torneoId);
    }

    @Override
    @Transactional(readOnly = true)
    public BracketResponse obtenerBracket(Long torneoId) {
        Torneo torneo = obtenerTorneo(torneoId);
        List<Partido> partidos = partidoRepository.buscarPorTorneoId(torneoId);

        TreeMap<Integer, List<PartidoResponse>> porRonda = new TreeMap<>();
        partidos.forEach(p -> porRonda
                .computeIfAbsent(p.getRonda(), k -> new ArrayList<>())
                .add(partidoMapper.toResponse(p)));

        List<RondaResponse> rondas = porRonda.entrySet().stream()
                .map(e -> RondaResponse.builder()
                        .numeroRonda(e.getKey())
                        .partidos(e.getValue())
                        .build())
                .toList();

        return BracketResponse.builder()
                .torneoId(torneo.getId())
                .nombreTorneo(torneo.getNombre())
                .estadoTorneo(torneo.getEstado())
                .totalRondas(rondas.isEmpty() ? 0 : rondas.getLast().getNumeroRonda())
                .rondas(rondas)
                .build();
    }

    // ===================== helpers =====================

    /** Coloca al ganador en el primer hueco libre del siguiente partido. */
    private void avanzarASiguiente(Partido origen, Map<Long, Integer> avancesAutomaticos) {
        Partido siguiente = origen.getSiguientePartido();
        if (siguiente == null) {
            return;
        }
        if (siguiente.getEquipo1() == null) {
            siguiente.setEquipo1(origen.getGanador());
        } else if (siguiente.getEquipo2() == null) {
            siguiente.setEquipo2(origen.getGanador());
        }
        if (origen.getEstado() == EstadoPartido.WALKOVER) {
            avancesAutomaticos.merge(siguiente.getId(), 1, Integer::sum);
        }
    }

    /**
     * Orden de siembras clasico construido recursivamente.
     * Para 8 equipos produce los pares (0,7)(3,4)(1,6)(2,5):
     * los huecos vacios (byes) quedan emparejados con las mejores semillas.
     */
    private int[] ordenSiembras(int tamanoBracket) {
        int[] orden = {0};
        while (orden.length < tamanoBracket) {
            int nuevoTamano = orden.length * 2;
            int[] siguiente = new int[nuevoTamano];
            for (int i = 0; i < orden.length; i++) {
                siguiente[2 * i] = orden[i];
                siguiente[2 * i + 1] = nuevoTamano - 1 - orden[i];
            }
            orden = siguiente;
        }
        return orden;
    }

    /** Minima potencia de 2 mayor o igual a n. */
    private int tamanoPotenciaDeDos(int n) {
        int potencia = 1;
        while (potencia < n) {
            potencia <<= 1;
        }
        return potencia;
    }

    private TorneoResponse armarRespuesta(Torneo torneo) {
        TorneoResponse response = torneoMapper.toResponse(torneo);
        response.setEquiposInscritos(inscripcionRepository.contarPorTorneoId(torneo.getId()));
        return response;
    }

    private Torneo obtenerTorneo(Long id) {
        return torneoRepository.buscarPorId(id)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Torneo", id));
    }

    private Usuario obtenerUsuario(Long id) {
        return usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> RecursoNoEncontradoException.de("Usuario", id));
    }

    private void validarOrganizadorOAdmin(Usuario usuario) {
        if (usuario.getRol() != RolUsuario.ADMIN && usuario.getRol() != RolUsuario.ORGANIZADOR) {
            throw new AccesoDenegadoException("Esta operacion requiere rol ORGANIZADOR o ADMIN");
        }
    }

    /** Defensa en profundidad: solo ADMIN o el creador del torneo. */
    private void validarCreadorOAdmin(Usuario usuario, Torneo torneo) {
        boolean esAdmin = usuario.getRol() == RolUsuario.ADMIN;
        boolean esCreador = usuario.getRol() == RolUsuario.ORGANIZADOR
                && torneo.getCreadoPor().getId().equals(usuario.getId());
        if (!esAdmin && !esCreador) {
            throw new AccesoDenegadoException("Solo el organizador que creo el torneo o un ADMIN pueden modificarlo");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean esCreador(Long torneoId, String username) {
        Torneo torneo = obtenerTorneo(torneoId);
        return torneo.getCreadoPor().getNombreUsuario().equalsIgnoreCase(username);
    }
}
