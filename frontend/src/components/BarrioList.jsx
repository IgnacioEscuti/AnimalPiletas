import { motion } from "framer-motion";

export function BarrioList({ barrios, onEliminar }) {
  return barrios.map((barrio, index) => (
    <motion.li
      className="row row-motion"
      key={barrio.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <span className="row-name">{barrio.nombre}</span>
      <button
        className="danger btn-eliminar-barrio"
        title={`Eliminar ${barrio.nombre}`}
        aria-label={`Eliminar ${barrio.nombre}`}
        onClick={() => onEliminar(barrio)}
      >
        −
      </button>
    </motion.li>
  ));
}
