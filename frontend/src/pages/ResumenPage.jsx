import { useEffect, useState } from "react";
import { ResumenTable } from "../components/ResumenTable.jsx";
import { getResumen } from "../services/resumenService.js";
import { fechaISO, formatoPeriodo, fechaInicialMensual } from "../utils/fecha.js";

function sumarSemanas(fecha, cantidad) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + cantidad * 7);
  return nueva;
}

function sumarMeses(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

export function ResumenPage() {
  const [tab, setTab] = useState("semanal");
  const [fechaSemanal, setFechaSemanal] = useState(new Date());
  const [fechaMensual, setFechaMensual] = useState(fechaInicialMensual());
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  const fechaActiva = tab === "semanal" ? fechaSemanal : fechaMensual;
  const periodo = resumen ? formatoPeriodo(tab, resumen.inicio, resumen.fin) : "";

  useEffect(() => {
    let cancelado = false;

    getResumen(tab, fechaISO(fechaActiva))
      .then((data) => {
        if (!cancelado) {
          setError("");
          setResumen(data);
        }
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar el resumen.");
      });

    return () => {
      cancelado = true;
    };
  }, [tab, fechaActiva]);

  const irAnterior = () => {
    if (tab === "semanal") setFechaSemanal((fecha) => sumarSemanas(fecha, -1));
    else setFechaMensual((fecha) => sumarMeses(fecha, -1));
  };

  const irSiguiente = () => {
    if (tab === "semanal") setFechaSemanal((fecha) => sumarSemanas(fecha, 1));
    else setFechaMensual((fecha) => sumarMeses(fecha, 1));
  };

  return (
    <section>
      <h2>Resumen</h2>

      <div className="tabs">
        <button
          className={tab === "semanal" ? "" : "secondary"}
          onClick={() => setTab("semanal")}
        >
          Semanal
        </button>
        <button
          className={tab === "mensual" ? "" : "secondary"}
          onClick={() => setTab("mensual")}
        >
          Mensual
        </button>
      </div>

      <div className="periodo-nav">
        <button className="secondary" onClick={irAnterior} title="Período anterior">
          ←
        </button>
        <span className="periodo-label">{periodo}</span>
        <button className="secondary" onClick={irSiguiente} title="Período siguiente">
          →
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {resumen && (
        <ResumenTable filas={resumen.clientes} totales={resumen.totales} periodo={periodo} />
      )}
    </section>
  );
}
