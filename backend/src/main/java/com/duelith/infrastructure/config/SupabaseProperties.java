package com.duelith.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Credenciales y endpoints del proyecto Supabase (se cargan desde .env).
 */
@ConfigurationProperties(prefix = "supabase")
public record SupabaseProperties(
        String url,
        String publishableKey,
        String secretKey,
        String jwksUrl) {
}
