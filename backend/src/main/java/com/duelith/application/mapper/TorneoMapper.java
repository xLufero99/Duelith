package com.duelith.application.mapper;

import com.duelith.application.dto.response.TorneoDetalleResponse;
import com.duelith.application.dto.response.TorneoResponse;
import com.duelith.domain.model.Torneo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TorneoMapper {

    @Mapping(target = "creadoPorId", source = "creadoPor.id")
    @Mapping(target = "creadoPorNombre", source = "creadoPor.nombreUsuario")
    @Mapping(target = "equiposInscritos", ignore = true)
    TorneoResponse toResponse(Torneo torneo);

    /** Base del detalle; la lista de equipos inscritos se completa en el servicio. */
    @Mapping(target = "creadoPorId", source = "creadoPor.id")
    @Mapping(target = "creadoPorNombre", source = "creadoPor.nombreUsuario")
    @Mapping(target = "equiposInscritos", ignore = true)
    @Mapping(target = "equiposInscritosDetalle", ignore = true)
    TorneoDetalleResponse toDetalle(Torneo torneo);
}
