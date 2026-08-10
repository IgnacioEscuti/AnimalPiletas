# AnimalPiletas

App de gestión para una empresa de mantenimiento de piletas: clientes, tarifas de limpieza, y registro diario de limpieza, pastillas y productos, con (a futuro) resumen mensual por cliente.

## Stack

**Backend**
- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Arquitectura en capas: Model → DAO → Repository → Service → Controller → Routes → DTO → Middlewares

**Frontend**
- React 19 + Vite
- Axios para consumir la API
- Context API para estado global (sin Redux)

## Estructura del proyecto

```
AnimalPiletas/
├── src/                        # Backend
│   ├── config/                 # Conexión a DB y variables de entorno
│   ├── models/                 # Schemas de Mongoose
│   ├── DAOs/                   # Acceso directo a los modelos
│   ├── repositories/           # Capa intermedia entre DAO y Service
│   ├── services/                # Lógica de negocio
│   ├── controllers/            # Manejo de req/res
│   ├── routes/                 # Definición de endpoints
│   ├── DTOs/                   # Formato de datos expuesto por la API
│   ├── middlewares/             # Manejo de errores
│   ├── seeds/                   # Scripts de carga inicial (tarifas)
│   └── server.js
└── frontend/                   # Frontend
    └── src/
        ├── components/
        ├── pages/
        └── services/            # Llamadas a la API con Axios
```

## Modelo de datos

- **Cliente**: nombre, tarifa de limpieza asignada por defecto.
- **TarifaLimpieza**: catálogo fijo (bajo / medio / alto), se carga una sola vez con el seed.
- **PrecioPastillas**: catálogo de un solo documento con el precio fijo de pastillas.
- **Limpieza / UsoPastillas / UsoProducto**: un documento por cliente y por día (cargar de nuevo el mismo día actualiza ese documento en vez de duplicarlo), con el precio congelado al momento de la carga para no afectar eventos pasados si cambia una tarifa.

El detalle completo del modelo y el orden de funciones planificado está en [PLAN.md](PLAN.md).

## Endpoints disponibles

| Recurso | Método | Ruta |
|---|---|---|
| Clientes | POST | `/api/clientes` |
| Clientes | GET | `/api/clientes` |
| Clientes | GET | `/api/clientes/:id` |
| Clientes | PUT | `/api/clientes/:id` |
| Tarifas de limpieza | GET | `/api/tarifas-limpieza` |
| Tarifas de limpieza | PUT | `/api/tarifas-limpieza/:id` |
| Precio de pastillas | GET | `/api/precio-pastillas` |
| Precio de pastillas | PUT | `/api/precio-pastillas` |
| Limpiezas | POST | `/api/limpiezas` |
| Limpiezas | GET | `/api/limpiezas?fecha=YYYY-MM-DD` |
| Usos de pastillas | POST | `/api/usos-pastillas` |
| Usos de pastillas | GET | `/api/usos-pastillas?fecha=YYYY-MM-DD` |
| Usos de producto | POST | `/api/usos-producto` |
| Usos de producto | GET | `/api/usos-producto?fecha=YYYY-MM-DD` |

## Cómo correr el proyecto

### 1. Backend

```bash
npm install
cp .env.example .env   # completar MONGO_URI
npm run dev
```

Variables de entorno (`.env`):

```
MONGO_URI=
PORT=3000
```

Cargar el catálogo de tarifas (bajo / medio / alto) y el precio de pastillas una sola vez:

```bash
npm run seed:tarifas
npm run seed:pastillas
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estado del proyecto

En desarrollo activo, feature por feature. Próximo paso según [PLAN.md](PLAN.md): armar el resumen mensual por cliente.
