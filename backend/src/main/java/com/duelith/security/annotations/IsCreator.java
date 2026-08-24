package com.duelith.security.annotations;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Solo ADMIN, o el ORGANIZADOR que creo el recurso.
 * Requiere un parametro de metodo llamado {@code id} con el id del torneo.
 * Delega en TorneoServicePort#esCreador (bean "torneoService").
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN') or (hasRole('ORGANIZADOR') and @torneoService.esCreador(#id, principal.username))")
public @interface IsCreator {
}
