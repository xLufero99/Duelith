package com.duelith.security.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Inyecta el usuario autenticado (UserPrincipal) en un parametro de controlador.
 * Ej: public void miMetodo(@CurrentUser UserPrincipal actual) { ... }
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
