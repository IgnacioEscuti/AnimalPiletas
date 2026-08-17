import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService.js";
import { setOnUnauthorized } from "../services/api.js";
import { setEmailRecordado } from "../utils/authStorage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setOnUnauthorized(() => setUsuario(null));

    authService
      .obtenerUsuarioActual(controller.signal)
      .then(setUsuario)
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setUsuario(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => {
      controller.abort();
    };
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
