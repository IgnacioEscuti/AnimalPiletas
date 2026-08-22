import { useEffect, useState } from "react";
import { ResumenTable } from "../components/ResumenTable.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { getResumen } from "../services/resumenService.js";
import { fechaISO, formatoPeriodo, parsearFechaISO } from "../utils/fecha.js";

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
  const [fechaMensual, setFechaMensual] = useState(new Date());
  const [resumen, setResumen] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  const fechaActiva = tab === "semanal" ? fechaSemanal : fechaMensual;
  const periodo = resumen ? formatoPeriodo(tab, resumen.inicio, resumen.fin) : "";

  useEffect(() => {
    let cancelado = false;

    // Si no se limpia acá, mientras el fetch nuevo está en vuelo el label
    // combina el "tab" ya actualizado con los datos viejos (de la otra
    // pestaña o período) — ej. formato mensual aplicado a un rango
    // semanal, mostrando un período que nunca se pidió.
    setResumen(null);

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

  const handleFechaManual = (event) => {
    if (!event.target.value) return;
    const nuevaFecha = parsearFechaISO(event.target.value);
    if (tab === "semanal") setFechaSemanal(nuevaFecha);
    else setFechaMensual(nuevaFecha);
  };

  const filasFiltradas = resumen
    ? resumen.clientes.filter((fila) =>
        fila.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : [];

  return (
    <>
      <div className="page-title">
        <h2>Resumen</h2>
      </div>

      <section className="card-mobile">
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
          <input
            type="date"
            className="periodo-fecha"
            value={fechaISO(fechaActiva)}
            onChange={handleFechaManual}
          />
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="search-input"
        />

        {error && <p className="error-message">{error}</p>}

        {resumen ? (
          <ResumenTable
            filas={filasFiltradas}
            totales={resumen.totales}
            periodo={periodo}
            tab={tab}
            inicioISO={resumen.inicio}
          />
        ) : (
          !error && <Skeleton filas={5} />
        )}
      </section>
    </>
  );
}
