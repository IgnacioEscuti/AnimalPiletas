export function listaExtras(extras) {
  if (extras.length === 0) return "—";
  return extras.map(({ nombre, cantidad }) => `${nombre} x${cantidad}`).join(", ");
}
