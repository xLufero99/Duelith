package com.duelith.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Respuesta generica con mensaje (operaciones sin cuerpo de retorno). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String mensaje;
}
