import { listaExtras } from "../utils/resumen.js";

export function ResumenTotales({ totales }) {
  return (
    <div className="resumen-totales">
      <span className="resumen-totales-titulo">Total</span>
      <div className="resumen-totales-items">
        <div className="resumen-totales-item">
          <span className="resumen-totales-label">Limpiezas</span>
          <span className="resumen-totales-valor">{totales.totalLimpiezas}</span>
        </div>
        <div className="resumen-totales-item">
          <span className="resumen-totales-label">Pastillas</span>
          <span className="resumen-totales-valor">{totales.totalPastillas}</span>
        </div>
        <div className="resumen-totales-item">
          <span className="resumen-totales-label">Extras</span>
          <span className="resumen-totales-valor">{listaExtras(totales.totalExtras)}</span>
        </div>
      </div>
    </div>
  );
}
