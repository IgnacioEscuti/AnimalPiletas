# Plan — App de gestión para empresa de piletas

## Contexto del proyecto

App para gestionar clientes de una empresa de mantenimiento de piletas. Se construye de a poco, función por función. Este documento es la referencia completa del modelo de datos para que Claude Code no tenga que re-explicarse en cada prompt. Las reglas generales de workflow (simplicidad, no sobre-diseñar, verificación) viven en CLAUDE.md.

## Modelo de datos

### Cliente
```
nombre: string
direccion: string (opcional)
telefono: string (opcional)
tarifaLimpieza: ObjectId → ref TarifaLimpieza (tarifa asignada por defecto)
semana: "1" | "2" | "todas" | "unaVez" (con qué frecuencia se atiende)
semanaUnaVezDesde: Date (opcional — solo se usa cuando semana = "unaVez", fecha en la que se marcó)
status: "activo" | "cancelado" (default "activo")
barrio: ObjectId → ref Barrio (opcional)
ordenEnBarrio: number (posición dentro de su barrio, para el orden manual por arrastre)
```

**Cliente "una vez" (visita puntual, sin repetir):** para clientes que llaman por una sola visita y no vuelven a necesitar servicio regular. Al elegir "unaVez" en el selector de semana, se guarda la fecha de ese momento en `semanaUnaVezDesde`. El filtro de la pantalla de Cliente muestra a ese cliente solo mientras la fecha de hoy caiga dentro de la misma semana que `semanaUnaVezDesde` (mismo cálculo de semana ISO que ya se usa para 1/2) — al cruzar a la semana siguiente, desaparece del filtro normal sin que nadie tenga que cancelarlo a mano. Sigue visible con el toggle "Ver todos", por si hay que reactivarlo eligiendo "unaVez" de nuevo (lo que actualiza `semanaUnaVezDesde` a la fecha actual). Editar al cliente por otro motivo mientras ya tiene "unaVez" seleccionado NO debe resetear esa fecha — solo se actualiza cuando se vuelve a elegir esa opción explícitamente. El resumen no se ve afectado: sigue consultando eventos por fecha, sin mirar el campo `semana` del cliente.

### Barrio (catálogo abierto — a diferencia de TarifaLimpieza, se pueden seguir agregando con el tiempo)
```
nombre: string
orden: number (posición de la sección en la pantalla de Cliente, se cambia arrastrando ahí mismo)
```

**Agregar barrios nuevos:** vive dentro de la pestaña Tarifas ya existente — un campo de texto + botón "Agregar", con la lista de barrios ya creados debajo. Por ahora solo crear y listar, sin editar ni eliminar.

**Agrupar clientes por barrio en la pantalla de Cliente:** en vez de una tabla plana, la lista se organiza en secciones — una por barrio, con su nombre como header (no se repite el nombre del barrio en cada fila de cliente, solo aparece una vez arriba de su sección). Los clientes sin barrio asignado caen en una sección "Sin barrio" al final. Las secciones no son colapsables — siempre se ven todas expandidas.

**Orden por arrastre (drag and drop), directo en la pantalla de Cliente:**
- Arrastrando el header de una sección de barrio, se reordenan las secciones entre sí — actualiza el campo `orden` de los barrios afectados.
- Arrastrando la fila de un cliente, se reordena su posición dentro de su misma sección de barrio — actualiza `ordenEnBarrio`. Arrastrar un cliente a la sección de OTRO barrio no le cambia el barrio asignado — cambiar de barrio se sigue haciendo únicamente desde el modal de editar cliente.

**Dirección y teléfono en la pantalla de Cliente:** no van como columnas propias en la tabla — al lado del nombre hay una flechita (chevron) que expande/colapsa una fila debajo mostrando la dirección y el teléfono de ese cliente. Colapsado por defecto, para no ensanchar más la tabla.

**Cancelar un cliente (soft-delete):** desde el modal de editar cliente, un botón para pasar su `status` a "cancelado". No se borra nada de la base — los eventos históricos (Limpieza, UsoPastillas, UsoExtra) siguen intactos y los resúmenes de períodos pasados los siguen mostrando igual, porque el resumen consulta esos eventos por fecha, no por el status actual del cliente. Un cliente cancelado desaparece por completo de la pantalla de Cliente — ni el toggle "ver todos" lo muestra, no hace falta ninguna pantalla nueva para "ver cancelados".

**Reactivar:** si al crear un cliente nuevo el nombre coincide exactamente (sin importar mayúsculas/espacios) con uno ya cancelado, en vez de crear un duplicado se reactiva ese registro existente (status vuelve a "activo") con los datos nuevos que se cargaron.

### TarifaLimpieza (catálogo fijo: bajo / medio / alto)
```
nombre: string ("bajo" | "medio" | "alto")
precio: number
```
Se cargan las 3 una sola vez. Para cambiar un precio para todos los clientes que usan esa tarifa, se edita un solo documento.

### Limpieza (un documento por cada limpieza realizada)
```
cliente: ObjectId → ref Cliente
fecha: Date
tarifa: ObjectId → ref TarifaLimpieza (copiada de la tarifa del cliente al momento de crear el evento)
precioUnitarioUsado: number (precio de esa tarifa, congelado en ese momento)
extra: number (opcional, default 0)
empleado: string (opcional, nombre de quién hizo el trabajo — puede quedar en blanco)
```

### UsoPastillas (un documento por cada carga de pastillas)
```
cliente: ObjectId → ref Cliente
fecha: Date
cantidad: number
precioUnitarioUsado: number (precio fijo de pastillas, congelado en ese momento)
empleado: string (opcional, nombre de quién hizo el trabajo — puede quedar en blanco)
```

### UsoExtra (un documento por cada carga de un extra — antes llamado "Producto")
```
cliente: ObjectId → ref Cliente
fecha: Date
nombreExtra: string (cargado a mano, sin catálogo)
precioUnitario: number (cargado a mano en el momento, ya representa el total de esa carga)
empleado: string (opcional, nombre de quién hizo el trabajo — puede quedar en blanco)
```

**El campo `empleado`:** en la pantalla de Cliente aparece una sola vez por fila (un cuarto campo, al mismo nivel que Limpieza/Pastillas/Extras) — un texto libre, opcional. Al guardar, ese mismo valor se copia a todos los eventos que se generen ese día para ese cliente (Limpieza, UsoPastillas, UsoExtra), sin importar si quedó vacío.

**Por qué se congela el precio de la tarifa en Limpieza:** si más adelante se cambia el precio de una tarifa, los eventos ya cargados no se tienen que ver afectados. El precio histórico queda fijo tal cual era el día que se cargó. Esto no aplica a Extra, que ya se carga a mano cada vez.

## Cómo funciona el filtro de semana en la pantalla de Cliente

Hay clientes que se atienden todas las semanas (`semana: "todas"`) y otros que se dividen en semana 1 o semana 2, alternando semana por medio. No hace falta guardar ninguna fecha de referencia: se usa el número de semana ISO de la fecha de hoy — semana ISO impar = semana 1, semana ISO par = semana 2. Es un cálculo directo a partir del calendario, no algo que se configure a mano.

Por defecto, la pantalla de Cliente muestra solo los clientes de `semana: "todas"` más los que correspondan a la semana actual (1 o 2, según el cálculo de arriba). Como esto puede dejar fuera de vista a un cliente que no le toca esta semana (por ejemplo, para editarlo o cargarlo por primera vez), hay un toggle "Ver todos" que desactiva el filtro y muestra la lista completa sin importar la semana.

El campo `semana` de cada cliente se edita directo desde un selector chico (1 / 2 / todas) en su propia fila — no hace falta abrir el modal de edición para cambiarlo. Si un cliente pasa de semana 1 a semana 2, se cambia ahí mismo y el filtro lo usa a partir de ese momento.

El resumen (semanal y mensual) no necesita ninguna lógica nueva por esto: sigue sumando los eventos que realmente se cargaron, sin comparar contra el campo `semana` de cada cliente. Si algún cliente fue atendido fuera de su semana (usando el toggle "ver todos"), ese trabajo real se refleja igual en el resumen.

## Cómo funciona el resumen (semanal y mensual)

No existe una colección "resumen" que se cree a mano — se calcula consultando las 3 colecciones de eventos (Limpieza, UsoPastillas, UsoExtra) filtrando por rango de fechas. La función es genérica: recibe un `inicio` y un `fin`, y no le importa si ese rango es una semana o un mes.

```js
// Mensual: 1° del mes hasta 1° del mes siguiente
const inicio = new Date(anio, mes - 1, 1);
const fin = new Date(anio, mes, 1);

// Semanal: lunes de esa semana hasta el lunes siguiente
// (mismo cálculo de inicio/fin, solo cambia cómo se arma la fecha)

// Limpieza.find({ fecha: { $gte: inicio, $lt: fin } })
// UsoPastillas.find({ fecha: { $gte: inicio, $lt: fin } })
// UsoExtra.find({ fecha: { $gte: inicio, $lt: fin } })
```

Agrupando por cliente y sumando los totales de cada colección se arma el total por cliente en ese período. La misma función sirve para el resumen semanal, el mensual, un período ya cerrado, o uno en curso — no hace falta lógica distinta para cada caso, solo el rango de fechas cambia.

**Qué muestra cada fila (por cliente):** para cada una de las 3 categorías se muestra la cantidad al lado del precio:
- **Limpieza:** cantidad = cuántas limpiezas con `realizada: true` hubo en el período (cada una suma 1) · precio = suma de `precioUnitarioUsado + extra` de esos eventos
- **Pastillas:** cantidad = suma del campo `cantidad` de todos los eventos UsoPastillas del período · precio = suma de `cantidad × precioUnitarioUsado`
- **Extras:** en vez de un solo número, se lista el nombre de cada extra cargado con cuántas veces apareció (ej: "Cloro x2, Algicida x1") — agrupando los eventos UsoExtra del cliente por `nombreExtra` · precio = suma de `precioUnitario` de todos esos eventos

**Fila de totales al pie de toda la lista** (solo cantidades, sin plata):
- Total limpiezas: suma de limpiezas realizadas de todos los clientes (cada una suma 1)
- Total pastillas: suma de las cantidades de pastillas de todos los clientes
- Total extras: igual que en la fila de cliente pero agregando entre todos — desglosado por nombre de extra (ej: "Cloro: 15, Algicida: 8"), sumando las apariciones de cada nombre en todos los clientes del período

**Navegación entre períodos:** el endpoint recibe un tipo (`semanal` o `mensual`) y una fecha de referencia cualquiera dentro del período a mostrar. A partir de esa fecha calcula el inicio/fin (lunes-a-lunes o 1°-a-1°) y corre la misma consulta. Navegar hacia atrás o adelante es mandar una fecha de referencia distinta — un solo endpoint sirve para el período actual y para cualquier período pasado. En el frontend: dos pestañas (Semanal / Mensual), flechas anterior/siguiente, un texto que muestra qué período se está viendo, y un selector de fecha nativo (`<input type="date">`) para saltar directo a cualquier período de cualquier año sin tener que ir clickeando flecha por flecha — al elegir una fecha, se manda como fecha de referencia y se recalcula el período que la contiene.

**Buscador de clientes dentro del resumen:** igual que en la pantalla de Cliente, un campo de texto arriba de la tabla que filtra las filas por nombre — del lado del frontend, sobre los clientes que ya trajo la consulta del período (no hace falta pedirle nada nuevo al backend).

**Período por defecto al entrar:** tanto semanal como mensual arrancan siempre mostrando el período que contiene la fecha de hoy (la semana en curso, o el mes en curso) — sin ninguna excepción para el día 1° del mes. Se eliminó la regla anterior (que el día 1° mostraba el mes anterior por defecto) porque generaba una lógica condicional extra y terminó siendo la fuente de un bug. Si al 1° del mes hace falta ver el mes que se acaba de cerrar, se navega con la flecha "anterior" o el selector de fecha — un solo click.

## Login (Función 7) y Roles (Función 8)

### Usuario
```
email: string (único, requerido)
passwordHash: string (bcrypt, hash del PIN de 4 dígitos)
nombre: string (opcional)
intentosFallidos: number (default 0)
bloqueadoHasta: Date (opcional — si está en el futuro, la cuenta está bloqueada)
rol: "admin" | "encargado" (default "encargado")
```

**Registro:** email + PIN numérico de 4 dígitos. El PIN se hashea con bcrypt antes de guardar, nunca se guarda en texto plano. El registro queda abierto — cualquiera con la URL puede crear una cuenta (decisión consciente, dado que el repo ya es privado y son solo 2 usuarios reales esperados).

**Login:** email + PIN.
- Si el email no existe, error genérico ("credenciales inválidas") — no revelar si el email existe o no.
- Si la cuenta está bloqueada (`bloqueadoHasta` en el futuro), rechazar con el tiempo restante.
- Si el PIN no coincide: incrementar `intentosFallidos`. Al llegar a 10 fallidos seguidos, setear `bloqueadoHasta` a 2 minutos en el futuro.
- Si el PIN coincide: resetear `intentosFallidos` a 0, generar sesión.

**Sesión:** cookie httpOnly (secure solo en producción, sameSite lax — mismo patrón que ya usa Gestión de Eventos), duración 8 horas. Todos los endpoints existentes de la app (clientes, limpiezas, resumen, etc.) pasan a requerir esta cookie válida — un middleware de autenticación se aplica a todas las rutas actuales.

**"Recordar email" en el dispositivo:** después de un login exitoso, el frontend guarda el email en `localStorage`. La próxima vez que se abre la app en ese mismo dispositivo, si hay un email guardado, la pantalla de login solo pide el PIN (mostrando el email guardado como texto). Un link "¿No sos vos?" borra el email guardado y vuelve a pedir los dos campos. Esto es puramente cosmético del lado del frontend — el login real en el backend siempre recibe el par completo (email + PIN).

**Sin Google OAuth** — se evaluó y se descartó, no se justifica la complejidad (Google Cloud Console, callbacks, etc.) para 2 usuarios.

**Arquitectura:** reusar el mismo patrón de Passport.js que ya está probado en Gestión de Eventos (estrategias register/login/current), agregando lo específico de PIN+bcrypt+bloqueo por intentos en vez de reinventar el mecanismo de sesión.

## Roles (Función 8)

**Los dos roles:**
- **Admin** — 1 solo (el jefe). Ve y modifica todos los clientes de todas las pantallas, sin restricción.
- **Encargado** — cantidad variable. Ve y modifica solo sus propios clientes, en todas las pantallas (Cliente, Resumen, copiado de WhatsApp — el mismo filtro se aplica en todos lados).

**Cómo se asigna el rol:** todo usuario que se registra queda como "encargado" automáticamente — no hay forma de auto-asignarse admin desde la app. Para que el jefe sea admin, se cambia el campo `rol` a mano una sola vez directo en MongoDB Atlas — no se construye ninguna pantalla para esto, es un cambio que prácticamente no se repite.

**Cliente gana un campo nuevo, independiente de `barrio`:**
```
encargado: ObjectId → ref Usuario (opcional)
```
Completamente separado de `barrio` (que sigue siendo solo agrupación visual) — un cambio de barrio nunca afecta quién puede ver o tocar un cliente.

**Al crear o editar un cliente:**
- Admin: elige de un desplegable a qué usuario pertenece ese cliente — el desplegable incluye tanto a los encargados como al propio admin (para poder asignarse clientes a sí mismo).
- Encargado: el campo `encargado` se completa automáticamente con su propio usuario, sin mostrarle ningún selector — no tiene forma de elegir ni cambiar a otro usuario, ni por error ni a propósito.

**Visibilidad, aplicada en TODAS las pantallas (Cliente, Resumen, y lo que se copia para WhatsApp):**
- Encargado: solo ve y puede modificar los clientes donde `encargado` sea él mismo.
- Admin: ve y modifica todos, sin filtrar por este campo.
- Clientes sin `encargado` asignado (por ejemplo, los que ya existen en la base de antes de esta función): solo los ve el admin, hasta que se los asigne a alguien.

## Orden de funciones a implementar

1. ✅ CRUD de Cliente (con tarifa de limpieza asignada) — hecho en Función 1
2. ✅ Catálogo de TarifaLimpieza: seed de las 3 (bajo/medio/alto) + endpoint/formulario para editar precio — hecho entre Función 1 y 2
3. ✅ Pantalla de Cliente: lista con buscador, alta/edición vía modal, y en cada fila: marcar limpieza del día (tick/cruz), cantidad de pastillas, y nombre+precio de extra (carga manual, antes llamado "producto") — hecho en Función 3
4. ✅ Resumen (semanal y mensual, por cliente, con cantidad al lado del precio y totales al pie) — hecho en Función 4
5. ✅ Campo semana en Cliente + filtro automático en la pantalla + toggle "ver todos" — hecho en Función 5
6. ✅ Responsive (mobile): layout mobile de tarjetas colapsables por cliente, manifest.json + apple-touch-icon para PWA en iOS, meta theme-color y safe-area para el status bar — hecho en Función 6
7. ✅ Login (email + PIN de 4 dígitos, cookie httpOnly de 8hs, bloqueo por intentos) — hecho en Función 7
8. ✅ Roles (admin ve/modifica todo, encargado solo sus propios clientes vía campo Cliente.encargado) — hecho en Función 8
9. ✅ Persistencia semanal en pantalla de Cliente (Limpieza y Pastillas pasan a un documento por semana en vez de por día; Extra pasa a lista real con borrado por ítem) — hecho en Función 9

App deployada y en uso: frontend en Vercel, backend en Render, base en MongoDB Atlas. Instalada como PWA en iPhone. Login y roles ya activos — todos los endpoints requieren sesión.
