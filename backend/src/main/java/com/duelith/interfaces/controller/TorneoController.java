package com.duelith.interfaces.controller;

import com.duelith.application.dto.request.CrearTorneoRequest;
import com.duelith.application.dto.request.InscribirEquipoRequest;
import com.duelith.application.dto.response.BracketResponse;
import com.duelith.application.dto.response.MessageResponse;
import com.duelith.application.dto.response.TorneoDetalleResponse;
import com.duelith.application.dto.response.TorneoResponse;
import com.duelith.domain.model.EstadoTorneo;
import com.duelith.domain.service.TorneoServicePort;
import com.duelith.security.UserPrincipal;
import com.duelith.security.annotations.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/torneos")
@RequiredArgsConstructor
@Tag(name = "Torneos", description = "Creacion (ADMIN), consulta publica, inscripciones y brackets")
public class TorneoController {

    private final TorneoServicePort torneoService;

    @PostMapping
    @Operation(summary = "Crear torneo", description = "Exclusivo de administradores. El torneo inicia en estado EN_REGISTRO.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Torneo creado",
                    content = @Content(schema = @Schema(implementation = TorneoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Fechas invalidas"),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN")
    })
    public ResponseEntity<TorneoResponse> crear(@CurrentUser UserPrincipal actual,
                                                @Valid @RequestBody CrearTorneoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(torneoService.crear(actual.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Listar torneos", description = "Consulta publica con filtros opcionales por estado y juego.")
    @ApiResponse(responseCode = "200", description = "Listado de torneos")
    public ResponseEntity<List<TorneoResponse>> listar(
            @Parameter(in = ParameterIn.QUERY, description = "Estado del torneo",
                    schema = @Schema(implementation = EstadoTorneo.class))
            @RequestParam(required = false) EstadoTorneo estado,
            @Parameter(in = ParameterIn.QUERY, description = "Nombre del juego", example = "Valorant")
            @RequestParam(required = false) String juego) {
        return ResponseEntity.ok(torneoService.listar(estado, juego));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de torneo", description = "Datos del torneo y equipos inscritos. Consulta publica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Torneo encontrado"),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado")
    })
    public ResponseEntity<TorneoDetalleResponse> obtenerDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(torneoService.obtenerDetalle(id));
    }

    @PostMapping("/{id}/inscribir")
    @Operation(summary = "Inscribir equipo", description = "Solo el capitan puede inscribir a su equipo. Requiere torneo EN_REGISTRO, juego coincidente y cupo disponible. Cierra inscripciones automaticamente al llenarse.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipo inscrito"),
            @ApiResponse(responseCode = "400", description = "Juego no coincide o equipo sin miembros suficientes"),
            @ApiResponse(responseCode = "403", description = "No eres el capitan del equipo"),
            @ApiResponse(responseCode = "409", description = "Estado invalido, cupo lleno o equipo ya inscrito")
    })
    public ResponseEntity<MessageResponse> inscribir(@CurrentUser UserPrincipal actual,
                                                     @PathVariable Long id,
                                                     @Valid @RequestBody InscribirEquipoRequest request) {
        torneoService.inscribirEquipo(actual.getId(), id, request);
        return ResponseEntity.ok(new MessageResponse("Equipo inscrito correctamente"));
    }

    @PostMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar inscripciones", description = "Solo ADMIN. Transicion manual EN_REGISTRO -> INSCRIPCIONES_CERRADAS.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Inscripciones cerradas"),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN"),
            @ApiResponse(responseCode = "409", description = "El torneo no esta EN_REGISTRO")
    })
    public ResponseEntity<MessageResponse> cerrarInscripciones(@CurrentUser UserPrincipal actual,
                                                               @PathVariable Long id) {
        torneoService.cerrarInscripciones(actual.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Inscripciones cerradas"));
    }

    @PostMapping("/{id}/bracket")
    @Operation(summary = "Generar bracket", description = "Solo ADMIN. Genera el bracket de eliminacion directa con siembras aleatorias; los equipos faltantes se resuelven como WALKOVER. Transicion a EN_CURSO.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Bracket generado",
                    content = @Content(schema = @Schema(implementation = BracketResponse.class))),
            @ApiResponse(responseCode = "400", description = "Menos de 2 equipos inscritos"),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN"),
            @ApiResponse(responseCode = "409", description = "Estado invalido o bracket ya generado")
    })
    public ResponseEntity<BracketResponse> generarBracket(@CurrentUser UserPrincipal actual,
                                                          @PathVariable Long id) {
        return ResponseEntity.ok(torneoService.generarBracket(actual.getId(), id));
    }

    @GetMapping("/{id}/bracket")
    @Operation(summary = "Ver bracket", description = "Bracket agrupado por rondas. Consulta publica.")
    @ApiResponse(responseCode = "200", description = "Bracket del torneo")
    public ResponseEntity<BracketResponse> verBracket(@PathVariable Long id) {
        return ResponseEntity.ok(torneoService.obtenerBracket(id));
    }
}
