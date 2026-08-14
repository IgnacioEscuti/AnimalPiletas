export function BarrioList({ barrios }) {
  return barrios.map((barrio) => (
    <li className="row" key={barrio.id}>
      <span className="row-name">{barrio.nombre}</span>
    </li>
  ));
}
