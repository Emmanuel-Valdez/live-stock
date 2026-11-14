## MODIFIED Requirements

### Requirement: Real-time stock synchronization
El sistema SHALL sincronizar el stock disponible en tiempo real entre todos los dispositivos conectados ante cualquier cambio en las ventas (alta, modificación o borrado), sin requerir recarga manual de la página.

#### Scenario: Venta registrada actualiza stock en todos los dispositivos
- **WHEN** un vendedor registra una venta de un producto
- **THEN** todos los dispositivos conectados ven el stock actualizado del producto en menos de 2 segundos, sin recargar la página

#### Scenario: Borrado de venta errónea restaura stock
- **WHEN** se borra una venta registrada por error
- **THEN** el stock disponible del producto se restaura en todos los dispositivos conectados

#### Scenario: Múltiples ventas simultáneas
- **WHEN** dos vendedores en dispositivos diferentes registran ventas del mismo producto simultáneamente
- **THEN** el sistema procesa ambas ventas y el stock refleja ambas transacciones correctamente

### Requirement: Stock consistency
El sistema SHALL mantener la consistencia del stock, bloqueando las ventas que excedan el stock disponible.

#### Scenario: Venta con stock insuficiente
- **WHEN** un vendedor intenta registrar una venta pero el stock disponible es 0
- **THEN** el sistema bloquea la venta y muestra un mensaje claro de producto sin stock

#### Scenario: Stock llega a cero
- **WHEN** la última unidad de un producto es vendida
- **THEN** el sistema marca visualmente el producto como sin stock en todos los dispositivos en menos de 2 segundos

### Requirement: Connection status awareness
El sistema SHALL indicar al usuario si su conexión de tiempo real está activa, basándose en el estado real del canal de sincronización y la conectividad del dispositivo.

#### Scenario: Conexión activa
- **WHEN** el canal de tiempo real está suscrito correctamente y el dispositivo tiene conectividad
- **THEN** el sistema muestra un indicador visual de conexión activa (verde)

#### Scenario: Pérdida de conexión
- **WHEN** el canal de tiempo real se cae, falla o el dispositivo pierde conectividad
- **THEN** el sistema muestra un indicador de desconexión (rojo) y advierte que el stock visible puede estar desactualizado

#### Scenario: Reconexión automática
- **WHEN** la conexión de tiempo real se restablece tras una caída
- **THEN** el sistema recarga automáticamente los datos de productos y ventas y vuelve a mostrar el indicador activo
