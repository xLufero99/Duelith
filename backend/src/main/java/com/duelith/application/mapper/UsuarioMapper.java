package com.duelith.application.mapper;

import com.duelith.application.dto.response.UsuarioResponse;
import com.duelith.domain.model.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "rol", expression = "java(usuario.getRol() == null ? null : usuario.getRol().name())")
    UsuarioResponse toResponse(Usuario usuario);
}
