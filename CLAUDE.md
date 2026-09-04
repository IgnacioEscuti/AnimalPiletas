# Estructura del repo

Monorepo con el **backend en la raíz** (`src/`) y el **frontend en `frontend/`**.

# Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express 5 + MongoDB (Mongoose)

# Frontend

- **Navegación por estado local**: `useState` + el objeto `PANTALLAS` en `App.jsx`. NO se usa React Router — no instalarlo ni proponerlo sin pedido explícito (ver PLAN.md, sección Decisiones evaluadas).
- Context API para estado global (no Redux ni otras librerías)
- Axios para las llamadas a la API
- framer-motion para las animaciones y las transiciones entre pantallas — al tocar `App.jsx` o componentes animados, mantener los `AnimatePresence` / `motion` existentes

# Diseño

- Ver **DESIGN.md** para los tokens del proyecto: paleta, escala tipográfica, radios.
- Usar las variables CSS ya definidas en `frontend/src/index.css` (`--bg`, `--surface`, `--text`, `--accent`, `--radius`, etc.). No inventar colores, tamaños ni radios nuevos: si hace falta uno, proponerlo y agregarlo a DESIGN.md.
- La app está en producción y se usa a diario. Cada función se entrega con el mismo nivel visual que el resto de la app — no "funcional primero, pulido después".

# Arquitectura del backend

Arquitectura en capas, ya implementada en este repo: Model → DAO → Repository → Service → Controller → Routes, más DTOs y middlewares. Antes de crear un módulo nuevo, mirar uno existente (por ejemplo `cliente` o `barrio`) y replicar esa misma estructura y separación de responsabilidades.

# Seguridad

- Nunca devolver `err.message` crudo en una respuesta 500 — mensaje genérico al cliente, detalle al log del servidor.
- Todo endpoint nuevo va detrás de `authenticateActual`. Los que solo puede tocar el admin, además con `autorizarRol("admin")`.
- Nunca loguear ni devolver `passwordHash`, PINs ni el contenido de JWTs.
- Variables de entorno solo a través de `src/config/env.js`, nunca `process.env` directo en el código.

# Comandos

- Backend (raíz): `npm run dev`. No tiene lint, build ni tests.
- Frontend: `cd frontend` → `npm run dev` | `npm run lint` (oxlint) | `npm run build`
- Al terminar una función que toca el frontend, correr `npm run lint` y `npm run build` en `frontend/` y confirmar que pasan antes de darla por terminada.

# Mantener PLAN.md sincronizado

PLAN.md es la fuente de verdad del modelo de datos. La división de trabajo es:

- **Nacho** escribe las funcionalidades nuevas, las reglas de negocio y las decisiones.
- **Claude Code** corrige los desfasajes: si el código quedó distinto de lo que PLAN.md describe, actualiza PLAN.md para que refleje la realidad.

Antes de dar una función por terminada:

1. Comparar los modelos de `src/models/` contra la sección "Modelo de datos" de PLAN.md.
2. Si hay diferencias (campo nuevo, tipo o default cambiado, índice, colección nueva), corregir PLAN.md.
3. Listar al final de la respuesta qué se cambió en PLAN.md y por qué.

Límites de esa corrección:

- Solo se corrigen descripciones de lo que el código **realmente hace**.
- No reescribir, resumir ni reorganizar secciones existentes.
- No borrar decisiones, justificaciones ("por qué...") ni la sección de deuda técnica.
- **Si el código contradice una decisión ya documentada, NO tocar PLAN.md.** Eso probablemente es un bug, no un cambio: avisar y preguntar.

# Workflow

- Devolver en el output solo lo importante, no escribir de más.
- No diseñar pensando en funciones futuras que todavía no se pidieron explícitamente. Resolver solo lo pedido en cada paso.
- Preferir soluciones simples. Si hay una forma más simple de lograr lo mismo, usarla.
- Si algo no queda claro antes de codear una función, preguntar antes de asumir.
- **Nunca hacer `git commit` ni `git push`.** Los commits los hace Nacho siempre, a mano.
- Si una función crea o modifica variables de entorno (backend o frontend), terminar la respuesta con una lista aparte de esas variables (nombre y valor exacto a usar) para cargar manualmente en Render y/o Vercel — el deploy no las toma solas del código.
- Ver **PLAN.md** para el modelo de datos completo del proyecto y el orden de funciones planificado.
