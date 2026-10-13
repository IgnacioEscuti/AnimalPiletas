import { useState, useEffect, useRef } from "react";

export function ClienteModal({
  cliente,
  tarifas,
  barrios,
  usuarios,
  esAdmin,
  borrador,
  error,
  onClose,
  onGuardar,
  onCancelar,
}) {
  // Si el guardado falló, el modal se reabre con lo que se había escrito.
  const inicial = borrador ?? {
    nombre: cliente?.nombre ?? "",
    direccion: cliente?.direccion ?? "",
    telefono: cliente?.telefono ?? "",
    tarifaLimpieza: cliente?.tarifaLimpieza?.id ?? "",
    semana: cliente?.semana ?? "1",
    barrio: cliente?.barrio?.id ?? "",
    encargado: cliente?.encargado?.id ?? "",
  };
  const [nombre, setNombre] = useState(inicial.nombre);
  const [direccion, setDireccion] = useState(inicial.direccion);
  const [telefono, setTelefono] = useState(inicial.telefono);
  const [tarifaLimpieza, setTarifaLimpieza] = useState(inicial.tarifaLimpieza);
  const [semana, setSemana] = useState(inicial.semana);
  const [barrio, setBarrio] = useState(inicial.barrio ?? "");
  const [encargado, setEncargado] = useState(inicial.encargado ?? "");
  const modalRef = useRef(null);
  const dragRef = useRef({ startY: 0, arrastrando: false });

  // Si el modal se abre para crear un cliente antes de que las tarifas
  // terminen de cargar (tarifas=[] al montar), no hay nada que
  // preseleccionar todavía — este efecto completa el valor apenas
  // llegan, en vez de quedar con "" para siempre (el bug: useState solo
  // lee su valor inicial una vez, en el montaje).
  useEffect(() => {
    if (!tarifaLimpieza && tarifas.length > 0) {
      setTarifaLimpieza(tarifas[0].id);
    }
  }, [tarifas, tarifaLimpieza]);

  useEffect(() => {
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
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const datos = { nombre, direccion, telefono, tarifaLimpieza, semana, barrio: barrio || null };
    if (esAdmin) {
      datos.encargado = encargado || null;
    }
    onGuardar(datos);
  };

  const handleHandleDown = (event) => {
    dragRef.current = { startY: event.clientY, arrastrando: true };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (modalRef.current) {
      modalRef.current.style.transition = "none";
    }
  };

  const handleHandleMove = (event) => {
    if (!dragRef.current.arrastrando || !modalRef.current) return;
    const deltaY = Math.max(0, event.clientY - dragRef.current.startY);
    modalRef.current.style.transform = `translateY(${deltaY}px)`;
  };

  const handleHandleUp = (event) => {
    if (!dragRef.current.arrastrando) return;
    const deltaY = Math.max(0, event.clientY - dragRef.current.startY);
    dragRef.current.arrastrando = false;
    if (deltaY > 100) {
      onClose();
      return;
    }
    if (modalRef.current) {
      modalRef.current.style.transition = "transform 0.2s ease";
      modalRef.current.style.transform = "translateY(0)";
    }
  };

  const handleCancelarCliente = () => {
    const confirmado = window.confirm(
      `¿Cancelar a ${cliente.nombre}? Va a dejar de aparecer en la lista.`
    );
    if (confirmado) onCancelar(cliente.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={modalRef} onClick={(event) => event.stopPropagation()}>
        <div
          className="modal-handle-area"
          onPointerDown={handleHandleDown}
          onPointerMove={handleHandleMove}
          onPointerUp={handleHandleUp}
        >
          <div className="modal-handle" />
        </div>
        <h2>{cliente ? "Editar cliente" : "Nuevo cliente"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Dirección (opcional)"
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
          />
          <select
            value={tarifaLimpieza}
            onChange={(event) => setTarifaLimpieza(event.target.value)}
            required
          >
            {tarifas.map((tarifa) => (
              <option key={tarifa.id} value={tarifa.id}>
                {tarifa.nombre} (${tarifa.precio})
              </option>
            ))}
          </select>
          <select value={semana} onChange={(event) => setSemana(event.target.value)} required>
            <option value="1">Semana 1</option>
            <option value="2">Semana 2</option>
            <option value="todas">Todas las semanas</option>
            <option value="unaVez">Una vez</option>
          </select>
          <select value={barrio} onChange={(event) => setBarrio(event.target.value)}>
            <option value="">Sin barrio</option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
          {esAdmin && (
            <select
              value={encargado}
              onChange={(event) => setEncargado(event.target.value)}
              required
            >
              <option value="" disabled>
                Elegir encargado
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre || u.email}
                  {u.rol === "admin" ? " (admin)" : ""}
                </option>
              ))}
            </select>
          )}
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Guardar
            </button>
          </div>
        </form>
        {cliente && (
          <button
            type="button"
            className="danger modal-cancelar-cliente"
            onClick={handleCancelarCliente}
          >
            Cancelar cliente
          </button>
        )}
      </div>
    </div>
  );
}
