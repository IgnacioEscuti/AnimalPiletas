import { fechaISO, inicioDeSemana } from "./fecha.js";

const DEBOUNCE_MS = 500;
const ESPERAS_REINTENTO_MS = [2000, 4000, 8000];
const DURACION_GUARDADO_MS = 1500;

// localStorage puede fallar (modo privado, cuota llena, bloqueado): en ese
// caso el guardador sigue andando, solo se pierde la anotación.
function leerNota(clave) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? undefined : JSON.parse(texto);
  } catch {
    return undefined;
  }
}

function escribirNota(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // sin localStorage disponible
  }
}

function borrarNota(clave) {
  try {
    localStorage.removeItem(clave);
  } catch {
    // sin localStorage disponible
  }
}

function clavesConPrefijo(prefijo) {
  try {
    return Object.keys(localStorage).filter((clave) => clave.startsWith(prefijo));
  } catch {
    return [];
  }
}

const mismoValor = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const semanaActualISO = () => fechaISO(inicioDeSemana());

// Guarda un valor absoluto por id (ej. por cliente) con un solo pedido en
// vuelo a la vez, debounce, reintentos y anotación en localStorage. Ver la
// sección "Guardador" de PLAN.md.
export function crearGuardador({ nombre, usuarioId, enviar }) {
  const prefijo = `guardador:${nombre}:${usuarioId}:`;
  const claveNota = (id) => `${prefijo}${semanaActualISO()}:${id}`;
  const entradas = new Map();
  const suscriptores = new Set();
  let estados = {};

  const setEstado = (id, estado) => {
    if (estados[id] === estado) return;
    estados = { ...estados };
    if (estado) estados[id] = estado;
    else delete estados[id];
    suscriptores.forEach((avisar) => avisar());
  };

  const obtenerEntrada = (id) => {
    if (!entradas.has(id)) {
      entradas.set(id, { pendiente: undefined, enVuelo: undefined, timer: null, intentos: 0 });
    }
    return entradas.get(id);
  };

  const programar = (id, espera) => {
    const entrada = obtenerEntrada(id);
    clearTimeout(entrada.timer);
    entrada.timer = setTimeout(() => {
      entrada.timer = null;
      enviarAhora(id);
    }, espera);
  };

  // Si hay un pedido en vuelo no se manda nada: el pendiente sale cuando
  // vuelva la respuesta.
  const enviarAhora = (id) => {
    const entrada = obtenerEntrada(id);
    clearTimeout(entrada.timer);
    entrada.timer = null;
    if (entrada.enVuelo !== undefined || entrada.pendiente === undefined) return;

    const valor = entrada.pendiente;
    entrada.pendiente = undefined;
    entrada.enVuelo = valor;
    enviar(id, valor).then(
      () => alConfirmar(id, valor),
      () => alFallar(id, valor)
    );
  };

  const alConfirmar = (id, valor) => {
    const entrada = obtenerEntrada(id);
    entrada.enVuelo = undefined;
    entrada.intentos = 0;

    if (entrada.pendiente !== undefined) {
      if (!entrada.timer) enviarAhora(id);
      return;
    }

    const clave = claveNota(id);
    if (mismoValor(leerNota(clave), valor)) borrarNota(clave);
    setEstado(id, "guardado");
    setTimeout(() => {
      if (estados[id] === "guardado") setEstado(id, null);
    }, DURACION_GUARDADO_MS);
  };

  const alFallar = (id, valor) => {
    const entrada = obtenerEntrada(id);
    entrada.enVuelo = undefined;

    // Mientras tanto llegó un valor más nuevo: ese reemplaza al que falló.
    if (entrada.pendiente !== undefined) {
      entrada.intentos = 0;
      if (!entrada.timer) enviarAhora(id);
      return;
    }

    entrada.pendiente = valor;
    if (entrada.intentos < ESPERAS_REINTENTO_MS.length) {
      programar(id, ESPERAS_REINTENTO_MS[entrada.intentos]);
      entrada.intentos += 1;
    } else {
      setEstado(id, "error");
    }
  };

  const guardar = (id, valor) => {
    const entrada = obtenerEntrada(id);
    entrada.pendiente = valor;
    entrada.intentos = 0;
    escribirNota(claveNota(id), valor);
    setEstado(id, "pendiente");
    programar(id, DEBOUNCE_MS);
  };

  const reintentar = (id) => {
    const entrada = obtenerEntrada(id);
    if (entrada.pendiente === undefined) return;
    entrada.intentos = 0;
    setEstado(id, "pendiente");
    enviarAhora(id);
  };

  const reintentarTodos = () => entradas.forEach((_, id) => reintentar(id));

  // Devuelve { id: valor } con todo lo que todavía no confirmó el servidor,
  // para pisar lo que vino de la base. Las notas de esta semana que no están
  // en memoria (app recién abierta) se vuelven a mandar; las de otra semana
  // se descartan.
  const restaurar = () => {
    const semana = semanaActualISO();
    const valores = {};

    clavesConPrefijo(prefijo).forEach((clave) => {
      const [semanaNota, id] = clave.slice(prefijo.length).split(":");
      if (semanaNota !== semana) {
        borrarNota(clave);
        return;
      }
      const valor = leerNota(clave);
      if (valor === undefined) return;
      const entrada = entradas.get(id);
      if (!entrada || (entrada.pendiente === undefined && entrada.enVuelo === undefined)) {
        guardar(id, valor);
      }
    });

    entradas.forEach((entrada, id) => {
      const sinConfirmar = entrada.pendiente ?? entrada.enVuelo;
      if (sinConfirmar !== undefined) valores[id] = sinConfirmar;
    });
    return valores;
  };

  // Al irse a segundo plano se manda ya lo pendiente; al volver, o al
  // recuperar la red, se reenvía lo que haya quedado sin confirmar.
  document.addEventListener("visibilitychange", reintentarTodos);
  window.addEventListener("online", reintentarTodos);

  return {
    guardar,
    reintentar,
    restaurar,
    getEstados: () => estados,
    suscribir: (avisar) => {
      suscriptores.add(avisar);
      return () => suscriptores.delete(avisar);
    },
  };
}
