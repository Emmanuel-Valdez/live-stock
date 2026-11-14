# Proposal: fix-auth-realtime-stock

## Why

La app está deployada (lsukiyo.netlify.app) pero el uso real expuso fallas críticas: pide login en cada carga de página (el guard corre en SSR, donde no existe la sesión persistida en localStorage), el stock no se actualiza en vivo entre dispositivos (mutación de estado sin re-render + publicación Realtime de Supabase posiblemente no habilitada), el indicador de conexión no refleja el estado real, no hay navegación entre vistas según auth, y cualquier usuario logueado puede entrar a /admin.

## What Changes

- **Sesiones persistentes**: desactivar SSR (`export const ssr = false` en layout raíz) para que los guards corran en el navegador y vean la sesión que Supabase ya persiste en localStorage. Hidratar el store `currentUser` al inicio con `checkAuth()` + `onAuthStateChange` (hoy nadie llama a `checkAuth`).
- **Guards por rol**: `/admin` exclusivo del email `VITE_ADMIN_EMAIL`; `/ventas` requiere login (vendedores); redirect post-login por rol (admin → `/admin`, vendedor → `/ventas`); raíz `/` redirige por rol.
- **Autorización en base de datos**: RLS permite lectura autenticada de productos y días, y lectura/alta de ventas; solo el admin (email de `VITE_ADMIN_EMAIL` en el JWT) puede crear/modificar/borrar productos o días. Los guards de rutas por sí solos no protegen la API de Supabase.
- **Inicio de día controlado**: solo el admin crea el registro diario desde `/admin/dias`; ventas muestra el estado "Día no iniciado" y bloquea la operación hasta que exista.
- **Navegación con auth**: header de `/ventas` con botón "Admin" (solo admin) y "Salir"; bottom nav mobile de admin con 5to botón "Salir" (hoy solo existe en desktop).
- **Stock en vivo**: suscripción a `ventas` con `event: '*'` (cubre INSERT/UPDATE/DELETE) y recarga completa de counts reasignando el objeto — la mutación actual `ventasCount[id] = ...` no dispara re-render en Svelte. Habilitar publicación `supabase_realtime` para las tablas (paso manual SQL en dashboard).
- **Indicador de conexión**: reflejar el estado real del canal Realtime (`SUBSCRIBED`/`TIMED_OUT`/`CHANNEL_ERROR`) + `navigator.onLine`; rojo = advertencia de datos viejos; auto-recarga de datos al reconectar. Eliminar el canal basura `connection-status`.
- **Guard en detalle de venta**: `/ventas/[id]` bloquea la venta si el stock disponible es 0 o el día está cerrado (incluso entrando por URL directa) y muestra "Quedan X".
- **Usuarios vendedores**: proceso documentado — creación desde Supabase dashboard (Auth → Users), sin código nuevo (crear usuarios con anon key desde el frontend no es seguro).
- **BREAKING**: `/ventas` deja de ser accesible sin sesión.

## Capabilities

### New Capabilities

- `auth-navigation`: Sesión persistente entre cargas de página, guards de rutas por rol (admin vs vendedor), navegación con botones según estado de autenticación y logout accesible desde mobile.

### Modified Capabilities

- `realtime-stock`: La sincronización en tiempo real se extiende a cualquier cambio en `ventas` (incluidos borrados de ventas erróneas), no solo INSERT. El indicador de conexión debe reflejar el estado real del canal y advertir datos viejos; al reconectar se recargan los datos automáticamente.
- `sales-registration`: La vista de detalle debe mostrar el stock restante y bloquear la venta cuando el stock es 0 o el día está cerrado, incluida la entrada directa por URL.

## Impact

- **Código**: `src/routes/+layout.ts` (nuevo), `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/admin/+layout.ts`, `src/routes/admin/+layout.svelte`, `src/routes/admin/login/+page.svelte`, `src/routes/admin/dias/+page.svelte`, `src/routes/ventas/+layout.ts` (nuevo), `src/routes/ventas/+page.svelte`, `src/routes/ventas/[id]/+page.svelte`, `src/lib/stores/realtime.ts`, `src/lib/stores/auth.ts`, `src/lib/stores/dias.ts`.
- **Supabase (manual)**: SQL `ALTER PUBLICATION supabase_realtime ADD TABLE ...` y políticas RLS por rol; crear usuarios vendedores en dashboard; verificar que `VITE_ADMIN_EMAIL` coincide con el email del admin.
- **Hosting**: Netlify sigue funcionando con adapter-auto en modo SPA (sin SSR).
- **Dependencias**: ninguna nueva.
- **Usuarios existentes**: los vendedores deberán loguearse una vez (sesión queda persistida).
