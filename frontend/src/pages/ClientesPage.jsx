import { useEffect, useState } from "react";
import { ClienteModal } from "../components/ClienteModal.jsx";
import { ClienteRow } from "../components/ClienteRow.jsx";
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

export function ClientesPage() {
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

  const handleLimpieza = async (clienteId, realizada, empleado) => {
    try {
      await registrarLimpieza(clienteId, realizada, empleado);
      setLimpiezas(await getLimpiezasDeHoy());
    } catch {
      setError("No se pudo registrar la limpieza.");
    }
  };

  const handlePastillas = async (clienteId, cantidad, empleado) => {
    try {
      await registrarUsoPastillas(clienteId, cantidad, empleado);
      setPastillas(await getUsosPastillasDeHoy());
    } catch {
      setError("No se pudo registrar la carga de pastillas.");
    }
  };

  const handleExtra = async (clienteId, nombreExtra, precioUnitario, empleado) => {
    try {
      await registrarUsoExtra(clienteId, nombreExtra, precioUnitario, empleado);
      setExtras(await getUsosExtraDeHoy());
    } catch {
      setError("No se pudo registrar la carga de extra.");
    }
  };

  const handleCancelarCliente = async (id) => {
    await cancelarCliente(id);
    setModalAbierto(false);
    await cargarTodo();
  };

  const handleBarrioDragStart = (event, barrioId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", barrioId);
    setDragBarrioId(barrioId);
  };

  const handleBarrioDrop = async (targetBarrioId) => {
    const origenId = dragBarrioId;
    setDragBarrioId(null);
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

  const handleClienteDragStart = (event, clienteId, grupoKey) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clienteId);
    setDragCliente({ id: clienteId, grupoKey });
  };

  const handleClienteDrop = async (targetClienteId, grupoKey) => {
    const origen = dragCliente;
    setDragCliente(null);
    if (!origen || origen.grupoKey !== grupoKey || origen.id === targetClienteId) return;

    const ids = clientes
      .filter((cliente) => (cliente.barrio?.id ?? SIN_BARRIO) === grupoKey)
      .sort((a, b) => a.ordenEnBarrio - b.ordenEnBarrio)
      .map((cliente) => cliente.id);
    const fromIndex = ids.indexOf(origen.id);
    const toIndex = ids.indexOf(targetClienteId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, origen.id);

    try {
      await reordenarClientesEnBarrio(ids);
      setClientes(await getClientes());
    } catch {
      setError("No se pudo reordenar los clientes.");
    }
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
          placeholder="Buscar por nombre..."
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
            <tbody key={grupo.key}>
              <tr
                className="barrio-header-row"
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
                        title="Arrastrar para reordenar el barrio"
                      >
                        ⠿
                      </span>
                    )}
                    {grupo.nombre}
                  </div>
                </td>
              </tr>
              {grupo.clientes.map((cliente) => (
                <ClienteRow
                  key={cliente.id}
                  cliente={cliente}
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
                />
              ))}
            </tbody>
          ))}
        </table>
        {grupos.length === 0 && <p className="empty-state">No hay clientes para mostrar.</p>}
      </div>

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
