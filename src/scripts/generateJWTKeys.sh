#!/bin/sh

# Create certificates folder
mkdir certs

# Generate private key
openssl genrsa -out certs/private.pem 2048

# Generate public key
openssl rsa -in certs/private.pem -pubout -outform PEM -out certs/public.pem