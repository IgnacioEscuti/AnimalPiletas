import { useState } from "react";
import { ClientesPage } from "./pages/ClientesPage.jsx";
import { TarifasPage } from "./pages/TarifasPage.jsx";
import { ResumenPage } from "./pages/ResumenPage.jsx";

const PANTALLAS = {
  clientes: { label: "Clientes", Componente: ClientesPage },
  resumen: { label: "Resumen", Componente: ResumenPage },
  tarifas: { label: "Tarifas", Componente: TarifasPage },
};

function App() {
  const [pantalla, setPantalla] = useState("clientes");
  const { Componente } = PANTALLAS[pantalla];

  return (
    <>
      <h1>AnimalPiletas</h1>
      <p className="subtitle">Gestión de clientes, tarifas y resumen de cobros</p>

      <nav className="main-nav">
        {Object.entries(PANTALLAS).map(([clave, { label }]) => (
          <button
            key={clave}
            className={pantalla === clave ? "" : "secondary"}
            onClick={() => setPantalla(clave)}
          >
            {label}
          </button>
        ))}
      </nav>

      <Componente />
    </>
  );
}

export default App;
