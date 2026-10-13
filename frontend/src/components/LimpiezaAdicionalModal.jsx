import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdicionalTarjeta } from "./AdicionalTarjeta.jsx";
import { getClientesBuscador } from "../services/clienteService.js";
import {
  getLimpiezasAdicionales,
  registrarLimpiezaAdicional,
  eliminarLimpiezaAdicional,
} from "../services/limpiezaAdicionalService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { crearMatcher, normalizar } from "../utils/texto.js";
import { parsearFechaISO } from "../utils/fecha.js";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// La fecha llega en UTC: se toma solo "YYYY-MM-DD" para no correr el día.
function formatoDia(fecha) {
  const dia = parsearFechaISO(fecha.slice(0, 10));
  const dd = String(dia.getDate()).padStart(2, "0");
  const mm = String(dia.getMonth() + 1).padStart(2, "0");
  return `${DIAS[dia.getDay()]} ${dd}/${mm}`;
}

function formatoPrecio(valor) {
  return `$ ${valor.toLocaleString("es-AR")}`;
}

// Resalta en cada palabra del nombre el prefijo que coincide con lo buscado.
function NombreResaltado({ nombre, busqueda }) {
  const buscadas = normalizar(busqueda).split(" ").filter(Boolean);
  return nombre.split(" ").map((palabra, index) => {
    const largo = Math.max(
      0,
      ...buscadas.filter((buscada) => normalizar(palabra).startsWith(buscada)).map((b) => b.length)
    );
    return (
      <span key={index}>
        {index > 0 && " "}
        {largo > 0 && <mark>{palabra.slice(0, largo)}</mark>}
        {palabra.slice(largo)}
      </span>
    );
  });
}

const transicionPaso = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.18 },
};

export function LimpiezaAdicionalModal({ clientesPagina, onEditarCliente, onClose }) {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const [clientes, setClientes] = useState([]);
  const [adicionales, setAdicionales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteElegidoId, setClienteElegidoId] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);
  const dragRef = useRef({ startY: 0, arrastrando: false });

  // Se vuelve a pedir cuando cambian los clientes de la pantalla (por
  // ejemplo, al editar uno desde acá), para no mostrar datos viejos.
  useEffect(() => {
    getClientesBuscador()
      .then(setClientes)
      .catch(() => setError("No se pudieron cargar los clientes."));
  }, [clientesPagina]);

  useEffect(() => {
    cargarAdicionales();
  }, []);

  useEffect(() => {
    const scrollY = window.scrollY;
    const { overflow, position, width, top } = document.body.style;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.width = width;
      document.body.style.top = top;
      window.scrollTo(0, scrollY);
    };
  }, []);

  const cargarAdicionales = async () => {
    try {
      const data = await getLimpiezasAdicionales();
      setAdicionales([...data].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    } catch {
      setError("No se pudieron cargar las limpiezas adicionales.");
    }
  };

  const handleHandleDown = (event) => {
    dragRef.current = { startY: event.clientY, arrastrando: true };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (modalRef.current) {
      modalRef.current.style.transition = "none";
    }
  };

  const handleHandleMove = (event) => {
    if (!dragRef.current.arrastrando || !modalRef.current) return;
    const deltaY = Math.max(0, event.clientY - dragRef.current.startY);
    modalRef.current.style.transform = `translateY(${deltaY}px)`;
  };

  const handleHandleUp = (event) => {
    if (!dragRef.current.arrastrando) return;
    const deltaY = Math.max(0, event.clientY - dragRef.current.startY);
    dragRef.current.arrastrando = false;
    if (deltaY > 100) {
      onClose();
      return;
    }
    if (modalRef.current) {
      modalRef.current.style.transition = "transform 0.2s ease";
      modalRef.current.style.transform = "translateY(0)";
    }
  };

  const handleGuardar = async (datos) => {
    await registrarLimpiezaAdicional(datos);
    setClienteElegidoId(null);
    setBusqueda("");
    await cargarAdicionales();
  };

  const handleEliminar = async () => {
    setEliminando(true);
    setError("");
    try {
      await eliminarLimpiezaAdicional(aEliminar.id);
      await cargarAdicionales();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar la limpieza adicional.");
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  // Si el cliente elegido se canceló mientras tanto, desaparece del buscador
  // y se vuelve solo al paso 1.
  const clienteElegido = clientes.find((cliente) => cliente.id === clienteElegidoId);
  const buscando = Boolean(busqueda.trim());
  const matchea = crearMatcher(busqueda);
  const resultados = clientes
    .filter((cliente) => matchea(cliente.nombre))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal-adicional" ref={modalRef} onClick={(event) => event.stopPropagation()}>
          <div
            className="modal-handle-area"
            onPointerDown={handleHandleDown}
            onPointerMove={handleHandleMove}
            onPointerUp={handleHandleUp}
          >
            <div className="modal-handle" />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {clienteElegido ? (
              <motion.div key="carga" className="adicional-paso" {...transicionPaso}>
                <AdicionalTarjeta
                  key={clienteElegido.id}
                  cliente={clienteElegido}
                  puedeEditar={esAdmin || String(clienteElegido.encargado) === usuario?.id}
                  onEditar={onEditarCliente}
                  onGuardar={handleGuardar}
                  onVolver={() => setClienteElegidoId(null)}
                />
              </motion.div>
            ) : (
              <motion.div key="buscador" className="adicional-paso adicional-paso-buscador" {...transicionPaso}>
                <h2>Limpieza adicional</h2>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="adicional-buscador"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && buscando && resultados[0]) {
                      setClienteElegidoId(resultados[0].id);
                    }
                  }}
                />

                {error && <p className="error-message">{error}</p>}

                {!buscando && adicionales.length > 0 && (
                  <>
                    <p className="adicional-seccion">Limpiezas adicionales de esta semana</p>
                    <ul className="adicional-semana adicional-scroll">
                      {adicionales.map((adicional) => (
                        <li key={adicional.id}>
                          <button type="button" onClick={() => setAEliminar(adicional)}>
                            <span>
                              <span className="adicional-item-nombre">{adicional.cliente?.nombre}</span>
                              <span className="adicional-item-detalle">{formatoDia(adicional.fecha)}</span>
                            </span>
                            <span className="adicional-item-precio">{formatoPrecio(adicional.total)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {!buscando && <p className="adicional-seccion">Clientes</p>}
                <div className={`adicional-lista adicional-scroll ${buscando ? "buscando" : ""}`}>
                  {resultados.length > 0 ? (
                    <ul className="adicional-clientes">
                      {resultados.map((cliente) => (
                        <li key={cliente.id}>
                          <button type="button" onClick={() => setClienteElegidoId(cliente.id)}>
                            <span className="adicional-item-nombre">
                              <NombreResaltado nombre={cliente.nombre} busqueda={busqueda} />
                            </span>
                            <span className="adicional-item-detalle">{cliente.barrio ?? "Sin barrio"}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    buscando && <p className="empty-state">No hay clientes que coincidan.</p>
                  )}
                </div>
                {buscando && resultados.length > 0 && (
                  <p className="adicional-ayuda">Elegí un cliente para cargar la adicional</p>
                )}

                <div className="adicional-acciones">
                  <button type="button" className="secondary" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="button" disabled>
                    Guardar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {aEliminar && (
          <motion.div
            key="confirmacion"
            className="modal-overlay confirmacion-overlay"
            onClick={() => setAEliminar(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="confirmacion"
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.94 }}
              transition={{ duration: 0.15 }}
            >
              <span className="confirmacion-icono" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                </svg>
              </span>
              <h2>¿Eliminar esta limpieza adicional?</h2>
              <p className="confirmacion-detalle">
                {aEliminar.cliente?.nombre} · {formatoDia(aEliminar.fecha)} · {formatoPrecio(aEliminar.total)}
              </p>
              <div className="adicional-acciones">
                <button type="button" className="secondary" onClick={() => setAEliminar(null)}>
                  Cancelar
                </button>
                <button type="button" className="danger" onClick={handleEliminar} disabled={eliminando}>
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
