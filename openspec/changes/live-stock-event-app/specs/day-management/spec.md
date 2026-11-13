## Purpose

Permite al administrador cerrar días de evento, marcando el fin de las ventas de esa jornada. Esto facilita la organización de reportes por día y el seguimiento del evento a lo largo de múltiples jornadas.

## ADDED Requirements

### Requirement: Close day from admin panel
El sistema SHALL proporcionar un botón en el panel de administración para cerrar el día actual de evento.

#### Scenario: Cerrar día de evento
- **WHEN** el admin presiona el botón "Cerrar día" en el panel de administración
- **THEN** el sistema marca el día actual como cerrado y registra el timestamp de cierre

#### Scenario: Cierre de día sin ventas
- **WHEN** el admin cierra un día en el que no se registraron ventas
- **THEN** el sistema marca el día como cerrado sin error y genera un reporte vacío para ese día

### Requirement: Prevent sales after day close
El sistema SHALL impedir registrar ventas después de que el día haya sido cerrado.

#### Scenario: Intentar vender después del cierre
- **WHEN** un vendedor intenta registrar una venta después de que el admin cerró el día
- **THEN** el sistema muestra un mensaje indicando que el día está cerrado y no permite registrar la venta

### Requirement: Day status visibility
El sistema SHALL mostrar el estado del día actual (abierto/cerrado) tanto en el panel de administración como en la vista de ventas.

#### Scenario: Ver estado del día en admin
- **WHEN** el admin accede al panel de administración
- **THEN** el sistema muestra claramente si el día actual está abierto o cerrado

#### Scenario: Ver estado del día en vista de ventas
- **WHEN** el vendedor accede a la vista de ventas
- **THEN** el sistema muestra el estado del día actual y, si está cerrado, indica que no se pueden registrar ventas

### Requirement: Reopen closed day
El sistema SHALL permitir al admin reabrir un día cerrado si es necesario (corrección de errores).

#### Scenario: Reabrir día cerrado
- **WHEN** el admin selecciona reabrir un día cerrado
- **THEN** el sistema cambia el estado del día a abierto y permite registrar ventas nuevamente
