package com.duelith.security;

import com.duelith.domain.model.RolUsuario;
import com.duelith.domain.model.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Principal de Spring Security con los datos minimos del usuario autenticado.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String passwordHash;
    private final RolUsuario rol;
    private final boolean activo;

    public UserPrincipal(Long id, String username, String passwordHash, RolUsuario rol, boolean activo) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.activo = activo;
    }

    public static UserPrincipal desdeUsuario(Usuario usuario) {
        return new UserPrincipal(usuario.getId(), usuario.getNombreUsuario(),
                usuario.getPasswordHash(), usuario.getRol(), Boolean.TRUE.equals(usuario.getActivo()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return activo;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
