export function fechaISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO() {
  return fechaISO();
}

// "YYYY-MM-DD" (el formato que devuelve <input type="date">) -> Date
// local. Se parsea a mano en vez de `new Date(fechaStr)` porque ese
// formato lo interpreta como UTC y corre el día en zonas horarias
// negativas.
export function parsearFechaISO(fechaStr) {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
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

  const mismoAnio = inicio.getFullYear() === ultimoDia.getFullYear();
  const mismoMes = mismoAnio && inicio.getMonth() === ultimoDia.getMonth();

  if (mismoMes) {
    return `${inicio.getDate()} al ${ultimoDia.getDate()} de ${MESES[inicio.getMonth()]} de ${inicio.getFullYear()}`;
  }
  if (mismoAnio) {
    return `${inicio.getDate()} de ${MESES[inicio.getMonth()]} al ${ultimoDia.getDate()} de ${MESES[ultimoDia.getMonth()]} de ${inicio.getFullYear()}`;
  }
  // Semana que cruza de un año al siguiente (ej. fin/principio de año).
  return `${inicio.getDate()} de ${MESES[inicio.getMonth()]} de ${inicio.getFullYear()} al ${ultimoDia.getDate()} de ${MESES[ultimoDia.getMonth()]} de ${ultimoDia.getFullYear()}`;
}
