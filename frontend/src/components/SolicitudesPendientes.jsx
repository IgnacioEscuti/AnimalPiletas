import { useEffect, useState } from "react";
import {
  getPendientes,
  aprobarPendiente,
  rechazarPendiente,
} from "../services/usuarioService.js";

export function SolicitudesPendientes({ onCerrar }) {
  const [pendientes, setPendientes] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState("");

  // Se pide una sola vez, al abrir la app. Si falla (red caída o sesión
  // vencida) el pop-up simplemente no aparece: no es una pantalla crítica y
  // del 401 ya se encarga el interceptor de api.js.
  useEffect(() => {
    getPendientes()
      .then(setPendientes)
      .catch(() => setPendientes([]));
  }, []);

  const solicitud = pendientes[0];
  const restantes = pendientes.length - 1;
  const hayCola = Boolean(solicitud);

  // Mismo bloqueo de scroll del body que los otros modales, pero atado a que
  // haya cola: mientras se cargan los pendientes este componente no muestra
  // nada, así que no tiene por qué congelar la página detrás.
  useEffect(() => {
    if (!hayCola) return;

    const scrollY = window.scrollY;
    const { overflow, position, width, top } = document.body.style;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.width = width;
      document.body.style.top = top;
      window.scrollTo(0, scrollY);
    };
  }, [hayCola]);

  if (!solicitud) return null;

  const resolver = async (accion) => {
    setProcesando(true);
    setAviso("");
    try {
      await accion(solicitud.id);
    } catch (error) {
      // 409: otro admin ya resolvió esta solicitud. Se avisa y se pasa a la
      // siguiente igual, porque este pendiente ya no existe.
      setAviso(
        error.response?.data?.error || "No se pudo resolver la solicitud. Probá de nuevo."
      );
      if (error.response?.status !== 409) {
        setProcesando(false);
        return;
      }
    }
    setPendientes((actuales) => actuales.slice(1));
    setProcesando(false);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal modal-solicitud" onClick={(event) => event.stopPropagation()}>
        <p className="solicitud-label">Solicitud de registro</p>
        <h2 className="solicitud-email">{solicitud.email}</h2>
        <p className="empty-state">
          Quiere registrarse. Si la aceptás, entra como encargado y solo ve los clientes
          que le asignes.
        </p>

        {aviso && <p className="error-message solicitud-aviso">{aviso}</p>}
        {restantes > 0 && (
          <p className="empty-state">
            {restantes === 1 ? "Queda 1 solicitud más." : `Quedan ${restantes} solicitudes más.`}
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="solicitud-rechazar"
            disabled={procesando}
            onClick={() => resolver(rechazarPendiente)}
          >
            Rechazar
          </button>
          <button type="button" disabled={procesando} onClick={() => resolver(aprobarPendiente)}>
            Aceptar
          </button>
        </div>

        <button type="button" className="solicitud-despues" onClick={onCerrar}>
          Después
        </button>
      </div>
    </div>
  );
}
