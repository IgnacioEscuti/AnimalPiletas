---
name: AnimalPiletas
description: Panel de gestión para una empresa de mantenimiento de piletas, en tema oscuro fijo con un único acento violeta.
colors:
  bg: "#14151f"
  surface: "#1c1e2c"
  text: "#e9e9ed"
  text-muted: "rgba(233, 233, 237, 0.55)"
  border: "rgba(233, 233, 237, 0.1)"
  accent: "#9184d9"
  accent-hover: "#7c6fc4"
  accent-bg: "rgba(145, 132, 217, 0.14)"
  barrio-header-bg: "#2a2a41"
  cat-limpieza: "#4fd1b8"
  cat-pastillas: "#9184d9"
  cat-extras: "#f0b44c"
  success: "#34c759"
  success-hover: "#28a745"
  success-bg: "rgba(52, 199, 89, 0.16)"
  danger: "#f05064"
  danger-hover: "#ff7d8f"
  danger-bg: "rgba(240, 80, 100, 0.16)"
  on-fill: "#ffffff"
  scrim: "rgba(10, 10, 16, 0.6)"
  nav-blur: "rgba(28, 30, 42, 0.92)"
typography:
  stat:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  bodySmall:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "normal"
    letterSpacing: "normal"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "normal"
    letterSpacing: "normal"
  captionSmall:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "0.02em"
  small:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "normal"
    letterSpacing: "0.06em"
  micro:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
rounded:
  control-compact: "8px"
  control: "14px"
  card-mobile: "18px"
  surface: "22px"
  sheet: "24px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline-accent:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  badge:
    backgroundColor: "{colors.accent-bg}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: AnimalPiletas

## Overview

**Creative North Star: "El tablero de guardia nocturna"**

Una sola pantalla oscura que se lee tan bien de noche, con el sol pegando en la pantalla junto a una pileta, como sentado en un escritorio armando el resumen del mes. No hay modo claro: el fondo casi negro y las tarjetas navy son la superficie por defecto, no una preferencia de sistema. Un único acento violeta marca todo lo interactivo o activo — filtros elegidos, tabs activos, precios, botones — y no aparece en ningún otro lugar. El verde y el rojo están reservados exclusivamente para "confirmado" y "cancelado/rechazado"; no se usan como decoración ni como parte de la paleta general.

El sistema es deliberadamente el mismo en escritorio y en mobile — misma paleta, misma tipografía, mismo lenguaje de bordes redondeados — pero cada superficie adapta su propia densidad: la tabla de escritorio se mantiene compacta con controles chicos en cada celda, mientras que mobile se reorganiza en tarjetas colapsables de una sola columna, con controles más grandes pensados para el dedo, no para el mouse.

**Key Characteristics:**
- Tema oscuro fijo, sin alternativa clara.
- Un solo acento (violeta) para todo lo interactivo; nada de paleta múltiple.
- Verde y rojo son estados semánticos exclusivos, nunca decorativos.
- Bordes muy redondeados en toda la app — controles, tarjetas, pills.
- Etiquetas de sección en mayúscula chica y gris como recurso de separación, en vez de líneas divisorias.
- Misma paleta en escritorio y mobile; solo cambia la densidad/composición por superficie.

## Colors

Paleta mono-acento sobre fondo casi negro: dos tonos oscuros neutros para profundidad, un violeta como única voz interactiva, y verde/rojo reservados a dos estados puntuales.

### Primary
- **Violeta guardia** (`#9184d9`): el único acento de la app. Botones primarios, tabs/filtros activos, precios, badges, bordes de foco, ícono "+" de nuevo cliente, botón "Editar" (variante outline).

- **Header de barrio** (`#2a2a41`, `--barrio-header-bg`): mezcla sólida de `surface` con el acento al 12%. Fondo del header de cada tarjeta de barrio en Clientes. Es sólido (no una opacidad) porque tiene que tapar el `surface` de la tarjeta de forma pareja; es la única excepción a la Regla del Tinte por Opacidad.

### Neutral
- **Casi-negro** (`#14151f`): fondo de página (como gradiente radial hacia `surface`), y también el tono "recesado" de inputs y filas de tabla dentro de una tarjeta más clara.
- **Navy tarjeta** (`#1c1e2c`): superficie de las tarjetas de sección (desktop) y del modal; el punto más claro del gradiente de fondo. A opacidad reducida (92%) es también el fondo con blur de la tab bar flotante de mobile.
- **Texto** (`#e9e9ed`): texto principal sobre fondo oscuro. Este mismo neutro, a distintas opacidades bajas (4%–10%), es la fuente de todo fondo/borde "sutil" de la app (tarjetas de cliente en mobile, hover states, divisores) — nunca se inventa un gris sólido nuevo para eso.
- **Texto muted** (`rgba(233,233,237,0.55)`): labels, texto secundario, placeholders.
- **Borde** (`rgba(233,233,237,0.1)`): borde sutil sobre superficies oscuras — nunca un borde sólido de alto contraste.
- **Texto sobre color** (`#ffffff`): texto/ícono cuando el fondo es un color lleno y saturado (botón primario, estado verde/rojo activo). Nunca se usa blanco sobre una superficie neutra.
- **Scrim** (`rgba(10,10,16,0.6)`): fondo semitransparente detrás de cualquier modal, en desktop y mobile por igual.

### Categorías del Resumen
Cada categoría del Resumen tiene un color propio que **solo la identifica** (ícono, label, chip de cantidad y el tinte de su tarjeta de total). Nunca marca algo interactivo: el "Ver más" de extras toma el color de su tarjeta, pero los tabs, flechas y botones siguen en violeta.
- **Limpieza** (`#4fd1b8`, `--cat-limpieza`): verde azulado. Distinto del verde de "confirmado" (`--success`), que sigue siendo semántico.
- **Pastillas** (`#9184d9`, `--cat-pastillas`): el mismo violeta del acento, con variable propia para poder separarlo si hace falta.
- **Extras** (`#f0b44c`, `--cat-extras`): ámbar.

Los fondos y bordes de esas tarjetas siguen la Regla del Tinte por Opacidad (`color-mix` del color de categoría al 12% de fondo, 24% de borde, 18% para el ícono y el chip).

### Named Rules
**La Regla del Acento Único.** El violeta es la única voz de color no semántica para lo interactivo. Si un control necesita destacar y no es "confirmar" ni "cancelar", es violeta o no es nada. Los colores de categoría del Resumen no compiten con esta regla: identifican datos, no controles.

**La Regla del Verde y Rojo Reservados.** Verde = confirmado/ok (limpieza realizada). Rojo = rechazado/cancelado (limpieza no realizada, cancelar cliente). Ningún otro elemento usa estos colores, ni siquiera como acento decorativo.

**La Regla del Tinte por Opacidad.** Ningún color "suave" o "tintado" es un valor nuevo: siempre es uno de los colores ya nombrados (neutro de texto, acento, verde o rojo) bajado a una opacidad baja (4%–16% para fondos tintados, 45%–55% para texto secundario). Así se logran, por ejemplo, el fondo del badge de pastillas (acento al 14%) y el fondo del ícono de estado verde/rojo (verde o rojo al 16%).

## Typography

**Body/Display Font:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (pila de sistema; no hay webfont cargada)

**Character:** Tipografía de sistema, neutra y muy legible a cualquier tamaño — el peso y el tracking hacen el trabajo de jerarquía, no la elección de fuente.

### Hierarchy
Escala completa, de mayor a menor. Varios roles se reutilizan a propósito en más de un lugar cuando cumplen la misma función visual en contextos distintos (p. ej. "title" es el `h1` en mobile y el `h2` en desktop — ambos son el título de la pantalla en su propio contexto).

- **Stat** (700, 44px, letter-spacing -0.02em, line-height 1): número grande de los totales del Resumen (34px en la tarjeta de extras en mobile).
- **Display** (600, 34px, letter-spacing -0.02em): título de página en desktop ("AnimalPiletas").
- **Title** (600, 22px, letter-spacing -0.01em): subtítulo de sección en desktop (`h2`), título de página en mobile (`h1`) y nombre de barrio en las tarjetas de Clientes (desktop; 19px en mobile).
- **Subtitle** (600, 19px): subtítulo de sección en mobile (`h2`).
- **Lead** (400, 17px): bajada de la página, label del período en Resumen, botones de Limpieza en desktop.
- **Body** (400, 16px): inputs, botones, texto de control estándar.
- **Body Small** (500, 15px): chevron indicador.
- **Caption** (500, 14px): inputs chicos (Empleado, Extra), botones de Limpieza en mobile.
- **Caption Small** (600, 13px, letter-spacing 0.02em): encabezados de columna de tabla, bajada de página en mobile, badge de tarifa.
- **Small** (600, 12px): badge de pastillas cargadas.
- **Label** (700, 11px, letter-spacing 0.06em, mayúscula): encabezados de sección pequeños ("LIMPIEZA", "PASTILLAS") — el recurso principal para separar contenido sin usar líneas.
- **Micro** (600, 10px): labels de la tab bar inferior en mobile.

### Named Rules
**La Regla del Label en Mayúscula.** Toda separación de contenido dentro de una tarjeta se resuelve con un label chico en mayúscula y gris, nunca con un divisor de línea.

## Layout

En Clientes, desktop y mobile agrupan a los clientes en una tarjeta por barrio (ver "Tarjeta de barrio"). Desktop las muestra como filas en grid con las columnas Nombre/Limpieza/Pastillas/Extra/Empleado alineadas a títulos que van una sola vez arriba; mobile muestra solo la fila colapsada (handle, estado y nombre) y expande el resto adentro de la misma tarjeta. La navegación pasa de tabs arriba (desktop) a una tab bar flotante fija abajo (mobile, con blur de fondo). El modal pasa de tarjeta centrada (desktop) a hoja inferior deslizable (mobile). Ningún breakpoint permite scroll horizontal.

## Elevation & Depth

Plano por defecto — `--shadow: none` en toda superficie que vive dentro del flujo normal de la página (tarjetas, filas, inputs). La profundidad ahí se transmite por capas de tono (page bg más oscuro → tarjeta `surface` más clara → fila/input `bg` recesado de nuevo), no por sombra. Solo los elementos que literalmente flotan por encima del contenido — porque el usuario los abrió o porque están fijos en pantalla — usan una sombra real, y son exactamente tres:

### Shadow Vocabulary
- **Modal** (`box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)`): el modal centrado de desktop, para despegarlo del overlay oscuro detrás.
- **Tab bar flotante** (`box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45)` + `backdrop-filter: blur(14px)` sobre `nav-blur`): la navegación fija inferior de mobile, para que se lea como una barra suspendida sobre el contenido que scrollea debajo.

- **Cliente expandido en mobile** (`--shadow-cliente-expandido`: `0 0 12px rgba(145,132,217,0.22), 0 14px 32px rgba(0,0,0,0.55)`): un halo violeta suave más una sombra "levantada" hacia abajo, para que la fila abierta se despegue del resto de la tarjeta del barrio. La fila expandida queda por encima de las vecinas (`z-index: 1`) y la tarjeta del barrio no la recorta.

### Named Rules
**La Regla de las Tres Sombras.** Ningún otro elemento de la app usa `box-shadow` para dar profundidad (el contorno de `drag-over` es un borde inset, no una sombra). Si algo no es un modal, la tab bar fija o el cliente expandido, su profundidad se resuelve con tono, no con sombra.

## Shapes

Todo redondeado, sin esquinas duras en ningún control. Botones cuadrados muy chicos (el −/+ del stepper de pastillas, 28×28px) en 8px, proporcional a su propio tamaño; controles e inputs estándar en 14px; tarjeta de cliente en mobile en 18px; tarjetas/superficies grandes de escritorio y el modal centrado en 22px; la hoja inferior del modal en mobile en 24px (solo las esquinas superiores); y cualquier elemento tipo pill (badges, chips de "ver todos", botones de Limpieza en mobile, tabs de Resumen en mobile) en 999px (cápsula completa). Sin bordes duros de alto contraste — el borde estándar es el neutro de texto al 10% de opacidad sobre el fondo oscuro.

## Components

### Buttons
- **Shape:** 14px de radio.
- **Primary:** fondo violeta (`#9184d9`), texto blanco, hover a `#7c6fc4`.
- **Outline accent:** fondo transparente, borde y texto violeta — usado para "Editar cliente", la acción secundaria pero destacada de cada fila.
- **Secondary:** fondo `bg`, borde sutil, texto neutro — acciones de menor jerarquía ("Cancelar" en modales).
- **Danger:** fondo rojo — solo para "cancelar cliente" dentro del modal de edición.

### Icon buttons (Limpieza)
- **Desktop (lista de Clientes):** cuadrados de 44px, radio 14px, solo ícono. Tick y cruz arrancan en gris neutro (texto al 8%); el tick se llena de verde solo cuando la limpieza está marcada como realizada, y la cruz de rojo solo cuando está marcada como no realizada. Así el estado de cada fila se lee de un vistazo.
- **Mobile:** pills anchas con ícono + texto ("Confirmar" / "No se pudo"), 48px de alto, ocupan el ancho disponible en partes iguales.
- **Estado:** "Confirmar" es verde lleno por defecto (acción primaria de la fila); "No se pudo" es outline neutro salvo que sea el estado activo, en cuyo caso se invierte (confirmar pasa a neutro, no-se-pudo pasa a rojo lleno).

### Badges / Chips
- **Style:** fondo `accent-bg` (violeta al 14%), texto violeta, radio 999px.
- **Uso:** cantidad de pastillas cargadas hoy en la tarjeta colapsada ("N past.", solo si N > 0), y la tarifa asignada en el detalle expandido.
- **Contador de barrio:** variante llena — fondo `accent`, texto `bg`, 13px en negrita, radio 999px. Va a la derecha del header de cada tarjeta de barrio ("X/Y").

### Cards / Containers
- **Corner Style:** 22px (contenedor de sección desktop, modal) / 18px (tarjeta de cliente mobile).
- **Background:** `surface` (desktop) / tinte translúcido sutil sobre el gradiente de página (mobile, sin contenedor propio).
- **Shadow Strategy:** ninguna — ver Elevation & Depth.
- **Border:** 1px `border` sutil en tarjetas mobile; sin borde en el contenedor desktop.

### Inputs / Fields
- **Style:** fondo `bg` (recesado), borde sutil, radio 14px.
- **Focus:** borde pasa a violeta, fondo sube a `surface`.

### Navigation
- **Desktop:** fila de botones simples arriba (Clientes/Resumen/Tarifas), el activo en violeta lleno.
- **Mobile:** tab bar fija abajo, flotante con blur, ícono + label chico; el tab activo se lee solo por el color del ícono/texto (violeta).

### Tarjeta de barrio (Clientes)
Cada barrio (y "Sin barrio") es una sola tarjeta: `surface`, borde 1px `border`, radio 18px, `overflow: hidden` en escritorio (en mobile no, para no recortar la sombra del cliente expandido: el header y la última fila redondean sus propias esquinas), 14px entre tarjetas. Header con fondo `barrio-header-bg`: handle de arrastre (ícono SVG de dos líneas, violeta), nombre del barrio en Title (22px desktop / 19px mobile) en `text`, y el contador a la derecha. Los clientes van adentro, sin tarjeta propia, separados por una línea de 1px `border` (en mobile arranca alineada con el punto de estado). En mobile, el cliente expandido queda demarcado: borde 1px `accent` (anillo inset, no cambia la altura), radio 18px, 8px de separación con los bordes de la tarjeta, chevron hacia arriba a la derecha, la sombra de "Cliente expandido" y sin separadores pegados. Al abrir, la altura se anima en 450ms (`cubic-bezier(0.32, 0.72, 0, 1)`) y margen, borde, radio y sombra entran con la misma curva; el contenido hace fade-in con 100ms de delay y, al terminar, la fila se scrollea a la vista. Al cerrar, el contenido hace fade-out mientras la card se achica (mismos 450ms) y recién al final se oculta. En escritorio la altura se anima en 280ms (ease-out). Con "reducir movimiento" activado todo aparece directo. En escritorio, los títulos de columna van una sola vez arriba de todas las tarjetas, en Caption Small mayúscula y `text-muted`, y las filas son un grid con las mismas columnas; Pastillas, Extra/Precio (un solo contenedor partido por una línea), Empleado y "Editar cliente" miden 44px de alto.

### Encabezado del Resumen
- **Título + tabs:** "Resumen" en Display y, a su derecha, los tabs Semanal/Mensual en una cápsula (`surface`, borde sutil, radio 999px). El activo es violeta lleno con texto `bg`, y el indicador se desliza entre tabs (framer-motion).
- **Período:** tarjeta `surface` con borde, radio 18px: flecha ‹ y › en cuadrados de 44px (radio 14px) y al centro ícono de calendario violeta + label del período (Lead). Tocar el label abre el date picker nativo (el input de fecha está oculto). En desktop va a la derecha de la fila del título; en mobile, a ancho completo debajo, y el label puede partirse en dos líneas.
- **Totales:** una tarjeta por categoría (radio 22px desktop / 18px mobile) con ícono lucide en un cuadrado de 44px, label en el color de la categoría y el número en Stat. Desktop: las tres en una fila; extras arranca compacta (título, "Ver más" y número) y al desplegar muestra la lista adentro. Mobile: limpiezas y pastillas en dos columnas (ícono arriba, número, label abajo), extras a ancho completo con los 3 primeros visibles y "Ver más" abajo a la derecha. Cada extra es una fila con el nombre y un chip `×N`, separadas por una línea tintada de la categoría.
- **Buscador + selector:** en la misma fila; el buscador (ícono de lupa, fondo `surface`) ocupa el resto y el selector de encargado va a la derecha (solo admin).

### Lista de clientes del Resumen
- **Barrio:** el nombre es un título suelto (Title, 22px) arriba de sus clientes, sin tarjeta ni header propio. En desktop los barrios siguen dentro de la tarjeta `surface` de la lista; en mobile van directo sobre el fondo de la página.
- **Desktop (`ResumenTable`):** un grid con las columnas Cliente / Limpieza / Pastillas / Extra / Empleado (solo semanal) / Total / Copiar. Encabezado sin fondo, 12px mayúscula `text-muted` con letter-spacing, y un punto de 8px del color de la categoría en Limpieza, Pastillas y Extra. Cada cliente es una tarjeta (`bg`, borde 1px `border`, radio 18px, 10px entre filas). Limpieza y Pastillas: cantidad en `text` arriba y precio en el color de la categoría abajo (todo `text-muted` si la cantidad es 0). Extra: un extra por línea ("Nombre ×N" en negrita + precio ámbar), 2 visibles; si hay más, a la izquierda un botón cuadrado de 32px (radio 8px, ámbar al 18%) con chevron que gira al desplegar. Total en 20px / 700. Copiar: botón violeta con texto `bg` e ícono Copy.
- **Mobile (`ResumenClienteCard`):** una tarjeta por cliente (`surface`, borde 1px `border`, radio 22px). Nombre centrado (19px, 700). Filas Limpieza / Pastillas / Extra / Empleado separadas por divisores de 1px `border` — excepción a la Regla del Label en Mayúscula, pedida por el diseño de esta tarjeta. Cada fila: punto de 8px en el color de la categoría (gris `text-muted` para Empleado) y label en Caption Small mayúscula; a la derecha la cantidad en `text` y el precio en el color de la categoría, con ancho fijo para que las cantidades queden alineadas. Extras: uno por línea, los 2 primeros visibles y "Ver N más" en ámbar. Bloque TOTAL con fondo `bg`, radio 18px y el total en 28px / 700 (versión chica de Stat, solo acá). Botón Copiar a ancho completo, pill, violeta con texto `bg`. Los precios se muestran con separador de miles (`$25.000`).

### Fila de cliente colapsable (componente de firma)
Cada cliente arranca colapsado: handle de arrastre (mismo ícono SVG, violeta al 60%), ícono de estado circular de 26px (tick verde / cruz roja / guion gris "pendiente"), nombre, badge de pastillas si corresponde, y un chevron puramente indicativo — tocar cualquier parte del encabezado (no solo el chevron) expande o colapsa. Expandido, revela Limpieza/Pastillas/Extra/Empleado y, antes del botón Editar, dirección y teléfono con ícono. El reordenamiento dentro de un barrio se hace con drag-and-drop nativo en desktop y con mantener-presionado + arrastrar en mobile (mismo endpoint de persistencia en ambos casos).

## Do's and Don'ts

### Do:
- **Do** usar violeta para cualquier control interactivo o activo que no sea un estado de confirmación/rechazo.
- **Do** usar labels en mayúscula chica para separar secciones dentro de una tarjeta, nunca una línea divisoria.
- **Do** mantener 100% de los controles y superficies con esquinas redondeadas (14px controles, 22px superficies, 999px pills).
- **Do** transmitir profundidad con capas de tono (`bg` → `surface`), no con sombras.

### Don't:
- **Don't** introducir un segundo color de acento — todo lo no-semántico es violeta o neutro.
- **Don't** usar verde o rojo fuera de los estados "confirmado" / "cancelado-rechazado".
- **Don't** agregar `box-shadow` como recurso de jerarquía fuera de las tres sombras de Elevation & Depth; el sistema es plano por diseño.
- **Don't** permitir scroll horizontal en ningún breakpoint.
