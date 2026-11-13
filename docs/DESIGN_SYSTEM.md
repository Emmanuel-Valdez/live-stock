# Sistema de Diseño - Live Stock / Ukiyo Studio

## Contexto

App para vendedores en eventos físicos, mobile-first. El diseño debe transmitir:
- **Velocidad**: todo ocurre en vivo, no hay tiempo que perder
- **Claridad**: decisión instantánea bajo presión (stock 0, día cerrado)
- **Artesanía**: Ukiyo Studio es un estudio de arte, merece identidad distintiva

## Paleta

Inspirada en la paleta tradicional japonesa (Nippon Colors) pero adaptada a UI moderna:

| Token | Hex | Uso |
|-------|-----|-----|
| `bg` | `#fafaf7` | Fondo general, warm off-white |
| `surface` | `#ffffff` | Cards, modales |
| `ink` | `#1a1a1a` | Texto primario |
| `ink-muted` | `#6b6560` | Texto secundario, labels |
| `border` | `#e5e2dd` | Bordes sutiles |
| `accent` | `#1e3a5f` | Primario: botones CTA, links |
| `accent-hover` | `#15304f` | Hover state |
| `success` | `#2d5016` | Stock disponible, día abierto |
| `success-bg` | `#e8f0e0` | Fondo success |
| `danger` | `#a13b2b` | Sin stock, día cerrado, errores |
| `danger-bg` | `#f5e5e2` | Fondo danger |
| `warning` | `#8a5a00` | Warnings |
| `warning-bg` | `#fdf0d5` | Fondo warning |

## Tipografía

- **Display**: `Georgia, 'Times New Roman', serif` — títulos con personalidad artesanal
- **Body**: `system-ui, -apple-system, 'Segoe UI', sans-serif` — UI nativa, rápida
- **Mono**: `ui-monospace, 'SF Mono', monospace` — precios, stock (datos numéricos)

### Escala

```
xs: 12px / 0.75rem  (badges, timestamps)
sm: 14px / 0.875rem (labels, helpers)
base: 16px / 1rem   (body, inputs)
lg: 18px / 1.125rem (subtítulos)
xl: 20px / 1.25rem  (h3)
2xl: 24px / 1.5rem  (h2)
3xl: 30px / 1.875rem (h1)
```

## Layout Mobile-First

### Breakpoints
```
mobile:  < 640px   (base, 1 col o 2 col productos)
tablet:  640-1024px (3 col productos)
desktop: > 1024px   (4 col productos, top nav)
```

### Touch Targets
```
Minimum: 48x48px
Ideal: 56x56px para acciones primarias
Spacing entre targets: 12px mínimo
```

### Grilla de productos
- **Mobile (base)**: 2 columnas, gap 12px
- **Tablet (sm)**: 3 columnas
- **Desktop (lg)**: 4 columnas
- Cards clickeables completas (no solo imagen)
- Aspect ratio imagen: 1:1 (evita CLS)

## Componentes

### Botones
```css
/* Primario */
min-height: 48px;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
/* Active state: scale(0.98) + vibración si disponible */

/* Secundario */
border: 1px solid currentColor;
background: transparent;
```

### Cards de producto
```css
border-radius: 12px;
overflow: hidden;
box-shadow: 0 1px 3px rgba(0,0,0,0.04);
/* Hover: solo en desktop, shadow más pronunciado */
/* Active: scale(0.97), shadow reduce */
```

### Inputs
```css
min-height: 48px;
padding: 12px 16px;
border-radius: 8px;
border: 1px solid border;
font-size: 16px; /* evita zoom en iOS */
/* Focus: ring 2px accent */
```

## Estados Críticos

### Stock 0
- Overlay sobre imagen con `bg-black/60`
- Texto blanco "SIN STOCK" en bold
- Card deshabilitada (opacity 0.5, pointer-events none)

### Día cerrado
- Banner rojo fijo en top con mensaje
- Botón de venta deshabilitado
- Icono 🔒 visible

### Conexión perdida
- Badge rojo "Sin conexión" en header
- Mensaje persistente, no toast que desaparece

## Animaciones

```css
/* Respetar prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

/* Transitions sutiles */
transition: all 150ms ease-out;

/* Active state (feedback táctil) */
&:active { transform: scale(0.98); }
```

## Accesibilidad (WCAG 2.2 AA)

- Labels explícitos en todos los inputs
- Focus states: 2px solid accent, offset 2px
- Contraste mínimo 4.5:1 (texto), 3:1 (UI)
- Alt text descriptivo en imágenes de producto
- Aria-live para actualizaciones de stock
- Skip link para navegación por teclado
- Roles ARIA donde sea necesario (alert, status)

## Principios de Copy

- **Verbos activos**: "Vender", "Cerrar día", no "Confirmar", "Procesar"
- **Sin jerga técnica**: el vendedor no necesita saber qué es "Realtime"
- **Mensajes de error claros**: qué pasó + cómo resolverlo
- **Tono**: directo, calmado, profesional pero cercano
