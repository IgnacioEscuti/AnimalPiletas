import { Fragment, useEffect, useRef, useState } from "react";
import { ClienteModal } from "../components/ClienteModal.jsx";
import { ClienteRow } from "../components/ClienteRow.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  cancelarCliente,
  reordenarClientesEnBarrio,
} from "../services/clienteService.js";
import { getTarifas } from "../services/tarifaService.js";
import { getBarrios, reordenarBarrios } from "../services/barrioService.js";
import { getLimpiezasDeHoy, registrarLimpieza } from "../services/limpiezaService.js";
import { getUsosPastillasDeHoy, registrarUsoPastillas } from "../services/usoPastillasService.js";
import { getUsosExtraDeHoy, registrarUsoExtra } from "../services/usoExtraService.js";
import { getUsuarios } from "../services/usuarioService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { semanaActual, estaEnSemanaActual } from "../utils/fecha.js";

const SEMANA_ACTUAL = semanaActual();
const SIN_BARRIO = "sin-barrio";

export function ClientesPage({ onPrimeraCarga }) {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [pastillas, setPastillas] = useState([]);
  const [extras, setExtras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [verTodos, setVerTodos] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");
  const [dragBarrioId, setDragBarrioId] = useState(null);
  const [dragCliente, setDragCliente] = useState(null);
  const [touchDragId, setTouchDragId] = useState(null);
  const [touchOverId, setTouchOverId] = useState(null);
  const [touchDragBarrioId, setTouchDragBarrioId] = useState(null);
  const [touchOverBarrioId, setTouchOverBarrioId] = useState(null);
  const [dragPointerPos, setDragPointerPos] = useState({ x: 0, y: 0 });
  const [clienteExpandidoId, setClienteExpandidoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const touchDragRef = useRef(null);
  const ignorarClickRef = useRef(false);

  const handleToggleExpandido = (clienteId) => {
    if (ignorarClickRef.current) {
      ignorarClickRef.current = false;
      return;
    }
    setClienteExpandidoId((actual) => (actual === clienteId ? null : clienteId));
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [
        clientesData,
        tarifasData,
        barriosData,
        limpiezasData,
        pastillasData,
        extrasData,
        usuariosData,
      ] = await Promise.all([
        getClientes(),
        getTarifas(),
        getBarrios(),
        getLimpiezasDeHoy(),
        getUsosPastillasDeHoy(),
        getUsosExtraDeHoy(),
        esAdmin ? getUsuarios() : Promise.resolve([]),
      ]);
      setClientes(clientesData);
      setTarifas(tarifasData);
      setBarrios(barriosData);
      setLimpiezas(limpiezasData);
      setPastillas(pastillasData);
      setExtras(extrasData);
      setUsuarios(usuariosData);
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
      onPrimeraCarga?.();
    }
  };

  const abrirNuevo = () => {
    setClienteEnEdicion(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (cliente) => {
    setClienteEnEdicion(cliente);
    setModalAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (clienteEnEdicion) {
      await actualizarCliente(clienteEnEdicion.id, datos);
    } else {
      await crearCliente(datos);
    }
    setModalAbierto(false);
    await cargarTodo();
  };

  const actualizarPorCliente = (lista, clienteId, cambios) =>
    lista.some((item) => item.cliente === clienteId)
      ? lista.map((item) => (item.cliente === clienteId ? { ...item, ...cambios } : item))
      : [...lista, { cliente: clienteId, ...cambios }];

  const handleLimpieza = async (clienteId, realizada, empleado) => {
    const anterior = limpiezas;
    setLimpiezas(actualizarPorCliente(anterior, clienteId, { realizada, empleado }));
    try {
      await registrarLimpieza(clienteId, realizada, empleado);
    } catch {
      setLimpiezas(anterior);
      setError("No se pudo registrar la limpieza.");
    }
  };

  const handlePastillas = async (clienteId, cantidad, empleado) => {
    const anterior = pastillas;
    setPastillas(actualizarPorCliente(anterior, clienteId, { cantidad, empleado }));
    try {
      await registrarUsoPastillas(clienteId, cantidad, empleado);
    } catch {
      setPastillas(anterior);
      setError("No se pudo registrar la carga de pastillas.");
    }
  };

  const handleExtra = async (clienteId, nombreExtra, precioUnitario, empleado) => {
    const anterior = extras;
    setExtras(actualizarPorCliente(anterior, clienteId, { nombreExtra, precioUnitario, empleado }));
    try {
      await registrarUsoExtra(clienteId, nombreExtra, precioUnitario, empleado);
    } catch {
      setExtras(anterior);
      setError("No se pudo registrar la carga de extra.");
    }
  };

  const handleCancelarCliente = async (id) => {
    await cancelarCliente(id);
    setModalAbierto(false);
    await cargarTodo();
  };

  const handleBarrioDragStart = (event, barrioId) => {
    if (touchDragRef.current) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", barrioId);
    setDragBarrioId(barrioId);
  };

  const reordenarBarrio = async (origenId, targetBarrioId) => {
    if (!origenId || origenId === targetBarrioId || targetBarrioId === SIN_BARRIO) return;

    const ids = barrios.map((barrio) => barrio.id);
    const fromIndex = ids.indexOf(origenId);
    const toIndex = ids.indexOf(targetBarrioId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, origenId);

    try {
      await reordenarBarrios(ids);
      setBarrios(await getBarrios());
    } catch {
      setError("No se pudo reordenar los barrios.");
    }
  };

  const handleBarrioDrop = async (targetBarrioId) => {
    const origenId = dragBarrioId;
    setDragBarrioId(null);
    await reordenarBarrio(origenId, targetBarrioId);
  };

  const handleClienteDragStart = (event, clienteId, grupoKey) => {
    if (touchDragRef.current) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clienteId);
    setDragCliente({ id: clienteId, grupoKey });
  };

  const reordenarCliente = async (origenId, targetClienteId, grupoKey) => {
    if (!origenId || origenId === targetClienteId) return;

    const ids = clientes
      .filter((cliente) => (cliente.barrio?.id ?? SIN_BARRIO) === grupoKey)
      .sort((a, b) => a.ordenEnBarrio - b.ordenEnBarrio)
      .map((cliente) => cliente.id);
    const fromIndex = ids.indexOf(origenId);
    const toIndex = ids.indexOf(targetClienteId);
    if (fromIndex === -1 || toIndex === -1) return;
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, origenId);

    const clientesAnteriores = clientes;
    setClientes(
      clientes.map((cliente) => {
        const nuevoOrden = ids.indexOf(cliente.id);
        return nuevoOrden === -1 ? cliente : { ...cliente, ordenEnBarrio: nuevoOrden };
      })
    );

    try {
      await reordenarClientesEnBarrio(ids);
    } catch {
      setClientes(clientesAnteriores);
      setError("No se pudo reordenar los clientes.");
    }
  };

  const handleClienteDrop = async (targetClienteId, grupoKey) => {
    const origen = dragCliente;
    setDragCliente(null);
    if (!origen || origen.grupoKey !== grupoKey) return;
    await reordenarCliente(origen.id, targetClienteId, grupoKey);
  };

  // Drag táctil: HTML5 drag-and-drop (arriba) no dispara con touch, así que
  // acá replicamos el mismo gesto con Pointer Events y un long-press, pero
  // reutilizamos reordenarCliente para persistir el orden — sin lógica de
  // guardado nueva.
  const handlePointerDownDrag = (event, clienteId, grupoKey) => {
    if (event.pointerType !== "touch") return;
    const el = event.currentTarget;
    let startX = event.clientX;
    let startY = event.clientY;
    const state = { dragging: false, clienteId, grupoKey };
    touchDragRef.current = state;

    const cleanup = () => {
      clearTimeout(state.timer);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      touchDragRef.current = null;
    };

    const onMove = (moveEvent) => {
      if (!state.dragging) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          cleanup();
        }
        return;
      }
      moveEvent.preventDefault();
      setDragPointerPos({ x: moveEvent.clientX, y: moveEvent.clientY });
      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const fila = target?.closest("tr[data-cliente-id]");
      if (fila && fila.dataset.grupo === grupoKey && fila.dataset.clienteId !== clienteId) {
        setTouchOverId(fila.dataset.clienteId);
      } else {
        setTouchOverId(null);
      }
    };

    const onUp = async (upEvent) => {
      const wasDragging = state.dragging;
      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const fila = target?.closest("tr[data-cliente-id]");
      const targetId = fila?.dataset.grupo === grupoKey ? fila.dataset.clienteId : null;
      cleanup();
      setTouchDragId(null);
      setTouchOverId(null);
      if (wasDragging) {
        ignorarClickRef.current = true;
      }
      if (wasDragging && targetId && targetId !== clienteId) {
        await reordenarCliente(clienteId, targetId, grupoKey);
      }
    };

    const onCancel = () => {
      cleanup();
      setTouchDragId(null);
      setTouchOverId(null);
    };

    state.timer = setTimeout(() => {
      state.dragging = true;
      el.setPointerCapture(event.pointerId);
      setDragPointerPos({ x: startX, y: startY });
      setTouchDragId(clienteId);
      if (navigator.vibrate) navigator.vibrate(10);
    }, 350);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp, { once: true });
    el.addEventListener("pointercancel", onCancel, { once: true });
  };

  const handlePointerDownDragBarrio = (event, barrioId) => {
    if (event.pointerType !== "touch") return;
    const el = event.currentTarget;
    let startX = event.clientX;
    let startY = event.clientY;
    const state = { dragging: false, barrioId };
    touchDragRef.current = state;

    const cleanup = () => {
      clearTimeout(state.timer);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      touchDragRef.current = null;
    };

    const onMove = (moveEvent) => {
      if (!state.dragging) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          cleanup();
        }
        return;
      }
      moveEvent.preventDefault();
      setDragPointerPos({ x: moveEvent.clientX, y: moveEvent.clientY });
      const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const fila = target?.closest("tr[data-barrio-id]");
      if (fila && fila.dataset.barrioId !== barrioId && fila.dataset.barrioId !== SIN_BARRIO) {
        setTouchOverBarrioId(fila.dataset.barrioId);
      } else {
        setTouchOverBarrioId(null);
      }
    };

    const onUp = async (upEvent) => {
      const wasDragging = state.dragging;
      const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const fila = target?.closest("tr[data-barrio-id]");
      const targetId = fila && fila.dataset.barrioId !== SIN_BARRIO ? fila.dataset.barrioId : null;
      cleanup();
      setTouchDragBarrioId(null);
      setTouchOverBarrioId(null);
      if (wasDragging) {
        ignorarClickRef.current = true;
      }
      if (wasDragging && targetId && targetId !== barrioId) {
        await reordenarBarrio(barrioId, targetId);
      }
    };

    const onCancel = () => {
      cleanup();
      setTouchDragBarrioId(null);
      setTouchOverBarrioId(null);
    };

    state.timer = setTimeout(() => {
      state.dragging = true;
      el.setPointerCapture(event.pointerId);
      setDragPointerPos({ x: startX, y: startY });
      setTouchDragBarrioId(barrioId);
      if (navigator.vibrate) navigator.vibrate(10);
    }, 350);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp, { once: true });
    el.addEventListener("pointercancel", onCancel, { once: true });
  };

  const clientesFiltrados = clientes
    .filter((cliente) => cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(
      (cliente) =>
        verTodos ||
        cliente.semana === "todas" ||
        cliente.semana === SEMANA_ACTUAL ||
        (cliente.semana === "unaVez" && estaEnSemanaActual(cliente.semanaUnaVezDesde))
    );

  const porBarrio = new Map();
  clientesFiltrados.forEach((cliente) => {
    const key = cliente.barrio?.id ?? SIN_BARRIO;
    if (!porBarrio.has(key)) porBarrio.set(key, []);
    porBarrio.get(key).push(cliente);
  });

  const grupos = barrios
    .filter((barrio) => porBarrio.has(barrio.id))
    .map((barrio) => ({
      key: barrio.id,
      nombre: barrio.nombre,
      clientes: porBarrio.get(barrio.id).sort((a, b) => a.ordenEnBarrio - b.ordenEnBarrio),
    }));

  if (porBarrio.has(SIN_BARRIO)) {
    grupos.push({
      key: SIN_BARRIO,
      nombre: "Sin barrio",
      clientes: porBarrio.get(SIN_BARRIO).sort((a, b) => a.ordenEnBarrio - b.ordenEnBarrio),
    });
  }

  const clienteArrastrado = touchDragId ? clientes.find((cliente) => cliente.id === touchDragId) : null;
  const limpiezaArrastrado = clienteArrastrado
    ? limpiezas.find((limpieza) => limpieza.cliente === clienteArrastrado.id)
    : null;
  const estadoArrastrado =
    limpiezaArrastrado?.realizada === true
      ? "tick"
      : limpiezaArrastrado?.realizada === false
      ? "cross"
      : "pendiente";
  const simboloArrastrado = estadoArrastrado === "tick" ? "✓" : estadoArrastrado === "cross" ? "✕" : "–";
  const barrioArrastrado = touchDragBarrioId
    ? barrios.find((barrio) => barrio.id === touchDragBarrioId)
    : null;

  return (
    <section>
      <div className="page-header">
        <h2>Clientes</h2>
        <button onClick={abrirNuevo} className="btn-nuevo-cliente">
          <span className="btn-nuevo-cliente-full">+ Nuevo cliente</span>
          <span className="btn-nuevo-cliente-icon" aria-hidden="true">
            +
          </span>
        </button>
      </div>

      <div className="filtros-clientes">
        <input
          type="text"
          placeholder="Buscar cliente"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="search-input"
        />
        <label className="toggle-ver-todos">
          <input
            type="checkbox"
            checked={verTodos}
            onChange={(event) => setVerTodos(event.target.checked)}
          />
          Ver todos
        </label>
      </div>

      {error && <p className="error-message">{error}</p>}

      {cargando ? (
        <Skeleton filas={6} />
      ) : (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Limpieza</th>
              <th>Pastillas</th>
              <th>Extra</th>
              <th>Empleado</th>
              <th></th>
            </tr>
          </thead>
          {grupos.map((grupo) => (
            <Fragment key={grupo.key}>
              <tbody>
                <tr
                  className={`barrio-header-row ${touchOverBarrioId === grupo.key ? "drag-over" : ""}`}
                  data-barrio-id={grupo.key}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleBarrioDrop(grupo.key)}
                >
                  <td colSpan="100%">
                    <div className="barrio-header">
                      {grupo.key !== SIN_BARRIO && (
                        <span
                          className="drag-handle"
                          draggable
                          onDragStart={(event) => handleBarrioDragStart(event, grupo.key)}
                          onPointerDown={(event) => handlePointerDownDragBarrio(event, grupo.key)}
                          title="Arrastrar para reordenar el barrio"
                        >
                          ⠿
                        </span>
                      )}
                      {grupo.nombre}
                    </div>
                  </td>
                </tr>
              </tbody>
              {grupo.clientes.map((cliente, index) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
                  index={index}
                  grupoKey={grupo.key}
                  limpiezaHoy={limpiezas.find((limpieza) => limpieza.cliente === cliente.id)}
                  pastillasHoy={pastillas.find((uso) => uso.cliente === cliente.id)}
                  extraHoy={extras.find((uso) => uso.cliente === cliente.id)}
                  onEditar={abrirEdicion}
                  onLimpieza={handleLimpieza}
                  onPastillas={handlePastillas}
                  onExtra={handleExtra}
                  onDragStart={(event) => handleClienteDragStart(event, cliente.id, grupo.key)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleClienteDrop(cliente.id, grupo.key)}
                  onPointerDownDrag={handlePointerDownDrag}
                  arrastrando={touchDragId === cliente.id}
                  dragOver={touchOverId === cliente.id}
                  expandido={clienteExpandidoId === cliente.id}
                  onToggleExpandido={() => handleToggleExpandido(cliente.id)}
                />
              ))}
            </Fragment>
          ))}
        </table>
        {grupos.length === 0 && <p className="empty-state">No hay clientes para mostrar.</p>}
      </div>
      )}

      {touchDragId && clienteArrastrado && (
        <div
          className="cliente-drag-ghost"
          style={{ left: dragPointerPos.x, top: dragPointerPos.y }}
        >
          <span className={`estado-punto estado-${estadoArrastrado}`} aria-hidden="true">
            {simboloArrastrado}
          </span>
          <span className="cliente-nombre">{clienteArrastrado.nombre}</span>
        </div>
      )}

      {touchDragBarrioId && barrioArrastrado && (
        <div
          className="cliente-drag-ghost"
          style={{ left: dragPointerPos.x, top: dragPointerPos.y }}
        >
          <span className="cliente-nombre">{barrioArrastrado.nombre}</span>
        </div>
      )}

      {modalAbierto && (
        <ClienteModal
          cliente={clienteEnEdicion}
          tarifas={tarifas}
          barrios={barrios}
          usuarios={usuarios}
          esAdmin={esAdmin}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardar}
          onCancelar={handleCancelarCliente}
        />
      )}
    </section>
  );
}
