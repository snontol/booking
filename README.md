# Booking Widget — Reserva de Mesa

Widget de reserva de mesa para restaurantes, con un flujo por pasos (wizard): tipo de reserva → comensales → fecha y hora → datos de contacto.

## ⚠️ Estado actual: frontend + backend en memoria (sin base de datos todavía)

- El frontend (`index.html`, `style.css`, `script.js`, `data.js`) ya habla con un servidor real por `fetch()`, en `http://localhost:3000`.
- El servidor (`/server`) valida disponibilidad de verdad y **evita overbooking** (no deja reservar una franja horaria que ya tiene el máximo de mesas ocupadas).
- Las reservas se guardan en un **array en memoria**, no en una base de datos: si reinicias el servidor, se pierden. Eso se resuelve en la Fase 3.
- No hay autenticación ni panel de gestión para el restaurante todavía (Fase 4).

## Cómo probarlo

1. Arranca el backend:
   ```
   cd server
   npm install
   npm run dev
   ```
   Debería mostrar: `Servidor escuchando en http://localhost:3000`

2. Con el backend arrancado, abre `index.html` en el navegador (doble clic, o con una extensión tipo Live Server). El wizard pedirá los datos al servidor en vez de simularlos.

3. Para comprobar que las reservas se están guardando de verdad, visita `http://localhost:3000/api/bookings` en el navegador mientras el servidor está arrancado.

## Estructura de archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura de los 5 pasos del wizard |
| `style.css` | Estilos visuales |
| `script.js` | Lógica del wizard: navegación entre pasos, validación, estado |
| `data.js` | Funciones que hablan con el backend por `fetch()` |
| `server/server.js` | Servidor Express: expone los endpoints y valida disponibilidad real |
| `server/config.js` | Configuración del restaurante (fuente de verdad única, ya no vive en el navegador) |

## Cómo adaptarlo a un restaurante distinto

Todo lo específico de cada negocio vive en `RESTAURANT_CONFIG`, dentro de `server/config.js`: nombre, tipos de reserva, horario de apertura, aforo por franja. No hace falta tocar HTML, CSS ni el resto del código para cambiar estos datos — y como ahora vive en el servidor, el cambio se aplica para todo el mundo sin volver a desplegar el frontend.

## Roadmap

- [x] Fase 1 — Wizard frontend con datos simulados
- [x] Fase 2 — Backend con Node.js + Express (datos en memoria)
- [ ] Fase 3 — Base de datos real (sustituye el array en memoria de `server.js`)
- [ ] Fase 4 — Autenticación y panel de administración para el restaurante
- [ ] Fase 5 — Soporte multi-restaurante (multi-tenant)
- [ ] Fase 6 — Despliegue en producción
