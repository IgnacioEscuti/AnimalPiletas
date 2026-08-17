import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegistroPage } from "./pages/RegistroPage.jsx";
import { ClientesPage } from "./pages/ClientesPage.jsx";
import { TarifasPage } from "./pages/TarifasPage.jsx";
import { ResumenPage } from "./pages/ResumenPage.jsx";

const PANTALLAS = {
  clientes: { label: "Clientes", Componente: ClientesPage },
  resumen: { label: "Resumen", Componente: ResumenPage },
  tarifas: { label: "Tarifas", Componente: TarifasPage },
};

function App() {
  const { usuario, cargando, logout } = useAuth();
  const [pantalla, setPantalla] = useState("clientes");
  const [vistaAuth, setVistaAuth] = useState("login");

  if (cargando) return null;

  if (!usuario) {
    return (
      <>
        <h1>AnimalPiletas</h1>
        <p className="subtitle">Gestión de clientes, tarifas y resumen de cobros</p>

        {vistaAuth === "login" ? (
          <LoginPage onIrARegistro={() => setVistaAuth("registro")} />
        ) : (
          <RegistroPage onIrALogin={() => setVistaAuth("login")} />
        )}
      </>
    );
  }

  const { Componente } = PANTALLAS[pantalla];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>AnimalPiletas</h1>
          <p className="subtitle">Gestión de clientes, tarifas y resumen de cobros</p>
        </div>
        <button className="secondary" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

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
