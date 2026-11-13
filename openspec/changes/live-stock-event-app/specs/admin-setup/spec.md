## Purpose

Permite al administrador configurar los productos, precios y stock inicial antes de que comience el evento. Esta configuración es la base para que los vendedores puedan operar durante el evento.

## ADDED Requirements

### Requirement: Admin authentication
El sistema SHALL requerir autenticación para acceder al panel de administración. Solo usuarios autorizados podrán configurar productos y gestionar el evento.

#### Scenario: Admin login exitoso
- **WHEN** el admin ingresa credenciales válidas
- **THEN** el sistema le concede acceso al panel de administración

#### Scenario: Admin login fallido
- **WHEN** el admin ingresa credenciales inválidas
- **THEN** el sistema muestra mensaje de error y no concede acceso

### Requirement: Product creation
El sistema SHALL permitir al admin crear productos con nombre, descripción, imagen (URL o selección de existentes en ukiyostudio.evaldez.ar), y precio sugerido.

#### Scenario: Crear producto nuevo
- **WHEN** el admin completa el formulario de producto con todos los campos requeridos
- **THEN** el sistema guarda el producto y lo muestra en la lista de productos configurados

#### Scenario: Crear producto con URL de imagen externa
- **WHEN** el admin ingresa una URL de imagen de ukiyostudio.evaldez.ar
- **THEN** el sistema almacena la URL y la usa para mostrar el producto

### Requirement: Stock initialization
El sistema SHALL permitir al admin asignar stock inicial a cada producto antes de iniciar el evento.

#### Scenario: Asignar stock inicial
- **WHEN** el admin ingresa la cantidad de stock para un producto
- **THEN** el sistema guarda esa cantidad como stock disponible para la venta

#### Scenario: Actualizar stock antes del evento
- **WHEN** el admin modifica la cantidad de stock de un producto antes de que se registren ventas
- **THEN** el sistema actualiza el stock disponible con el nuevo valor

### Requirement: Product listing
El sistema SHALL mostrar al admin la lista completa de productos configurados con su stock asignado.

#### Scenario: Ver productos configurados
- **WHEN** el admin accede a la lista de productos
- **THEN** el sistema muestra todos los productos con nombre, imagen, precio sugerido y stock asignado

#### Scenario: Ver stock disponible
- **WHEN** el admin consulta un producto específico
- **THEN** el sistema muestra el stock total asignado y el stock disponible (total menos ventas)

### Requirement: Price configuration
El sistema SHALL permitir al admin configurar un precio sugerido para cada producto.

#### Scenario: Establecer precio sugerido
- **WHEN** el admin ingresa un precio sugerido para un producto
- **THEN** el sistema guarda ese precio como referencia para las ventas
