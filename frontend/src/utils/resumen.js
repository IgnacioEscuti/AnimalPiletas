import { MESES, parsearFechaISO } from "./fecha.js";

export function listaExtras(extras) {
  if (extras.length === 0) return "—";
  return extras.map(({ nombre, cantidad }) => `${nombre} x${cantidad}`).join(", ");
}

// Precio con separador de miles para mostrar en pantalla ($25.000).
// El texto que se copia no lo usa: sigue saliendo sin separador.
export function formatearPrecio(precio) {
  return `$${precio.toLocaleString("es-AR")}`;
}

function capitalizar(palabra) {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

function textoParaCopiarSemanal(fila, periodo) {
  const lineas = [
    `*Resumen de ${fila.clienteNombre} — ${periodo}*`,
    `Limpieza: ${fila.limpieza.cantidad} x $${fila.limpieza.precio}`,
    `Pastillas: ${fila.pastillas.cantidad} x $${fila.pastillas.precio}`,
  ];
  if (fila.extra.extras.length > 0) {
    lineas.push(`Extra: ${listaExtras(fila.extra.extras)}`);
  }
  lineas.push(`*Total: $${fila.totalGeneral}*`);
  return lineas.join("\n");
}

// Solo el número de día (el mes ya va arriba, en el saludo), en orden
// cronológico — las fechas ya llegan ordenadas desde el backend.
function diasDeLimpieza(fechas) {
  return fechas.map((fecha) => parsearFechaISO(fecha.slice(0, 10)).getDate()).join("/");
}

function textoParaCopiarMensual(fila, inicioISO) {
  const inicio = parsearFechaISO(inicioISO.slice(0, 10));
  const nombreMes = capitalizar(MESES[inicio.getMonth()]);
  const lineas = ["Buenas!", `En ${nombreMes} fuimos`];

  if (fila.limpieza.cantidad > 0) {
    lineas.push(
      `${fila.limpieza.cantidad} veces $${fila.limpieza.precio} (${diasDeLimpieza(fila.limpieza.fechas)})`
    );
  }
  if (fila.pastillas.cantidad > 0) {
    lineas.push(`${fila.pastillas.cantidad} pastillas $${fila.pastillas.precio}`);
  }
  if (fila.extra.extras.length > 0) {
    lineas.push(`${listaExtras(fila.extra.extras)} $${fila.extra.precio}`);
  }
  lineas.push(`Total $${fila.totalGeneral}`);
  lineas.push("Avíseme cuando lo podamos cobrar , saludos");
  return lineas.join("\n");
}

// Texto que se copia al portapapeles para mandarle al cliente. Lo usan la
// tabla de desktop y la tarjeta de mobile, así sale idéntico en las dos.
export function textoParaCopiar(fila, { tab, periodo, inicioISO }) {
  return tab === "mensual"
    ? textoParaCopiarMensual(fila, inicioISO)
    : textoParaCopiarSemanal(fila, periodo);
}
