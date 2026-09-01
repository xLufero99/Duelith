package com.duelith.application.service.impl;

import com.duelith.application.dto.request.CrearDonacionRequest;
import com.duelith.application.exceptions.ReglaNegocioException;
import com.duelith.application.mapper.DonacionMapper;
import com.duelith.domain.model.MetodoPagoDonacion;
import com.duelith.domain.repository.DonacionRepositoryPort;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import com.duelith.infrastructure.config.DonacionProperties;
import com.duelith.infrastructure.config.WompiProperties;
import com.duelith.infrastructure.wompi.WompiClient;
import com.duelith.infrastructure.wompi.WompiDtos;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de la validacion de la donacion: el backend SIEMPRE
 * valida el monto, nunca confia en los valores del frontend.
 */
@ExtendWith(MockitoExtension.class)
class DonacionServiceImplTest {

    @Mock
    private DonacionRepositoryPort donacionRepository;
    @Mock
    private UsuarioRepositoryPort usuarioRepository;
    @Mock
    private DonacionMapper donacionMapper;
    @Mock
    private WompiClient wompiClient;
    @Mock
    private WompiSignatureService wompiSignatureService;

    private final DonacionProperties donacionProperties =
            new DonacionProperties(1000L, 10_000_000L, 5, 60L);

    private final WompiProperties wompiProperties = new WompiProperties(
            "https://sandbox.wompi.co/v1", "pub", "pri", "it", "ev",
            "COP", "http://exito", "http://fallo", "http://pendiente");

    private DonacionServiceImpl service;
    private CrearDonacionRequest requestValido;

    @BeforeEach
    void setUp() {
        service = new DonacionServiceImpl(
                donacionRepository, usuarioRepository, donacionMapper,
                wompiClient, wompiSignatureService,
                donacionProperties, wompiProperties, new ObjectMapper());
        requestValido = CrearDonacionRequest.builder()
                .amount(25000L)
                .email("donante@correo.com")
                .fullName("Ana Torres")
                .paymentMethod(MetodoPagoDonacion.NEQUI)
                .sessionId("sess123")
                .deviceId("dev123")
                .build();
    }

    @Test
    @DisplayName("Monto por debajo del minimo se rechaza")
    void rechazaMontoMenorAlMinimo() {
        requestValido.setAmount(500L);
        assertThatThrownBy(() -> service.crear(null, requestValido))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("minima");
    }

    @Test
    @DisplayName("Monto por encima del maximo se rechaza")
    void rechazaMontoMayorAlMaximo() {
        requestValido.setAmount(10_000_001L);
        assertThatThrownBy(() -> service.crear(null, requestValido))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("maxima");
    }

    @Test
    @DisplayName("Monto negativo o cero se rechaza")
    void rechazaMontoNegativoOCero() {
        requestValido.setAmount(0L);
        assertThatThrownBy(() -> service.crear(null, requestValido))
                .isInstanceOf(ReglaNegocioException.class);

        requestValido.setAmount(-100L);
        assertThatThrownBy(() -> service.crear(null, requestValido))
                .isInstanceOf(ReglaNegocioException.class);
    }

    @Test
    @DisplayName("Monto en el limite minimo se acepta")
    void aceptaMontoMinimo() {
        requestValido.setAmount(1000L);
        when(wompiSignatureService.firmarIntegridad(any(), any(Long.class), any()))
                .thenReturn("firma");
        when(wompiClient.crearTransaccion(any())).thenReturn(
                new WompiDtos.ResultadoTransaccion("tx-1", "PENDING", "ref", "https://checkout"));
        assertThatCode(() -> service.crear(null, requestValido))
                .doesNotThrowAnyException();
    }
}
