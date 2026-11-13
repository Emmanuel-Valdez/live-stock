## Purpose

Permite al administrador consultar reportes de ventas agrupados por día, con totales generales, desglose por medio de cobro, y exportación de datos. Los balances se calculan en base a los precios de venta reales registrados.

## ADDED Requirements

### Requirement: Daily sales summary
El sistema SHALL mostrar un resumen de ventas por día con total vendido, cantidad de ventas, y desglose por medio de cobro.

#### Scenario: Ver resumen de un día
- **WHEN** el admin selecciona un día específico en el panel de reportes
- **THEN** el sistema muestra el total vendido, cantidad de ventas, y desglose por medio de cobro de ese día

#### Scenario: Ver resumen de múltiples días
- **WHEN** el admin consulta el reporte general del evento
- **THEN** el sistema muestra los totales agrupados por día

### Requirement: Sales based on actual prices
El sistema SHALL calcular todos los balances y totales en base a los precios de venta reales registrados (incluyendo regateos), no los precios sugeridos.

#### Scenario: Cálculo con precio de venta real
- **WHEN** un producto se vendió a un precio diferente al sugerido
- **THEN** el reporte refleja el precio de venta real en los totales

### Requirement: Payment method breakdown
El sistema SHALL desglosar las ventas por medio de cobro (efectivo, transferencia, QR, tarjeta) dentro de cada día.

#### Scenario: Desglose por medio de cobro
- **WHEN** el admin consulta el reporte de un día
- **THEN** el sistema muestra el total vendido y cantidad de ventas para cada medio de cobro

### Requirement: Sales history with timestamps
El sistema SHALL mostrar el historial completo de ventas con timestamp (fecha y hora), producto, precio de venta, y medio de cobro.

#### Scenario: Ver historial de ventas
- **WHEN** el admin accede al historial de ventas
- **THEN** el sistema muestra todas las ventas ordenadas por fecha/hora descendente con todos los detalles

#### Scenario: Filtrar historial por día
- **WHEN** el admin filtra el historial por un día específico
- **THEN** el sistema muestra solo las ventas de ese día

### Requirement: Export sales data
El sistema SHALL permitir exportar los datos de ventas en formato CSV para procesamiento externo.

#### Scenario: Exportar reporte diario
- **WHEN** el admin solicita exportar las ventas de un día
- **THEN** el sistema genera y descarga un archivo CSV con todas las ventas de ese día

#### Scenario: Exportar reporte completo del evento
- **WHEN** el admin solicita exportar todas las ventas del evento
- **THEN** el sistema genera y descarga un archivo CSV con todas las ventas con fecha, hora, producto, precio y medio de cobro
