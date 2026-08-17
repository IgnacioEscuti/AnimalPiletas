import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService.js";
import { setOnUnauthorized } from "../services/api.js";
import { setEmailRecordado } from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => setUsuario(null));

    authService
      .obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const login = async (email, pin) => {
    const usuarioLogueado = await authService.login(email, pin);
    setEmailRecordado(email);
    setUsuario(usuarioLogueado);
  };

  const registrar = async (email, pin) => {
    await authService.registrar(email, pin);
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
