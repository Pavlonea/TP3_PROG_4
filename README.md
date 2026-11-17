# TP3 - Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de Programación IV (UTN - FRLR - Tecnicatura Universitaria en Programación).

Aplicación para registrar los vehículos de una empresa de transporte, sus conductores y los viajes realizados.

## Tecnologías

- **Frontend:** Vite + React (JavaScript), React Router, CSS puro.
- **Backend:** Express.js, MySQL con `mysql2`, `express-validator`.
- **Seguridad:** JWT (vence a las 4 horas) verificado con Passport, contraseñas encriptadas con `bcrypt`.

## Requisitos

- Node.js 20.6 o superior
- MySQL 8 o superior

## Instalación

### 1. Base de datos

Importar el script `backend/tablas.sql` en MySQL. Crea la base `tp3_db` con sus tablas
(`usuario`, `vehiculos`, `conductores` y `viajes`).

> El script incluye `DROP TABLE IF EXISTS`, así que no conviene ejecutarlo sobre una base con datos.

### 2. Backend

```
cd backend
npm install
```

Crear un archivo `.env` dentro de `backend` con estas variables:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=tp3_db
JWT_SECRET=una_clave_secreta
```

Iniciar el servidor (queda en `http://localhost:3000`):

```
npm run dev
```

### 3. Frontend

En otra terminal:

```
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Uso

1. Registrarse desde **Registrarse** e iniciar sesión desde **Ingresar**.
2. Con la sesión iniciada se habilitan **Vehículos**, **Conductores** y **Viajes**.
3. En **Viajes** se registra un viaje eligiendo un vehículo y un conductor, y se consulta el historial
   filtrando por vehículo o por conductor, con el total de kilómetros recorridos.

La sesión se guarda en memoria: al recargar la página hay que volver a ingresar.

## API

Todas las rutas, salvo `/auth`, requieren el header `Authorization: Bearer <token>`.

| Ruta | Descripción |
|---|---|
| `POST /auth/register` | Registro de usuario |
| `POST /auth/login` | Inicio de sesión, devuelve el token |
| `/vehiculos` | CRUD de vehículos |
| `/conductores` | CRUD de conductores |
| `/viajes` | CRUD de viajes, con filtros `vehiculo_id` y `conductor_id` |
| `GET /viajes/kilometros` | Total de kilómetros por `vehiculo_id` o `conductor_id` |

En `backend/` hay archivos `.http` para probar la API (extensión REST Client de VS Code).

## Estructura

```
backend/    API REST con Express y MySQL
frontend/   Aplicación React
```