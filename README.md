# Booking Widget — Reserva de Mesa

Widget de reserva de mesa para restaurantes, con un flujo por pasos (wizard): tipo de reserva → comensales → fecha y hora → datos de contacto.

## ⚠️ Estado actual: prototipo frontend

Esta versión es **solo frontend**, sin servidor ni base de datos real:

- Los tipos de reserva, horarios y disponibilidad están **simulados** en `data.js`, no vienen de una base de datos.
- Las reservas confirmadas **no se guardan de forma persistente** — solo quedan en el `localStorage` del navegador que las crea, como comprobación temporal durante el desarrollo.
- No hay backend, autenticación, ni panel de gestión para el restaurante todavía.

Es un paso intermedio pensado para validar el flujo de usuario y la interfaz antes de construir la parte de servidor.

## Cómo probarlo

Abre `index.html` en el navegador. No requiere instalación ni build — es HTML/CSS/JS puro.

## Estructura de archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura de los 5 pasos del wizard |
| `style.css` | Estilos visuales |
| `script.js` | Lógica del wizard: navegación entre pasos, validación, estado |
| `data.js` | Configuración del restaurante + funciones que simulan una API (a sustituir por peticiones reales en la siguiente fase) |

## Cómo adaptarlo a un restaurante distinto

Todo lo específico de cada negocio vive en `RESTAURANT_CONFIG`, dentro de `data.js`: nombre, tipos de reserva, horario de apertura, aforo por franja. No hace falta tocar HTML, CSS ni el resto del JS para cambiar estos datos.

## Roadmap

- [x] Fase 1 — Wizard frontend con datos simulados
- [ ] Fase 2 — Backend con Node.js + Express
- [ ] Fase 3 — Base de datos real (sustituye los datos simulados de `data.js`)
- [ ] Fase 4 — Autenticación y panel de administración para el restaurante
- [ ] Fase 5 — Soporte multi-restaurante (multi-tenant)
- [ ] Fase 6 — Despliegue en producción
