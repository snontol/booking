/**
 * data.js
 * -------
 * Este archivo tiene DOS trabajos:
 *
 * 1) Guardar la CONFIGURACIÓN del restaurante (nombre, tipos de reserva,
 *    horarios, aforo...). Esto es lo único que cambiarías para adaptar
 *    el widget a un negocio distinto.
 *
 * 2) Simular las llamadas a una API con funciones async que devuelven
 *    Promises, exactamente con la misma forma que tendrán cuando en la
 *    Fase 2 las sustituyamos por fetch() a un backend real. Así, cuando
 *    llegue ese momento, solo reescribimos el CONTENIDO de estas
 *    funciones — el resto del código (script.js) no se entera del cambio.
 */

// ---------------------------------------------------------------------
// 1) CONFIGURACIÓN DEL RESTAURANTE
// ---------------------------------------------------------------------
// En el futuro (Fase 3+) esto vivirá en una base de datos, una fila por
// restaurante. De momento es un objeto JS.

const RESTAURANT_CONFIG = {
  name: "Restaurant",

  // Empezamos simple: UN solo tipo de reserva.
  // Para añadir más (ej: "Terraza", "Evento privado"), solo añade
  // objetos aquí. El wizard detectará automáticamente que hay más
  // de uno y mostrará el paso de selección de tipo.
  bookingTypes: [
    { id: "standard", label: "Mesa estándar", description: "Reserva de mesa para el comedor principal" },
    // { id: "terrace", label: "Terraza", description: "Mesa al aire libre" },
    // { id: "event", label: "Evento privado", description: "Sala reservada para grupos grandes" },
  ],

  // Rango de comensales que se puede reservar en una sola solicitud.
  minGuests: 1,
  maxGuests: 10,

  // Horario de apertura por franja (24h). Se usa para generar los
  // huecos disponibles en el paso 3. En producción esto vendría de la
  // base de datos y podría variar por día de la semana.
  openingHours: {
    start: "13:00",
    end: "23:30",
  },

  // Duración estimada de una reserva, en minutos. Se usa para calcular
  // qué huecos horarios ofrecer.
  slotDurationMinutes: 30,

  // Nº de mesas disponibles por franja horaria (simulación simplificada
  // de aforo; en real esto dependería del nº de mesas y su capacidad).
  tablesPerSlot: 5,
};

// ---------------------------------------------------------------------
// 2) FUNCIONES QUE SIMULAN LA API
// ---------------------------------------------------------------------
// Cada una devuelve una Promise, como haría fetch(). Añadimos un pequeño
// retraso artificial (setTimeout) para que el wizard se comporte ya
// desde ahora como si hablara con una red real (estados de "cargando").

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * GET /api/booking-types  (simulado)
 * Devuelve los tipos de reserva configurados para el restaurante.
 */
async function fetchBookingTypes() {
  await wait(300);
  return RESTAURANT_CONFIG.bookingTypes;
}

/**
 * GET /api/availability?date=YYYY-MM-DD  (simulado)
 * Devuelve las franjas horarias disponibles para una fecha dada.
 * Ahora mismo genera huecos "de mentira" según el horario de apertura;
 * en la Fase 3 esta función consultará la base de datos real para
 * descartar huecos ya reservados.
 */
async function fetchAvailableSlots(dateStr) {
  await wait(400);

  const slots = [];
  const [startH, startM] = RESTAURANT_CONFIG.openingHours.start.split(":").map(Number);
  const [endH, endM] = RESTAURANT_CONFIG.openingHours.end.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current < end) {
    const h = String(Math.floor(current / 60)).padStart(2, "0");
    const m = String(current % 60).padStart(2, "0");

    // Simulamos que algunos huecos ya están llenos, para que el wizard
    // tenga que manejar ese caso desde el principio.
    const isFull = Math.random() < 0.15;

    slots.push({
      time: `${h}:${m}`,
      available: !isFull,
    });

    current += RESTAURANT_CONFIG.slotDurationMinutes;
  }

  return slots;
}

/**
 * POST /api/bookings  (simulado)
 * Envía la reserva completa. De momento solo la "guarda" en la consola
 * y en localStorage, para que puedas comprobar que el flujo entero
 * funciona de punta a punta. En la Fase 2 esto será un fetch() real
 * con method: "POST".
 */
async function submitBooking(bookingData) {
  await wait(500);

  console.log("Reserva enviada (simulada):", bookingData);

  // Guardamos un histórico local solo para poder inspeccionarlo mientras
  // desarrollamos. Esto NO sustituye a una base de datos real.
  const existing = JSON.parse(localStorage.getItem("bookings_demo") || "[]");
  existing.push({ ...bookingData, id: Date.now() });
  localStorage.setItem("bookings_demo", JSON.stringify(existing));

  return { success: true, confirmationCode: `RES-${Date.now().toString().slice(-6)}` };
}
