/**
 * server.js
 * ---------
 * Servidor Express que sustituye a las funciones simuladas que tenías
 * en el data.js del frontend. Expone 3 endpoints, con la misma "forma"
 * de datos que ya usa el wizard — por eso en el frontend casi no habrá
 * que tocar nada más que "cómo se piden" los datos.
 *
 * IMPORTANTE — qué NO es esto todavía:
 * Los datos (bookings[]) viven en un array en memoria. Eso significa
 * que si reinicias el servidor, se pierden todas las reservas. Ese es
 * justo el problema que resolveremos en la Fase 3 con una base de
 * datos real. De momento, esta es la pieza que nos permite entender
 * CÓMO habla un servidor con un frontend, sin la complejidad añadida
 * de SQL todavía.
 */

import express from "express";
import cors from "cors";
import { RESTAURANT_CONFIG } from "./config.js";

const app = express();
const PORT = 3000;

// -----------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------
// cors(): sin esto, el navegador BLOQUEA las peticiones que vienen de
// un origen distinto (tu frontend) por seguridad. Al activarlo, le
// decimos al navegador "este servidor permite que otros orígenes le
// pidan datos".
app.use(cors());

// express.json(): sin esto, cuando el frontend envíe una reserva por
// POST con JSON en el body, req.body llegaría vacío/undefined. Este
// middleware lee ese JSON y lo deja listo en req.body.
app.use(express.json());

// -----------------------------------------------------------------
// "BASE DE DATOS" EN MEMORIA (temporal, hasta la Fase 3)
// -----------------------------------------------------------------
const bookings = [];

// -----------------------------------------------------------------
// GET /api/restaurant-info
// -----------------------------------------------------------------
// Datos generales del restaurante que el frontend necesita mostrar
// (de momento solo el nombre) pero que no tienen que ver con el
// wizard en sí. Separarlo de /booking-types mantiene cada endpoint
// enfocado en una sola cosa.
app.get("/api/restaurant-info", (req, res) => {
  res.json({ name: RESTAURANT_CONFIG.name });
});

// -----------------------------------------------------------------
// GET /api/booking-types
// -----------------------------------------------------------------
app.get("/api/booking-types", (req, res) => {
  res.json(RESTAURANT_CONFIG.bookingTypes);
});

// -----------------------------------------------------------------
// GET /api/availability?date=YYYY-MM-DD
// -----------------------------------------------------------------
// Diferencia importante respecto a la versión simulada: aquí la
// disponibilidad se calcula de verdad, contando cuántas reservas ya
// existen para cada franja en `bookings`, en vez de "tirar un dado".
app.get("/api/availability", (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Falta el parámetro 'date'." });
  }

  const slots = [];
  const [startH, startM] = RESTAURANT_CONFIG.openingHours.start.split(":").map(Number);
  const [endH, endM] = RESTAURANT_CONFIG.openingHours.end.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current < end) {
    const h = String(Math.floor(current / 60)).padStart(2, "0");
    const m = String(current % 60).padStart(2, "0");
    const time = `${h}:${m}`;

    const bookingsInSlot = bookings.filter(
      (b) => b.date === date && b.time === time
    ).length;

    slots.push({
      time,
      available: bookingsInSlot < RESTAURANT_CONFIG.tablesPerSlot,
    });

    current += RESTAURANT_CONFIG.slotDurationMinutes;
  }

  res.json(slots);
});

// -----------------------------------------------------------------
// POST /api/bookings
// -----------------------------------------------------------------
app.post("/api/bookings", (req, res) => {
  const { type, guests, date, time, customer } = req.body;

  // Validación en el SERVIDOR. Esto es clave: el frontend ya valida,
  // pero nunca hay que fiarse solo de eso — cualquiera podría llamar
  // a esta API directamente (con curl, Postman, etc.) saltándose el
  // formulario. El servidor es la última línea de defensa.
  if (!guests || !date || !time || !customer?.name || !customer?.email) {
    return res.status(400).json({ error: "Faltan datos obligatorios de la reserva." });
  }

  // Comprobamos otra vez la disponibilidad justo antes de guardar,
  // por si dos personas reservan la misma franja casi a la vez.
  const bookingsInSlot = bookings.filter(
    (b) => b.date === date && b.time === time
  ).length;

  if (bookingsInSlot >= RESTAURANT_CONFIG.tablesPerSlot) {
    return res.status(409).json({ error: "Esa franja horaria ya está completa." });
  }

  const newBooking = {
    id: Date.now(),
    type,
    guests,
    date,
    time,
    customer,
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);

  res.status(201).json({
    success: true,
    confirmationCode: `RES-${String(newBooking.id).slice(-6)}`,
  });
});

// -----------------------------------------------------------------
// Endpoint extra, útil solo para desarrollo: ver todas las reservas
// guardadas hasta ahora. En un producto real esto estaría protegido
// por login (Fase 4) — de momento es abierto para que puedas comprobar
// que las reservas se están guardando.
// -----------------------------------------------------------------
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
