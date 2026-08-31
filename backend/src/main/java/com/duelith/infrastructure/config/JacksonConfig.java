package com.duelith.infrastructure.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracion de Jackson para el proyecto.
 *
 * En Spring Boot 4 el ObjectMapper ya no se expone automaticamente como bean
 * en todos los case, por lo que se define explicitamente aqui. Se usa en
 * WompiClient (serializar/deserializar requests a la API de Wompi) y en
 * DonacionServiceImpl (parsear el body del webhook).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Soporte de fechas Java Time (OffsetDateTime, LocalDateTime, etc.)
        mapper.registerModule(new JavaTimeModule());
        // No fallar si Wompi agrega campos nuevos en el JSON
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // Escribir fechas como texto ISO-8601
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
