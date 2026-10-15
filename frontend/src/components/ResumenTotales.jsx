import { useState } from "react";
import { ChevronDown, Droplet, FlaskConical, Pill } from "lucide-react";

// En mobile la lista de extras muestra estos primeros y "Ver más" despliega
// el resto. En desktop la tarjeta arranca compacta y "Ver más" muestra todo.
const EXTRAS_VISIBLES = 3;

function TotalCategoria({ categoria, Icono, label, valor }) {
  return (
    <div className={`total-card total-${categoria}`}>
      <span className="total-icono">
        <Icono size={20} strokeWidth={2} />
      </span>
      <span className="total-label">{label}</span>
      <span className="total-numero">{valor}</span>
    </div>
  );
}

export function ResumenTotales({ totales }) {
  const [abierto, setAbierto] = useState(false);

  const extras = [...totales.totalExtras].sort((a, b) => b.cantidad - a.cantidad);
  const cantidadExtras = extras.reduce((suma, { cantidad }) => suma + cantidad, 0);
  const hayResto = extras.length > EXTRAS_VISIBLES;

  return (
    <div className="resumen-totales">
      <TotalCategoria categoria="limpieza" Icono={Droplet} label="Limpiezas" valor={totales.totalLimpiezas} />
      <TotalCategoria categoria="pastillas" Icono={Pill} label="Pastillas" valor={totales.totalPastillas} />

      <div className={`total-card total-extras${abierto ? " abierto" : ""}`}>
        <span className="total-icono">
          <FlaskConical size={20} strokeWidth={2} />
        </span>
        <span className="total-label">Extras</span>
        <span className="total-numero">{cantidadExtras}</span>

        {extras.length === 0 ? (
          <p className="total-extras-vacio">Sin extras en este período</p>
        ) : (
          <ul className="total-extras-lista">
            {extras.map(({ nombre, cantidad }, index) => (
              <li key={nombre} className={index >= EXTRAS_VISIBLES ? "total-extras-resto" : ""}>
                <span className="total-extras-nombre">{nombre}</span>
                <span className="total-extras-chip">×{cantidad}</span>
              </li>
            ))}
          </ul>
        )}

        {extras.length > 0 && (
          // Sin resto, en mobile ya se ve toda la lista: el botón solo
          // tiene sentido en desktop, donde la tarjeta arranca compacta.
          <button
            type="button"
            className={`total-ver-mas${hayResto ? "" : " solo-desktop"}`}
            onClick={() => setAbierto((valor) => !valor)}
            aria-expanded={abierto}
          >
            {abierto ? "Ver menos" : "Ver más"}
            <ChevronDown size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </div>
  );
}
