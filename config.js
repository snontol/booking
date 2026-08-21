/**
 * config.js (servidor)
 * ---------------------
 * Este es el mismo tipo de objeto RESTAURANT_CONFIG que antes vivía en
 * el data.js del frontend. La diferencia clave de la Fase 2:
 *
 * ANTES: el navegador de cada visitante tenía su propia copia de la
 *        configuración (en su JS local). Si la cambiabas, tenías que
 *        volver a desplegar el frontend entero.
 *
 * AHORA: la configuración vive UNA SOLA VEZ, aquí, en el servidor.
 *        Todos los navegadores piden estos datos por red. Cambias este
 *        archivo (o, en la Fase 3, una fila en la base de datos) y
 *        todo el mundo ve el cambio al instante, sin tocar el frontend.
 *
 * Esto es exactamente lo que hace posible más adelante que UN MISMO
 * servidor pueda atender a VARIOS restaurantes distintos (Fase 5):
 * cada uno con su propia configuración, pero todos usando el mismo
 * código de servidor.
 */

export const RESTAURANT_CONFIG = {
  name: "Restaurant",

  bookingTypes: [
    { id: "standard", label: "Mesa estándar", description: "Reserva de mesa para el comedor principal" },
    // { id: "terrace", label: "Terraza", description: "Mesa al aire libre" },
    // { id: "event", label: "Evento privado", description: "Sala reservada para grupos grandes" },
  ],

  minGuests: 1,
  maxGuests: 10,

  openingHours: {
    start: "13:00",
    end: "23:30",
  },

  slotDurationMinutes: 30,
  tablesPerSlot: 5,
};
