# Historias de Usuario - Cauca Resiliente

**Proyecto:** API REST para el sistema móvil de apoyo a la localización y gestión de emergencias "Cauca Resiliente"
**Autores:** Andrés Felipe Cometa Pillimue - Didier Felipe Valencia Rodríguez
**Institución:** Corporación Universitaria Autónoma del Cauca
**Programa:** Bases de Datos Avanzadas.
**Docente:** Diego Predo
**Fecha:** Septiembre 2026
## Funcionalidad #1: Registrar usuario

**Historia de usuario:**
Como ciudadano, quiero registrar mis datos personales y médicos para que los socorristas me atiendan correctamente en un rescate.

**Endpoint:** `POST /api/usuarios`
**Método HTTP:** POST
**Body (JSON):**
```json
{
  "_id": 7,
  "nombres": "Andrés Felipe",
  "apellidos": "Cometa Pillimue",
  "tipo_documento": "CC",
  "identificacion": "10469099",
  "genero": "Masculino",
  "edad": 22,
  "email": "andres.cometa@email.com",
  "telefono": "3145678901",
  "ciudad": "Popayán",
  "direccion": "Calle 10 # 5-20",
  "fecha_registro": "2026-01-20",
  "rol": "Ciudadano",
  "tipo_sangre": "O+",
  "alergias": ["Polen"],
  "discapacidades": [],
  "contacto_emergencia": {
    "nombre": "Mamá",
    "telefono": "3171234567",
    "parentesco": "Madre"
  },
  "activo": true
}


## Funcionalidad #2: Actualizar estado de seguridad

Historia de usuario:
Como ciudadano, quiero actualizar mi estado (A salvo / En riesgo / Atrapado / Desaparecido) para que mis contactos y los socorristas sepan cómo estoy.

Endpoint: `PUT /api/estados/:usuarioId`
Método HTTP: PUT
Body (JSON):
```json
{
  "estado": "En riesgo",
  "mensaje_estado": "Réplica fuerte, estoy en la calle"
}

## Funcionalidad #3: Consultar estado de seguridad

**Historia de usuario:**
Como socorrista, quiero consultar el estado de seguridad actual de un ciudadano para saber si necesita ayuda urgente.

http://localhost:3000/api/estados/1
```json
{
  "_id": 1,
  "usuario_id": 1,
  "estado": "En riesgo",
  "mensaje_estado": "Réplica fuerte, estoy en la calle",
  "fecha_ultima_actualizacion": "2026-... "
}

**Endpoint:** `GET /api/estados/:usuarioId`
**Método HTTP:** GET

**Resultado esperado:** `200 OK` con el estado actual del usuario.
**Validación:** Devuelve `404 Not Found` si el usuario no tiene estado registrado.
**Persistencia:** Consulta la colección `estados_seguridad` de MongoDB.


## Funcionalidad #4: Enviar ubicación GPS

**Historia de usuario:**
Como ciudadano, quiero que mi ubicación GPS se registre automáticamente para que los socorristas sepan mi última posición confirmada.

**Endpoint:** `POST /api/ubicaciones`
**Método HTTP:** POST
**Body (JSON):**
```json
{
  "usuario_id": 7,
  "latitud": 2.4425,
  "longitud": -76.6070,
  "direccion_aproximada": "Calle 10 # 5-20, Popayán",
  "precision_metros": 8.0,
  "bateria": 78
}

## Funcionalidad #5: Consultar historial de ubicaciones

**Historia de usuario:**
Como socorrista, quiero ver el historial de ubicaciones de un ciudadano para rastrear su último paradero conocido.

**Endpoint:** `GET /api/ubicaciones/:usuarioId`
**Método HTTP:** GET
**Ejemplo de URL:** `http://localhost:3000/api/ubicaciones/1`

**Resultado esperado:** `200 OK` con el historial ordenado de la ubicación más reciente a la más antigua.
**Ejemplo de respuesta (JSON):**
```json
{
  "mensaje": "Historial de ubicaciones",
  "total": 2,
  "historial": [
    {
      "_id": 2,
      "usuario_id": 1,
      "latitud": 2.4425,
      "longitud": -76.6055,
      "direccion_aproximada": "Calle 6 # 4-20, Popayán",
      "precision_metros": 6.0,
      "bateria": 72,
      "fecha_hora": "2026-09-07T14:20:00.000Z"
    },
    {
      "_id": 1,
      "usuario_id": 1,
      "latitud": 2.4419,
      "longitud": -76.6063,
      "direccion_aproximada": "Calle 5 # 3-12, Popayán",
      "precision_metros": 8.5,
      "bateria": 75,
      "fecha_hora": "2026-09-07T14:15:00.000Z"
    }
  ]
}


## Funcionalidad #6: Crear solicitud SOS


**Historia de usuario:**
Como ciudadano, quiero enviar una solicitud SOS con tipo de ayuda y prioridad para que los socorristas me atiendan según la gravedad.

**Endpoint:** `POST /api/solicitudes`
**Método HTTP:** POST
**Body (JSON):**
```json
{
  "usuario_id": 7,
  "tipo_ayuda": "Rescate",
  "descripcion_emergencia": "Atrapado en el segundo piso por derrumbe",
  "nivel_prioridad": "Crítica",
  "latitud": 2.4425,
  "longitud": -76.6070,
  "personas_afectadas": 2,
  "requiere_ambulancia": true
}



## Funcionalidad #7: Listar solicitudes priorizadas



**Historia de usuario:**
Como socorrista, quiero ver las solicitudes ordenadas por prioridad (Crítica primero) para atender primero las más graves.

**Endpoint:** `GET /api/solicitudes`
**Método HTTP:** GET
**Ejemplo de URL:** `http://localhost:3000/api/solicitudes`

**Resultado esperado:** `200 OK` con las solicitudes ordenadas por prioridad: Crítica, Alta, Media, Baja.
**Ejemplo de respuesta (JSON):**
```json
{
  "mensaje": "Solicitudes priorizadas",
  "total": 7,
  "solicitudes": [
    {
      "_id": 7,
      "usuario_id": 7,
      "tipo_ayuda": "Rescate",
      "descripcion_emergencia": "Atrapado en el segundo piso por derrumbe",
      "nivel_prioridad": "Crítica",
      "estado_solicitud": "Pendiente",
      "latitud": 2.4425,
      "longitud": -76.6070,
      "personas_afectadas": 2,
      "requiere_ambulancia": true,
      "fecha_hora": "2026-10-14T15:45:00.000Z"
    },
    {
      "_id": 2,
      "usuario_id": 2,
      "tipo_ayuda": "Rescate",
      "descripcion_emergencia": "Vivienda inundada por desbordamiento de río",
      "nivel_prioridad": "Crítica",
      "estado_solicitud": "En proceso",
      "latitud": 3.0094,
      "longitud": -76.4847,
      "personas_afectadas": 5,
      "requiere_ambulancia": false,
      "fecha_hora": "2026-09-08T08:20:00.000Z"
    },
    {
      "_id": 3,
      "usuario_id": 4,
      "tipo_ayuda": "Atención Médica",
      "descripcion_emergencia": "Posible fractura por caída durante réplica",
      "nivel_prioridad": "Alta",
      "estado_solicitud": "Pendiente",
      "latitud": 3.2306,
      "longitud": -76.4171,
      "personas_afectadas": 1,
      "requiere_ambulancia": true,
      "fecha_hora": "2026-09-08T09:35:00.000Z"
    }
  ]
}



## Funcionalidad #8: Asignar socorrista a una solicitud

**Historia de usuario:**
Como coordinador, quiero asignar un socorrista a una solicitud para que se haga cargo del rescate.

### Crear asignación

**Endpoint:** `POST /api/asignaciones`
**Método HTTP:** POST
**Body (JSON):**
```json
{
  "solicitud_id": 6,
  "socorrista_id": 3
}



## Funcionalidad #9: Registrar zona de riesgo


**Historia de usuario:**
Como administrador, quiero registrar zonas de riesgo (derrumbe, inundación, fuga de gas) para alertar a los ciudadanos cercanos.

**Endpoint:** `POST /api/zonas-riesgo`
**Método HTTP:** POST
**Body (JSON):**
```json
{
  "nombre_zona": "Barrio Los Sauces",
  "tipo": "Escape de Gas",
  "nivel_peligro": "Inminente",
  "descripcion": "Fuga de gas por daño en tubería principal",
  "latitud": 2.4440,
  "longitud": -76.6060,
  "radio_metros": 180
}


## Funcionalidad #10: Consultar zonas de riesgo cercanas

**Historia de usuario:**
Como ciudadano, quiero consultar las zonas de riesgo cercanas a mi ubicación para evitar transitar por zonas peligrosas.

**Endpoint:** `GET /api/zonas-riesgo/cercanas`
**Método HTTP:** GET
**Query Params:**
- `lat` (número): latitud del usuario
- `lng` (número): longitud del usuario

**Ejemplo de URL:** `http://localhost:3000/api/zonas-riesgo/cercanas?lat=2.4420&lng=-76.6060`

**Resultado esperado:** `200 OK` con las zonas cuyo radio de afectación incluye las coordenadas enviadas.
**Ejemplo de respuesta (JSON):**
```json
{
  "mensaje": "Zonas de riesgo cercanas",
  "total": 1,
  "zonas": [
    {
      "_id": 4,
      "nombre_zona": "Barrio Los Sauces",
      "tipo": "Escape de Gas",
      "nivel_peligro": "Inminente",
      "descripcion": "Fuga de gas por daño en tubería principal",
      "latitud": 2.4440,
      "longitud": -76.6060,
      "radio_metros": 180,
      "fecha_registro": "2026-10-14T16:15:00.000Z"
    }
  ]
}





## Tabla de Resumen de funcionalidades


| # |       Funcionalidad               | Método |                Endpoint                          |

| 1 | Registrar usuario                  | POST | http://localhost:3000/api/usuarios                |
| 2 | Actualizar estado de seguridad     | PUT  | http://localhost:3000/api/estados/:usuarioId      |
| 3 | Consultar estado de seguridad      | GET  | http://localhost:3000/api/estados/:usuarioId      |
| 4 | Enviar ubicación GPS               | POST | http://localhost:3000/api/ubicaciones             |
| 5 | Consultar historial de ubicaciones | GET  | http://localhost:3000/api/ubicaciones/:usuarioId  |
| 6 | Crear solicitud SOS                | POST | http://localhost:3000/api/solicitudes             |
| 7 | Listar solicitudes priorizadas     | GET  | http://localhost:3000/api/solicitudes             |
| 8 | Asignar socorrista                 | POST | PUT | http://localhost:3000/api/asignaciones      |
| 9 | Registrar zona de riesgo           | POST | http://localhost:3000/api/zonas-riesgo            |
| 10| Consultar zonas cercanas           | GET  | http://localhost:3000/api/zonas-riesgo/cercanas   |



## Tecnologías utilizadas

- **Node.js** con **Express** para el backend.
- **MongoDB** con **Mongoose** para la base de datos.
- **dotenv** para variables de entorno.
- **cors** para permitir conexiones desde la app móvil.
- **nodemon** para desarrollo.



## Colecciones en MongoDB

|         Colección       |                  Descripción                          |
|-------------------------|-------------------------------------------------------|
| usuarios                | Datos personales y médicos de ciudadanos y socorristas |
| estados_seguridad       | Estado actual de cada usuario (A salvo, En riesgo, Atrapado, Desaparecido) |
| historial_ubicaciones   | Registro GPS con latitud, longitud, batería y fecha |
| solicitudes_ayuda       | Solicitudes SOS creadas por los usuarios |
| asignacion_rescate      | Asignaciones de socorristas a solicitudes |
| zonas_riesgo            | Zonas peligrosas con tipo, nivel y radio de afectación |



## Estructura del proyecto
cauca-resiliente-api/
├── src/
│ ├── config/
│ │ └── db.js
│ ├── controllers/
│ │ ├── usuarioController.js
│ │ ├── estadoController.js
│ │ ├── ubicacionController.js
│ │ ├── solicitudController.js
│ │ ├── asignacionController.js
│ │ └── zonaRiesgoController.js
│ ├── models/
│ │ ├── usuario.js
│ │ ├── EstadoSeguridad.js
│ │ ├── Ubicacion.js
│ │ ├── Solicitud.js
│ │ ├── Asignacion.js
│ │ └── ZonaRiesgo.js
│ ├── routes/
│ │ ├── usuarioRoutes.js
│ │ ├── estadoRoutes.js
│ │ ├── ubicacionRoutes.js
│ │ ├── solicitudRoutes.js
│ │ ├── asignacionRoutes.js
│ │ └── zonaRiesgoRoutes.js
│ └── index.js
├── .env
├── .gitignore
├── historias-usuarios.md
├── package.json
└── package-lock.json


## "Cómo ejecutar el proyecto"

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install

3. Crear el archivo `.env` con: npm install
PORT=3000
MONGO_URI=mongodb://localhost:27017/cauca_resiliente

4. Ejecutar en modo desarrollo: npm run dev
5. La API queda disponible en `http://localhost:3000`.