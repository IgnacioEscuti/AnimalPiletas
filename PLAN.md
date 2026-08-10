# Plan — App de gestión para empresa de piletas

## Contexto del proyecto

App para gestionar clientes de una empresa de mantenimiento de piletas. Se construye de a poco, función por función. Este documento es la referencia completa del modelo de datos para que Claude Code no tenga que re-explicarse en cada prompt. Las reglas generales de workflow (simplicidad, no sobre-diseñar, verificación) viven en CLAUDE.md.

## Modelo de datos

### Cliente
```
nombre: string
tarifaLimpieza: ObjectId → ref TarifaLimpieza (tarifa asignada por defecto)
semana: "1" | "2" | "todas" (con qué frecuencia se atiende)
```

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
```

### UsoPastillas (un documento por cada carga de pastillas)
```
cliente: ObjectId → ref Cliente
fecha: Date
cantidad: number
precioUnitarioUsado: number (precio fijo de pastillas, congelado en ese momento)
```

### UsoProducto (un documento por cada carga de un producto)
```
cliente: ObjectId → ref Cliente
fecha: Date
nombreProducto: string (cargado a mano, sin catálogo)
precioUnitario: number (cargado a mano en el momento, ya representa el total de esa carga)
```

**Por qué se congela el precio de la tarifa en Limpieza:** si más adelante se cambia el precio de una tarifa, los eventos ya cargados no se tienen que ver afectados. El precio histórico queda fijo tal cual era el día que se cargó. Esto no aplica a Producto, que ya se carga a mano cada vez.

## Cómo funciona el filtro de semana en la pantalla de Cliente

Hay clientes que se atienden todas las semanas (`semana: "todas"`) y otros que se dividen en semana 1 o semana 2, alternando semana por medio. No hace falta guardar ninguna fecha de referencia: se usa el número de semana ISO de la fecha de hoy — semana ISO impar = semana 1, semana ISO par = semana 2. Es un cálculo directo a partir del calendario, no algo que se configure a mano.

Por defecto, la pantalla de Cliente muestra solo los clientes de `semana: "todas"` más los que correspondan a la semana actual (1 o 2, según el cálculo de arriba). Como esto puede dejar fuera de vista a un cliente que no le toca esta semana (por ejemplo, para editarlo o cargarlo por primera vez), hay un toggle "Ver todos" que desactiva el filtro y muestra la lista completa sin importar la semana.

El campo `semana` de cada cliente se edita directo desde un selector chico (1 / 2 / todas) en su propia fila — no hace falta abrir el modal de edición para cambiarlo. Si un cliente pasa de semana 1 a semana 2, se cambia ahí mismo y el filtro lo usa a partir de ese momento.

El resumen (semanal y mensual) no necesita ninguna lógica nueva por esto: sigue sumando los eventos que realmente se cargaron, sin comparar contra el campo `semana` de cada cliente. Si algún cliente fue atendido fuera de su semana (usando el toggle "ver todos"), ese trabajo real se refleja igual en el resumen.

## Cómo funciona el resumen (semanal y mensual)

No existe una colección "resumen" que se cree a mano — se calcula consultando las 3 colecciones de eventos (Limpieza, UsoPastillas, UsoProducto) filtrando por rango de fechas. La función es genérica: recibe un `inicio` y un `fin`, y no le importa si ese rango es una semana o un mes.

```js
// Mensual: 1° del mes hasta 1° del mes siguiente
const inicio = new Date(anio, mes - 1, 1);
const fin = new Date(anio, mes, 1);

// Semanal: lunes de esa semana hasta el lunes siguiente
// (mismo cálculo de inicio/fin, solo cambia cómo se arma la fecha)

// Limpieza.find({ fecha: { $gte: inicio, $lt: fin } })
// UsoPastillas.find({ fecha: { $gte: inicio, $lt: fin } })
// UsoProducto.find({ fecha: { $gte: inicio, $lt: fin } })
```

Agrupando por cliente y sumando los totales de cada colección se arma el total por cliente en ese período. La misma función sirve para el resumen semanal, el mensual, un período ya cerrado, o uno en curso — no hace falta lógica distinta para cada caso, solo el rango de fechas cambia.

**Qué muestra cada fila (por cliente):** para cada una de las 3 categorías se muestra la cantidad al lado del precio:
- **Limpieza:** cantidad = cuántas limpiezas con `realizada: true` hubo en el período (cada una suma 1) · precio = suma de `precioUnitarioUsado + extra` de esos eventos
- **Pastillas:** cantidad = suma del campo `cantidad` de todos los eventos UsoPastillas del período · precio = suma de `cantidad × precioUnitarioUsado`
- **Producto:** en vez de un solo número, se lista el nombre de cada producto cargado con cuántas veces apareció (ej: "Cloro x2, Algicida x1") — agrupando los eventos UsoProducto del cliente por `nombreProducto` · precio = suma de `precioUnitario` de todos esos eventos

**Fila de totales al pie de toda la lista** (solo cantidades, sin plata):
- Total limpiezas: suma de limpiezas realizadas de todos los clientes (cada una suma 1)
- Total pastillas: suma de las cantidades de pastillas de todos los clientes
- Total productos: igual que en la fila de cliente pero agregando entre todos — desglosado por nombre de producto (ej: "Cloro: 15, Algicida: 8"), sumando las apariciones de cada nombre en todos los clientes del período

**Navegación entre períodos:** el endpoint recibe un tipo (`semanal` o `mensual`) y una fecha de referencia cualquiera dentro del período a mostrar. A partir de esa fecha calcula el inicio/fin (lunes-a-lunes o 1°-a-1°) y corre la misma consulta. Navegar hacia atrás o adelante es mandar una fecha de referencia distinta — un solo endpoint sirve para el período actual y para cualquier período pasado. En el frontend: dos pestañas (Semanal / Mensual), flechas anterior/siguiente, y un texto que muestra qué período se está viendo.

**Período por defecto al entrar:**
- Semanal: arranca en la semana actual (lo que haya cargado hasta hoy).
- Mensual: si hoy es el día 1° del mes, arranca mostrando el mes anterior (el que se acaba de cerrar, para cobrarle a los clientes). Cualquier otro día del mes, arranca en el mes actual en curso.

## Orden de funciones a implementar

1. ✅ CRUD de Cliente (con tarifa de limpieza asignada) — hecho en Función 1
2. ✅ Catálogo de TarifaLimpieza: seed de las 3 + endpoint/formulario para editar precio — hecho entre Función 1 y 2
3. ✅ Pantalla de Cliente: lista con buscador, alta/edición vía modal, y en cada fila: marcar limpieza del día (tick/cruz), cantidad de pastillas, y nombre+precio de producto (carga manual) — hecho en Función 3
4. ✅ Resumen (semanal y mensual, por cliente, con desglose de cantidad+precio por categoría y fila de totales) — hecho en Función 4
5. ✅ Campo semana en Cliente + filtro automático en la pantalla + toggle "ver todos" — hecho en Función 5
