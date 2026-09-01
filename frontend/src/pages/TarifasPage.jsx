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
    try {
      setError("");
      await actualizarTarifa(id, precio);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar la tarifa.");
    }
  };

  const handleCrearTarifa = async (nombre, precio) => {
    setError("");
    await crearTarifa(nombre, precio);
    setModalTarifaAbierto(false);
    await cargarTodo();
  };

  // Devuelve si se pudo borrar, para que la lista sepa si cerrar la edición.
  const handleEliminarTarifa = async (id) => {
    try {
      setError("");
      await eliminarTarifa(id);
      await cargarTodo();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar la tarifa.");
      return false;
    }
  };

  const handleEliminarBarrio = async (barrio) => {
    if (!window.confirm(`¿Eliminar el barrio "${barrio.nombre}"?`)) return;
    try {
      setError("");
      await eliminarBarrio(barrio.id);
      setBarrios(await getBarrios());
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar el barrio.");
    }
  };

  const handleActualizarPastillas = async (precio) => {
    try {
      setError("");
      await actualizarPrecioPastillas(precio);
      await cargarTodo();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el precio de pastillas.");
    }
  };

  const handleAgregarBarrio = async (event) => {
    event.preventDefault();
    if (!nombreBarrio.trim()) return;
    try {
      setError("");
      await crearBarrio(nombreBarrio.trim());
      setNombreBarrio("");
      setBarrios(await getBarrios());
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo agregar el barrio.");
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Tarifas de limpieza</h2>
      </div>

      <section className="card-mobile">
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
