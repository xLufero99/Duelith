package com.duelith.security.jwt;

import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.infrastructure.config.SupabaseProperties;
import com.duelith.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Valida access tokens emitidos por Supabase Auth (ES256) contra el JWKS
 * publico del proyecto y los mapea al usuario local por email.
 */
@Component
@Slf4j
public class SupabaseTokenValidator {

    private static final Duration INTERVALO_RECARGA = Duration.ofMinutes(5);

    private final SupabaseProperties propiedades;
    private final UsuarioRepositoryPort usuarioRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /** Claves publicas del JWKS indexadas por kid. */
    private volatile Map<String, PublicKey> claves = Map.of();
    private volatile Instant ultimaRecarga = Instant.EPOCH;

    public SupabaseTokenValidator(SupabaseProperties propiedades,
                                  UsuarioRepositoryPort usuarioRepository) {
        this.propiedades = propiedades;
        this.usuarioRepository = usuarioRepository;
    }

    @PostConstruct
    void cargarClavesIniciales() {
        try {
            recargarClaves();
        } catch (Exception e) {
            // No romper el arranque: los tokens propios siguen funcionando.
            log.warn("No se pudo cargar el JWKS de Supabase en el arranque: {}", e.getMessage());
        }
    }

    /**
     * Valida un token de Supabase y devuelve el principal local asociado.
     * Vacio si el token no es de Supabase, es invalido o no existe usuario local.
     */
    public Optional<UserPrincipal> validarYResolver(String token) {
        try {
            String kid = kidDeToken(token);
            PublicKey clave = obtenerClave(kid);
            if (clave == null) {
                log.debug("Token con kid desconocido o sin claves JWKS disponibles");
                return Optional.empty();
            }

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(clave)
                    .requireIssuer(propiedades.url() + "/auth/v1")
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.get("email", String.class);
            if (!org.springframework.util.StringUtils.hasText(email)) {
                log.debug("Token de Supabase sin claim email");
                return Optional.empty();
            }

            return usuarioRepository.buscarPorNombreUsuarioOEmail(email)
                    .map(usuario -> principalDe(usuario, claims.getSubject()));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            log.debug("Token de Supabase invalido: {}", e.getMessage());
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Error resolviendo token de Supabase: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private UserPrincipal principalDe(Usuario usuario, String subSupabase) {
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new io.jsonwebtoken.JwtException("Usuario local inactivo");
        }
        UserPrincipal principal = UserPrincipal.desdeUsuario(usuario);
        log.debug("Token de Supabase aceptado para {} (sub={})", usuario.getEmail(), subSupabase);
        return principal;
    }

    /** Lee el header del JWT sin verificar firma para extraer el kid. */
    private String kidDeToken(String token) {
        String[] partes = token.split("\\.");
        if (partes.length != 3) {
            throw new IllegalArgumentException("Token malformado");
        }
        byte[] headerJson = Base64.getUrlDecoder().decode(partes[0]);
        try {
            JsonNode header = objectMapper.readTree(headerJson);
            // Solo tokens ES256 (los que emite Supabase Auth).
            if (!"ES256".equals(header.path("alg").asText())) {
                throw new IllegalArgumentException("Algoritmo no ES256");
            }
            return header.hasNonNull("kid") ? header.get("kid").asText() : null;
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Header JWT ilegible", e);
        }
    }

    private PublicKey obtenerClave(String kid) throws Exception {
        Map<String, PublicKey> actuales = claves;
        PublicKey clave = kid != null ? actuales.get(kid) : null;
        if (clave == null && Duration.between(ultimaRecarga, Instant.now()).compareTo(INTERVALO_RECARGA) > 0) {
            synchronized (this) {
                if (Duration.between(ultimaRecarga, Instant.now()).compareTo(INTERVALO_RECARGA) > 0) {
                    recargarClaves();
                    clave = kid != null ? claves.get(kid) : null;
                }
            }
        }
        return clave;
    }

    private synchronized void recargarClaves() throws Exception {
        HttpRequest peticion = HttpRequest.newBuilder()
                .uri(URI.create(propiedades.jwksUrl()))
                .header("apikey", propiedades.publishableKey())
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        HttpResponse<String> respuesta = httpClient.send(peticion, HttpResponse.BodyHandlers.ofString());
        if (respuesta.statusCode() != 200) {
            throw new IllegalStateException("JWKS respondio HTTP " + respuesta.statusCode());
        }

        Map<String, PublicKey> nuevas = new ConcurrentHashMap<>();
        for (JsonNode jwk : objectMapper.readTree(respuesta.body()).path("keys")) {
            if (!"EC".equals(jwk.path("kty").asText()) || !"P-256".equals(jwk.path("crv").asText())) {
                continue;
            }
            String kid = jwk.path("kid").asText(null);
            if (kid == null) {
                continue;
            }
            nuevas.put(kid, construirClavePublica(
                    jwk.path("x").asText(), jwk.path("y").asText()));
        }
        this.claves = Map.copyOf(nuevas);
        this.ultimaRecarga = Instant.now();
        log.info("JWKS de Supabase cargado: {} clave(s)", nuevas.size());
    }

    /** Construye una ECPublicKey P-256 desde las coordenadas base64url x/y del JWK. */
    private ECPublicKey construirClavePublica(String xBase64url, String yBase64url) throws Exception {
        BigInteger x = new BigInteger(1, Base64.getUrlDecoder().decode(xBase64url));
        BigInteger y = new BigInteger(1, Base64.getUrlDecoder().decode(yBase64url));
        ECPoint punto = new ECPoint(x, y);

        AlgorithmParameters parametros = AlgorithmParameters.getInstance("EC");
        parametros.init(new ECGenParameterSpec("secp256r1"));
        ECParameterSpec especificacion = parametros.getParameterSpec(ECParameterSpec.class);
        return (ECPublicKey) KeyFactory.getInstance("EC")
                .generatePublic(new ECPublicKeySpec(punto, especificacion));
    }
}
