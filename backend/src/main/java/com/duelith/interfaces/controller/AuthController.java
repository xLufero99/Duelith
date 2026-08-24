package com.duelith.interfaces.controller;

import com.duelith.application.dto.request.ActualizarPerfilRequest;
import com.duelith.application.dto.request.LoginRequest;
import com.duelith.application.dto.request.RegistroRequest;
import com.duelith.application.dto.response.AuthResponse;
import com.duelith.application.dto.response.UsuarioResponse;
import com.duelith.domain.service.AuthServicePort;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacion", description = "Registro, login y perfil de usuario")
public class AuthController {

    private final AuthServicePort authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Crea una cuenta nueva (rol JUGADOR) y devuelve un JWT de sesion iniciada.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario registrado",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos invalidos"),
            @ApiResponse(responseCode = "409", description = "Username o email ya registrados")
    })
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesion", description = "Acepta email o nombre de usuario. Devuelve el token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login exitoso",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales invalidas")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil", description = "Devuelve los datos del usuario autenticado.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil obtenido",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<UsuarioResponse> obtenerPerfil(
            @Parameter(hidden = true) @CurrentUser UserPrincipal actual) {
        return ResponseEntity.ok(authService.obtenerPerfil(actual.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar perfil", description = "Actualiza username, email o gamertag del usuario autenticado. Campos omitidos no se modifican.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "409", description = "Username o email ya en uso")
    })
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @Parameter(hidden = true) @CurrentUser UserPrincipal actual,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(authService.actualizarPerfil(actual.getId(), request));
    }

    @PatchMapping("/convertir-organizador")
    @Operation(summary = "Convertirse en organizador", description = "Cambia el rol del usuario autenticado a ORGANIZADOR para que pueda crear torneos.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol cambiado a ORGANIZADOR",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "400", description = "El usuario ya es organizador o admin"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioResponse> convertirOrganizador(
            @Parameter(hidden = true) @CurrentUser UserPrincipal actual) {
        return ResponseEntity.ok(authService.convertirOrganizador(actual.getId()));
    }
}
