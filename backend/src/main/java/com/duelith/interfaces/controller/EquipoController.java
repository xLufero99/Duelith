package com.duelith.interfaces.controller;

import com.duelith.application.dto.request.CambiarRolMiembroRequest;
import com.duelith.application.dto.request.CrearEquipoRequest;
import com.duelith.application.dto.response.EquipoResponse;
import com.duelith.application.dto.response.MessageResponse;
import com.duelith.domain.service.EquipoServicePort;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Equipos", description = "Creacion de equipos, membresias y gestion por parte del capitan")
public class EquipoController {

    private final EquipoServicePort equipoService;

    @PostMapping
    @Operation(summary = "Crear equipo", description = "El usuario autenticado queda como capitan del nuevo equipo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Equipo creado",
                    content = @Content(schema = @Schema(implementation = EquipoResponse.class))),
            @ApiResponse(responseCode = "409", description = "Nombre de equipo ya existe")
    })
    public ResponseEntity<EquipoResponse> crear(@CurrentUser UserPrincipal actual,
                                                @Valid @RequestBody CrearEquipoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoService.crear(actual.getId(), request));
    }

    @GetMapping("/mis-equipos")
    @Operation(summary = "Mis equipos", description = "Equipos donde el usuario tiene membresia (incluye solicitudes pendientes).")
    @ApiResponse(responseCode = "200", description = "Listado obtenido")
    public ResponseEntity<List<EquipoResponse>> misEquipos(@CurrentUser UserPrincipal actual) {
        return ResponseEntity.ok(equipoService.misEquipos(actual.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de equipo", description = "Miembros confirmados y solicitudes pendientes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipo encontrado"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    })
    public ResponseEntity<EquipoResponse> obtenerPorId(@Parameter(description = "Id del equipo")
                                                       @PathVariable Long id) {
        return ResponseEntity.ok(equipoService.obtenerPorId(id));
    }

    @PostMapping("/{id}/unirse")
    @Operation(summary = "Solicitar unirse", description = "Crea una solicitud pendiente (rol SUPLENTE) hasta que el capitan acepte.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud enviada",
                    content = @Content(schema = @Schema(implementation = MessageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Equipo inactivo o lleno"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado"),
            @ApiResponse(responseCode = "409", description = "Ya eres miembro o ya hay solicitud pendiente")
    })
    public ResponseEntity<MessageResponse> solicitarUnirse(@CurrentUser UserPrincipal actual,
                                                           @PathVariable Long id) {
        equipoService.solicitarUnirse(actual.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Solicitud enviada. Esperando aprobacion del capitan."));
    }

    @PutMapping("/{id}/miembros/{usuarioId}")
    @Operation(summary = "Aceptar miembro / cambiar rol", description = "El capitan acepta una solicitud pendiente (SUPLENTE -> JUGADOR) o cambia el rol de un miembro. Si no envias body se asume JUGADOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membresia actualizada"),
            @ApiResponse(responseCode = "403", description = "No eres el capitan"),
            @ApiResponse(responseCode = "404", description = "Equipo o miembro no encontrado")
    })
    public ResponseEntity<EquipoResponse> aceptarMiembro(@CurrentUser UserPrincipal actual,
                                                         @PathVariable Long id,
                                                         @PathVariable Long usuarioId,
                                                         @Valid @RequestBody(required = false) CambiarRolMiembroRequest request) {
        return ResponseEntity.ok(equipoService.aceptarMiembro(actual.getId(), id, usuarioId, request));
    }

    @DeleteMapping("/{id}/miembros/{usuarioId}")
    @Operation(summary = "Expulsar miembro", description = "El capitan expulsa a un miembro o rechaza una solicitud pendiente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Miembro retirado"),
            @ApiResponse(responseCode = "403", description = "No eres el capitan"),
            @ApiResponse(responseCode = "404", description = "Equipo o miembro no encontrado")
    })
    public ResponseEntity<MessageResponse> expulsarMiembro(@CurrentUser UserPrincipal actual,
                                                           @PathVariable Long id,
                                                           @PathVariable Long usuarioId) {
        equipoService.expulsarMiembro(actual.getId(), id, usuarioId);
        return ResponseEntity.ok(new MessageResponse("Miembro retirado del equipo"));
    }

    @PutMapping("/{id}/transferir/{usuarioId}")
    @Operation(summary = "Transferir capitania", description = "Pasa la capitania a un miembro confirmado; el capitan anterior pasa a JUGADOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Capitania transferida"),
            @ApiResponse(responseCode = "400", description = "El nuevo capitan no es miembro confirmado"),
            @ApiResponse(responseCode = "403", description = "No eres el capitan actual")
    })
    public ResponseEntity<EquipoResponse> transferirCapitania(@CurrentUser UserPrincipal actual,
                                                              @PathVariable Long id,
                                                              @PathVariable Long usuarioId) {
        return ResponseEntity.ok(equipoService.transferirCapitania(actual.getId(), id, usuarioId));
    }

    @DeleteMapping("/{id}/abandonar")
    @Operation(summary = "Abandonar equipo", description = "Un miembro sale del equipo. El capitan debe transferir primero; si es el unico integrante el equipo se disuelve.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Saliste del equipo"),
            @ApiResponse(responseCode = "400", description = "Debes transferir la capitania antes de salir"),
            @ApiResponse(responseCode = "404", description = "No eres miembro del equipo")
    })
    public ResponseEntity<MessageResponse> abandonar(@CurrentUser UserPrincipal actual,
                                                     @PathVariable Long id) {
        equipoService.abandonar(actual.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Has abandonado el equipo"));
    }
}
