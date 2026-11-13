## Purpose

Permite a los vendedores registrar ventas de productos durante el evento, con precio editable (para regateo), selección de medio de cobro, y timestamp automático. Esta es la funcionalidad principal durante la operación del evento.

## ADDED Requirements

### Requirement: Product grid view
El sistema SHALL mostrar una vista de grilla con los productos disponibles, mostrando imagen, nombre, precio sugerido y stock actual. La descripción del producto NO se muestra en la grilla.

#### Scenario: Ver grilla de productos
- **WHEN** el vendedor accede a la vista principal
- **THEN** el sistema muestra una grilla con todos los productos que tienen stock disponible

#### Scenario: Producto sin stock
- **WHEN** un producto tiene stock 0
- **THEN** el sistema lo muestra visualmente diferenciado (tenue o separado) en la grilla

### Requirement: Product detail view
El sistema SHALL permitir al vendedor ver los detalles completos de un producto al tocarlo en la grilla, incluyendo la descripción.

#### Scenario: Ver detalle de producto
- **WHEN** el vendedor toca un producto en la grilla
- **THEN** el sistema muestra una vista de detalle con imagen, nombre, descripción, precio sugerido y stock disponible

### Requirement: Sale registration
El sistema SHALL permitir registrar una venta desde la vista de detalle del producto, con precio pre-llenado con el precio sugerido pero editable.

#### Scenario: Registrar venta con precio sugerido
- **WHEN** el vendedor confirma una venta sin modificar el precio
- **THEN** el sistema registra la venta con el precio sugerido del producto

#### Scenario: Registrar venta con precio diferente (regateo)
- **WHEN** el vendedor modifica el precio antes de confirmar la venta
- **THEN** el sistema registra la venta con el precio ingresado por el vendedor

### Requirement: Payment method selection
El sistema SHALL requerir la selección de un medio de cobro al registrar una venta. Los medios disponibles son: efectivo, transferencia, QR, tarjeta.

#### Scenario: Seleccionar medio de cobro
- **WHEN** el vendedor registra una venta
- **THEN** el sistema presenta las opciones de medio de cobro y requiere seleccionar una antes de confirmar

#### Scenario: Venta sin medio de cobro seleccionado
- **WHEN** el vendedor intenta confirmar una venta sin seleccionar medio de cobro
- **THEN** el sistema muestra un error y no permite confirmar la venta

### Requirement: Automatic timestamp
El sistema SHALL registrar automáticamente la fecha y hora de cada venta al momento de confirmarla.

#### Scenario: Timestamp automático
- **WHEN** se confirma una venta
- **THEN** el sistema registra la fecha y hora exacta de la transacción sin intervención del usuario

### Requirement: Touch-optimized interface
El sistema SHALL tener una interfaz optimizada para pantalla táctil con botones grandes y flujo de trabajo minimalista para registrar ventas rápidamente.

#### Scenario: Interfaz táctil eficiente
- **WHEN** un vendedor usa la app en un teléfono con pantalla táctil
- **THEN** puede completar el flujo de venta (seleccionar producto, confirmar precio, seleccionar medio de cobro, confirmar) en no más de 4 toques

### Requirement: Stock decrement after sale
El sistema SHALL decrementar automáticamente el stock disponible después de registrar una venta exitosa.

#### Scenario: Stock se actualiza tras venta
- **WHEN** se registra una venta de un producto
- **THEN** el stock disponible de ese producto se reduce en la cantidad vendida inmediatamente
