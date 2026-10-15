// Un barrio del Resumen: su nombre como título suelto y, abajo, sus clientes.
export function ResumenGrupo({ titulo, children }) {
  return (
    <div className="resumen-grupo">
      <h3 className="resumen-grupo-titulo">{titulo}</h3>
      {children}
    </div>
  );
}
