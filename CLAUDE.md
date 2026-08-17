# Stack
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB (Mongoose)

# Frontend
- React Router v7 para el ruteo
- Context API para estado global (no Redux ni otras librerías)
- Axios para las llamadas a la API
- Mantener las pantallas funcionales y simples mientras se construye cada feature — el pulido visual es un paso aparte, al final

# Arquitectura del backend
Seguir la misma arquitectura en capas que el proyecto "Gestión de Eventos": Model → DAO → Repository → Service → Controller → Routes → DTO → Middlewares. Replicar esa estructura de carpetas y ese estilo de separación de responsabilidades desde el primer feature.

# Workflow
- No diseñar pensando en funciones futuras que todavía no se pidieron explícitamente. Resolver solo lo pedido en cada paso.
- Preferir soluciones simples. Si hay una forma más simple de lograr lo mismo, usarla.
- Si algo no queda claro antes de codear una función, preguntar antes de asumir.
- Al terminar una función, correr lint/build (o tests si corresponde) y confirmar que todo funciona antes de darla por terminada.
- Si una función crea o modifica variables de entorno (backend o frontend), terminar la respuesta con una lista aparte de esas variables (nombre y valor exacto a usar) para cargar manualmente en Render y/o Vercel — el deploy no las toma solas del código.
- Ver PLAN.md para el modelo de datos completo del proyecto y el orden de funciones planificado.
