# Despliegue en el VPS (jonolea.eus/civilizatu)

Esta guía describe cómo se publica CIVilizaTu en el VPS que ya sirve
`jonolea.eus`, detrás de Nginx y con HTTPS.

## Arquitectura

```
Internet
  └── https://jonolea.eus/civilizatu/        -> Nginx del host (443)
        ├── /civilizatu/         -> frontend (contenedor Nginx, 127.0.0.1:3000)
        └── /civilizatu/api/     -> backend  (contenedor Gunicorn, 127.0.0.1:5000)
                                      └── llm_service (127.0.0.1:5001) -> Google AI Studio
                                      └── mongo (solo red interna de Docker)
```

Solo Nginx escucha en Internet. Los contenedores publican sus puertos en
`127.0.0.1`, así que no son accesibles desde fuera del VPS.

## 1. Requisitos en el VPS

```sh
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu   # cerrar y volver a entrar en la sesión SSH
```

Swap recomendado (el VPS tiene 3,8 GB de RAM y el build de React consume
bastante):

```sh
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. Código

```sh
sudo mkdir -p /opt/civilizatu
sudo chown ubuntu:ubuntu /opt/civilizatu
git clone https://github.com/Pokoion/CIVilizaTu.git /opt/civilizatu
cd /opt/civilizatu
```

## 3. Variables de entorno

Los `.env` **no se versionan**. Hay que crearlos en el VPS.

### `llm_service/.env` — Google AI Studio

```env
GOOGLE_API_KEY=AIza...tu_clave_de_AI_Studio
GOOGLE_MODEL=gemini-3.8-flash
GOOGLE_TEMPERATURE=
GOOGLE_MAX_TOKENS=32768
```

- La clave se obtiene en <https://aistudio.google.com/apikey>.
- El modelo se puede cambiar sin tocar código (`gemini-3.8-flash`,
  `gemini-3.6-flash`, `gemini-3.5-flash-lite`...).
- Se pueden indicar varias claves en `GOOGLE_API_KEYS=clave1,clave2` para
  rotarlas si se alcanza el límite de peticiones.

### `backend/.env`

```env
FLASK_DEBUG=0
FLASK_APP=app.py
LLM_SERVICE_URL=http://llm_service:5001
MONGO_URI=mongodb://mongo:27017/civilizatu
JWT_SECRET_KEY=<cadena larga y aleatoria>
CORS_ORIGINS=https://jonolea.eus

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

Generar el JWT:

```sh
openssl rand -hex 32
```

### `frontend`

No necesita `.env` en el VPS: `docker-compose.prod.yml` pasa
`REACT_APP_API_URL=https://jonolea.eus/civilizatu` y `PUBLIC_URL=/civilizatu`
como argumentos de build.

## 4. Firebase

El frontend ya apunta al proyecto `t3praktika` en
`frontend/src/config/firebase-config.ts`. Para que el backend valide los
tokens:

1. Consola de Firebase → Configuración del proyecto → **Cuentas de servicio**
   → *Generar nueva clave privada*. Descarga el JSON.
2. Copia los campos del JSON a `backend/.env` (`FIREBASE_*`). La clave privada
   debe ir con `\n` literales, tal como aparece en el JSON.
3. Authentication → Settings → **Authorized domains**: añade `jonolea.eus`.
4. Si el proyecto de Firebase cambia, actualiza también
   `frontend/src/config/firebase-config.ts`.

`google-services.json` (el de Android) **no se usa** en esta aplicación web.

## 5. Arrancar

```sh
cd /opt/civilizatu
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Comprobar:

```sh
curl -s http://127.0.0.1:5000/health
curl -s http://127.0.0.1:5001/health
curl -sI http://127.0.0.1:3000/
```

## 6. Nginx

Añadir al `server` HTTPS de `/etc/nginx/sites-available/jonolea.eus`
(hacer copia de seguridad antes):

```nginx
location = /civilizatu {
    return 301 /civilizatu/;
}

location /civilizatu/api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    client_max_body_size 25m;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /civilizatu/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Aplicar:

```sh
sudo nginx -t
sudo systemctl reload nginx
```

El certificado de `jonolea.eus` ya cubre esta ruta; no hace falta ejecutar
Certbot de nuevo.

## 7. Actualizaciones

```sh
cd /opt/civilizatu
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Notas

- Si no hay `GOOGLE_API_KEY`, el servicio arranca igualmente: el mapa por
  defecto funciona, pero los mapas aleatorios y las acciones de la IA
  devuelven error.
- Si faltan las credenciales de Firebase, el backend arranca pero
  `/api/auth/*` responde `503` hasta que se configuren.
- Los datos de MongoDB viven en el volumen `mongo_data`. Para una copia:
  `docker compose -f docker-compose.prod.yml exec -T mongo mongodump --archive --gzip > civilizatu-$(date +%F).gz`
