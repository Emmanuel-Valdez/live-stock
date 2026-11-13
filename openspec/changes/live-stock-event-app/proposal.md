## Why

Ukiyo Studio necesita una aplicación ligera para gestionar ventas en eventos físicos con stock en tiempo real. Actualmente no tienen forma de que múltiples vendedores (hasta 5) vean el stock actualizado al instante cuando alguien vende, lo que puede llevar a sobreventa o confusión. La solución debe ser simple, rápida de usar en móviles, y permitir generar reportes de ventas al final de cada día de evento.

## What Changes

- Nueva aplicación web (PWA) con dos vistas: admin (configuración previa y reportes) y ventas (durante el evento)
- Sincronización en tiempo real del stock entre todos los dispositivos conectados
- Registro de ventas con precio editable (para regateo), medio de cobro, y timestamp automático
- Panel de administración para configurar productos, stock inicial, y cerrar días
- Reportes de ventas agrupados por día con totales y desglose por medio de cobro
- Imágenes referenciadas desde ukiyostudio.evaldez.ar (no se suben en la app)
- Interfaz optimizada para pantalla táctil con botones grandes y flujo minimalista

## Capabilities

### New Capabilities
- `admin-setup`: Configuración inicial de productos, stock, y precios por el admin antes del evento
- `realtime-stock`: Sincronización en tiempo real del stock entre todos los vendedores durante el evento
- `sales-registration`: Registro de ventas con precio editable, medio de cobro, y timestamp
- `daily-reports`: Reportes de ventas agrupados por día con totales y desgloses
- `day-management`: Capacidad de cerrar días de evento desde el panel admin

### Modified Capabilities
(ninguna - proyecto nuevo)

## Impact

- Nuevo proyecto frontend en Svelte + Vite + Tailwind
- Nueva base de datos Supabase con tablas: productos, ventas
- Configuración de realtime subscriptions en Supabase
- Auth básico (solo admin)
- Dependencia de URLs de imágenes externas (ukiyostudio.evaldez.ar)
- Hosting en Vercel o Netlify (frontend)
- Conexión a Supabase (backend + DB + realtime)
