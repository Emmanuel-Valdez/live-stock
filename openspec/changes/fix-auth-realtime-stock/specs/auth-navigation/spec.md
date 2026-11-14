## Purpose

Gestiona la sesión del usuario (vendedor o admin) de forma persistente, restringe el acceso a las rutas según el rol y expone controles de navegación coherentes con el estado de autenticación en desktop y mobile.

## ADDED Requirements

### Requirement: Persistent session
El sistema SHALL mantener la sesión del usuario entre recargas de página y reinicios del navegador hasta que cierre sesión explícitamente.

#### Scenario: Recarga de página con sesión activa
- **WHEN** un usuario logueado recarga la página o abre la app en otro momento
- **THEN** permanece autenticado y accede directamente a su vista sin volver a ingresar credenciales

#### Scenario: Sesión tras logout
- **WHEN** el usuario cierra sesión
- **THEN** la sesión se elimina y debe autenticarse de nuevo para acceder a cualquier vista protegida

### Requirement: Role-based route guards
El sistema SHALL restringir el panel de administración exclusivamente al usuario admin (email configurado como admin) y requerir autenticación para la vista de ventas.

#### Scenario: Vendedor intenta acceder a /admin
- **WHEN** un usuario logueado que no es admin intenta entrar al panel de administración
- **THEN** el sistema lo redirige a la vista de ventas

#### Scenario: Usuario sin sesión intenta acceder a /ventas
- **WHEN** un visitante sin sesión intenta acceder a la vista de ventas
- **THEN** el sistema lo redirige a la pantalla de login

#### Scenario: Login redirige por rol
- **WHEN** un usuario inicia sesión correctamente
- **THEN** el sistema lo redirige al panel de administración si es admin, o a la vista de ventas si es vendedor

#### Scenario: Visitante sin sesión en la raíz
- **WHEN** un visitante sin sesión abre la raíz del sitio
- **THEN** el sistema lo redirige al login; si está logueado, lo redirige según su rol

### Requirement: Auth-aware navigation
El sistema SHALL mostrar controles de navegación acordes al estado de autenticación y al rol del usuario, accesibles también en mobile.

#### Scenario: Admin en vista de ventas
- **WHEN** el admin está en la vista de ventas
- **THEN** ve un botón para ir al panel de administración y un botón para cerrar sesión

#### Scenario: Vendedor en vista de ventas
- **WHEN** un vendedor está en la vista de ventas
- **THEN** ve un botón para cerrar sesión pero no el de acceso al panel de administración

#### Scenario: Logout en mobile admin
- **WHEN** el admin usa el panel en un teléfono
- **THEN** dispone de un botón de cerrar sesión visible en la navegación inferior

### Requirement: Role-based database authorization
La base de datos SHALL permitir a usuarios autenticados leer productos y días del evento, y leer/registrar ventas; solo el admin configurado podrá crear, modificar o borrar productos y días del evento.

#### Scenario: Vendedor consulta datos y registra venta
- **WHEN** un vendedor autenticado consulta productos/días o registra una venta
- **THEN** puede leer productos y días, y puede insertar una venta

#### Scenario: Vendedor intenta modificar productos
- **WHEN** un vendedor autenticado intenta insertar, actualizar o borrar un producto directamente en Supabase
- **THEN** RLS rechaza la operación

#### Scenario: Vendedor intenta modificar días
- **WHEN** un vendedor autenticado intenta crear, cerrar, reabrir o borrar un día directamente en Supabase
- **THEN** RLS rechaza la operación

#### Scenario: Admin administra productos y días
- **WHEN** el usuario cuyo email coincide con `VITE_ADMIN_EMAIL` crea/modifica/borra productos o días
- **THEN** RLS permite la operación
