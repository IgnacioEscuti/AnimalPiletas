import { useEffect, useState } from "react";
import { ClienteModal } from "../components/ClienteModal.jsx";
import { ClienteRow } from "../components/ClienteRow.jsx";
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  cancelarCliente,
} from "../services/clienteService.js";
import { getTarifas } from "../services/tarifaService.js";
import { getLimpiezasDeHoy, registrarLimpieza } from "../services/limpiezaService.js";
import { getUsosPastillasDeHoy, registrarUsoPastillas } from "../services/usoPastillasService.js";
import { getUsosExtraDeHoy, registrarUsoExtra } from "../services/usoExtraService.js";
import { semanaActual } from "../utils/fecha.js";

const SEMANA_ACTUAL = semanaActual();

export function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [limpiezas, setLimpiezas] = useState([]);
  const [pastillas, setPastillas] = useState([]);
  const [extras, setExtras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [verTodos, setVerTodos] = useState(false);
  const [clienteEnEdicion, setClienteEnEdicion] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [clientesData, tarifasData, limpiezasData, pastillasData, extrasData] =
        await Promise.all([
          getClientes(),
          getTarifas(),
          getLimpiezasDeHoy(),
          getUsosPastillasDeHoy(),
          getUsosExtraDeHoy(),
        ]);
      setClientes(clientesData);
      setTarifas(tarifasData);
      setLimpiezas(limpiezasData);
      setPastillas(pastillasData);
      setExtras(extrasData);
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

  const handleSemana = async (clienteId, semana) => {
    try {
      await actualizarCliente(clienteId, { semana });
      setClientes(await getClientes());
    } catch {
      setError("No se pudo actualizar la semana.");
    }
  };

  const clientesFiltrados = clientes
    .filter((cliente) => cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(
      (cliente) => verTodos || cliente.semana === "todas" || cliente.semana === SEMANA_ACTUAL
    );

  return (
    <section>
      <div className="page-header">
        <h2>Clientes</h2>
        <button onClick={abrirNuevo}>+ Nuevo cliente</button>
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
              <th>Tarifa</th>
              <th>Semana</th>
              <th>Limpieza</th>
              <th>Pastillas</th>
              <th>Extra</th>
              <th>Empleado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
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
                onSemana={handleSemana}
              />
            ))}
          </tbody>
        </table>
        {clientesFiltrados.length === 0 && (
          <p className="empty-state">No hay clientes para mostrar.</p>
        )}
      </div>

      {modalAbierto && (
        <ClienteModal
          cliente={clienteEnEdicion}
          tarifas={tarifas}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardar}
          onCancelar={handleCancelarCliente}
        />
      )}
    </section>
  );
}
