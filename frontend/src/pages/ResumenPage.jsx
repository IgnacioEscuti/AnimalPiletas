import { useEffect, useState } from "react";
import { ResumenTable } from "../components/ResumenTable.jsx";
import { ResumenTotales } from "../components/ResumenTotales.jsx";
import { ResumenGrupo } from "../components/ResumenGrupo.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { getResumen } from "../services/resumenService.js";
import { getUsuarios } from "../services/usuarioService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fechaISO, formatoPeriodo, parsearFechaISO } from "../utils/fecha.js";

const TODOS = "todos";

function sumarSemanas(fecha, cantidad) {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + cantidad * 7);
  return nueva;
}

function sumarMeses(fecha, cantidad) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

export function ResumenPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const [tab, setTab] = useState("semanal");
  const [fechaSemanal, setFechaSemanal] = useState(new Date());
  const [fechaMensual, setFechaMensual] = useState(new Date());
  const [resumen, setResumen] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [encargadoSeleccionado, setEncargadoSeleccionado] = useState(TODOS);
  const [error, setError] = useState("");

  const fechaActiva = tab === "semanal" ? fechaSemanal : fechaMensual;
  const periodo = resumen ? formatoPeriodo(tab, resumen.inicio, resumen.fin) : "";

  useEffect(() => {
    if (!esAdmin) return;
    getUsuarios()
      .then(setUsuarios)
      .catch(() => {});
  }, [esAdmin]);

  useEffect(() => {
    let cancelado = false;

    // Si no se limpia acá, mientras el fetch nuevo está en vuelo el label
    // combina el "tab" ya actualizado con los datos viejos (de la otra
    // pestaña o período) — ej. formato mensual aplicado a un rango
    // semanal, mostrando un período que nunca se pidió.
    setResumen(null);

    const encargadoId = esAdmin && encargadoSeleccionado !== TODOS ? encargadoSeleccionado : undefined;

    getResumen(tab, fechaISO(fechaActiva), encargadoId)
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
  }, [tab, fechaActiva, esAdmin, encargadoSeleccionado]);

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

  const filtrarClientes = (clientes) =>
    clientes.filter((fila) => fila.clienteNombre.toLowerCase().includes(busqueda.toLowerCase()));

  let contenido = null;
  if (resumen) {
    const grupos = resumen.grupos
      .map((grupo) => {
        const filas = filtrarClientes(grupo.clientes);
        if (filas.length === 0) return null;
        return (
          <ResumenGrupo key={grupo.barrioId} titulo={grupo.barrioNombre}>
            <ResumenTable filas={filas} periodo={periodo} tab={tab} inicioISO={resumen.inicio} />
          </ResumenGrupo>
        );
      })
      .filter(Boolean);

    contenido =
      grupos.length === 0 ? (
        <p className="empty-state">No hay clientes para mostrar.</p>
      ) : (
        <>
          {grupos}
          <ResumenTotales totales={resumen.totales} tab={tab} />
        </>
      );
  }

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
          <div className="periodo-nav-grupo">
            <button className="secondary" onClick={irAnterior} title="Período anterior">
              ←
            </button>
            <span className="periodo-label">{periodo}</span>
            <button className="secondary" onClick={irSiguiente} title="Período siguiente">
              →
            </button>
          </div>
          <input
            type="date"
            className="periodo-fecha"
            value={fechaISO(fechaActiva)}
            onChange={handleFechaManual}
          />
        </div>

        {esAdmin && (
          <div className="resumen-selector-wrap">
            <select
              className="select-encargado"
              value={encargadoSeleccionado}
              onChange={(event) => setEncargadoSeleccionado(event.target.value)}
            >
              <option value={TODOS}>Todos</option>
              {usuarios.map((usuarioItem) => (
                <option key={usuarioItem.id} value={usuarioItem.id}>
                  {usuarioItem.nombre || usuarioItem.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="search-input resumen-search"
        />

        {error && <p className="error-message">{error}</p>}

        {resumen ? (
          contenido
        ) : (
          !error && <Skeleton filas={5} />
        )}
      </section>
    </>
  );
}
