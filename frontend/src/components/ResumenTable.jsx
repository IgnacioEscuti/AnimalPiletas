import { useState } from "react";

function listaProductos(productos) {
  if (productos.length === 0) return "—";
  return productos.map(({ nombre, cantidad }) => `${nombre} x${cantidad}`).join(", ");
}

function textoParaCopiar(fila, periodo) {
  const lineas = [
    `*Resumen de ${fila.clienteNombre} — ${periodo}*`,
    `Limpieza: ${fila.limpieza.cantidad} x $${fila.limpieza.precio}`,
    `Pastillas: ${fila.pastillas.cantidad} x $${fila.pastillas.precio}`,
  ];
  if (fila.producto.productos.length > 0) {
    lineas.push(`Producto: ${listaProductos(fila.producto.productos)}`);
  }
  lineas.push(`*Total: $${fila.totalGeneral}*`);
  return lineas.join("\n");
}

export function ResumenTable({ filas, totales, periodo }) {
  const [copiadoId, setCopiadoId] = useState(null);

  const handleCopiar = async (fila) => {
    try {
      await navigator.clipboard.writeText(textoParaCopiar(fila, periodo));
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
          <th>Producto</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.clienteId}>
            <td>{fila.clienteNombre}</td>
            <td>
              <div>{fila.limpieza.cantidad}</div>
              <div className="row-price">${fila.limpieza.precio}</div>
            </td>
            <td>
              <div>{fila.pastillas.cantidad}</div>
              <div className="row-price">${fila.pastillas.precio}</div>
            </td>
            <td>
              <div>{listaProductos(fila.producto.productos)}</div>
              <div className="row-price">${fila.producto.precio}</div>
            </td>
            <td>
              <strong>${fila.totalGeneral}</strong>
            </td>
            <td>
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
          <td>{totales.totalLimpiezas}</td>
          <td>{totales.totalPastillas}</td>
          <td>{listaProductos(totales.totalProductos)}</td>
          <td>—</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
