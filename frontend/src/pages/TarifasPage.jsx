import { useEffect, useState } from "react";
import { TarifaList } from "../components/TarifaList.jsx";
import { PrecioPastillasRow } from "../components/PrecioPastillasRow.jsx";
import { getTarifas, actualizarTarifa } from "../services/tarifaService.js";
import { getPrecioPastillas, actualizarPrecioPastillas } from "../services/precioPastillasService.js";

export function TarifasPage() {
  const [tarifas, setTarifas] = useState([]);
  const [precioPastillas, setPrecioPastillas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [tarifasData, precioPastillasData] = await Promise.all([
        getTarifas(),
        getPrecioPastillas(),
      ]);
      setTarifas(tarifasData);
      setPrecioPastillas(precioPastillasData);
    } catch {
      setError("No se pudieron cargar las tarifas.");
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

  return (
    <section>
      <h2>Tarifas de limpieza</h2>
      {error && <p className="error-message">{error}</p>}
      <ul>
        <TarifaList tarifas={tarifas} onActualizar={handleActualizarTarifa} />
        {precioPastillas && (
          <PrecioPastillasRow
            precioPastillas={precioPastillas}
            onActualizar={handleActualizarPastillas}
          />
        )}
      </ul>
    </section>
  );
}
