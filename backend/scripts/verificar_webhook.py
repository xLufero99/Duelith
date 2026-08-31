#!/usr/bin/env python3
"""
Envia un webhook de prueba a tu endpoint local expuesto con ngrok,
con la firma X-Wompi-Signature calculada correctamente con tu EVENTS_SECRET.

Uso:
    WOMPI_EVENTS_SECRET=ev_test_xxx python3 verificar_webhook.py \
        https://TU-SUBDOMINIO.ngrok-free.app/api/webhook/donations

Esto calcula SHA256(timestamp + body + events_secret) y lo envia en los
headers que el backend espera (X-Wompi-Timestamp y X-Wompi-Signature).
El backend debe responder 200 si la firma es valida y 401 si no.
"""
import hashlib
import json
import os
import sys
import time
import urllib.request

EVENTS_SECRET = os.environ.get("WOMPI_EVENTS_SECRET")
if not EVENTS_SECRET:
    sys.exit("Falta la variable WOMPI_EVENTS_SECRET (usa el mismo valor del backend).")

if len(sys.argv) < 2:
    sys.exit("Uso: WOMPI_EVENTS_SECRET=ev_test_xxx python3 verificar_webhook.py <URL_ngrok>")

url = sys.argv[1]

# Body de ejemplo de un evento de transaccion de Wompi.
body = json.dumps({
    "event": "transaction.updated",
    "data": {
        "transaction": {
            "id": "tx_test_00001",
            "status": "APPROVED",
            "amount_in_cents": 2500000,
            "reference": "DON-test-123",
            "currency": "COP"
        }
    }
}, separators=(",", ":"))

timestamp = str(int(time.time()))
# Construccion de la firma: SHA256(timestamp + body + events_secret)
firma = hashlib.sha256((timestamp + body + EVENTS_SECRET).encode()).hexdigest()

req = urllib.request.Request(
    url,
    data=body.encode(),
    method="POST",
    headers={
        "Content-Type": "application/json",
        "X-Wompi-Timestamp": timestamp,
        "X-Wompi-Signature": firma,
    },
)

try:
    with urllib.request.urlopen(req) as resp:
        print(f"HTTP {resp.status}: {resp.read().decode()}")
        print("Firma valida: el webhook se proceso correctamente.")
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()}")
    print("Si recibiste 401, verifica que WOMPI_EVENTS_SECRET coincida con el backend.")
