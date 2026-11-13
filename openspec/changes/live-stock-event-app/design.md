## Context

Proyecto nuevo desde cero para Ukiyo Studio. La aplicación gestionará ventas en eventos físicos con stock en tiempo real para hasta 5 vendedores concurrentes. Las imágenes de productos ya existen en ukiyostudio.evaldez.ar y se referenciarán por URL. WiFi estable en el lugar con datos móviles como backup.

Ver proposal.md para motivación completa.

## Goals / Non-Goals

**Goals:**
- App PWA instalable en teléfonos, optimizada para pantalla táctil
- Sync en tiempo real del stock entre dispositivos (Sub-2 segundos)
- Interfaz minimalista: venta completa en 4 toques máximo
- Reportes por día con exportación CSV
- Deploy en Vercel o Netlify (costo cero o mínimo)

**Non-Goals:**
- Sistema de upload de imágenes (se referencian URLs existentes)
- Identificación individual de vendedores
- Soporte offline (WiFi + datos son suficientes)
- Multi-evento (solo un evento por ahora)
- Gestión de compras o inventario de reposición

## Decisions

### Svelte + Vite + Tailwind para frontend

**Decisión:** Svelte 5 con Vite como bundler y Tailwind CSS para estilos.

**Alternativas consideradas:**
- React + Vite: más ecosystem, pero más boilerplate. Para 5 usuarios y una app de este tamaño, Svelte es más liviano y el reactive model nativo funciona perfecto para realtime sin necesidad de useEffect/useState patterns.
- Vue: viable, pero Svelte tiene menos runtime overhead para este caso.

**Rationale:** Svelte compila a Vanilla JS sin runtime virtual DOM. Con 5 usuarios en teléfonos, el rendimiento es excelente. Menos código = menos bugs. Tailwind para estilos rápidos sin CSS custom.

### Supabase como backend

**Decisión:** Supabase (PostgreSQL + Realtime + Auth).

**Alternativas consideradas:**
- Firebase/Firestore: NoSQL, menos ideal para reportes SQL con GROUP BY por día y medio de cobro.
- Backend propio con WebSockets: más trabajo, y requiere un servidor (no funciona en Vercel serverless).
- PlanetScale + Pusher: más caro, más piezas.

**Rationale:** Supabase ofrece PostgreSQL (ideal para reportes agregados), Realtime subscriptions gratis (perfecto para stock sync), y Auth incluido. Todo en un solo servicio con free tier generoso. El hosting del frontend queda en Vercel/Netlify sin necesidad de servidor propio.

### Realtime via Supabase Realtime subscriptions

**Decisión:** Usar Supabase Realtime con PostgreSQL changes subscriptions para sincronizar stock.

**Alternativas consideradas:**
- Polling cada N segundos: desperdicia requests, no es verdaderamente en tiempo real.
- WebSockets manuales: requiere servidor dedicado.
- Ably/Pusher: servicios adicionales con costo.

**Rationale:** Supabase Realtime usa WebSockets bajo el hood y se integra nativamente con cambios en PostgreSQL. Cuando un INSERT ocurre en la tabla `ventas`, todos los suscriptores reciben el cambio automáticamente. Gratis hasta 200 concurrent connections.

### Imágenes via URL externa

**Decisión:** Almacenar solo URLs de ukiyostudio.evaldez.ar en la base de datos.

**Alternativas consideradas:**
- Subir imágenes a Supabase Storage: duplicaría imágenes que ya existen.
- Base64 en DB: inflaría la base de datos innecesariamente.

**Rationale:** Las imágenes ya están optimizadas y servidas desde la web de Ukiyo Studio. Solo necesitamos las URLs. Si en el futuro se agregan productos con imágenes propias, se puede evaluar Supabase Storage.

### Estructura de datos

**Decisión:** 3 tablas principales + una para el estado de día.

```
productos (id, nombre, descripcion, imagen_url, precio_sugerido, stock_total)
ventas (id, producto_id, precio_venta, medio_cobro, timestamp, dia)
dias_evento (id, fecha, estado, cerrado_en)
```

Stock disponible = stock_total - SUM(cantidad vendida). Se calcula en query o se mantiene como columna calculada.

**Alternativas consideradas:**
- Columna `stock_actual` con trigger: más rápido de leer, pero riesgo de inconsistencia si un trigger falla.
- Vista materializada: overhead de refresh.

**Rationale:** Calcular stock en query es suficiente para el volumen (cientos de productos, no miles). Si hay performance issues, se puede agregar columna calculada después.

### Auth: solo admin

**Decisión:** Auth simplificado con email/password para el admin vía Supabase Auth.

**Rationale:** Solo el admin necesita login (para configurar y ver reportes). Los vendedores acceden directamente a la vista de ventas sin auth. Esto reduce fricción durante el evento.

## Risks / Trade-offs

**[URLs de imágenes rotas]** → Si ukiyostudio.evaldez.ar cambia su estructura de URLs, las imágenes se rompen. Mitigación: las URLs son estables; si cambia, se actualizan en DB.

**[Supabase outage]** → Si Supabase tiene downtime, la app no funciona. Mitigación: Supabase tiene SLA 99.9%. Para un evento de horas, el riesgo es aceptable. Alternativa manual: papel y lápiz como backup.

**[Sin offline]** → Si WiFi y datos fallan simultáneamente, no se puede vender. Mitigación: el usuario confirmó que solo espera microcortes. Si se necesita offline en el futuro, se puede agregar con sync posterior.

**[Sin identificación de vendedores]** → No se puede rastrear quién vendió qué. Mitigación: requisito explícito del usuario. Si se necesita después, se requiere agregar auth de vendedores.

**[Single event]** → La app está diseñada para un evento. Reutilizar para otro evento requiere limpiar la DB o agregar tabla de eventos. Mitigación: si se confirma multi-evento futuro, se agrega tabla `eventos` desde el inicio.
