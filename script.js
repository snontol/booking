/**
 * script.js
 * ---------
 * Controla el wizard de reserva. No sabe NADA de cómo se generan los
 * datos (eso vive en data.js) — solo pide datos, los muestra, valida
 * lo que el usuario introduce y guarda todo en `bookingState`.
 *
 * Esta separación es la razón por la que, en la Fase 2, solo tendremos
 * que cambiar data.js (de datos simulados a fetch() real) sin tocar
 * este archivo.
 */

// -----------------------------------------------------------------
// ESTADO DEL WIZARD
// -----------------------------------------------------------------
// Un único objeto que va acumulando lo que el usuario elige en cada
// paso. Es la "fuente de la verdad": cualquier cosa que se muestre en
// pantalla sale de aquí.
const bookingState = {
  type: null,
  guests: null,
  date: null,
  time: null,
  customer: { name: "", email: "", phone: "", notes: "" },
};

// Los pasos que existen SIEMPRE (el de "Tipo" se añade dinámicamente
// solo si hay más de un tipo configurado — ver initWizard()).
const BASE_STEPS = ["guests", "datetime", "details", "confirmation"];
let STEPS = [...BASE_STEPS];
let currentStepIndex = 0;

// -----------------------------------------------------------------
// ARRANQUE
// -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", initWizard);

async function initWizard() {
  document.getElementById("restaurant-name").textContent = RESTAURANT_CONFIG.name;

  const types = await fetchBookingTypes();

  if (types.length > 1) {
    // Solo mostramos el paso de "Tipo" si hay algo real que elegir.
    STEPS = ["type", ...BASE_STEPS];
    renderTypeOptions(types);
  } else {
    // Un único tipo: lo asignamos automáticamente y nos lo saltamos.
    bookingState.type = types[0]?.id ?? "standard";
    STEPS = [...BASE_STEPS];
  }

  buildStepIndicator();
  goToStep(0);

  // Fecha mínima seleccionable = hoy
  const dateInput = document.getElementById("input-date");
  dateInput.min = new Date().toISOString().split("T")[0];
  dateInput.addEventListener("change", onDateChange);

  document.getElementById("input-guests").addEventListener("input", onGuestsChange);

  document.querySelectorAll("[data-next]").forEach((btn) =>
    btn.addEventListener("click", () => attemptAdvance())
  );
  document.querySelectorAll("[data-back]").forEach((btn) =>
    btn.addEventListener("click", () => goToStep(currentStepIndex - 1))
  );

  document.getElementById("form-details").addEventListener("submit", onSubmitDetails);
}

// -----------------------------------------------------------------
// PASO "TIPO"
// -----------------------------------------------------------------
function renderTypeOptions(types) {
  const container = document.getElementById("type-options");
  container.innerHTML = "";

  types.forEach((t) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "option-card";
    card.dataset.value = t.id;
    card.innerHTML = `<strong>${t.label}</strong><span>${t.description}</span>`;
    card.addEventListener("click", () => {
      bookingState.type = t.id;
      container.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      clearError("type");
    });
    container.appendChild(card);
  });
}

// -----------------------------------------------------------------
// PASO "COMENSALES"
// -----------------------------------------------------------------
function onGuestsChange(e) {
  bookingState.guests = Number(e.target.value) || null;
  clearError("guests");
}

// -----------------------------------------------------------------
// PASO "FECHA Y HORA"
// -----------------------------------------------------------------
async function onDateChange(e) {
  bookingState.date = e.target.value;
  bookingState.time = null;

  const slotsContainer = document.getElementById("time-slots");
  slotsContainer.innerHTML = `<p class="hint">Cargando horarios disponibles…</p>`;

  const slots = await fetchAvailableSlots(bookingState.date);
  renderTimeSlots(slots);
}

function renderTimeSlots(slots) {
  const container = document.getElementById("time-slots");
  container.innerHTML = "";

  if (slots.every((s) => !s.available)) {
    container.innerHTML = `<p class="hint">No quedan huecos ese día. Prueba con otra fecha.</p>`;
    return;
  }

  slots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time-slot";
    btn.textContent = slot.time;
    btn.disabled = !slot.available;

    btn.addEventListener("click", () => {
      bookingState.time = slot.time;
      container.querySelectorAll(".time-slot").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      clearError("datetime");
    });

    container.appendChild(btn);
  });
}

// -----------------------------------------------------------------
// PASO "DATOS"
// -----------------------------------------------------------------
function onSubmitDetails(e) {
  e.preventDefault();
  attemptAdvance();
}

function collectCustomerData() {
  bookingState.customer = {
    name: document.getElementById("input-name").value.trim(),
    email: document.getElementById("input-email").value.trim(),
    phone: document.getElementById("input-phone").value.trim(),
    notes: document.getElementById("input-notes").value.trim(),
  };
}

// -----------------------------------------------------------------
// VALIDACIÓN POR PASO
// -----------------------------------------------------------------
// Cada validador devuelve un mensaje de error (string) o null si todo
// está bien. Mantenerlos separados hace fácil añadir más reglas luego.
const VALIDATORS = {
  type: () => (bookingState.type ? null : "Selecciona un tipo de reserva."),
  guests: () => {
    const g = bookingState.guests;
    if (!g) return "Indica el número de comensales.";
    if (g < RESTAURANT_CONFIG.minGuests || g > RESTAURANT_CONFIG.maxGuests) {
      return `El número de comensales debe estar entre ${RESTAURANT_CONFIG.minGuests} y ${RESTAURANT_CONFIG.maxGuests}.`;
    }
    return null;
  },
  datetime: () => {
    if (!bookingState.date) return "Selecciona una fecha.";
    if (!bookingState.time) return "Selecciona una hora.";
    return null;
  },
  details: () => {
    collectCustomerData();
    const { name, email, phone } = bookingState.customer;
    if (!name) return "Indica tu nombre.";
    if (!email || !email.includes("@")) return "Indica un email válido.";
    if (!phone) return "Indica un teléfono de contacto.";
    return null;
  },
};

function clearError(stepKey) {
  const el = document.getElementById(`error-${stepKey}`);
  if (el) el.textContent = "";
}

function showError(stepKey, message) {
  const el = document.getElementById(`error-${stepKey}`);
  if (el) el.textContent = message;
}

// -----------------------------------------------------------------
// NAVEGACIÓN ENTRE PASOS
// -----------------------------------------------------------------
async function attemptAdvance() {
  const stepKey = STEPS[currentStepIndex];
  const validator = VALIDATORS[stepKey];

  if (validator) {
    const error = validator();
    if (error) {
      showError(stepKey, error);
      return;
    }
  }

  if (stepKey === "details") {
    await finalizeBooking();
    return;
  }

  goToStep(currentStepIndex + 1);
}

function goToStep(index) {
  currentStepIndex = index;

  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.hidden = panel.dataset.step !== STEPS[index];
  });

  updateStepIndicator();
}

function buildStepIndicator() {
  const nav = document.getElementById("step-indicator");
  nav.innerHTML = "";

  const labels = {
    type: "Tipo",
    guests: "Comensales",
    datetime: "Fecha y hora",
    details: "Datos",
    confirmation: "Confirmación",
  };

  STEPS.forEach((key, i) => {
    const item = document.createElement("li");
    item.textContent = labels[key];
    item.dataset.index = i;
    nav.appendChild(item);
  });
}

function updateStepIndicator() {
  document.querySelectorAll("#step-indicator li").forEach((li, i) => {
    li.classList.toggle("active", i === currentStepIndex);
    li.classList.toggle("done", i < currentStepIndex);
  });
}

// -----------------------------------------------------------------
// ENVÍO FINAL
// -----------------------------------------------------------------
async function finalizeBooking() {
  goToStep(STEPS.indexOf("confirmation"));

  const panel = document.querySelector('[data-step="confirmation"]');
  panel.innerHTML = `<p class="hint">Confirmando tu reserva…</p>`;

  const result = await submitBooking(bookingState);

  panel.innerHTML = `
    <h2>¡Reserva confirmada!</h2>
    <p>Código de confirmación: <strong>${result.confirmationCode}</strong></p>
    <ul class="summary">
      <li><strong>Comensales:</strong> ${bookingState.guests}</li>
      <li><strong>Fecha:</strong> ${bookingState.date}</li>
      <li><strong>Hora:</strong> ${bookingState.time}</li>
      <li><strong>Nombre:</strong> ${bookingState.customer.name}</li>
    </ul>
    <p class="hint">Te hemos enviado los detalles a ${bookingState.customer.email}.</p>
  `;
}
