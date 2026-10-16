import { useEffect, useState } from "react";
import { TarifaList } from "../components/TarifaList.jsx";
import { PrecioPastillasRow } from "../components/PrecioPastillasRow.jsx";
import { BarrioList } from "../components/BarrioList.jsx";
import { TarifaModal } from "../components/TarifaModal.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import {
  getTarifas,
  actualizarTarifa,
  crearTarifa,
  eliminarTarifa,
} from "../services/tarifaService.js";
import { getPrecioPastillas, actualizarPrecioPastillas } from "../services/precioPastillasService.js";
import { getBarrios, crearBarrio, eliminarBarrio } from "../services/barrioService.js";

const mensajeDeError = (err, porDefecto) => err.response?.data?.error || porDefecto;

// Para que un item que no se pudo eliminar vuelva a su lugar.
const insertarEn = (lista, index, item) => [...lista.slice(0, index), item, ...lista.slice(index)];

export function TarifasPage() {
  const [tarifas, setTarifas] = useState([]);
  const [precioPastillas, setPrecioPastillas] = useState(null);
  const [barrios, setBarrios] = useState([]);
  const [nombreBarrio, setNombreBarrio] = useState("");
  const [modalTarifaAbierto, setModalTarifaAbierto] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [tarifasData, precioPastillasData, barriosData] = await Promise.all([
        getTarifas(),
        getPrecioPastillas(),
        getBarrios(),
      ]);
      setTarifas(tarifasData);
      setPrecioPastillas(precioPastillasData);
      setBarrios(barriosData);
    } catch {
      setError("No se pudieron cargar las tarifas.");
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarTarifa = async (id, precio) => {
    const anterior = tarifas.find((t) => t.id === id);
    setError("");
    setTarifas((actuales) => actuales.map((t) => (t.id === id ? { ...t, precio } : t)));
    try {
      const actualizada = await actualizarTarifa(id, precio);
      setTarifas((actuales) => actuales.map((t) => (t.id === id ? { ...t, ...actualizada } : t)));
    } catch (err) {
      setTarifas((actuales) => actuales.map((t) => (t.id === id ? anterior : t)));
      setError(mensajeDeError(err, "No se pudo actualizar la tarifa."));
    }
  };

  const handleCrearTarifa = async (nombre, precio) => {
    const idTemporal = `temp-${Date.now()}`;
    setError("");
    setModalTarifaAbierto(false);
    setTarifas((actuales) => [...actuales, { id: idTemporal, nombre, precio }]);
    try {
      const creada = await crearTarifa(nombre, precio);
      // claveRender mantiene la key de la fila: si cambiara con el id
      // real, React la volvería a montar y repetiría la animación.
      setTarifas((actuales) =>
        actuales.map((t) => (t.id === idTemporal ? { ...creada, claveRender: idTemporal } : t))
      );
    } catch (err) {
      setTarifas((actuales) => actuales.filter((t) => t.id !== idTemporal));
      setError(mensajeDeError(err, "No se pudo crear la tarifa."));
    }
  };

  const handleEliminarTarifa = async (id) => {
    const index = tarifas.findIndex((t) => t.id === id);
    const tarifa = tarifas[index];
    setError("");
    setTarifas((actuales) => actuales.filter((t) => t.id !== id));
    try {
      await eliminarTarifa(id);
    } catch (err) {
      setTarifas((actuales) => insertarEn(actuales, index, tarifa));
      setError(mensajeDeError(err, "No se pudo eliminar la tarifa."));
    }
  };

  const handleEliminarBarrio = async (barrio) => {
    if (!window.confirm(`¿Eliminar el barrio "${barrio.nombre}"?`)) return;
    const index = barrios.findIndex((b) => b.id === barrio.id);
    setError("");
    setBarrios((actuales) => actuales.filter((b) => b.id !== barrio.id));
    try {
      await eliminarBarrio(barrio.id);
    } catch (err) {
      setBarrios((actuales) => insertarEn(actuales, index, barrio));
      setError(mensajeDeError(err, "No se pudo eliminar el barrio."));
    }
  };

  const handleActualizarPastillas = async (precio) => {
    const anterior = precioPastillas;
    setError("");
    setPrecioPastillas({ ...anterior, precio });
    try {
      setPrecioPastillas(await actualizarPrecioPastillas(precio));
    } catch (err) {
      setPrecioPastillas(anterior);
      setError(mensajeDeError(err, "No se pudo actualizar el precio de pastillas."));
    }
  };

  const handleAgregarBarrio = async (event) => {
    event.preventDefault();
    const nombre = nombreBarrio.trim();
    if (!nombre) return;
    const idTemporal = `temp-${Date.now()}`;
    setError("");
    setNombreBarrio("");
    setBarrios((actuales) => [...actuales, { id: idTemporal, nombre, orden: actuales.length }]);
    try {
      const creado = await crearBarrio(nombre);
      setBarrios((actuales) =>
        actuales.map((b) => (b.id === idTemporal ? { ...creado, claveRender: idTemporal } : b))
      );
    } catch (err) {
      setBarrios((actuales) => actuales.filter((b) => b.id !== idTemporal));
      setError(mensajeDeError(err, "No se pudo agregar el barrio."));
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Configuración</h2>
      </div>

      <section className="card-mobile">
        <h2>Tarifas</h2>
        {error && <p className="error-message">{error}</p>}
        {cargando ? (
          <Skeleton filas={3} />
        ) : (
          <ul>
            <TarifaList
              tarifas={tarifas}
              onActualizar={handleActualizarTarifa}
              onEliminar={handleEliminarTarifa}
            />
            {precioPastillas && (
              <PrecioPastillasRow
                precioPastillas={precioPastillas}
                onActualizar={handleActualizarPastillas}
              />
            )}
          </ul>
        )}
        <button className="btn-nueva-tarifa" onClick={() => setModalTarifaAbierto(true)}>
          + Nueva tarifa
        </button>
      </section>

      <section className="card-mobile">
        <h2>Barrios</h2>
        <form onSubmit={handleAgregarBarrio}>
          <input
            type="text"
            placeholder="Nombre del barrio"
            value={nombreBarrio}
            onChange={(event) => setNombreBarrio(event.target.value)}
          />
          <button type="submit">Agregar</button>
        </form>
        {cargando ? (
          <Skeleton filas={2} />
        ) : (
          <ul>
            <BarrioList barrios={barrios} onEliminar={handleEliminarBarrio} />
          </ul>
        )}
        {!cargando && barrios.length === 0 && (
          <p className="empty-state">Todavía no hay barrios cargados.</p>
        )}
      </section>

      {modalTarifaAbierto && (
        <TarifaModal onClose={() => setModalTarifaAbierto(false)} onGuardar={handleCrearTarifa} />
      )}
    </>
  );
}
