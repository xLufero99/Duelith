package com.duelith.infrastructure.wompi;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * DTOs del request/response de la API REST de Wompi (POST /transactions).
 * Se serializan con Jackson (ya incluido por Spring Boot Web).
 */
public final class WompiDtos {

    private WompiDtos() {
    }

    /** Request enviado a POST /transactions (flujo de widget/IFRAME). */
    @Getter
    @Builder
    public static class CrearTransaccionRequest {
        @JsonProperty("amount_in_cents")
        private final Long amountInCents;

        private final String currency;

        @JsonProperty("customer_email")
        private final String customerEmail;

        private final String reference;

        @JsonProperty("session_id")
        private final String sessionId;

        /** Contiene device_id del cliente (anti-fraude), exigido por Wompi. */
        @JsonProperty("customer_data")
        private final Map<String, Object> customerData;

        @JsonProperty("signature:integrity")
        private final String signatureIntegrity;

        /** Objeto con success/failure/pending: a donde vuelve el usuario tras pagar. */
        @JsonProperty("redirect_urls")
        private final Map<String, String> redirectUrls;
    }

    /** Response de POST /transactions. */
    @Getter
    public static class CrearTransaccionResponse {
        private JsonNode data;
        private List<ErrorItem> errors;

        @Getter
        public static class ErrorItem {
            private String type;
            private String code;
            private String message;
            private String parameter;
        }
    }

    /** Response enriquecida que consume el servicio de donaciones. */
    @Getter
    public static class ResultadoTransaccion {
        private String id;
        private String status;
        private String reference;
        private String redirectUrl;

        public ResultadoTransaccion(String id, String status, String reference, String redirectUrl) {
            this.id = id;
            this.status = status;
            this.reference = reference;
            this.redirectUrl = redirectUrl;
        }
    }
}
