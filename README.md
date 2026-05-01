# TuTicket

Frontend Angular para la gestion de tickets de soporte. Consume la API `TuTicketAPI` e incluye autenticacion JWT, bandeja y detalle de tickets, creacion de tickets con adjuntos, bitacora, historial, cambios de estado, asignacion, notificaciones, dashboard con graficos y mantenedores administrativos.

## Stack

- Angular 21
- Angular Router con lazy loading
- Angular Material
- Tailwind CSS 4
- Chart.js
- RxJS
- TypeScript

## Estructura principal

```text
TuTicket/
  public/              Archivos publicos
  src/
    environments/     Configuracion de ambiente
    app/
      core/            Auth, layout, guards, interceptors y servicios compartidos
      features/        Pantallas y modulos funcionales
    styles.css         Estilos globales y Tailwind
  angular.json         Configuracion Angular
  package.json         Scripts y dependencias npm
```

## Requisitos

- Node.js compatible con Angular 21
- npm 10 o superior
- API `TuTicketAPI` ejecutandose
- Certificado HTTPS de desarrollo confiable para `https://localhost:7113`

## Configuracion

La URL base de la API se configura en:

```text
src/environments/environment.ts
```

Valor local esperado:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7113/api'
};
```

La API debe estar disponible en:

- HTTPS: `https://localhost:7113`
- Swagger: `https://localhost:7113/swagger`

## Ejecucion local

Instalar dependencias:

```powershell
npm install
```

Ejecutar servidor Angular:

```powershell
npm start
```

URL por defecto:

- Angular: `http://localhost:4200`

## Compilacion

Compilar la aplicacion:

```powershell
npm run build
```

Los artefactos quedan en:

```text
dist/TuTicket
```

## Autenticacion

La aplicacion usa JWT devuelto por la API.

Endpoints consumidos:

- `POST /api/Usuario/login`
  - Autentica usuario y guarda token, datos del usuario y roles.
- `POST /api/Usuario/registrar`
  - Registra usuario solicitante.
- `GET /api/Usuario/select`
  - Alimenta selects de usuarios en asignaciones y mantenedores.

El token se guarda en `localStorage` y se envia automaticamente mediante interceptor:

```http
Authorization: Bearer <token>
```

## Roles

- `Administrador`
  - Acceso a dashboard, tickets, notificaciones y todos los mantenedores.
- `ResolvedorTicket`
  - Acceso a tickets visibles para su usuario, cambio de estado y operaciones permitidas por la API.
- `Solicitante`
  - Acceso a sus tickets, creacion de tickets, adjuntos, bitacoras y acciones disponibles para el solicitante.

## Modulos principales

### Login y registro

Pantallas:

- `/login`
- `/register`

Reglas:

- Solo usuarios no autenticados pueden entrar al login/registro.
- Un usuario autenticado no puede volver al login.
- Al cerrar sesion se limpia el token y se vuelve al login.

### Layout y navegacion

El layout principal esta protegido por `authGuard`.

Incluye:

- Navbar con accesos principales.
- Nombre, correo y roles del usuario autenticado.
- Logout.
- Indicador de notificaciones no leidas.
- Opciones administrativas visibles solo para `Administrador`.

### Dashboard

Ruta:

- `/app`

Consume `GraficosController`:

- `GET /api/Graficos/resumen`
- `GET /api/Graficos/tickets-por-estado`
- `GET /api/Graficos/tickets-por-prioridad`
- `GET /api/Graficos/tickets-por-categoria`
- `GET /api/Graficos/tickets-creados-por-mes`
- `GET /api/Graficos/sla-cumplimiento`
- `GET /api/Graficos/tickets-por-responsable`

Muestra KPIs y graficos con Chart.js.

### Bandeja de tickets

Ruta:

- `/tickets`

Consume `TicketController`:

- `GET /api/Ticket`
- `POST /api/Ticket`

Incluye:

- Tabla paginada.
- Filtros por estado, prioridad, categoria, subcategoria, texto y rangos de fechas.
- Creacion de tickets mediante modal.
- Carga de categorias, prioridades y subcategorias desde endpoints `select`.
- Adjuntos iniciales en la creacion del ticket.

### Detalle de ticket

Ruta:

- `/tickets/:id`

Consume endpoints de tickets, adjuntos, bitacora, historial, relaciones, SLA y flujos de estado.

Incluye:

- Resumen del ticket.
- SLA asociado.
- Adjuntos paginados.
- Bitacora paginada.
- Historial paginado.
- Relaciones.
- Cambio de estado.
- Asignacion de usuario visible para administrador.
- Aceptar resolucion si el solicitante puede cambiar a `Cerrado`.
- Cancelar ticket si el solicitante puede cambiar a `Cancelado`.

### Adjuntos

Endpoints consumidos:

- `GET /api/Ticket/{idTicket}/adjuntos`
- `POST /api/Ticket/{idTicket}/adjuntos`
- `GET /api/TicketAdjunto/{id}/descargar`

La subida permite lista de archivos.

### Bitacora

Endpoints consumidos:

- `GET /api/Ticket/{idTicket}/bitacora`
- `POST /api/Ticket/{idTicket}/bitacora`

Las bitacoras se agregan mediante modal y el listado esta paginado.

### Notificaciones

Ruta:

- `/notificaciones`

Consume `NotificacionController`:

- `GET /api/Notificacion/mis-notificaciones`
- `GET /api/Notificacion/no-leidas/count`
- `PUT /api/Notificacion/marcar-leidas`
- `PUT /api/Notificacion/marcar-todas-leidas`
- `PUT /api/Notificacion/{id}/marcar-no-leida`

Comportamiento:

- El navbar muestra badge con total de no leidas.
- Al abrir la pantalla, las notificaciones no leidas visibles se marcan como leidas.
- Permite marcar todas como leidas.
- Permite volver una notificacion a no leida.
- Si la notificacion tiene ticket asociado, permite navegar al detalle.

## Mantenedores administrativos

Rutas protegidas por `adminGuard`:

- `/admin/estados-ticket`
- `/admin/flujos-estado-ticket`
- `/admin/prioridades-ticket`
- `/admin/categorias-ticket`
- `/admin/categorias-responsables`
- `/admin/subcategorias-ticket`
- `/admin/equipos-soporte`
- `/admin/tipos-relacion-ticket`
- `/admin/sla-politicas`

Caracteristicas:

- Listados paginados.
- Modales para crear y editar.
- Modal de confirmacion para eliminar.
- Uso de endpoints `select` para combos.
- Borrado logico cuando la API lo soporta.

## Servicios principales del frontend

- `AuthService`
  - Login, registro, token, usuario actual y roles.
- `NotificacionService`
  - Conteo de no leidas, listado y marcado de notificaciones.
- `TicketBandejaService`
  - Tickets, adjuntos, bitacora, historial, SLA, relaciones, asignacion y estados disponibles.
- Servicios de mantenedores
  - Encapsulan llamadas CRUD y endpoints `select`.

## Guards e interceptor

- `authGuard`
  - Protege rutas autenticadas.
- `guestGuard`
  - Evita que usuarios logeados entren al login o registro.
- `adminGuard`
  - Protege mantenedores administrativos.
- Interceptor de autenticacion
  - Agrega el token JWT a las solicitudes hacia la API.

## Reglas importantes del frontend

- La URL base de la API debe salir siempre desde `environment.apiUrl`.
- El login y registro son solo para usuarios no autenticados.
- Las rutas internas requieren usuario autenticado.
- Los mantenedores administrativos solo aparecen y se pueden abrir con rol `Administrador`.
- Los listados principales usan paginacion.
- La bandeja de tickets no usa filtro de inactivos porque `Ticket` ya no expone `Activo`.
- La creacion de tickets no envia estado; la API define el estado inicial.
- El cambio de estado usa los estados disponibles de la API.
- Si el flujo exige comentario, el modal de cambio de estado debe solicitarlo.
- Los errores de validacion del backend se muestran en los modales cuando aplica.
- El solicitante puede aceptar resolucion solo si existe flujo disponible hacia `Cerrado`.
- El solicitante puede cancelar solo si existe flujo disponible hacia `Cancelado`.
- El boton `Cambiar estado` solo aparece para `Administrador` y `ResolvedorTicket`.
- Las notificaciones visibles se marcan como leidas al entrar a la pantalla de notificaciones.
- Las pantallas funcionales se cargan con lazy loading.

## Scripts disponibles

```powershell
npm start
```

Ejecuta `ng serve`.

```powershell
npm run build
```

Compila la aplicacion.
