import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ResumenTable } from "../components/ResumenTable.jsx";
import { ResumenTotales } from "../components/ResumenTotales.jsx";
import { ResumenGrupo } from "../components/ResumenGrupo.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { getResumen } from "../services/resumenService.js";
import { getUsuarios } from "../services/usuarioService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fechaISO, formatoPeriodo, parsearFechaISO } from "../utils/fecha.js";
import { crearMatcher } from "../utils/texto.js";

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
  const inputFechaRef = useRef(null);

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

  // El input de fecha está oculto: tocar el label abre el picker nativo.
  // showPicker() no existe en navegadores viejos (y puede tirar error), así
  // que el fallback es enfocar y clickear el input.
  const abrirSelectorFecha = () => {
    const input = inputFechaRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // sigue al fallback
    }
    input.focus();
    input.click();
  };

  const matchea = crearMatcher(busqueda);

  // Barrio que matchea: la sección entera. Si no, solo los clientes que matchean.
  const filtrarClientes = (grupo) => {
    if (matchea(grupo.barrioNombre)) return grupo.clientes;
    return grupo.clientes.filter((fila) => matchea(fila.clienteNombre));
  };

  let contenido = null;
  if (resumen) {
    const gruposVisibles = resumen.grupos
      .map((grupo) => ({ grupo, filas: filtrarClientes(grupo) }))
      .filter(({ filas }) => filas.length > 0);

    const grupos = gruposVisibles.map(({ grupo, filas }) => (
      <ResumenGrupo key={grupo.barrioId} titulo={grupo.barrioNombre}>
        <ResumenTable filas={filas} periodo={periodo} tab={tab} inicioISO={resumen.inicio} />
      </ResumenGrupo>
    ));

    contenido =
      grupos.length === 0 ? (
        <p className="empty-state">Todavia no hay clientes cargados esta semana.</p>
      ) : (
        grupos
      );
  }

  return (
    <>
      <div className="resumen-top">
        <div className="resumen-encabezado">
          <h2>Resumen</h2>
          <div className="resumen-tabs">
            {[
              ["semanal", "Semanal"],
              ["mensual", "Mensual"],
            ].map(([clave, label]) => (
              <button
                key={clave}
                type="button"
                className={tab === clave ? "activo" : ""}
                onClick={() => setTab(clave)}
              >
                {tab === clave && (
                  <motion.span
                    layoutId="resumen-tab-indicador"
                    className="resumen-tab-indicador"
                    transition={{ type: "spring", stiffness: 500, damping: 45 }}
                  />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="periodo-card">
          <button type="button" className="periodo-flecha" onClick={irAnterior} aria-label="Período anterior">
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <button type="button" className="periodo-actual" onClick={abrirSelectorFecha}>
            <CalendarDays size={20} strokeWidth={2} className="periodo-icono" />
            <span className="periodo-label">{periodo || " "}</span>
          </button>
          <button type="button" className="periodo-flecha" onClick={irSiguiente} aria-label="Período siguiente">
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
          <input
            ref={inputFechaRef}
            type="date"
            className="periodo-fecha-oculta"
            value={fechaISO(fechaActiva)}
            onChange={handleFechaManual}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      {resumen && <ResumenTotales totales={resumen.totales} />}

      <div className="resumen-filtros">
        <label className="resumen-buscador">
          <Search size={18} strokeWidth={2} className="resumen-buscador-icono" />
          <input
            type="text"
            placeholder="Buscar cliente o barrio"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>

        {esAdmin && (
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
        )}
      </div>

      <section className="card-mobile resumen-lista">
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
