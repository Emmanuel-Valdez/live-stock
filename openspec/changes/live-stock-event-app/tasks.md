## 1. Setup y Configuración

- [x] 1.1 Inicializar proyecto Svelte + Vite + Tailwind y verificar que `npm run dev` muestra la pantalla de bienvenida
- [x] 1.2 Crear proyecto en Supabase (proyecto nuevo en supabase.com) y guardar las credenciales (URL, anon key) en `.env`
- [x] 1.3 Instalar `@supabase/supabase-js` y configurar el cliente Supabase en `src/lib/supabase.ts`. Verificar conexión exitosa con un query de prueba
- [x] 1.4 Crear tablas en Supabase: `productos`, `ventas`, `dias_evento` con las columnas definidas en design.md. Verificar que las tablas existen en el dashboard de Supabase
- [x] 1.5 Configurar Supabase Realtime para las tablas `productos` y `ventas`. Verificar que las suscripciones reciben cambios

## 2. Auth Admin

- [x] 2.1 Crear tabla/auth de admin en Supabase (email/password). Verificar que se puede crear un usuario admin desde el dashboard
- [x] 2.2 Crear página de login en `/admin/login` con formulario email/password. Verificar que el login funciona y redirige al panel admin
- [x] 2.3 Crear middleware de auth que protege rutas `/admin/*`. Verificar que sin login se redirige a `/admin/login`
- [x] 2.4 Implementar logout en el panel admin. Verificar que al cerrar sesión se limpia el estado y redirige al login

## 3. Panel Admin - Configuración de Productos

- [x] 3.1 Crear layout del panel admin en `/admin` con navegación a sub-secciones (productos, reportes, gestión de día). Verificar que la navegación funciona
- [x] 3.2 Crear formulario de creación de producto en `/admin/productos/nuevo` con campos: nombre, descripción, URL imagen, precio sugerido. Verificar que se puede crear un producto y aparece en la lista
- [x] 3.3 Crear lista de productos en `/admin/productos` que muestra todos los productos con imagen thumbnail, nombre, precio y stock. Verificar que la lista se actualiza al crear/editar productos
- [x] 3.4 Crear formulario de edición de producto existente. Verificar que los cambios se guardan y reflejan en la lista
- [x] 3.5 Crear campo/input de stock inicial en el formulario de producto. Verificar que el stock se guarda correctamente

## 4. Vista de Ventas - Grilla de Productos

- [x] 4.1 Crear página principal `/ventas` con grilla de productos (imagen, nombre, precio sugerido, stock). Verificar que la grilla muestra todos los productos con stock > 0
- [x] 4.2 Implementar suscripción Realtime en la grilla para actualizar stock cuando cambia. Verificar que al insertar una venta desde Supabase dashboard, el stock se actualiza automáticamente en la grilla
- [x] 4.3 Marcar visualmente productos con stock 0 (tenue o badge "sin stock"). Verificar que se distinguen de los productos disponibles
- [x] 4.4 Optimizar grilla para pantalla táctil: botones grandes, tap para seleccionar producto. Verificar que funciona correctamente en viewport de móvil

## 5. Vista de Ventas - Registro de Venta

- [x] 5.1 Crear vista de detalle de producto al tocar en la grilla: imagen grande, nombre, descripción, precio sugerido, stock. Verificar que al tocar un producto se abre el detalle
- [x] 5.2 Crear formulario de venta en el detalle: campo de precio (pre-llenado con sugerido, editable), selector de medio de cobro (efectivo, transferencia, QR, tarjeta), botón confirmar. Verificar que el precio se puede editar
- [x] 5.3 Implementar validación: medio de cobro requerido antes de confirmar. Verificar que no se puede confirmar sin seleccionar medio de cobro
- [x] 5.4 Al confirmar venta: INSERT en tabla `ventas` con producto_id, precio_venta, medio_cobro, timestamp automático, día actual. Verificar que la venta se registra en Supabase
- [x] 5.5 Decrementar stock después de venta exitosa. Verificar que el stock se actualiza en la grilla inmediatamente después de confirmar
- [x] 5.6 Mostrar confirmación visual post-venta (toast o feedback breve) y volver a la grilla. Verificar que el flujo completo funciona en 4 toques máximo

## 6. Realtime Stock Sync

- [x] 6.1 Configurar Supabase Realtime channel para escuchar cambios en tabla `ventas`. Verificar que nuevos inserts disparan eventos
- [x] 6.2 Al recibir evento de nueva venta, recalcular stock del producto y actualizar estado local. Verificar que dos dispositivos ven el mismo stock después de una venta
- [x] 6.3 Mostrar indicador de estado de conexión (conectado/desconectado) en la vista de ventas. Verificar que el indicador cambia al perder/restaurar conexión
- [x] 6.4 Test manual con 2+ pestañas/navegadores simulando 5 usuarios. Verificar que todas las ventas se reflejan en tiempo real sin sobreventa

## 7. Gestión de Días

- [x] 7.1 Crear tabla `dias_evento` con columnas: id, fecha, estado (abierto/cerrado), cerrado_en. Verificar que se puede insertar un día
- [x] 7.2 Crear botón "Cerrar día" en el panel admin. Verificar que al presionarlo se actualiza el estado del día actual a "cerrado" con timestamp
- [x] 7.3 Mostrar estado del día (abierto/cerrado) en el panel admin y en la vista de ventas. Verificar que el estado es visible en ambas vistas
- [x] 7.4 Impedir registrar ventas cuando el día está cerrado: mostrar mensaje en vista de ventas. Verificar que no se puede vender con día cerrado
- [x] 7.5 Implementar botón "Reabrir día" en panel admin para días cerrados. Verificar que al reabrir se pueden registrar ventas nuevamente

## 8. Reportes

- [x] 8.1 Crear página de reportes en `/admin/reportes` con selector de día y resumen: total vendido, cantidad de ventas, desglose por medio de cobro. Verificar que los totales se calculan con precios de venta reales
- [x] 8.2 Mostrar historial de ventas en la página de reportes: timestamp, producto, precio venta, medio cobro. Ordenar por timestamp descendente. Verificar que el historial muestra todas las ventas del día seleccionado
- [x] 8.3 Implementar filtro de historial por día. Verificar que al seleccionar un día solo se muestran las ventas de ese día
- [x] 8.4 Implementar exportación CSV de ventas por día. Verificar que el archivo descargado contiene fecha, hora, producto, precio y medio de cobro
- [x] 8.5 Implementar exportación CSV de todas las ventas del evento. Verificar que el archivo contiene todas las ventas con sus detalles

## 9. PWA y Mobile Optimization

- [x] 9.1 Agregar `manifest.json` para PWA: nombre, iconos, theme color, display standalone. Verificar que la app es instalable en Chrome/Android
- [x] 9.2 Agregar meta tags para mobile: viewport, apple-mobile-web-app-capable, theme-color. Verificar que se ve bien en iOS Safari
- [x] 9.3 Optimizar CSS para touch: botones mínimo 44x44px, spacing adecuado. Verificar con Chrome DevTools device mode

## 10. Deploy

- [ ] 10.1 Configurar proyecto en Vercel (o Netlify) y conectar con el repo. Verificar que el deploy automático funciona
- [ ] 10.2 Configurar variables de entorno (SUPABASE_URL, SUPABASE_ANON_KEY) en Vercel/Netlify. Verificar que la app funciona en producción
- [ ] 10.3 Configurar dominio personalizado si es necesario. Verificar que la app es accesible desde el dominio final
- [ ] 10.4 Test end-to-end en producción: login admin, crear producto, registrar venta desde móvil, verificar realtime sync, cerrar día, ver reporte. Verificar que todo funciona correctamente en el deploy final
