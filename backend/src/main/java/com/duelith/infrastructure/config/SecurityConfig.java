package com.duelith.infrastructure.config;

import com.duelith.security.jwt.JwtAuthenticationFilter;
import com.duelith.security.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuracion de seguridad: API stateless con JWT.
 * - Publico: registro/login, consulta de torneos/brackets y Swagger.
 * - Solo ADMIN: crear torneos, cerrar inscripciones, generar brackets.
 * - Resto: requiere token valido.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final CorsConfig corsConfig;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // En Spring Security 7 el UserDetailsService va por constructor;
        // el encoder BCrypt se configura aparte.
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        // 401 JSON cuando falta el token en endpoints protegidos.
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write(
                                    "{\"status\":401,\"error\":\"Unauthorized\","
                                            + "\"mensaje\":\"Se requiere autenticacion (token JWT)\"}");
                        })
                        // 403 JSON cuando el rol no alcanza.
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write(
                                    "{\"status\":403,\"error\":\"Forbidden\","
                                            + "\"mensaje\":\"No tienes permisos para esta operacion\"}");
                        }))
                .authorizeHttpRequests(auth -> auth
                        // Documentacion y salud
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Autenticacion
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        // Consultas publicas de torneos, brackets y partidos
                        .requestMatchers(HttpMethod.GET,
                                "/api/torneos", "/api/torneos/*",
                                "/api/torneos/*/bracket", "/api/torneos/*/partidos").permitAll()
                        // Operaciones exclusivas de ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/torneos").hasRole("ADMIN")
                        .requestMatchers("/api/torneos/*/cerrar", "/api/torneos/*/bracket").hasRole("ADMIN")
                        // Resto de la API autenticada
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
