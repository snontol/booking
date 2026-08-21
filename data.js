/**
 * data.js
 * -------
 * FASE 2: este archivo ya NO simula datos — ahora hace peticiones
 * fetch() reales al servidor Express que vive en /server.
 *
 * Fíjate en algo importante: las funciones se llaman exactamente
 * igual que antes (fetchBookingTypes, fetchAvailableSlots,
 * submitBooking) y devuelven los mismos tipos de datos. Por eso
 * script.js no necesita ningún cambio — solo le importa QUÉ le
 * devuelven estas funciones, no CÓMO consiguen los datos.
 *
 * RESTAURANT_CONFIG ya no vive aquí: el servidor es ahora la única
 * fuente de verdad de la configuración del restaurante.
 */

// Cambia esto si despliegas el backend en otra URL (ej. en producción).
const API_BASE_URL = "http://localhost:3000";

/**
 * GET /api/restaurant-info
 */
async function fetchRestaurantInfo() {
  const res = await fetch(`${API_BASE_URL}/api/restaurant-info`);

  if (!res.ok) {
    throw new Error("No se pudo cargar la información del restaurante.");
  }

  return res.json();
}

/**
 * GET /api/booking-types
 */
async function fetchBookingTypes() {
  const res = await fetch(`${API_BASE_URL}/api/booking-types`);

  if (!res.ok) {
    throw new Error("No se pudieron cargar los tipos de reserva.");
  }

  return res.json();
}

/**
 * GET /api/availability?date=YYYY-MM-DD
 */
async function fetchAvailableSlots(dateStr) {
  const res = await fetch(`${API_BASE_URL}/api/availability?date=${dateStr}`);

  if (!res.ok) {
    throw new Error("No se pudo consultar la disponibilidad.");
  }

  return res.json();
}

/**
 * POST /api/bookings
 */
async function submitBooking(bookingData) {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  const data = await res.json();

  if (!res.ok) {
    // El servidor puede rechazar la reserva (ej. franja ya completa).
    // Propagamos ese mensaje para que script.js lo pueda mostrar.
    throw new Error(data.error || "No se pudo completar la reserva.");
  }

  return data;
}
