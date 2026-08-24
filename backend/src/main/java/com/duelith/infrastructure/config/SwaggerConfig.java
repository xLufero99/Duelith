package com.duelith.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentacion OpenAPI/Swagger UI disponible en /swagger-ui/index.html
 * con esquema de autorizacion Bearer JWT.
 */
@Configuration
public class SwaggerConfig {

    private static final String ESQUEMA_BEARER = "bearerAuth";

    @Bean
    public OpenAPI duelithOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Duelith API")
                        .description("Plataforma de gestion de torneos e-sports: equipos, inscripciones, "
                                + "brackets de eliminacion directa y reporte de resultados.")
                        .version("1.0.0")
                        .contact(new Contact().name("Duelith")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_BEARER))
                .components(new Components().addSecuritySchemes(ESQUEMA_BEARER,
                        new SecurityScheme()
                                .name(ESQUEMA_BEARER)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
