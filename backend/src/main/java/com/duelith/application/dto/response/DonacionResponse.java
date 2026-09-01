package com.duelith.application.dto.response;

import com.duelith.domain.model.EstadoDonacion;
import com.duelith.domain.model.MetodoPagoDonacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Detalle de una donacion registrada por el sistema. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonacionResponse {

    private Long id;
    private String reference;
    private BigDecimal amount;
    private String email;
    private String fullName;
    private MetodoPagoDonacion paymentMethod;
    private EstadoDonacion status;
    private String transactionId;
    private OffsetDateTime creadoEn;
}
