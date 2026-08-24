package com.duelith.domain.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

/**
 * Convierte el enum RolEquipo al formato en minusculas usado en la columna
 * miembros_equipo.rol ('capitan', 'jugador', 'suplente') y viceversa.
 */
@Converter(autoApply = true)
public class RolEquipoConverter implements AttributeConverter<RolEquipo, String> {

    @Override
    public String convertToDatabaseColumn(RolEquipo atributo) {
        return atributo == null ? null : atributo.name().toLowerCase();
    }

    @Override
    public RolEquipo convertToEntityAttribute(String valorDb) {
        if (valorDb == null) {
            return null;
        }
        return Arrays.stream(RolEquipo.values())
                .filter(r -> r.name().equalsIgnoreCase(valorDb))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Rol de equipo desconocido en BD: " + valorDb));
    }
}
