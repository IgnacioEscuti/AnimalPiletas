export function hoyNormalizado() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// fechaStr esperado como "YYYY-MM-DD". Se parsea a mano (en vez de
// `new Date(fechaStr)`) porque ese formato lo interpreta como UTC y
// corre el día en zonas horarias negativas como Argentina (UTC-3).
function parsearFecha(fechaStr) {
  if (!fechaStr) return hoyNormalizado();
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function rangoDelDia(fechaStr) {
  const inicio = parsearFecha(fechaStr);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { inicio, fin };
}

// Semana de lunes a lunes (exclusivo) que contiene fechaStr.
export function rangoSemanal(fechaStr) {
  const base = parsearFecha(fechaStr);
  const diaSemana = base.getDay(); // domingo=0, lunes=1, ..., sábado=6
  const diasHastaElLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

  const inicio = new Date(base);
  inicio.setDate(inicio.getDate() + diasHastaElLunes);

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 7);

  return { inicio, fin };
}

// True si `fecha` cae dentro de la semana (lunes a lunes) que contiene hoy.
export function estaEnSemanaActual(fecha) {
  if (!fecha) return false;
  const { inicio, fin } = rangoSemanal();
  return fecha >= inicio && fecha < fin;
}

// Mes calendario (1° al 1° del mes siguiente, exclusivo) que contiene fechaStr.
export function rangoMensual(fechaStr) {
  const base = parsearFecha(fechaStr);
  const inicio = new Date(base.getFullYear(), base.getMonth(), 1);
  const fin = new Date(base.getFullYear(), base.getMonth() + 1, 1);
  return { inicio, fin };
}
