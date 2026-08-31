-- ============================================================
-- SCRIPT DE MIGRACION - TABLA donaciones
-- Base: PostgreSQL (Supabase)
-- Nota: el proyecto usa spring.jpa.hibernate.ddl-auto=update por
-- defecto, que crea la tabla automaticamente. Este script es
-- la definicion canonica para entornos gestionados (Flyway/Liquibase)
-- o para despliegues donde se prefiera el esquema explicito.
-- ============================================================

CREATE TABLE IF NOT EXISTS donaciones (
    id                   BIGSERIAL PRIMARY KEY,
    donante_id           BIGINT REFERENCES usuarios(id),
    transaction_id       VARCHAR(255) UNIQUE,
    reference            VARCHAR(60) NOT NULL UNIQUE,
    amount               NUMERIC(14,2) NOT NULL,
    email                VARCHAR(255) NOT NULL,
    payment_method       VARCHAR(20) NOT NULL,          -- NEQUI | PSE
    status               VARCHAR(20) NOT NULL,          -- PENDING|APPROVED|REJECTED|EXPIRED|ERROR
    session_id           VARCHAR(255),
    device_id            VARCHAR(255),
    wompi_response       TEXT,
    wompi_events         TEXT,
    redirect_url         TEXT,
    creado_en            TIMESTAMPTZ,
    actualizado_en       TIMESTAMPTZ,
    webhook_processed_at TIMESTAMPTZ
);

-- Indices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_donaciones_donante   ON donaciones(donante_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_reference ON donaciones(reference);
CREATE INDEX IF NOT EXISTS idx_donaciones_txn       ON donaciones(transaction_id);
CREATE INDEX IF NOT EXISTS idx_donaciones_estado    ON donaciones(status, creado_en);
