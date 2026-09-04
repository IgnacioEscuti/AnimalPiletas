# Plan — App de gestión para empresa de piletas

## Contexto del proyecto

App para gestionar clientes de una empresa de mantenimiento de piletas. Se construye de a poco, función por función. Este documento es la referencia completa del modelo de datos para que Claude Code no tenga que re-explicarse en cada prompt. Las reglas generales de workflow (simplicidad, no sobre-diseñar, verificación) viven en CLAUDE.md.

> **Regla de mantenimiento:** la sección "Modelo de datos" describe lo que hay en la base **hoy**. Cuando una función cambia un modelo, se actualiza acá — no solo en la sección de esa función. El historial del porqué puede quedar más abajo.
>
> Las funcionalidades nuevas, las reglas de negocio y las decisiones las escribe Nacho. Claude Code solo corrige los desfasajes entre este documento y el código real, y avisa qué cambió. Si el código contradice una decisión ya documentada acá, eso es un bug a revisar, no un cambio a documentar. Ver la sección "Mantener PLAN.md sincronizado" en CLAUDE.md.

## Modelo de datos

### Cliente
```
nombre: string (requerido)
direccion: string (opcional, default "")
telefono: string (opcional, default "")
tarifaLimpieza: ObjectId → ref tarifaLimpieza (requerido, tarifa asignada por defecto)
semana: "1" | "2" | "todas" | "unaVez" (default "todas")
semanaUnaVezDesde: Date (opcional — solo cuando semana = "unaVez", fecha en la que se marcó)
status: "activo" | "cancelado" (default "activo")
barrio: ObjectId → ref barrio (opcional, default null)
ordenEnBarrio: number (default 0 — posición dentro de su barrio, para el orden manual por arrastre)
encargado: ObjectId → ref usuario (opcional, default null — quién es dueño del cliente; ver Roles)
```
Índice: `{ encargado: 1 }`

**Cliente "una vez" (visita puntual, sin repetir):** para clientes que llaman por una sola visita y no vuelven a necesitar servicio regular. Al elegir "unaVez" en el selector de semana, se guarda la fecha de ese momento en `semanaUnaVezDesde`. El filtro de la pantalla de Cliente muestra a ese cliente solo mientras la fecha de hoy caiga dentro de la misma semana que `semanaUnaVezDesde` — al cruzar a la semana siguiente, desaparece del filtro normal sin que nadie tenga que cancelarlo a mano. Sigue visible con el toggle "Ver todos", por si hay que reactivarlo eligiendo "unaVez" de nuevo (lo que actualiza `semanaUnaVezDesde` a la fecha actual). Editar al cliente por otro motivo mientras ya tiene "unaVez" seleccionado NO debe resetear esa fecha — solo se actualiza cuando se vuelve a elegir esa opción explícitamente. El resumen no se ve afectado: sigue consultando eventos por fecha, sin mirar el campo `semana` del cliente.

**Cancelar un cliente (soft-delete):** desde el modal de editar cliente, un botón para pasar su `status` a "cancelado". No se borra nada de la base — los eventos históricos siguen intactos y los resúmenes de períodos pasados los siguen mostrando igual, porque el resumen consulta esos eventos por fecha, no por el status actual del cliente. Un cliente cancelado desaparece por completo de la pantalla de Cliente — ni el toggle "ver todos" lo muestra.

**Reactivar:** si al crear un cliente nuevo el nombre coincide exactamente (sin importar mayúsculas/espacios) con uno ya cancelado, en vez de crear un duplicado se reactiva ese registro existente (status vuelve a "activo") con los datos nuevos que se cargaron.

### Barrio (catálogo abierto — a diferencia de TarifaLimpieza, se pueden seguir agregando)
```
nombre: string (requerido)
orden: number (requerido, default 0 — posición de la sección en la pantalla de Cliente)
```

**Agregar barrios nuevos:** vive dentro de la pestaña Tarifas ya existente — un campo de texto + botón "Agregar", con la lista de barrios ya creados debajo. Por ahora solo crear y listar, sin editar ni eliminar.

**Agrupar clientes por barrio en la pantalla de Cliente:** en vez de una tabla plana, la lista se organiza en secciones — una por barrio, con su nombre como header (no se repite el nombre del barrio en cada fila). Los clientes sin barrio asignado caen en una sección "Sin barrio" al final.

**Orden por arrastre (drag and drop), directo en la pantalla de Cliente:**
- Arrastrando el header de una sección de barrio, se reordenan las secciones entre sí — actualiza el campo `orden` de los barrios afectados.
- Arrastrando la fila de un cliente, se reordena su posición dentro de su misma sección de barrio — actualiza `ordenEnBarrio`. Arrastrar un cliente a la sección de OTRO barrio no le cambia el barrio asignado — eso se hace únicamente desde el modal de editar cliente.

**Dirección y teléfono en la pantalla de Cliente:** no van como columnas propias — al lado del nombre hay una flechita (chevron) que expande/colapsa una fila debajo mostrando la dirección y el teléfono. Colapsado por defecto.

### TarifaLimpieza (catálogo fijo: bajo / medio / alto)
```
nombre: string (requerido, único — "bajo" | "medio" | "alto")
precio: number (requerido, min 0)
```
Se cargan las 3 una sola vez (`npm run seed:tarifas`). Para cambiar un precio para todos los clientes que usan esa tarifa, se edita un solo documento.

### PrecioPastillas (documento único)
```
precio: number (requerido, min 0)
```
El precio fijo de pastillas que se congela en cada UsoPastillas al momento de la carga. No hay más de un documento. Se siembra con `npm run seed:pastillas` y se edita desde la pestaña Tarifas.

### Usuario
```
email: string (requerido, único, lowercase)
passwordHash: string (requerido, bcrypt del PIN de 4 dígitos, select: false)
nombre: string (opcional)
intentosFallidos: number (default 0)
bloqueadoHasta: Date (opcional — si está en el futuro, la cuenta está bloqueada)
rol: "admin" | "encargado" (default "encargado")
```

### Limpieza (un documento por cliente **por semana**)
```
cliente: ObjectId → ref cliente (requerido)
fecha: Date (requerido — último día en que se marcó)
weekStart: Date (lunes 00:00 de la semana a la que pertenece)
tarifa: ObjectId → ref tarifaLimpieza (requerido, copiada del cliente al crear el evento)
precioUnitarioUsado: number (requerido, precio de esa tarifa congelado en ese momento)
extra: number (default 0, min 0)
realizada: boolean (requerido — tick/cruz; una limpieza no realizada no se cobra ni se cuenta)
empleado: string (opcional, default "") ← ver "Deuda técnica"
```
Índices: `{ cliente: 1, weekStart: 1 }`, `{ fecha: 1 }`

Se guarda por upsert sobre `cliente + weekStart`: marcar de nuevo en la misma semana actualiza el documento existente en vez de crear otro.

### UsoPastillas (un documento por cliente **por semana**)
```
cliente: ObjectId → ref cliente (requerido)
fecha: Date (requerido)
weekStart: Date (lunes 00:00 de la semana a la que pertenece)
cantidad: number (requerido, min 0)
precioUnitarioUsado: number (requerido, precio de pastillas congelado en ese momento)
empleado: string (opcional, default "") ← ver "Deuda técnica"
```
Índices: `{ cliente: 1, weekStart: 1 }`, `{ fecha: 1 }`

### UsoExtra (un documento por cada carga de un extra)
```
cliente: ObjectId → ref cliente (requerido)
fecha: Date (requerido)
nombreExtra: string (requerido, cargado a mano, sin catálogo)
precioUnitario: number (requerido, min 0 — ya representa el total de esa carga)
empleado: string (opcional, default "") ← ver "Deuda técnica"
```
Índice: `{ fecha: 1 }`

A diferencia de Limpieza y UsoPastillas, los extras **no** se consolidan por semana: es una lista real, con un documento por carga y borrado por ítem.

### EmpleadoSemana (un documento por cliente por semana)
```
cliente: ObjectId → ref cliente (requerido)
weekStart: Date (requerido, lunes 00:00)
nombre: string (opcional, default "")
```
Índice: `{ weekStart: 1, cliente: 1 }`

**Esta es la fuente de verdad de quién hizo el trabajo.** En la pantalla de Cliente aparece una sola vez por fila (un cuarto campo, al mismo nivel que Limpieza/Pastillas/Extras) — texto libre, opcional. Se guarda por upsert sobre `cliente + weekStart`. El resumen lee los empleados exclusivamente de acá.

**Por qué se congela el precio de la tarifa en Limpieza:** si más adelante se cambia el precio de una tarifa, los eventos ya cargados no se tienen que ver afectados. El precio histórico queda fijo tal cual era el día que se cargó. Esto no aplica a UsoExtra, que ya se carga a mano cada vez.

## Cómo funciona el filtro de semana en la pantalla de Cliente

Hay clientes que se atienden todas las semanas (`semana: "todas"`) y otros que se dividen en semana 1 o semana 2, alternando semana por medio. No hace falta guardar ninguna fecha de referencia: se usa el número de semana ISO de la fecha de hoy — semana ISO impar = semana 1, semana ISO par = semana 2. Es un cálculo directo a partir del calendario, no algo que se configure a mano.

Por defecto, la pantalla de Cliente muestra solo los clientes de `semana: "todas"` más los que correspondan a la semana actual. Como esto puede dejar fuera de vista a un cliente que no le toca esta semana, hay un toggle "Ver todos" que desactiva el filtro.

El campo `semana` de cada cliente se edita directo desde un selector chico (1 / 2 / todas) en su propia fila — no hace falta abrir el modal de edición.

El resumen no necesita ninguna lógica nueva por esto: sigue sumando los eventos que realmente se cargaron, sin comparar contra el campo `semana` de cada cliente.

## Cómo funciona el resumen (semanal y mensual)

No existe una colección "resumen" — se calcula consultando las colecciones de eventos filtrando por rango de fechas. La función es genérica: recibe un `inicio` y un `fin`, y no le importa si ese rango es una semana o un mes.

- **Semanal:** lunes 00:00 hasta el lunes siguiente (exclusivo) — `rangoSemanal()`
- **Mensual:** 1° del mes hasta el 1° del mes siguiente (exclusivo) — `rangoMensual()`

Limpieza, UsoPastillas y UsoExtra se filtran por `fecha`. EmpleadoSemana se filtra por `weekStart`.

> Las fechas "YYYY-MM-DD" se parsean a mano, nunca con `new Date(str)`: ese formato se interpreta como UTC y corre el día en zonas horarias negativas como Argentina (UTC-3). Vale igual en backend (`src/utils/fecha.utils.js`) y frontend (`frontend/src/utils/fecha.js`).

**Qué devuelve cada fila (por cliente):**
- **Limpieza:** `cantidad` = limpiezas con `realizada: true` en el período · `precio` = suma de `precioUnitarioUsado + extra` · `fechas` = las fechas de esas limpiezas, ordenadas
- **Pastillas:** `cantidad` = suma del campo `cantidad` · `precio` = suma de `cantidad × precioUnitarioUsado`
- **Extras:** lista de `{ nombre, cantidad }` agrupando los UsoExtra por `nombreExtra` · `precio` = suma de `precioUnitario`
- **empleados:** nombres únicos de EmpleadoSemana del período, unidos por coma
- **totalGeneral:** limpieza + pastillas + extras

**Fila de totales al pie** (solo cantidades, sin plata): total de limpiezas, total de pastillas, y extras desglosados por nombre.

**Navegación entre períodos:** el endpoint recibe un tipo (`semanal` o `mensual`) y una fecha de referencia cualquiera dentro del período. A partir de esa fecha calcula el inicio/fin y corre la misma consulta. Un solo endpoint sirve para el período actual y para cualquier período pasado. En el frontend: dos pestañas, flechas anterior/siguiente, texto del período y un `<input type="date">` para saltar a cualquier período.

**Buscador de clientes dentro del resumen:** campo de texto que filtra las filas por nombre, del lado del frontend, sobre los clientes que ya trajo la consulta.

**Período por defecto al entrar:** siempre el período que contiene la fecha de hoy, sin excepción para el día 1° del mes. Se eliminó la regla anterior (que el día 1° mostraba el mes anterior) porque generaba lógica condicional extra y fue la fuente de un bug.

## Login

**Registro:** email + PIN numérico de 4 dígitos, hasheado con bcrypt. El registro queda abierto — cualquiera con la URL puede crear una cuenta (decisión consciente, son solo 2 usuarios reales esperados).

**Login:** email + PIN.
- Si el email no existe, error genérico ("credenciales inválidas") — no revelar si el email existe.
- Si la cuenta está bloqueada (`bloqueadoHasta` en el futuro), rechazar con el tiempo restante.
- Si el PIN no coincide: incrementar `intentosFallidos`. Al llegar a 10 seguidos, `bloqueadoHasta` = 2 minutos en el futuro.
- Si coincide: resetear `intentosFallidos` a 0 y generar sesión.

**Sesión:** cookie httpOnly (secure solo en producción, sameSite lax), duración 8 horas. Todos los endpoints de la app pasan por `authenticateActual`; `/api/usuarios` además requiere `autorizarRol("admin")`.

**"Recordar email" en el dispositivo:** después de un login exitoso el frontend guarda el email en `localStorage`, y la próxima vez solo pide el PIN. Un link "¿No sos vos?" lo borra. Es puramente cosmético — el backend siempre recibe el par completo.

**CORS:** allowlist explícita vía la env var `FRONTEND_URLS` (separada por comas), más `localhost:*` solo fuera de producción.

## Roles

**Los dos roles:**
- **Admin** — 1 solo (el jefe). Ve y modifica todos los clientes, sin restricción.
- **Encargado** — cantidad variable. Ve y modifica solo sus propios clientes, en todas las pantallas.

**Cómo se asigna:** todo usuario que se registra queda como "encargado". Para que el jefe sea admin se cambia el campo `rol` a mano una sola vez directo en MongoDB Atlas — no se construye ninguna pantalla para esto.

**Al crear o editar un cliente:**
- Admin: elige de un desplegable a qué usuario pertenece (incluye al propio admin).
- Encargado: `encargado` se completa automáticamente con su propio usuario, sin mostrarle selector.

**Visibilidad, en TODAS las pantallas:**
- Encargado: solo los clientes donde `encargado` sea él mismo.
- Admin: todos.
- Clientes sin `encargado` asignado: solo los ve el admin, hasta que se los asigne a alguien.

**Agrupado en el Resumen:** siempre por barrio (mismo criterio de "Sin barrio" que la pantalla de Cliente), nunca por encargado. El admin tiene un selector "Todos" + cada usuario, debajo del buscador. El encargado no ve el selector.

## Decisiones evaluadas y descartadas

- **React Router** — descartado. Con 3 pantallas planas, sin rutas anidadas ni detalle por cliente, y usándose como PWA standalone en iPhone (sin barra de direcciones ni botón atrás), no aporta nada que se use. Reevaluar solo si aparece una pantalla de detalle (`/cliente/:id`). Único costo actual: al refrescar se vuelve siempre a "clientes".
- **Google OAuth** — descartado, no se justifica la complejidad para 2 usuarios.

## Deuda técnica conocida

- **Campo `empleado` muerto en los eventos.** Limpieza, UsoPastillas y UsoExtra siguen teniendo un campo `empleado` (string) que el frontend sigue mandando y el backend sigue guardando, pero el resumen lo ignora por completo: lee de EmpleadoSemana. Es escritura doble con lectura única. Limpiarlo implica migración de datos, así que no es urgente.
- **`manifest.json` y `apple-touch-icon` no existen.** La Función 6 los daba por hechos, pero no hay `manifest.json` en `frontend/public/` ni los `<link>` en `index.html`. Los meta tags de PWA sí están (`apple-mobile-web-app-capable`, `theme-color`, status bar), por eso la app funciona instalada.

## Orden de funciones a implementar

1. ✅ CRUD de Cliente (con tarifa de limpieza asignada) — Función 1
2. ✅ Catálogo de TarifaLimpieza: seed de las 3 + endpoint/formulario para editar precio
3. ✅ Pantalla de Cliente: lista con buscador, alta/edición vía modal, marcar limpieza, pastillas y extras — Función 3
4. ✅ Resumen (semanal y mensual, por cliente, con cantidad al lado del precio y totales al pie) — Función 4
5. ✅ Campo semana en Cliente + filtro automático + toggle "ver todos" — Función 5
6. ✅ Responsive (mobile): tarjetas colapsables, meta theme-color y safe-area — Función 6
7. ✅ Login (email + PIN de 4 dígitos, cookie httpOnly de 8hs, bloqueo por intentos) — Función 7
8. ✅ Roles (admin ve/modifica todo, encargado solo sus clientes vía `Cliente.encargado`) — Función 8
9. ✅ Persistencia semanal (Limpieza y Pastillas pasan a un documento por semana; Extra pasa a lista real con borrado por ítem; aparece EmpleadoSemana) — Función 9
10. ✅ Resumen agrupado por barrio con selector de encargado (solo admin) — Función 10
11. ✅ **Endurecimiento de seguridad** — Función 11:
    - El `errorHandler` distingue por la presencia de `err.statusCode`: los errores intencionales (400/403/404/409) siguen devolviendo su propio mensaje al cliente; los que llegan sin `statusCode` (los que `handleMongooseError` re-lanza sin tocar, o cualquier excepción inesperada) responden 500 con `"Ocurrió un error en el servidor"` y el error real va a `console.error` con el método y la URL de la request.
    - Rate limiting por IP con `express-rate-limit`, solo en `POST /api/auth/registro` (5 por hora) y `POST /api/auth/login` (20 cada 15 minutos), definidos en `src/middlewares/rateLimit.middlewares.js`. `/api/auth/actual` queda sin límite a propósito: el frontend lo llama en cada carga de la app para restaurar la sesión. `app.set("trust proxy", 1)` para que el límite use la IP real del cliente y no la del proxy de Render.
    - `src/config/env.js` valida al importarse y corta el arranque con `process.exit(1)` y un mensaje que nombra cuáles faltan. Obligatorias siempre: `MONGO_URI`, `JWT_SECRET`. Obligatoria solo cuando `NODE_ENV === "production"`: `FRONTEND_URLS`.

App deployada y en uso: frontend en Vercel, backend en Render, base en MongoDB Atlas. Instalada como PWA en iPhone. Login y roles activos — todos los endpoints requieren sesión.
