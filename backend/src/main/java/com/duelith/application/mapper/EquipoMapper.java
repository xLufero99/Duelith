package com.duelith.application.mapper;

import com.duelith.application.dto.response.EquipoBasicoResponse;
import com.duelith.application.dto.response.EquipoResponse;
import com.duelith.domain.model.Equipo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EquipoMapper {

    /** Datos basicos para anidar en partidos/inscripciones. */
    @Mapping(target = "capitanNombre", source = "capitan.nombreUsuario")
    EquipoBasicoResponse toBasico(Equipo equipo);

    /**
     * Respuesta completa. Las listas de miembros y solicitudes pendientes se
     * completan en el servicio (requieren consultas a miembros_equipo).
     */
    @Mapping(target = "capitanNombre", source = "capitan.nombreUsuario")
    @Mapping(target = "capitanId", ignore = true)
    @Mapping(target = "miembros", ignore = true)
    @Mapping(target = "solicitudesPendientes", ignore = true)
    EquipoResponse toResponse(Equipo equipo);
}
