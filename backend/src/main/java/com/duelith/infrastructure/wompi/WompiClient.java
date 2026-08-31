package com.duelith.infrastructure.wompi;

import com.duelith.infrastructure.config.WompiProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Cliente HTTP hacia la API de Wompi (POST /transactions).
 * Usa java.net.http.HttpClient (precedente del proyecto en SupabaseTokenValidator).
 * Llaves privadas aqui NUNCA salen hacia el frontend.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WompiClient {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    private final WompiProperties wompiProperties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(TIMEOUT)
            .build();

    /**
     * Crea una transaccion en Wompi y devuelve id, status y redirect_url.
     *
     * @throws WompiException si Wompi rechaza la peticion o falla la comunicacion.
     */
    public WompiDtos.ResultadoTransaccion crearTransaccion(WompiDtos.CrearTransaccionRequest request) {
        try {
            String body = objectMapper.writeValueAsString(request);
            HttpRequest peticion = HttpRequest.newBuilder()
                    .uri(URI.create(wompiProperties.apiUrl() + "/transactions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", BEARER_PREFIX + wompiProperties.privateKey())
                    .timeout(TIMEOUT)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> respuesta = httpClient.send(peticion,
                    HttpResponse.BodyHandlers.ofString());

            return parsearRespuesta(respuesta);
        } catch (WompiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error de comunicacion con Wompi al crear transaccion: {}", ex.getMessage());
            throw new WompiException("No se pudo contactar con la pasarela de pago", ex);
        }
    }

    private WompiDtos.ResultadoTransaccion parsearRespuesta(HttpResponse<String> respuesta) throws Exception {
        JsonNode raiz = objectMapper.readTree(respuesta.body());

        if (respuesta.statusCode() >= 400) {
            String detalle = extraerError(raiz);
            log.warn("Wompi rechazo la transaccion (HTTP {}): {}", respuesta.statusCode(), detalle);
            throw new WompiException("La pasarela de pago rechazo la transaccion");
        }

        JsonNode data = raiz.path("data");
        String id = data.path("id").asText(null);
        String status = data.path("status").asText(null);
        String reference = data.path("reference").asText(null);
        String redirectUrl = data.path("redirect_url").asText(null);

        if (id == null) {
            log.error("Wompi no devolvio id de transaccion: {}", respuesta.body());
            throw new WompiException("Respuesta invalida de la pasarela de pago");
        }

        return new WompiDtos.ResultadoTransaccion(id, status, reference, redirectUrl);
    }

    private String extraerError(JsonNode raiz) {
        try {
            StringBuilder sb = new StringBuilder();
            JsonNode errors = raiz.path("errors");
            if (errors.isArray()) {
                for (JsonNode e : errors) {
                    sb.append(e.path("message").asText()).append("; ");
                }
            }
            return sb.length() > 0 ? sb.toString() : raiz.toString();
        } catch (Exception ex) {
            return "desconocido";
        }
    }
}
