package com.duelith.interfaces.controller;

import com.duelith.application.dto.request.ReportarResultadoRequest;
import com.duelith.application.dto.response.PartidoResponse;
import com.duelith.domain.service.PartidoServicePort;
import com.duelith.security.UserPrincipal;
import com.duelith.security.annotations.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Partidos", description = "Consulta y reporte de resultados del bracket")
public class PartidoController {

    private final PartidoServicePort partidoService;

    @GetMapping("/partidos/mis-partidos")
    @Operation(summary = "Mis proximos partidos", description = "Partidos pendientes o en juego donde participa un equipo del usuario autenticado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Listado de partidos")
    public ResponseEntity<List<PartidoResponse>> misPartidos(@CurrentUser UserPrincipal actual) {
        return ResponseEntity.ok(partidoService.misPartidos(actual.getId()));
    }

    @PatchMapping("/partidos/{id}/reportar")
    @Operation(summary = "Reportar resultado", description = "Solo capitanes de los equipos implicados. El ganador avanza automaticamente al siguiente partido. Si es la final, el torneo pasa a FINALIZADO.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado reportado",
                    content = @Content(schema = @Schema(implementation = PartidoResponse.class))),
            @ApiResponse(responseCode = "400", description = "El ganador indicado no participa en el partido"),
            @ApiResponse(responseCode = "403", description = "No eres capitan de ninguno de los equipos"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado"),
            @ApiResponse(responseCode = "409", description = "El resultado ya fue reportado (protegido con SELECT FOR UPDATE)")
    })
    public ResponseEntity<PartidoResponse> reportar(
            @CurrentUser UserPrincipal actual,
            @Parameter(description = "Id del partido") @PathVariable Long id,
            @Valid @RequestBody ReportarResultadoRequest request) {
        return ResponseEntity.ok(partidoService.reportarResultado(actual.getId(), id, request));
    }

    @GetMapping("/torneos/{id}/partidos")
    @Operation(summary = "Partidos de un torneo", description = "Todos los partidos del bracket ordenados por ronda. Consulta publica.")
    @ApiResponse(responseCode = "200", description = "Listado de partidos")
    public ResponseEntity<List<PartidoResponse>> listarPorTorneo(
            @Parameter(description = "Id del torneo") @PathVariable Long id) {
        return ResponseEntity.ok(partidoService.listarPorTorneo(id));
    }
}
