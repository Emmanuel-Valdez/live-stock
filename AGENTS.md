# Live Stock - Event App

## Project Overview

Aplicación web para gestionar ventas en eventos físicos con stock en tiempo real para Ukiyo Studio.
Permite que hasta 5 vendedores en dispositivos móviles vean stock actualizado al instante cuando alguien vende.

## Tech Stack

**Frontend:**
- Svelte 5 + Vite
- Tailwind CSS
- PWA (instalable en móviles)

**Backend:**
- Supabase (PostgreSQL + Realtime + Auth)
- Imágenes: URLs a ukiyostudio.evaldez.ar (no se suben en la app)

**Hosting:**
- Frontend: Vercel o Netlify
- Backend: Supabase Cloud

## Project Structure

```
live_stock/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── stores/              # Svelte stores (auth, productos, ventas)
│   │   └── utils/               # Utilidades (formato, validaciones)
│   ├── routes/
│   │   ├── admin/               # Panel de administración
│   │   │   ├── login/           # Login admin
│   │   │   ├── productos/       # Gestión de productos
│   │   │   ├── reportes/        # Reportes de ventas
│   │   │   └── +layout.svelte   # Layout admin con navegación
│   │   ├── ventas/              # Vista de ventas (durante evento)
│   │   │   ├── +page.svelte     # Grilla de productos
│   │   │   └── [producto]/      # Detalle y registro de venta
│   │   └── +layout.svelte       # Layout root
│   └── app.html
├── static/
│   └── manifest.json            # PWA manifest
├── openspec/
│   └── changes/
│       └── live-stock-event-app/  # Change activo
├── .env                          # Variables Supabase (no commitear)
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tailwind.config.js
```

## Responsibilities / Módulos

### 1. **Admin Setup** (`/admin/*`)
- Auth de admin (login/logout)
- Gestión de productos (CRUD)
- Configuración de stock inicial
- Precios sugeridos

### 2. **Realtime Stock** (shared store + Supabase Realtime)
- Suscripción a cambios en tabla `ventas`
- Actualización automática de stock en todos los dispositivos
- Indicador de conexión

### 3. **Sales Registration** (`/ventas/*`)
- Grilla de productos con stock
- Detalle de producto con descripción
- Formulario de venta (precio editable, medio cobro)
- Optimización táctil

### 4. **Daily Reports** (`/admin/reportes/*`)
- Resumen por día (totales, desglose por medio cobro)
- Historial de ventas con timestamps
- Exportación CSV

### 5. **Day Management** (shared entre admin y ventas)
- Estado del día (abierto/cerrado)
- Botón cerrar día en admin
- Bloqueo de ventas cuando día cerrado

## Database Schema (Supabase)

```sql
-- Productos configurados por admin
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT NOT NULL,
  precio_sugerido DECIMAL(10,2) NOT NULL,
  stock_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ventas registradas durante el evento
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id),
  precio_venta DECIMAL(10,2) NOT NULL,
  medio_cobro TEXT NOT NULL CHECK (medio_cobro IN ('efectivo', 'transferencia', 'qr', 'tarjeta')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  dia DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Gestión de días del evento
CREATE TABLE dias_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE UNIQUE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  cerrado_en TIMESTAMPTZ
);
```

## Key Commands

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo (http://localhost:5173)
npm run build            # Build para producción
npm run preview          # Preview del build

# Supabase
# Configurar variables en .env:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxx

# Deploy
# Vercel: conectar repo, agregar variables de entorno
# Netlify: conectar repo, agregar variables de entorno
```

## Session Startup Checklist

Cuando inicies una sesión en este proyecto:

1. **Verificar changes pendientes de OpenSpec:**
   ```bash
   openspec list --json
   ```
   - Si hay changes activos, leer su status: `openspec status --change "<name>" --json`
   - Leer artifacts existentes para contexto (proposal.md, design.md, specs/, tasks.md)

2. **Verificar setup:**
   - ¿Existe `node_modules/`? Si no: `npm install`
   - ¿Existe `.env`? Si no, crear con credenciales de Supabase
   - ¿Supabase está configurado? Verificar tablas en dashboard

3. **Entender estado actual:**
   - Leer `openspec/changes/live-stock-event-app/tasks.md` para ver progreso
   - Identificar qué tareas están completadas (`[x]`) vs pendientes (`[ ]`)
   - Continuar desde la siguiente tarea pendiente

## Development Guidelines

### Principio #1: Mobile-first (OBLIGATORIO)

**Esta app se usa en teléfonos durante eventos en vivo.** Toda decisión de diseño pasa por el filtro mobile-first. No es una preferencia, es el caso de uso principal.

- **Touch targets:** mínimo 48x48px (botones, cards clickeables, selects)
- **Tipografía:** base 16px mínimo, nunca reducir a 14px en mobile
- **Espaciado:** padding vertical entre elementos interactivos mínimo 12px para evitar toques accidentales
- **Grilla productos:** 2 columnas en mobile (NUNCA 3-4), 3-4 solo en tablet+
- **Navegación:** bottom nav en mobile, no top nav con dropdowns
- **Imágenes:** lazy loading, aspect-ratio definido para evitar CLS
- **Formularios:** inputs con `inputmode` correcto (numeric para precios/stock, email para emails)
- **Feedback háptico visual:** todo toque debe tener respuesta inmediata (scale, color, vibration si disponible)
- **Estados críticos visibles:** stock 0, día cerrado, conexión perdida — siempre visibles en viewport
- **Sin hover en mobile:** toda funcionalidad debe funcionar sin hover state
- **Loading states:** skeleton screens, no spinners que bloquean viewport
- **Viewport lock:** scroll vertical nativo, nunca horizontal en mobile
- **Contraste:** WCAG 2.2 AA mínimo (4.5:1 texto, 3:1 UI)
- **Reduced motion:** respetar `prefers-reduced-motion`

**Test obligatorio:** antes de considerar una feature completa, verificar en viewport 375x667 (iPhone SE). Si no funciona ahí, no funciona.

### Otras guías

- **Idioma:** Solo español (UI, mensajes, commits)
- **Realtime:** Usar Supabase Realtime subscriptions, no polling
- **Imágenes:** Solo URLs externas (ukiyostudio.evaldez.ar), no upload
- **Precios:** Siempre usar precios de venta reales para reportes (no sugeridos)
- **Touch UX:** Venta completa en máximo 4 toques

## Current Status

Change activo: `live-stock-event-app`
- Progreso: 43/45 tareas completadas (96%)
- Deploy completado en Netlify: https://lsukiyo.netlify.app/
- Diseño mobile-first implementado con sistema de diseño completo

### Próximos pasos para próxima sesión:

1. **Test end-to-end en producción (10.4)**
   - Login como admin en https://lsukiyo.netlify.app/admin/login
   - Crear un producto de prueba con imagen de ukiyostudio.evaldez.ar
   - Registrar venta desde móvil (probar en 2 dispositivos)
   - Verificar realtime sync entre dispositivos
   - Cerrar día desde admin/dias
   - Ver reportes con exportación CSV

2. **Dominio personalizado (10.3) - opcional**
   - Configurar en Netlify → Domain settings
   - Agregar DNS records si es necesario

3. **Detalles de pulido pendientes**
   - Agregar iconos PWA (icon-192.png, icon-512.png) en /static
   - Probar accesibilidad con screen reader
   - Verificar rendimiento en móvil real (no solo DevTools)
   - Test offline (aunque no es requisito, verificar que no rompe)

4. **Mejoras de seguridad (opcional para producción)**
   - Implementar middleware para verificar que solo el email admin puede acceder a /admin/*
   - Refinar políticas RLS en Supabase (actualmente abiertas para authenticated)
   - Considerar rate limiting para endpoints críticos
