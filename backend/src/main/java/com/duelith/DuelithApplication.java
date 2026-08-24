package com.duelith;

import com.duelith.domain.model.RolUsuario;
import com.duelith.domain.model.Usuario;
import com.duelith.domain.repository.UsuarioRepositoryPort;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DuelithApplication {

	public static void main(String[] args) {
		SpringApplication.run(DuelithApplication.class, args);
	}

	/**
	 * Crea un usuario ORGANIZADOR por defecto para pruebas (solo si no existe).
	 * Credenciales: organizador@duelith.com / organizador123
	 */
	@Bean
	CommandLineRunner initOrganizador(UsuarioRepositoryPort usuarioRepository, PasswordEncoder encoder) {
		return args -> {
			if (usuarioRepository.buscarPorNombreUsuarioOEmail("organizador@duelith.com").isEmpty()) {
				Usuario org = Usuario.builder()
						.nombreUsuario("organizador")
						.email("organizador@duelith.com")
						.passwordHash(encoder.encode("organizador123"))
						.rol(RolUsuario.ORGANIZADOR)
						.gamertag("OrgDuelith")
						.creadoEn(OffsetDateTime.now())
						.activo(true)
						.build();
				usuarioRepository.guardar(org);
				System.out.println("ORGANIZADOR creado: organizador@duelith.com / organizador123");
			}
		};
	}
}
