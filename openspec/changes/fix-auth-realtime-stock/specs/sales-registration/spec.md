## MODIFIED Requirements

### Requirement: Product detail view
El sistema SHALL permitir al vendedor ver los detalles completos de un producto al tocarlo en la grilla, incluyendo la descripción y el stock disponible restante.

#### Scenario: Ver detalle de producto
- **WHEN** el vendedor toca un producto con stock en la grilla
- **THEN** el sistema muestra una vista de detalle con imagen, nombre, descripción, precio sugerido y cuántas unidades quedan

#### Scenario: Detalle de producto sin stock
- **WHEN** el vendedor accede al detalle de un producto con stock 0 (incluso mediante URL directa)
- **THEN** el sistema muestra el estado "Sin stock" y deshabilita el botón de venta

#### Scenario: Detalle con día cerrado
- **WHEN** el vendedor accede al detalle de cualquier producto mientras el día está cerrado
- **THEN** el sistema muestra el aviso de día cerrado y deshabilita el botón de venta

#### Scenario: Detalle sin día iniciado
- **WHEN** el vendedor accede a ventas antes de que el admin cree el registro del día
- **THEN** el sistema muestra "Día no iniciado" y bloquea la venta hasta que el admin inicie el día
