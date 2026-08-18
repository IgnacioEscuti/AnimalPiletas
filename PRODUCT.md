# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Admin (dueño del negocio, Ignacio)** — ve y edita todos los clientes, tarifas, barrios y el resumen de cobros, sin restricción.
- **Encargados (empleados reales, no hipotéticos)** — usuarios reales ya en uso hoy, no solo un rol construido a futuro. Cada uno ve y edita únicamente los clientes que tiene asignados (`Cliente.encargado`), en todas las pantallas.
- Uso físico mixto: no hay un escenario dominante confirmado entre "al lado de la pileta, al aire libre" y "sentado, en oficina/casa" — la pantalla de Cliente en mobile tiene que sostenerse en ambos.

## Product Purpose

Reemplazar el seguimiento manual (papel/memoria/WhatsApp) de una empresa de mantenimiento de piletas: quién se atiende esta semana, qué se hizo en cada visita (limpieza, pastillas, extras) y cuánto se le debe cobrar a cada cliente por período. Éxito = el dueño y los encargados comparten una sola fuente de verdad, y el resumen semanal/mensual sale de datos ya cargados en el momento del servicio, no de reconstruir todo después.

## Positioning

Herramienta interna a medida para este negocio puntual, no un producto de mercado. Lo que la distingue de una planilla o un CRM genérico:
- Visibilidad por responsabilidad: un encargado solo ve/edita sus propios clientes; el admin ve todo — aplicado en todas las pantallas, no solo una.
- Precio histórico congelado por evento (`precioUnitarioUsado`): si cambia el precio de una tarifa, los cobros ya cargados no se recalculan solos.
- Alternancia de semana (1/2) calculada automáticamente por semana ISO, sin que nadie tenga que configurar una fecha de referencia a mano.

## Operating Context

- Visita a domicilio: el encargado carga, en el momento o después, si hizo la limpieza, cuántas pastillas usó y cualquier extra (nombre + precio cargado a mano), con su nombre como "empleado" opcional.
- El admin gestiona el catálogo de tarifas y barrios, reordena clientes por barrio (drag & drop), y revisa/navega el resumen semanal y mensual para cobrar.
- Instalada como PWA en iPhone (Función 6 del plan de features, en curso) — hoy no se encontró `manifest.json` ni ícono en `frontend/public`, así que la instalabilidad PWA todavía no está entregada, no asumir que existe.
- Deploy real en producción: frontend en Vercel, backend en Render, base en MongoDB Atlas.

## Capabilities and Constraints

- Backend en capas: Model → DAO → Repository → Service → Controller → Routes → DTO → Middlewares (Express 5 + Mongoose).
- Frontend: React + Vite, React Router v7, Context API (sin Redux), Axios.
- Auth propia: email + PIN numérico de 4 dígitos (bcrypt), cookie de sesión de 8hs, bloqueo tras 10 intentos fallidos. Registro abierto (base de usuarios chica y de confianza, ~2-3 personas reales).
- Roles admin/encargado ya en producción, no aspiracionales.
- Baja lógica de cliente (status "cancelado"): nunca se borran datos, los eventos históricos siguen intactos.
- Rediseño visual mobile en curso ahora mismo: tema oscuro con acento violeta (`#9184d9`, del design system "Nocturne"), tarjetas colapsables, bottom sheets, tab bar inferior — el desktop sigue en tabla clara, todavía sin ese mismo rediseño.

## Brand Commitments

- Nombre: **AnimalPiletas**. Bajada actual en el header: "Gestión de clientes, tarifas y resumen de cobros".
- Preferencia de diseño general del desarrollador (instrucción propia, no de este proyecto puntual): estética moderna y minimalista, referentes Apple/Samsung — fondo gris claro (no blanco puro) en superficies claras, tipografía grande y limpia, animaciones suaves, nada recargado ni colorido en exceso.
- Este proyecto es además pieza de portfolio/CV del desarrollador — el nivel de terminación visual importa más allá de la utilidad interna pura.

## Evidence on Hand

- App real, funcionando en producción, usada hoy por personas reales (no es una demo).
- Modelo de datos y reglas de negocio completos documentados en `PLAN.md` (raíz del repo) — referencia durable para Cliente, Barrio, TarifaLimpieza, Limpieza, UsoPastillas, UsoExtra, Usuario.
- No hay testimonios, casos de estudio ni copy de marketing — no es un producto de cara al público.

## Product Principles

1. Una sola fuente de verdad compartida entre el dueño y los encargados — menos dependencia de papel, memoria o WhatsApp.
2. La pantalla de Cliente en mobile es la herramienta de trabajo real, usada en el momento del servicio — cada control tiene que aguantar un uso rápido y a veces distraído.
3. La historia no se reescribe: precios y eventos pasados quedan congelados, un cambio de tarifa nunca altera lo que un cliente ya debía.
4. La visibilidad sigue a la responsabilidad: admin ve todo, encargado ve lo suyo — reforzado en todas las pantallas por igual.
5. El acabado profesional también es parte del objetivo acá: este proyecto es portfolio, así que el pulido visual importa más allá de la utilidad interna.

## Accessibility & Inclusion

Sin requisito de accesibilidad específico confirmado todavía (base de usuarios chica, sin necesidades reportadas). El contexto físico de uso en mobile es mixto y no confirmado hacia un extremo — diseñar para que se sostenga legible y usable tanto al aire libre como en escritorio, sin optimizar solo para uno de los dos.
