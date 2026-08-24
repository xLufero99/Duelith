package com.duelith.application.mapper;

import com.duelith.application.dto.response.PartidoResponse;
import com.duelith.domain.model.Partido;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Convierte partidos a DTO anidando los datos basicos de los equipos.
 * Los equipos pueden ser null (huecos del bracket o "byes").
 */
@Mapper(componentModel = "spring", uses = EquipoMapper.class)
public interface PartidoMapper {

    @Mapping(target = "torneoId", source = "torneo.id")
    @Mapping(target = "reportadoPorNombre", source = "reportadoPor.nombreUsuario")
    @Mapping(target = "siguientePartidoId", ignore = true)
    PartidoResponse toResponse(Partido partido);
}
