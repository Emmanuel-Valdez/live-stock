# Tasks: fix-auth-realtime-stock

## 1. Supabase (manual, independiente del deploy)

- [x] 1.1 Habilitar Realtime en las tablas: ejecutar en el SQL Editor del dashboard `SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime';` y, si faltan, `ALTER PUBLICATION supabase_realtime ADD TABLE ventas, productos, dias_evento;` — verificar re-ejecutando el SELECT y viendo las 3 tablas
- [x] 1.2 Crear los usuarios vendedores en Dashboard → Authentication → Users → Add user (email + contraseña, sin email confirmation) — verificar que aparecen en el listado de usuarios
- [ ] 1.3 Verificar que `VITE_ADMIN_EMAIL` (.env local y variable en Netlify) coincide con el email del admin, y que las políticas RLS de `productos`/`ventas` permiten SELECT (e INSERT en `ventas`) a `authenticated` — verificar haciendo login con un vendedor de prueba y leyendo la grilla
- [ ] 1.4 Aplicar RLS por rol en Supabase según `design.md`: lectura autenticada de productos/días, lectura e inserción autenticada de ventas, y solo el email de `VITE_ADMIN_EMAIL` puede crear/modificar/borrar productos o días; eliminar políticas permisivas anteriores y habilitar RLS — verificar `pg_policies` y `relrowsecurity`, y probar lectura como vendedor y escritura como admin

## 2. Sesión persistente

- [x] 2.1 Crear `src/routes/+layout.ts` con `export const ssr = false` — verificar: login como admin, recargar `/admin` con F5 y permanecer dentro (sin redirect a login)
- [x] 2.2 En `src/routes/+layout.svelte` hidratar la sesión al montar: `checkAuth()` + `supabase.auth.onAuthStateChange` actualizando `currentUser`, con limpieza en `onDestroy` — verificar: tras F5 en cualquier ruta, `$currentUser` no es null si hay sesión (el botón Admin/Salir aparece sin re-login)

## 3. Guards por rol

- [x] 3.1 Endurecer `src/routes/admin/+layout.ts`: sin sesión → `/admin/login`; sesión con email ≠ `VITE_ADMIN_EMAIL` → `/ventas` — verificar: con usuario vendedor logueado, abrir `/admin` redirige a `/ventas`
- [x] 3.2 Crear `src/routes/ventas/+layout.ts`: sin sesión → `/admin/login` — verificar: en ventana incógnito, abrir `/ventas` redirige al login
- [x] 3.3 Redirect por rol en `admin/login/+page.svelte` (post-login y `onMount` con sesión activa: admin → `/admin`, vendedor → `/ventas`) y en `+page.svelte` raíz — verificar: login con vendedor cae en `/ventas`, login con admin cae en `/admin`, abrir `/` logueado redirige según rol

## 4. Navegación

- [x] 4.1 Header de `ventas/+page.svelte`: botón "Admin" visible solo si `$isAdmin` (link a `/admin`) y botón "Salir" (logout → `/admin/login`) — verificar con ambos roles en viewport 375x667: vendedor ve solo "Salir", admin ve ambos, logout deja la sesión cerrada
- [x] 4.2 Bottom nav de `admin/+layout.svelte`: `grid-cols-4` → `grid-cols-5` agregando ítem "Salir" con ícono — verificar en 375x667 que los 5 ítems son tocables (≥48px) y que "Salir" cierra sesión y lleva al login

## 5. Stock en vivo e indicador de conexión

- [x] 5.1 En `src/lib/stores/realtime.ts`: cambiar `subscribeToVentas` a `event: '*'` con callback sin payload (dispara recarga completa), y agregar parámetro `onStatus` a `subscribeToProductos` alimentado por el callback de `.subscribe()` — verificado: `npm run build` sin errores
- [x] 5.2 En `ventas/+page.svelte`: callback de ventas → `loadVentas()` completo (reasigna `ventasCount`, elimina la mutación que no re-renderizaba); eliminar el canal `connection-status`; `connected = canalOk && navigator.onLine` con listeners `online`/`offline`; al pasar a conectado re-ejecutar `loadProductos()` + `loadVentas()`; mostrar aviso visible de datos desactualizados cuando `connected` es false — verificar con 2 navegadores: vender en A actualiza el stock en B en <2s sin recargar
- [ ] 5.3 Probar el borrado: eliminar una venta desde el dashboard de Supabase — verificar que el stock se restaura solo en la grilla abierta
- [ ] 5.4 Probar desconexión: modo offline del navegador en B — verificar indicador rojo + aviso; al salir de offline, indicador verde y datos recargados automáticamente

## 6. Guard en detalle de venta

- [x] 6.1 En `ventas/[id]/+page.svelte`: al cargar obtener también el conteo de ventas del producto y `diaActual`; mostrar "Quedan X" cuando hay stock; con stock 0 mostrar estado "Sin stock" y con día cerrado el aviso correspondiente, ambos con botón "Vender" deshabilitado (incluso entrando por URL directa) — verificar: URL directa de producto agotado muestra "Sin stock" sin permitir vender; producto con stock muestra "Quedan X" correcto
- [x] 6.2 Hacer que solo `/admin/dias` cree el registro diario; las rutas de ventas solo lo consultan y, si falta, muestran "Día no iniciado" y bloquean la venta — verificar que un vendedor no crea la fila al entrar y que el admin la crea desde `/admin/dias`

## 7. Verificación integral

- [x] 7.1 `npm run build` sin errores — verificar salida del comando
- [ ] 7.2 E2E manual completo en 375x667 con 2 navegadores: login vendedor (sesión persiste tras F5), vendedor bloqueado en `/admin`, admin navega entre `/admin` y `/ventas`, venta completa en ≤4 toques, stock sincroniza en vivo entre ambos, "Sin stock" aparece en los dos cuando se agota, indicador verde/rojo correcto — verificar cada punto en el checklist de testing del change `live-stock-event-app` (task 10.4) actualizado
