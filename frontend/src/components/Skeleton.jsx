import { motion } from "framer-motion";

export function Skeleton({ filas = 4, className = "" }) {
  return (
    <div className={`skeleton-grupo ${className}`}>
      {Array.from({ length: filas }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-fila"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.08 }}
        />
      ))}
    </div>
  );
}
