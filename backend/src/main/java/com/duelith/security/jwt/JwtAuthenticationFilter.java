package com.duelith.security.jwt;

import com.duelith.security.UserPrincipal;
import com.duelith.security.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que extrae el token Bearer del header Authorization, lo valida
 * y coloca la autenticacion en el SecurityContext.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER_AUTHORIZATION = "Authorization";
    private static final String PREFIJO_BEARER = "Bearer ";

    private final JwtTokenProvider tokenProvider;
    private final SupabaseTokenValidator supabaseTokenValidator;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = resolverToken(request);

        if (StringUtils.hasText(token)) {
            UserDetails userDetails = resolverUsuario(token);

            if (userDetails != null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Acepta dos origenes de token: los HS256 emitidos por este backend
     * (/api/auth/login) y los ES256 emitidos por Supabase Auth (via JWKS).
     */
    private UserDetails resolverUsuario(String token) {
        if (tokenProvider.validarToken(token)) {
            String username = tokenProvider.getUsernameDeToken(token);
            return userDetailsService.loadUserByUsername(username);
        }
        return supabaseTokenValidator.validarYResolver(token).orElse(null);
    }

    private String resolverToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER_AUTHORIZATION);
        if (StringUtils.hasText(header) && header.startsWith(PREFIJO_BEARER)) {
            return header.substring(PREFIJO_BEARER.length());
        }
        return null;
    }
}
