import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./context/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegistroPage } from "./pages/RegistroPage.jsx";
import { ClientesPage } from "./pages/ClientesPage.jsx";
import { TarifasPage } from "./pages/TarifasPage.jsx";
import { ResumenPage } from "./pages/ResumenPage.jsx";

const ICONOS = {
  clientes: (
    <svg
      className="nav-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3"></circle>
      <circle cx="16" cy="8.5" r="2.5"></circle>
      <path d="M2.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"></path>
      <path d="M14 14.2c2.6 0.3 4.5 2.3 4.5 4.8"></path>
    </svg>
  ),
  resumen: (
    <svg
      className="nav-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2h9l4 4v16H6z"></path>
      <path d="M15 2v4h4"></path>
      <path d="M9 13h6M9 17h6"></path>
    </svg>
  ),
  tarifas: (
    <svg
      className="nav-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="4" width="14" height="17" rx="2"></rect>
      <path d="M9 2.5h6v3H9z"></path>
      <path d="M9 12h6M9 16h4"></path>
    </svg>
  ),
};

const PANTALLAS = {
  clientes: { label: "Clientes", Componente: ClientesPage },
  resumen: { label: "Resumen", Componente: ResumenPage },
  tarifas: { label: "Tarifas", Componente: TarifasPage },
};

function SafariBgFix() {
  return (
    <>
      <div className="safari-bg-fix safari-bg-fix-top" aria-hidden="true"></div>
      <div className="safari-bg-fix safari-bg-fix-bottom" aria-hidden="true"></div>
    </>
  );
}

function App() {
  const { usuario, cargando, logout } = useAuth();
  const [pantalla, setPantalla] = useState("clientes");
  const [vistaAuth, setVistaAuth] = useState("login");

  if (cargando) return null;

  if (!usuario) {
    return (
      <>
        <SafariBgFix />
        <h1>AnimalPiletas</h1>
        <p className="subtitle">Gestión de clientes, tarifas y resumen de cobros</p>

        <AnimatePresence mode="wait">
          {vistaAuth === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <LoginPage onIrARegistro={() => setVistaAuth("registro")} />
            </motion.div>
          ) : (
            <motion.div
              key="registro"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <RegistroPage onIrALogin={() => setVistaAuth("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  const { Componente } = PANTALLAS[pantalla];

  return (
    <>
      <SafariBgFix />
      <div className="page-header">
        <div>
          <h1>AnimalPiletas</h1>
          <p className="subtitle">Gestión de clientes, tarifas y resumen de cobros</p>
        </div>
        <button className="secondary btn-logout" onClick={logout}>
          <span className="btn-logout-full">Cerrar sesión</span>
          <span className="btn-logout-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
        </button>
      </div>

      <nav className="main-nav">
        {Object.entries(PANTALLAS).map(([clave, { label }]) => (
          <motion.button
            key={clave}
            className={pantalla === clave ? "" : "secondary"}
            onClick={() => setPantalla(clave)}
          >
            {pantalla === clave && (
              <motion.span
                layoutId="nav-indicador"
                className="nav-indicador"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {ICONOS[clave]}
            {label}
          </motion.button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={pantalla}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <Componente />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;
