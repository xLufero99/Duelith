package com.duelith.interfaces.controller;

import com.duelith.application.dto.request.CrearDonacionRequest;
import com.duelith.application.dto.response.DonacionResponse;
import com.duelith.application.dto.response.DonacionResultadoResponse;
import com.duelith.application.exceptions.RateLimitExcedidoException;
import com.duelith.domain.service.DonacionServicePort;
import com.duelith.infrastructure.ratelimit.RateLimiter;
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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donaciones")
@RequiredArgsConstructor
@Tag(name = "Donaciones", description = "Apoyo economico a Duelith via Wompi (Nequi/PSE). Rutas publicas: crear donacion")
public class DonacionController {

    private final DonacionServicePort donacionService;
    private final RateLimiter rateLimiter;

    @PostMapping("/create")
    @Operation(summary = "Crear donacion", description = "Publico (donaciones anonimas permitidas). Valida el monto en backend, crea la transaccion en Wompi y devuelve la URL del widget para completar el pago.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Donacion creada, redirigir a redirectUrl",
                    content = @Content(schema = @Schema(implementation = DonacionResultadoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Monto fuera de rango o datos invalidos"),
            @ApiResponse(responseCode = "429", description = "Demasiados intentos, espera la ventana"),
            @ApiResponse(responseCode = "500", description = "Error de la pasarela o servidor")
    })
    public ResponseEntity<DonacionResultadoResponse> crear(
            @Parameter(hidden = true) @CurrentUser UserPrincipal actual,
            @Parameter(hidden = true) HttpServletRequest request,
            @Valid @RequestBody CrearDonacionRequest body) {

        String ip = obtenerIp(request);
        if (!rateLimiter.permitir("donar:" + ip)) {
            throw new RateLimitExcedidoException("Demasiados intentos. Espera 60 minutos.");
        }

        Long usuarioId = actual == null ? null : actual.getId();
        DonacionResultadoResponse resultado = donacionService.crear(usuarioId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    @GetMapping("/{referencia}")
    @Operation(summary = "Estado de una donacion", description = "Consulta publica el estado de una donacion por su referencia.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Donacion encontrada",
                    content = @Content(schema = @Schema(implementation = DonacionResponse.class))),
            @ApiResponse(responseCode = "404", description = "Donacion no encontrada")
    })
    public ResponseEntity<DonacionResponse> estado(@PathVariable String referencia) {
        return ResponseEntity.ok(donacionService.obtenerPorReferencia(referencia));
    }

    @GetMapping("/mis-donaciones")
    @Operation(summary = "Historial de donaciones", description = "Solo usuarios autenticados. Devuelve sus donaciones.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "Listado de donaciones")
    public ResponseEntity<List<DonacionResponse>> misDonaciones(@CurrentUser UserPrincipal actual) {
        return ResponseEntity.ok(donacionService.misDonaciones(actual.getId()));
    }

    private String obtenerIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String ip = request.getRemoteAddr();
        return ip == null ? "desconocida" : ip;
    }
}
