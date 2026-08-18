import { useState } from "react";
import { MESES } from "../utils/fecha.js";

function listaExtras(extras) {
  if (extras.length === 0) return "—";
  return extras.map(({ nombre, cantidad }) => `${nombre} x${cantidad}`).join(", ");
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
  return fechas.map((fecha) => new Date(fecha).getDate()).join("/");
}

function textoParaCopiarMensual(fila, inicioISO) {
  const nombreMes = capitalizar(MESES[new Date(inicioISO).getMonth()]);
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

export function ResumenTable({ filas, totales, periodo, tab, inicioISO }) {
  const [copiadoId, setCopiadoId] = useState(null);

  const handleCopiar = async (fila) => {
    try {
      const texto =
        tab === "mensual"
          ? textoParaCopiarMensual(fila, inicioISO)
          : textoParaCopiarSemanal(fila, periodo);
      await navigator.clipboard.writeText(texto);
      setCopiadoId(fila.clienteId);
      setTimeout(() => setCopiadoId(null), 1200);
    } catch {
      // portapapeles no disponible (permisos, contexto no seguro, etc.)
    }
  };

  if (filas.length === 0) {
    return <p className="empty-state">No hay clientes para mostrar.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Limpieza</th>
          <th>Pastillas</th>
          <th>Extra</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.clienteId}>
            <td className="td-titulo">{fila.clienteNombre}</td>
            <td data-label="Limpieza">
              <div>{fila.limpieza.cantidad}</div>
              <div className="row-price">${fila.limpieza.precio}</div>
            </td>
            <td data-label="Pastillas">
              <div>{fila.pastillas.cantidad}</div>
              <div className="row-price">${fila.pastillas.precio}</div>
            </td>
            <td data-label="Extra">
              <div>{listaExtras(fila.extra.extras)}</div>
              <div className="row-price">${fila.extra.precio}</div>
            </td>
            <td data-label="Total">
              <strong>${fila.totalGeneral}</strong>
            </td>
            <td className="td-accion">
              <button className="secondary" onClick={() => handleCopiar(fila)}>
                {copiadoId === fila.clienteId ? "¡Copiado!" : "Copiar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>
            <strong>Total</strong>
          </td>
          <td data-label="Limpiezas">{totales.totalLimpiezas}</td>
          <td data-label="Pastillas">{totales.totalPastillas}</td>
          <td data-label="Extras">{listaExtras(totales.totalExtras)}</td>
          <td>—</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
