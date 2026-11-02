// Reglas de "Formato de textos" (ver PLAN.md). Todas sacan los espacios de
// los extremos y los repetidos. Un valor vacío (o null/undefined) da "".

function limpiarEspacios(texto) {
  // NFC junta las letras acentuadas en un solo carácter: algunos teclados
  // mandan "e" + "´" por separado y sin esto no se las podría capitalizar.
  return String(texto ?? "")
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ");
}

function primeraEnMayuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Van en minúscula salvo que sean la primera palabra: "Ramón y Cajal", "De Gaetano".
const PALABRAS_EN_MINUSCULA = ["y", "de", "del"];

// Mayúscula en la primera letra, no en el primer carácter: "(mari" -> "(Mari".
// Las partes que empiezan con un número quedan como se escribieron ("5B").
function capitalizarParte(parte) {
  if (/^\d/.test(parte)) return parte;
  return parte.toLowerCase().replace(/\p{L}/u, (letra) => letra.toUpperCase());
}

// "JUAN PÉREZ" -> "Juan Pérez", "ana-maría" -> "Ana-María",
// "juan de la cruz" -> "Juan de La Cruz". Cada palabra (y cada parte
// separada por guion) va con mayúscula inicial.
export function formatearNombre(texto) {
  return limpiarEspacios(texto)
    .split(" ")
    .map((palabra, i) => {
      const enMinuscula = palabra.toLowerCase();
      if (i > 0 && PALABRAS_EN_MINUSCULA.includes(enMinuscula)) return enMinuscula;
      return palabra.replace(/[^-]+/g, capitalizarParte);
    })
    .join(" ");
}

// "CLÓRO LÍQUIDO" -> "Cloro liquido", "PIÑA" -> "Piña". Sin acentos para
// que el mismo extra agrupe siempre bajo el mismo nombre en el resumen.
export function formatearExtra(texto) {
  // NFD separa cada letra de su acento ("ó" -> "o" + "´") y así se puede
  // borrar el acento solo. La ñ también se separa ("n" + "~"): por eso no
  // se borra la marca que sigue a una n, y NFC la vuelve a juntar.
  const sinAcentos = limpiarEspacios(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/(?<!n)[̀-ͯ]/g, "")
    .normalize("NFC");
  return primeraEnMayuscula(sinAcentos);
}

// "PILETA GRANDE" -> "Pileta grande". Respeta los acentos.
export function formatearTarifa(texto) {
  return primeraEnMayuscula(limpiarEspacios(texto));
}
