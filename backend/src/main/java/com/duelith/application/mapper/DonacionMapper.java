package com.duelith.application.mapper;

import com.duelith.application.dto.response.DonacionResponse;
import com.duelith.domain.model.Donacion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DonacionMapper {

    @Mapping(target = "transactionId", source = "transactionId")
    DonacionResponse toResponse(Donacion donacion);
}
