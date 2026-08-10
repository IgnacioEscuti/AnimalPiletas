export function fechaISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO() {
  return fechaISO();
}

// Número de semana ISO 8601 (1-53) de una fecha.
export function semanaISO(fecha = new Date()) {
  const dia = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const diaDeSemana = dia.getUTCDay() || 7; // domingo=0 -> 7, lunes=1, ..., sábado=6
  dia.setUTCDate(dia.getUTCDate() + 4 - diaDeSemana);
  const inicioDeAnio = new Date(Date.UTC(dia.getUTCFullYear(), 0, 1));
  return Math.ceil(((dia - inicioDeAnio) / 86400000 + 1) / 7);
}

// Semana ISO impar -> "1", par -> "2". Así se decide a quién le toca hoy.
export function semanaActual() {
  return semanaISO() % 2 === 1 ? "1" : "2";
}

// Con qué mes arranca la pestaña Mensual del Resumen al entrar. Recibe
// "hoy" por parámetro (en vez de usar `new Date()` adentro) para poder
// probar la regla del día 1° pasándole cualquier fecha a mano.
export function fechaInicialMensual(hoy = new Date()) {
  if (hoy.getDate() === 1) {
    return new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  }
  return hoy;
}

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function capitalizar(palabra) {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

export function formatoPeriodo(tipo, inicioISO, finISO) {
  const inicio = new Date(inicioISO);

  if (tipo === "mensual") {
    return `${capitalizar(MESES[inicio.getMonth()])} ${inicio.getFullYear()}`;
  }

  // fin es exclusivo (el lunes siguiente): el último día real es fin - 1.
  const ultimoDia = new Date(finISO);
  ultimoDia.setDate(ultimoDia.getDate() - 1);

  if (inicio.getMonth() === ultimoDia.getMonth()) {
    return `${inicio.getDate()} al ${ultimoDia.getDate()} de ${MESES[inicio.getMonth()]}`;
  }
  return `${inicio.getDate()} de ${MESES[inicio.getMonth()]} al ${ultimoDia.getDate()} de ${MESES[ultimoDia.getMonth()]}`;
}
