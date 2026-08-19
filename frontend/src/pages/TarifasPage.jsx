import { useEffect, useState } from "react";
import { TarifaList } from "../components/TarifaList.jsx";
import { PrecioPastillasRow } from "../components/PrecioPastillasRow.jsx";
import { BarrioList } from "../components/BarrioList.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import { getTarifas, actualizarTarifa } from "../services/tarifaService.js";
import { getPrecioPastillas, actualizarPrecioPastillas } from "../services/precioPastillasService.js";
import { getBarrios, crearBarrio } from "../services/barrioService.js";

export function TarifasPage() {
  const [tarifas, setTarifas] = useState([]);
  const [precioPastillas, setPrecioPastillas] = useState(null);
  const [barrios, setBarrios] = useState([]);
  const [nombreBarrio, setNombreBarrio] = useState("");
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
      <section className="card-mobile">
        <h2>Tarifas de limpieza</h2>
        {error && <p className="error-message">{error}</p>}
        {cargando ? (
          <Skeleton filas={3} />
        ) : (
          <ul>
            <TarifaList tarifas={tarifas} onActualizar={handleActualizarTarifa} />
            {precioPastillas && (
              <PrecioPastillasRow
                precioPastillas={precioPastillas}
                onActualizar={handleActualizarPastillas}
              />
            )}
          </ul>
        )}
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
            <BarrioList barrios={barrios} />
          </ul>
        )}
        {!cargando && barrios.length === 0 && (
          <p className="empty-state">Todavía no hay barrios cargados.</p>
        )}
      </section>
    </>
  );
}
