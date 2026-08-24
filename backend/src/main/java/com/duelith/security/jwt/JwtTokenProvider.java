package com.duelith.security.jwt;

import io.jsonwebtoken.Claims;
import com.duelith.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Genera y valida tokens JWT firmados con HS256.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private static final String CLAIM_ROL = "rol";
    private static final String CLAIM_UID = "uid";

    private final SecretKey claveFirma;
    private final long expiracionMs;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            @Value("${jwt.expiration}") long expiracionMs) {
        // La clave debe tener >= 32 bytes para HS256.
        this.claveFirma = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    /** Crea el token a partir de la autenticacion ya resuelta por Spring Security. */
    public String generarToken(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expiracionMs);

        return Jwts.builder()
                .setSubject(principal.getUsername())
                .claim(CLAIM_UID, principal.getId())
                .claim(CLAIM_ROL, principal.getRol().name())
                .setIssuedAt(ahora)
                .setExpiration(expiracion)
                .signWith(claveFirma, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getExpiracionSegundos() {
        return expiracionMs / 1000;
    }

    /** Valida firma y expiracion. Devuelve false ante cualquier token invalido. */
    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(claveFirma).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Token JWT expirado");
        } catch (UnsupportedJwtException e) {
            log.warn("Token JWT no soportado");
        } catch (MalformedJwtException e) {
            log.warn("Token JWT malformado");
        } catch (SecurityException | IllegalArgumentException e) {
            log.warn("Firma JWT invalida");
        }
        return false;
    }

    public String getUsernameDeToken(String token) {
        return parsearClaims(token).getSubject();
    }

    private Claims parsearClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(claveFirma).build().parseClaimsJws(token).getBody();
    }
}
