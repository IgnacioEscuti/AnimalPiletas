export function ResumenGrupo({ titulo, children }) {
  return (
    <div className="resumen-grupo">
      <div className="resumen-grupo-header">{titulo}</div>
      <div className="resumen-grupo-body">{children}</div>
    </div>
  );
}
