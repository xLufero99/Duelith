package com.duelith;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test de contexto deshabilitado: requiere DB_PASSWORD y JWT_SECRET
 * (conexion real a Supabase con ddl-auto=validate).
 */
@Disabled("Requiere variables de entorno y acceso a Supabase")
class DuelithApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true);
	}

}
