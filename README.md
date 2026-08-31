# DUELITH — Sistema de Donaciones con Wompi

Plataforma de torneos e-sports con un sistema de donaciones integrado a la
pasarela de pagos colombiana **Wompi** (métodos: **Nequi** y **PSE**).

Desde el footer de la app, un botón **"❤️ Apoyar DUELITH"** abre un modal donde
el usuario elige monto, método de pago y email, y es redirigido al **widget de
Wompi** para completar el pago. Un webhook confirma el resultado de forma
asíncrona.

---

## Arquitectura (decisión: Widget de Wompi)

Se eligió la **Opción A (Widget de Wompi)** por simplicidad y seguridad:
Wompi maneja internamente el listado de bancos (PSE) y el flujo de Nequi, por lo
que el frontend solo recopila **monto, método y email** — nunca datos sensibles
(documento, banco, tarjeta).

```
Frontend (React)
   │ 1. inicializa Wompi JS (public key) → sessionId/deviceId
   │ 2. POST /api/donaciones/create {monto, email, metodo, sessionId, deviceId}
   ▼
Backend (Spring Boot)
   │ 3. VALIDA monto (min $1.000, max $10.000.000) y email
   │ 4. genera referencia única (UUID)
   │ 5. firma = SHA256(ref + amount_in_cents + currency + integrity_key)
   │ 6. POST /transactions (Wompi) → devuelve redirect_url (widget)
   │    guarda donación PENDING
   ▼
Frontend → redirige a redirect_url (widget de Wompi)
   │ 7. usuario paga en Nequi/PSE
   ▼
Wompi → POST /webhook/donations (puede reintentar)
   │ 8. backend VERIFICA firma (events_secret) + IDEMPOTENCIA
   │ 9. actualiza estado (APPROVED/REJECTED) y guarda auditoría
```

---

## Seguridad (requisitos críticos)

- **El backend valida SIEMPRE el monto** (nunca confía en el frontend).
- Solo la **public key** se usa en el frontend; la private/integrity/events
  secret viven únicamente en el backend.
- Firma de integridad obligatoria: `SHA256(reference + amount_in_cents + currency + integrity_key)`,
  concatenación **directa sin separadores**, `amount_in_cents` entero sin decimales.
- Todos los webhooks verifican su firma: `SHA256(timestamp + body + events_secret)`
  comparada a tiempo constante; rechazo con **401**.
- **Idempotencia**: no se sobreescriben estados finales (APPROVED/REJECTED/EXPIRED).
- **Rate limiting**: máx. 5 intentos por hora por IP → **429**.
- Referencias únicas e impredecibles (UUID).
- CORS restringido al `FRONTEND_URL` (nunca `*`).
- Errores genéricos al usuario; logs detallados en servidor sin datos sensibles.

---

## Requisitos

- **Backend**: Java 21, Maven (wrapper `./mvnw`), PostgreSQL (Supabase en el
  proyecto, pero funciona con cualquier Postgres).
- **Frontend**: Node.js + pnpm (o npm), React 19.

---

## 1. Backend

### Variables de entorno

Copia `backend/.env.example` a `backend/.env` (o configura en tu plataforma) y
completa los valores:

```properties
WOMPI_API_URL=https://sandbox.wompi.co/v1     # produccion: https://production.wompi.co/v1
WOMPI_PUBLIC_KEY=pk_test_xxx                  # publica → frontend
WOMPI_PRIVATE_KEY=sk_test_xxx                 # SOLO backend
WOMPI_INTEGRITY_KEY=it_test_xxx               # firma de integridad (SOLO backend)
WOMPI_EVENTS_SECRET=ev_test_xxx               # firma de webhooks (SOLO backend)
WOMPI_CURRENCY=COP
WOMPI_SUCCESS_URL=https://tu-dominio.com/donaciones/exito
WOMPI_FAILURE_URL=https://tu-dominio.com/donaciones/fallo
WOMPI_PENDING_URL=https://tu-dominio.com/donaciones/pendiente

MIN_DONATION_AMOUNT=1000
MAX_DONATION_AMOUNT=10000000
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=60
```

Además se usan las variables ya existentes del proyecto: `SUPABASE_*`, `JWT_SECRET`,
`CORS_ALLOWED_ORIGINS`, etc.

### Compilar y ejecutar

```bash
cd backend
./mvnw spring-boot:run        # o: java -jar target/backend-0.0.1-SNAPSHOT.jar
```

La tabla `donaciones` se crea automáticamente vía `ddl-auto=update`. También
hay un script canónico en
`backend/src/main/resources/db/migration/V1__create_donaciones.sql`.

### Documentación API

Swagger UI: `http://localhost:8080/swagger-ui/index.html` (endpoints de
donaciones bajo el tag **Donaciones** y **Webhooks**).

---

## 2. Frontend

### Variables de entorno

```bash
cp frontend/.env.example frontend/.env
# completa:
VITE_API_URL=http://localhost:8080
VITE_WOMPI_PUBLIC_KEY=pk_test_xxx     # public key de Wompi
VITE_WOMPI_JS_URL=https://cdn.wompi.co/libs/js/v1.js
```

### Ejecutar

```bash
cd frontend
pnpm install
pnpm dev    # o: npm run dev
```

### Flujo en la UI

1. En el footer, clic en **"❤️ Apoyar DUELITH"**.
2. El modal carga Wompi JS, genera `sessionId`/`deviceId`, y el usuario elige
   monto / método / email.
3. "Donar" → `POST /donaciones/create` → redirige al widget de Wompi.
4. Páginas de resultado: `/donaciones/exito`, `/donaciones/fallo`,
   `/donaciones/pendiente`.

---

## 3. Probar los webhooks localmente con ngrok

Wompi necesita una URL pública para notificarte. Levanta un túnel y apunta el
webhook de Wompi (o usa el script de prueba) a tu backend:

```bash
ngrok http 8080
```

Luego envía un webhook de prueba con firma válida usando el script incluido:

```bash
cd backend
WOMPI_EVENTS_SECRET=ev_test_xxx python3 scripts/verificar_webhook.py \
    https://TU-SUBDOMINIO.ngrok-free.app/api/webhook/donations
```

Respuesta esperada: `HTTP 200`. Si mandas una firma incorrecta, el backend
responde **401**.

También puedes usar la **colección de Postman** incluida en
`backend/postman/donaciones.postman_collection.json` (el request del webhook
calcula la firma automáticamente con un pre-request script).

---

## 4. Datos de prueba en sandbox de Wompi

- PSE: **Banco de Pruebas** (código `0`), usuario `123456789`, clave `123456`.
- Nequi/PSE: usa las credenciales de prueba de tu comercio de sandbox.

---

## Notas técnicas

- El HTTP client hacia Wompi usa `java.net.http.HttpClient` (patrón ya presente
  en el proyecto en `SupabaseTokenValidator`), en lugar de añadir WebClient
  (que requeriría `spring-boot-starter-webflux` y riesgo de conflicto con Spring
  MVC). Si se prefiere WebClient, se puede sustituir el interior de
  `WompiClient` sin cambiar el resto.
- El rate limiter es **en memoria** (`ConcurrentHashMap`). Para producción
  multi-instancia se recomienda una solución distribuida (Redis).
- La verificación de identidad de webhooks no usa el `X-Wompi-Signature`
  derivado del evento exacto de Wompi en todos los formatos; si tu evento usa
  un esquema de firma distinto, ajusta la construcción del payload en
  `WompiWebhookVerifier` según la documentación de Wompi para ese evento.

## Entregables

- Código frontend + backend.
- `backend/.env.example` y `frontend/.env.example`.
- Script SQL: `backend/src/main/resources/db/migration/V1__create_donaciones.sql`.
- Swagger/OpenAPI en vivo (sin archivo generado explícitamente).
- Pruebas: `WompiSignatureServiceTest`, `DonacionServiceImplTest`,
  `DonacionWebhookServiceTest`, `WompiWebhookVerifierTest`.
- Colección de Postman: `backend/postman/donaciones.postman_collection.json`.
- Script de verificación de webhooks: `backend/scripts/verificar_webhook.py`.
