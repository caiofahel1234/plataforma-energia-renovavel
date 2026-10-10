#!/bin/sh
# Certificado AUTOASSINADO apenas para desenvolvimento/avaliação. Em produção use Let's Encrypt/CA.
set -e; mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/privkey.pem -out certs/fullchain.pem -days 365 \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
chmod 600 certs/privkey.pem; echo "Certificado gerado em ./certs"
