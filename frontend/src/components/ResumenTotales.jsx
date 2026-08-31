import { listaExtras } from "../utils/resumen.js";

export function ResumenTotales({ totales, tab }) {
  return (
    <table className="resumen-table resumen-totales-tabla">
      <tfoot>
        <tr>
          <td>
            <strong>Total</strong>
          </td>
          <td data-label="Limpiezas">{totales.totalLimpiezas}</td>
          <td data-label="Pastillas">{totales.totalPastillas}</td>
          <td data-label="Extras">{listaExtras(totales.totalExtras)}</td>
          {tab !== "mensual" && <td></td>}
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}
