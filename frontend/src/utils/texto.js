export function normalizar(texto) {
  return texto
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Devuelve una función que dice si un nombre matchea la búsqueda: cada palabra
// buscada tiene que ser prefijo de alguna palabra del nombre, sin que dos
// palabras buscadas usen la misma palabra del nombre.
export function crearMatcher(busqueda) {
  // De más larga a más corta: si una palabra buscada es prefijo de otra, sus
  // candidatas son un superconjunto, así que asignar primero la más específica
  // evita que la corta se quede con la única palabra que servía para la larga.
  const palabrasBuscadas = normalizar(busqueda)
    .split(" ")
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  // Sin término, palabrasBuscadas queda vacío y every() da true: matchea todo.
  return (nombre) => {
    const disponibles = normalizar(nombre).split(" ");
    return palabrasBuscadas.every((buscada) => {
      const indice = disponibles.findIndex((palabra) => palabra.startsWith(buscada));
      if (indice === -1) return false;
      disponibles.splice(indice, 1);
      return true;
    });
  };
}
