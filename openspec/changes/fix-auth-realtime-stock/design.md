# Design: fix-auth-realtime-stock

## Context

Motivación en proposal.md - Why. Estado actual del código que condiciona el diseño:

- `adapter-auto` + Netlify = SSR activo. `/admin/+layout.ts` ejecuta `supabase.auth.getUser()` en el servidor, donde no existe el localStorage del cliente → redirect a login en cada carga completa, aunque la sesión esté persistida (Supabase persiste por defecto con `persistSession: true`).
- `checkAuth()` existe en `src/lib/stores/auth.ts` pero nadie lo llama → `currentUser` arranca siempre en `null` tras un refresh.
- `ventas/+page.svelte` muta `ventasCount[id] = ...` sin reasignar el objeto → Svelte 5 (modo compat, sintaxis legacy) no re-renderiza. La suscripción a `ventas` solo escucha `INSERT`.
- El indicador de conexión usa un canal extra `connection-status` con `.on('system', { event: 'broadcast' })`, que no es un evento válido y nunca se limpia.
- `/ventas/[id]` no valida stock ni estado del día.
- No hay archivos SQL en el repo: las tablas y RLS se configuraron directo en Supabase. Se desconoce si `ventas`/`productos` están en la publicación `supabase_realtime` (requisito para que `postgres_changes` emita).
- `isAdmin` = `user.email === import.meta.env.VITE_ADMIN_EMAIL` (un único admin por diseño).

## Goals / Non-Goals

**Goals:**
- Que la sesión sobreviva recargas y reinicios del navegador sin código de persistencia nuevo (ya la tiene Supabase; solo no taparla con SSR).
- Guards por rol evaluados en cliente, sin parpadeos de contenido protegido.
- Stock en vivo correcto ante cualquier cambio de `ventas` (incluido borrado), con garantía de re-render.
- Indicador de conexión que refleje el estado real del canal y dispare recarga al reconectar.

**Non-Goals:**
- Gestión de usuarios desde la app (requiere `service_role`; se hace en Supabase dashboard — 5 usuarios no justifican un Edge Function).
- Prevención de sobreventa por carrera verdadera en el servidor (trigger/RPC en Postgres). Queda documentado como techo conocido.
- Endurecimiento general de RLS y rate limiting fuera de la autorización explícita de escritura para `productos` y `dias_evento` descrita en este change.
- Modo offline / service worker de datos.

## Decisions

1. **`export const ssr = false` en `src/routes/+layout.ts`** en vez de montar `@supabase/ssr` con cookies. La app es una PWA 100% cliente (todo dato viene de Supabase en el navegador, no hay SEO); SSR solo aporta el bug de sesión. Una línea vs. una capa de auth server completa. Con `ssr = false` los `load` corren en el navegador y ven la sesión persistida.

2. **Hidratación de auth en el root layout**: `onMount` → `checkAuth()` + `supabase.auth.onAuthStateChange` que mantiene `currentUser` sincronizado (cubre refresh de token, login/logout en otra pestaña). Un solo lugar, todas las rutas cubiertas.

3. **Guards en funciones `load`** (`admin/+layout.ts` existente, `ventas/+layout.ts` nuevo) con `redirect()` nativo de SvelteKit. Rol admin = comparación de email contra `VITE_ADMIN_EMAIL` (misma fuente que `isAdmin`). Alternativa descartada: guard en componente → renderiza contenido protegido un frame antes de redirigir.
   - `/admin/*` (excepto login): sin sesión → `/admin/login`; sesión no-admin → `/ventas`.
   - `/ventas/*`: sin sesión → `/admin/login`.
   - Login y raíz `/`: redirect por rol (admin → `/admin`, vendedor → `/ventas`).

4. **Realtime: recarga completa en vez de conteo incremental.** `subscribeToVentas` pasa a `event: '*'` con un callback sin payload que re-ejecuta `loadVentas()` (el cual reasigna `ventasCount` completo → re-render garantizado). Cubre INSERT, UPDATE y DELETE con menos código que el incremental. El volumen es despreciable (decenas de ventas por día); `ponytail:` si algún día hay miles de ventas simultáneas, cambiar a payload incremental con reasignación.

5. **Estado de conexión desde el canal real.** `subscribeToProductos` gana un parámetro `onStatus(status)` alimentado por el callback de `.subscribe()` (`SUBSCRIBED`/`TIMED_OUT`/`CHANNEL_ERROR`). En la página: `connected = canalOk && navigator.onLine`, más listeners `online`/`offline` de `window`. Al pasar de desconectado → conectado, re-ejecutar `loadProductos()` + `loadVentas()` (los datos pudieron cambiar durante la caída). Se elimina el canal basura `connection-status`.

6. **Guard del detalle (`/ventas/[id]`)**: al cargar, obtener producto + conteo de sus ventas + `diaActual`; mostrar "Quedan X", o estado bloqueado ("Sin stock" / "Día cerrado") con botón deshabilitado. Chequeo client-side: dos vendedores tocando "Vender" a la vez en la última unidad pueden pasarse en la ventana de ~2s hasta que el realtime llega al otro dispositivo. `ponytail:` techo conocido; el cierre real es un trigger/RPC en Postgres si la sobreventa llega a doler.

7. **Navegación**: header de `/ventas` muestra botón "Admin" solo si `$isAdmin` y botón "Salir" siempre (logout → `/admin/login`). Bottom nav mobile de admin: `grid-cols-4` → `grid-cols-5` con ítem "Salir" (desktop ya tiene logout en el header). El panel de inicio admin ya linkea a `/ventas`, no se toca.

8. **RLS por rol en Supabase.** Conservar lectura autenticada de `productos`/`dias_evento` y lectura + inserción autenticada de `ventas`; reemplazar las políticas actuales de `productos` y `dias_evento` para que INSERT/UPDATE/DELETE requieran `auth.jwt()->>'email' = '<VITE_ADMIN_EMAIL>'`. Se usa el email del JWT porque coincide con el único admin existente; los guards de UI no bastan para autorizar escrituras a la API. El SQL se ejecuta manualmente en Dashboard → SQL Editor y debe sustituirse el placeholder por el valor exacto de `VITE_ADMIN_EMAIL`. No dejar políticas permisivas antiguas, porque las políticas RLS permisivas se combinan con OR.

   SQL para aplicar en el dashboard (reemplazar `ADMIN_EMAIL` antes de ejecutar):

   ```sql
   BEGIN;

   DO $$
   DECLARE p record;
   BEGIN
     FOR p IN
       SELECT tablename, policyname
       FROM pg_policies
       WHERE schemaname = 'public' AND tablename IN ('productos', 'dias_evento')
     LOOP
       EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
     END LOOP;
   END $$;

   ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.dias_evento ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;

   CREATE POLICY productos_select_authenticated ON public.productos
     FOR SELECT TO authenticated USING (true);
   CREATE POLICY productos_insert_admin ON public.productos
     FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');
   CREATE POLICY productos_update_admin ON public.productos
     FOR UPDATE TO authenticated
     USING ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL')
     WITH CHECK ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');
   CREATE POLICY productos_delete_admin ON public.productos
     FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');

   CREATE POLICY dias_evento_select_authenticated ON public.dias_evento
     FOR SELECT TO authenticated USING (true);
   CREATE POLICY dias_evento_insert_admin ON public.dias_evento
     FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');
   CREATE POLICY dias_evento_update_admin ON public.dias_evento
     FOR UPDATE TO authenticated
     USING ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL')
     WITH CHECK ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');
   CREATE POLICY dias_evento_delete_admin ON public.dias_evento
     FOR DELETE TO authenticated USING ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');

   COMMIT;
   ```

9. **Solo el admin inicializa el día.** Cambiar `loadDiaActual` para que no inserte un registro si falta por defecto; `/admin/dias` invoca la opción explícita de creación. En `/ventas` y `/ventas/[id]`, ausencia de registro significa "Día no iniciado" y bloquea la venta hasta que el admin cree el día. Así no hace falta permitir escrituras de días a vendedores.

10. **Pasos manuales en Supabase** (documentados en tasks, no hay código):
   - `ALTER PUBLICATION supabase_realtime ADD TABLE ventas, productos, dias_evento;` (idempotente verificar antes con `SELECT * FROM pg_publication_tables`).
   - Crear los 5 vendedores en Dashboard → Authentication → Users → Add user.
   - Verificar `VITE_ADMIN_EMAIL` local/Netlify y probar las políticas nuevas con sesiones de admin y vendedor, incluyendo denegación de escritura directa de vendedor en productos y días.

## Risks / Trade-offs

- [Publicación realtime no habilitada] → sin esto nada del fix de stock funciona y falla en silencio. Mitigación: task explícita de verificación con 2 navegadores antes de dar el change por cerrado.
- [Carrera de sobreventa (~2s)] → aceptada conscientemente; realtime acorta la ventana y el guard del detalle la cubre en el caso común. Mitigación futura: trigger en Postgres.
- [`ssr = false` y deep links en Netlify] → las URLs directas (`/ventas/<uuid>`) dependen del fallback del adapter. Mitigación: probar carga directa de deep link post-deploy.
- [/ventas ahora requiere login] → cambio breaking para quien lo use anónimo. Mitigación: los 5 vendedores reciben cuenta antes del próximo evento; la sesión persiste (se loguean una vez).
- [Token de sesión expira sin red] → `onAuthStateChange` + auto-refresh de Supabase lo cubren; si la sesión muere, los guards redirigen a login.
- [El email del admin cambia y las políticas RLS quedan con el valor anterior] → actualizar la comparación en Supabase junto con `VITE_ADMIN_EMAIL`; cubrirlo en la verificación de políticas.

## Migration Plan

1. Ejecutar el SQL de publicación y crear usuarios en Supabase.
2. Deploy del código a Netlify y aplicar inmediatamente las políticas RLS de productos/días; verificar la autorización con las dos sesiones.
3. El admin visita `/admin/dias` para crear el día antes de que los vendedores abran `/ventas`.
4. Rollback: revert del commit y restaurar las políticas RLS previas si se revierte el change.
