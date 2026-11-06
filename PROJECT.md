# NIX IMPORTS - Sistema ERP para Importadora

## Contexto del Negocio

**Empresa:** NIX IMPORTS — importadora que opera como intermediaria entre proveedores internacionales y clientes locales.

**Moneda de operación:** Los productos se compran en USD (dólares) y se cotizan/cobran al cliente en moneda local. El admin registra los montos en USD y el sistema debe mostrar el equivalente en moneda local (tipo de cambio manual por ahora).

**Modelo de negocio:** La empresa NO compra inventario propio de tecnología. Funciona bajo demanda: el cliente pide, la empresa importa y cobra comisión por el servicio. La ganancia principal es la comisión sobre cada importación.

### Líneas de negocio

**1. Productos Tecnológicos (MVP1) — Importación por encargo**
- El cliente quiere un producto específico (celular, laptop, tablet, accesorios, etc.)
- Puede traerlo de: eBay, Amazon, tiendas de USA, etc.
- NIX IMPORTS se encarga de: comprar, gestionar el envío internacional, pasar aduana, y entregar al cliente
- Se cobra: precio del producto + costos de importación + comisión (% configurable)
- Tipos de cliente: personas individuales (la mayoría), a veces pequeños negocios

**2. Perfumes (MVP futuro) — Compra y reventa**
- La empresa importa lotes de perfumes directamente de proveedores
- Se vende a dos tipos de clientes:
  - **Minoristas:** compran pocas unidades a precio más alto
  - **Mayoristas:** compran en volumen a precio con descuento
- Aquí SÍ hay inventario propio que gestionar

**Alcance actual:** Solo panel de administrador. No hay portal de cliente ni app móvil.

---

## MVP1 - Gestión de Importaciones de Productos Tecnológicos

### Flujo del negocio (paso a paso)
1. **Solicitud:** Cliente contacta a NIX IMPORTS (WhatsApp, presencial, etc.) y dice qué producto quiere
2. **Registro:** Admin crea el pedido en el sistema con los datos del cliente y el producto (link, descripción)
3. **Cotización:** Admin investiga precios, ingresa costos (producto + envío + impuestos) y el sistema calcula el total con comisión
4. **Aprobación:** Se le envía la cotización al cliente. Si acepta, el pedido pasa a "Aprobado" y el cliente paga (total o anticipo)
5. **Compra:** Admin realiza la compra en el sitio de origen (eBay, Amazon, etc.) y registra el comprobante
6. **Tránsito:** El producto está en camino. Se registra número de tracking y se monitorea
7. **Recepción:** Producto llega a la bodega/oficina de NIX IMPORTS. Se registra en inventario temporal
8. **Entrega:** Se entrega al cliente, se confirma recepción y se cierra el pedido

### Canales de contacto con el cliente
- WhatsApp (principal)
- Presencial
- El sistema NO tiene portal de cliente — toda la comunicación es externa

### Categorías de productos tecnológicos
- Celulares / Smartphones
- Laptops / Notebooks
- Tablets
- Accesorios (cargadores, cases, audífonos, etc.)
- Otros (consolas, componentes, etc.)

---

## Product Backlog - MVP1

### Epic 1: Gestión de Pedidos de Importación

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-001 | Registrar pedido de importación | Alta | 8 | 1 |
| NIX-002 | Calcular costo total y cotización | Alta | 5 | 1 |
| NIX-003 | Cambiar estado del pedido | Alta | 5 | 1 |
| NIX-004 | Listar pedidos con filtros | Alta | 5 | 1 |
| NIX-005 | Registrar link de compra y tracking | Media | 3 | 2 |

### Epic 2: Gestión de Clientes

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-006 | Registrar clientes | Alta | 5 | 1 |
| NIX-007 | Historial de pedidos por cliente | Media | 3 | 2 |

### Epic 3: Inventario

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-008 | Registrar productos en almacén | Alta | 5 | 2 |
| NIX-009 | Marcar producto como entregado | Alta | 3 | 2 |
| NIX-010 | Ver inventario actual | Media | 5 | 2 |

### Epic 4: Configuración y Costos

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-011 | Configurar comisión | Alta | 3 | 1 |
| NIX-012 | Registrar costos adicionales por pedido | Media | 5 | 2 |

### Epic 5: Dashboard

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-013 | Dashboard resumen del negocio | Media | 8 | 2 |

### Epic 6: Reportes y Búsqueda

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-014 | Generar reportes de ventas y comisiones | Alta | 8 | 3 |
| NIX-015 | Búsqueda global de pedidos, clientes e inventario | Media | 5 | 3 |

### Epic 7: Notificaciones y Alertas

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-016 | Alertas de pedidos estancados y pendientes | Media | 5 | 3 |

### Epic 8: Configuración Avanzada

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-017 | Configurar tipo de cambio USD a moneda local | Alta | 3 | 3 |

### Epic 9: Pulido de UI/UX

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-018 | Mejorar experiencia de usuario y diseño responsive | Media | 5 | 3 |

### Epic 11: Ventas de Perfumes

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-024 | Registrar venta de perfumes | Alta | 8 | 5 |
| NIX-025 | Listar ventas con filtros | Alta | 5 | 5 |
| NIX-026 | Detalle y anulación de venta | Alta | 5 | 5 |
| NIX-028 | Reporte de ventas de perfumes | Alta | 8 | 5 |
| NIX-029 | Integrar ventas en navegación y dashboard | Media | 3 | 5 |

### Epic 12: Trazabilidad de Proveedores

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-027 | Historial de compras a proveedores | Media | 5 | 5 |

### Epic 13: Dashboard Avanzado

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-030 | Dashboard unificado con métricas de ambos negocios | Alta | 8 | 6 |
| NIX-031 | Gráficos de tendencia de ingresos y pedidos | Alta | 8 | 6 |

### Epic 14: Reportes Financieros

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-032 | Reporte financiero consolidado (importaciones + perfumes) | Alta | 8 | 6 |
| NIX-033 | Reporte de rentabilidad por línea de negocio | Media | 5 | 6 |

### Epic 15: Métricas y Análisis

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-034 | Métricas de clientes y ranking de compradores | Media | 5 | 6 |
| NIX-035 | Indicadores de rendimiento (KPIs) configurables en dashboard | Media | 5 | 6 |

### Epic 16: Autenticación y Gestión de Sesiones

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-036 | Autenticación segura con Supabase Auth | Alta | 8 | 7 |
| NIX-037 | Gestión segura de sesiones y tokens | Alta | 5 | 7 |

### Epic 17: Control de Acceso y Autorización

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-038 | Roles y permisos de usuario (RBAC) | Alta | 8 | 7 |
| NIX-039 | Row Level Security (RLS) en todas las tablas | Alta | 8 | 7 |

### Epic 18: Auditoría y Trazabilidad

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-040 | Registro de auditoría de operaciones críticas | Alta | 8 | 7 |

### Epic 19: Protección y Respaldo de Datos

| ID | Historia de Usuario | Prioridad | Puntos | Sprint |
|----|-------------------|-----------|--------|--------|
| NIX-041 | Respaldo y recuperación de datos | Media | 5 | 7 |
| NIX-042 | Protección contra ataques comunes (XSS, inyección, CSRF) | Alta | 5 | 7 |

### Resumen de puntos

| Sprint | Historias | Puntos totales |
|--------|-----------|----------------|
| 1 | NIX-001, 002, 003, 004, 006, 011 | **31** |
| 2 | NIX-005, 007, 008, 009, 010, 012, 013 | **32** |
| 3 | NIX-014, 015, 016, 017, 018 | **26** |
| 4 | NIX-019, 020, 021, 022, 023 | **29** |
| 5 | NIX-024, 025, 026, 027, 028, 029 | **34** |
| 6 | NIX-030, 031, 032, 033, 034, 035 | **39** |
| 7 | NIX-036, 037, 038, 039, 040, 041, 042 | **47** |

---

## Roadmap General

**Dedicación:** ~2 horas diarias
**Duración de sprint:** 2 semanas (≈28 horas por sprint)
**Inicio del proyecto:** 2026-10-28
**Estimación total:** ~4 meses (8 sprints)

| Sprint | Fechas | Enfoque | MVP |
|--------|--------|---------|-----|
| 1 | 28 Oct - 10 Nov | Core: clientes, pedidos, cotización, estados | MVP1 |
| 2 | 11 Nov - 24 Nov | Tracking, inventario, costos adicionales, dashboard básico | MVP1 |
| 3 | 25 Nov - 08 Dic | Reportes, búsqueda avanzada, notificaciones, pulido UI | MVP1 |
| 4 | 09 Dic - 22 Dic | Módulo perfumes: catálogo, precios mayorista/minorista | MVP2 |
| 5 | 23 Dic - 05 Ene | Ventas de perfumes, stock, gestión de proveedores | MVP2 |
| 6 | 06 Ene - 19 Ene | Dashboard avanzado, reportes financieros, métricas | MVP3 |
| 7 | 20 Ene - 02 Feb | Roles/permisos, auditoría, respaldos, seguridad | MVP3 |
| 8 | 03 Feb - 16 Feb | Testing final, bugfixes, deploy producción, documentación | Release |

---

## Sprint 1 - Scope

**Fechas:** 28 Oct - 10 Nov 2026
**Objetivo:** Poder registrar un pedido completo desde la solicitud hasta la cotización.

**Historias incluidas:** NIX-001, NIX-002, NIX-003, NIX-004, NIX-006, NIX-011

### NIX-001: Registrar pedido de importación
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 1
**Como** admin, **quiero** registrar un nuevo pedido de importación con los datos del cliente y el producto solicitado, **para** tener control de cada solicitud.

**Descripción:**
El admin recibe una solicitud de un cliente que quiere importar un producto tecnológico (celular, laptop, etc.) desde un sitio como eBay o Amazon. Debe poder crear un pedido asociando al cliente, describiendo el producto y registrando el link de origen.

**Criterios de aceptación:**
- [x] Puedo crear un pedido seleccionando un cliente existente o creando uno nuevo desde el formulario
- [x] Puedo ingresar: nombre del producto, descripción, URL de origen, categoría (celular/laptop/tablet/otro)
- [x] El pedido se crea con estado "Solicitado" y fecha de creación automática
- [x] El pedido genera un código único visible (NIX-XXXX)
- [x] Se muestra confirmación al guardar exitosamente
- [x] No puedo crear un pedido sin cliente ni producto

---

### NIX-002: Calcular costo total y cotización
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 1
**Como** admin, **quiero** calcular el costo total del pedido (precio + envío + impuestos + comisión), **para** generar una cotización al cliente.

**Descripción:**
Una vez registrado el pedido, el admin ingresa los costos reales del producto. El sistema calcula automáticamente la comisión según el porcentaje configurado y muestra el costo total que se le cobrará al cliente.

**Criterios de aceptación:**
- [x] Puedo ingresar: precio del producto (USD), costo de envío internacional, impuestos estimados
- [x] El sistema aplica automáticamente el % de comisión configurado (NIX-011)
- [x] Se muestra un desglose: precio + envío + impuestos + comisión = total
- [x] Puedo ajustar la comisión manualmente para un pedido específico si es necesario
- [x] Al guardar la cotización, el estado cambia automáticamente a "Cotizado"
- [x] El total se muestra en la moneda local

---

### NIX-003: Cambiar estado del pedido
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 1
**Como** admin, **quiero** cambiar el estado de un pedido, **para** rastrear el progreso de cada importación.

**Descripción:**
Los pedidos pasan por un flujo definido. El admin debe poder avanzar (o retroceder) el estado del pedido, y cada cambio debe quedar registrado con fecha.

**Criterios de aceptación:**
- [x] Puedo cambiar el estado siguiendo el flujo: Solicitado → Cotizado → Aprobado → Comprado → En tránsito → Recibido → Entregado
- [x] Puedo marcar un pedido como "Cancelado" desde cualquier estado (excepto Entregado)
- [x] Cada cambio de estado registra la fecha automáticamente
- [x] Se muestra visualmente el estado actual y el historial de cambios
- [x] No puedo saltar estados (ej: de Solicitado a Comprado directamente)

---

### NIX-004: Listar pedidos con filtros
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 1
**Como** admin, **quiero** ver una lista de todos los pedidos con filtros por estado y fecha, **para** gestionar el trabajo pendiente.

**Descripción:**
Vista principal de pedidos en formato tabla con la información más relevante y filtros para encontrar rápidamente lo que se necesita.

**Criterios de aceptación:**
- [x] Veo una tabla con: código, cliente, producto, estado, fecha de solicitud, total
- [x] Puedo filtrar por estado (uno o varios)
- [x] Puedo filtrar por rango de fechas
- [x] Puedo buscar por nombre de cliente o producto
- [x] Puedo ordenar por fecha o estado
- [x] Al hacer clic en un pedido, voy a su detalle
- [x] Veo un contador de resultados

---

### NIX-005: Registrar link de compra y tracking
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 3 | **Sprint:** 2
**Como** admin, **quiero** registrar el link de compra y los datos de seguimiento de un pedido, **para** localizar el producto comprado y monitorear su tránsito.

**Descripción:**
Después de realizar la compra, el admin puede guardar el enlace utilizado para comprar el producto, el número de tracking y el enlace de seguimiento. Estos datos quedan visibles en el detalle del pedido.

**Criterios de aceptación:**
- [x] Puedo registrar el link de compra del pedido
- [x] Puedo registrar el número de tracking una vez enviado el producto
- [x] Puedo registrar el enlace de seguimiento
- [x] Los datos se guardan y permanecen asociados al pedido
- [x] Los datos se pueden consultar desde el detalle del pedido
- [x] Los enlaces se pueden abrir en otra pestaña
- [x] Los enlaces inválidos se rechazan antes de guardarlos

---

### NIX-006: Registrar clientes
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 1
**Como** admin, **quiero** registrar clientes con sus datos de contacto, **para** asociarlos a los pedidos.

**Descripción:**
CRUD básico de clientes. Cada cliente tiene datos de contacto y se puede asociar a uno o más pedidos de importación.

**Criterios de aceptación:**
- [x] Puedo crear un cliente con: nombre completo, teléfono, email (opcional), dirección (opcional), notas
- [x] Puedo editar los datos de un cliente existente
- [x] Puedo ver la lista de todos los clientes con búsqueda por nombre o teléfono
- [x] No puedo crear dos clientes con el mismo teléfono
- [x] Puedo ver cuántos pedidos tiene asociados cada cliente en la lista

---

### NIX-007: Historial de pedidos por cliente
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 3 | **Sprint:** 2
**Como** admin, **quiero** consultar los pedidos asociados a un cliente, **para** conocer su historial comercial y dar seguimiento rápidamente.

**Descripción:**
Desde la lista de clientes, el admin puede abrir el historial de pedidos de cada cliente. El historial muestra código, producto, estado, fecha y total de cada pedido, y permite acceder al detalle.

**Criterios de aceptación:**
- [x] Desde un cliente puedo abrir su historial de pedidos
- [x] Veo los pedidos asociados al cliente
- [x] Cada pedido muestra código, producto, estado, fecha y total
- [x] Los pedidos se muestran desde el más reciente
- [x] Puedo navegar al detalle de cada pedido
- [x] Se muestra un mensaje cuando el cliente no tiene pedidos

---

### NIX-008: Registrar productos en almacén
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 2
**Como** admin, **quiero** registrar los productos recibidos en el almacén, **para** tener control del inventario temporal antes de entregarlos al cliente.

**Descripción:**
Cuando un pedido llega a la oficina, el admin puede registrar el producto en el inventario y asociarlo opcionalmente a su pedido. La información incluye nombre, número de serie, cantidad, fecha de recepción y notas.

**Criterios de aceptación:**
- [x] Puedo registrar un producto recibido en el almacén
- [x] Puedo asociar el producto a un pedido existente
- [x] Puedo ingresar nombre, número de serie, cantidad, fecha y notas
- [x] Los productos quedan visibles mientras estén pendientes de entrega
- [x] No puedo registrar cantidades menores a uno
- [x] El producto registrado muestra su fecha de recepción

---

### NIX-009: Marcar producto como entregado
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 3 | **Sprint:** 2
**Como** admin, **quiero** marcar un producto del almacén como entregado, **para** mantener actualizado el inventario temporal y saber cuándo se realizó la entrega.

**Descripción:**
Desde el inventario, el admin puede marcar como entregado cada producto que ya salió de la oficina. El sistema registra automáticamente la fecha de entrega y cambia su estado para que deje de contabilizarse como producto pendiente en almacén.

**Criterios de aceptación:**
- [x] Veo una acción para marcar cada producto pendiente como entregado
- [x] El estado cambia de `En almacén` a `Entregado`
- [x] Se registra automáticamente la fecha de entrega
- [x] La fecha de entrega se muestra en el listado
- [x] Los productos entregados dejan de contabilizarse como pendientes en almacén
- [x] El cambio se conserva en Supabase

---

### NIX-010: Ver inventario actual
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 2
**Como** admin, **quiero** consultar el inventario actual, **para** conocer qué productos están en almacén y cuáles ya fueron entregados.

**Descripción:**
La pantalla de inventario muestra todos los productos registrados, con un resumen de unidades y registros pendientes, además de filtros por nombre, número de serie y estado. Permite identificar rápidamente el inventario disponible y consultar su historial de entregas.

**Criterios de aceptación:**
- [x] Puedo ver la lista de productos registrados en el almacén
- [x] El listado muestra nombre, número de serie, cantidad, fechas y estado
- [x] Puedo buscar productos por nombre o número de serie
- [x] Puedo filtrar el inventario por `En almacén` o `Entregado`
- [x] Puedo ver cuántas unidades están pendientes de entrega
- [x] Puedo ver cuántos productos ya fueron entregados
- [x] El listado refleja los cambios realizados en el inventario

---

### NIX-011: Configurar comisión
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 3 | **Sprint:** 1
**Como** admin, **quiero** configurar el porcentaje de comisión por importación, **para** que se aplique automáticamente a las cotizaciones.

**Descripción:**
La pantalla de configuración permite consultar y modificar el porcentaje de comisión por defecto. El valor se persiste en Supabase y las nuevas cotizaciones lo utilizan automáticamente, mientras que los pedidos ya cotizados conservan su comisión guardada.

**Criterios de aceptación:**
- [x] Puedo establecer un porcentaje de comisión por defecto (ej: 15%)
- [x] El valor se persiste y se mantiene entre sesiones
- [x] Al crear una cotización (NIX-002), se usa este porcentaje automáticamente
- [x] Puedo ver el valor actual de comisión configurado
- [x] El cambio de comisión no afecta pedidos ya cotizados

---

### NIX-012: Registrar costos adicionales por pedido
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 2
**Como** admin, **quiero** registrar costos adicionales asociados a un pedido, **para** reflejar gastos reales y calcular su costo final correctamente.

**Descripción:**
Desde el detalle de un pedido el admin puede agregar conceptos y montos en USD que representan gastos adicionales, como seguro, almacenamiento o despacho. Los costos pueden eliminarse y se muestran sumados al costo final del pedido.

**Criterios de aceptación:**
- [x] Puedo registrar un costo adicional indicando concepto y monto
- [x] El monto debe ser mayor a cero
- [x] Los costos quedan asociados al pedido correspondiente
- [x] Puedo consultar el detalle y las notas de cada costo adicional
- [x] Puedo eliminar un costo adicional registrado
- [x] Se muestra el total acumulado de costos adicionales
- [x] El total del pedido se recalcula al agregar o eliminar costos

---

### NIX-013: Dashboard resumen del negocio
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 8 | **Sprint:** 2
**Como** admin, **quiero** consultar un resumen del negocio, **para** conocer rápidamente el estado operativo y financiero de los pedidos.

**Descripción:**
El dashboard centraliza indicadores generales de pedidos, facturación, comisiones, clientes y productos en almacén. También muestra los pedidos recientes y la distribución actual por estado, con navegación directa al detalle de cada pedido.

**Criterios de aceptación:**
- [x] Puedo ver la cantidad de pedidos activos
- [x] Puedo ver la cantidad de pedidos entregados
- [x] Puedo consultar el total facturado de pedidos entregados
- [x] Puedo ver las comisiones cobradas en pedidos entregados
- [x] Puedo ver la cantidad de clientes registrados
- [x] Puedo ver la cantidad de productos pendientes en almacén
- [x] Puedo consultar los pedidos recientes y navegar a su detalle
- [x] Puedo ver la distribución de pedidos por estado
- [x] Se muestran estados de carga y error al consultar los datos

---

## Sprint 3 - Scope

**Fechas:** 25 Nov - 08 Dic 2026
**Objetivo:** Agregar reportes, búsqueda global, alertas de seguimiento, tipo de cambio configurable y pulir la experiencia de usuario.

**Historias incluidas:** NIX-014, NIX-015, NIX-016, NIX-017, NIX-018

### NIX-014: Generar reportes de ventas y comisiones
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 3
**Como** admin, **quiero** generar reportes de ventas y comisiones por periodo, **para** conocer el rendimiento financiero del negocio y tomar decisiones informadas.

**Descripción:**
El admin puede consultar un reporte filtrado por rango de fechas que muestra los pedidos entregados, el total facturado, las comisiones cobradas y un desglose por pedido. El reporte se puede exportar a PDF o Excel.

**Criterios de aceptación:**
- [x] Puedo seleccionar un rango de fechas para generar el reporte
- [x] El reporte muestra solo pedidos en estado Entregado dentro del rango
- [x] Veo el total facturado, total de comisiones y cantidad de pedidos
- [x] Veo un desglose por pedido con: código, cliente, producto, total y comisión
- [x] Puedo exportar el reporte a PDF
- [x] Puedo exportar el reporte a Excel (CSV)
- [x] Se muestra un mensaje cuando no hay datos en el rango seleccionado
- [x] Se muestran estados de carga y error

---

### NIX-015: Búsqueda global de pedidos, clientes e inventario
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 3
**Como** admin, **quiero** buscar pedidos, clientes y productos desde un solo campo de búsqueda, **para** encontrar información rápidamente sin navegar entre secciones.

**Descripción:**
Un campo de búsqueda global accesible desde cualquier página permite al admin escribir un término y ver resultados agrupados por tipo (pedidos, clientes, inventario). Los resultados son enlaces directos al detalle correspondiente.

**Criterios de aceptación:**
- [x] Hay un campo de búsqueda global visible en el header o sidebar
- [x] Al escribir, se muestran resultados agrupados por: pedidos, clientes, inventario
- [x] Puedo buscar por código de pedido, nombre de cliente, teléfono, nombre de producto o número de serie
- [x] Los resultados se actualizan mientras escribo (debounce)
- [x] Al seleccionar un resultado, navego al detalle correspondiente
- [x] Se muestra un mensaje cuando no hay resultados
- [x] La búsqueda se puede abrir con un atajo de teclado (Ctrl+K)

---

### NIX-016: Alertas de pedidos estancados y pendientes
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 3
**Como** admin, **quiero** recibir alertas visuales de pedidos que llevan demasiado tiempo en un mismo estado, **para** dar seguimiento oportuno y evitar retrasos.

**Descripción:**
El sistema identifica pedidos que no han cambiado de estado en un tiempo configurable y los muestra como alertas en el dashboard y en un panel de notificaciones. El admin puede marcar alertas como revisadas.

**Criterios de aceptación:**
- [x] Los pedidos que llevan más de X días en el mismo estado se marcan como estancados
- [x] El umbral de días es configurable desde la pantalla de configuración
- [x] Las alertas se muestran en el dashboard con un indicador visual
- [x] Hay un panel o sección de notificaciones accesible desde el header
- [x] Cada alerta muestra: código del pedido, estado actual y días sin cambio
- [x] Puedo navegar al detalle del pedido desde la alerta
- [x] Puedo marcar una alerta como revisada para que deje de mostrarse
- [x] Se muestra un contador de alertas activas en el header

---

### NIX-017: Configurar tipo de cambio USD a moneda local
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 3 | **Sprint:** 3
**Como** admin, **quiero** configurar el tipo de cambio de USD a moneda local, **para** que las cotizaciones reflejen el precio correcto en la moneda del cliente.

**Descripción:**
Desde la pantalla de configuración, el admin puede establecer el tipo de cambio actual. Este valor se usa en las cotizaciones para mostrar el equivalente en moneda local. El cambio no afecta cotizaciones ya guardadas.

**Criterios de aceptación:**
- [x] Puedo establecer el tipo de cambio USD a moneda local desde configuración
- [x] El valor se persiste en Supabase y se mantiene entre sesiones
- [x] Las nuevas cotizaciones usan el tipo de cambio configurado
- [x] El cambio de tipo de cambio no afecta cotizaciones ya guardadas
- [x] Se muestra el valor actual del tipo de cambio en configuración
- [x] El valor debe ser mayor a cero
- [x] Se muestra la fecha de última actualización del tipo de cambio

---

### NIX-018: Mejorar experiencia de usuario y diseño responsive
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 3
**Como** admin, **quiero** que el sistema se vea bien y funcione correctamente en dispositivos móviles y de escritorio, **para** poder gestionar pedidos desde cualquier dispositivo.

**Descripción:**
Se revisan todas las pantallas para asegurar que funcionen correctamente en resoluciones móviles, tablet y escritorio. Se mejoran los empty states, los mensajes de feedback, la navegación y la consistencia visual general.

**Criterios de aceptación:**
- [x] Todas las pantallas son usables en resolución móvil (360px+)
- [x] La navegación se adapta a móvil (menú colapsable o drawer)
- [x] Las tablas se adaptan a pantallas pequeñas (scroll horizontal o vista de tarjetas)
- [x] Los formularios son usables en móvil sin overflow horizontal
- [x] Los empty states muestran un mensaje claro y acción sugerida
- [x] Los botones de acción tienen tamaño táctil adecuado en móvil (44px+)
- [x] La tipografía y espaciado son consistentes entre todas las pantallas

---

## Sprint 4 - Scope

**Fechas:** 09 Dic - 22 Dic 2026
**Objetivo:** Crear el módulo de perfumes con catálogo de productos, gestión de precios mayorista/minorista y proveedores.

**Historias incluidas:** NIX-019, NIX-020, NIX-021, NIX-022, NIX-023

### NIX-019: Registrar perfumes en catálogo
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 4
**Como** admin, **quiero** registrar perfumes en un catálogo con sus datos principales, **para** tener un inventario organizado de los productos disponibles para venta.

**Descripción:**
El admin puede crear, editar y eliminar perfumes del catálogo. Cada perfume tiene nombre, marca, presentación (ml), género, descripción y una imagen opcional. El catálogo es la base para luego asignar precios y gestionar stock.

**Criterios de aceptación:**
- [x] Puedo crear un perfume con: nombre, marca, presentación (ml), género (Hombre/Mujer/Unisex), descripción
- [x] Puedo subir o indicar una URL de imagen para el perfume
- [x] Puedo editar los datos de un perfume existente
- [x] Puedo eliminar un perfume que no tenga movimientos de stock
- [x] Puedo buscar perfumes por nombre o marca
- [x] Puedo filtrar por género (Hombre/Mujer/Unisex/Todos)
- [x] Se muestra la lista de perfumes en tarjetas o tabla con imagen, nombre, marca y presentación
- [x] Se valida que no existan duplicados (misma marca + nombre + presentación)

---

### NIX-020: Gestionar precios mayorista y minorista
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 4
**Como** admin, **quiero** asignar precios de venta mayorista y minorista a cada perfume, **para** manejar las dos líneas de negocio con precios diferenciados.

**Descripción:**
Cada perfume tiene dos precios de venta: uno para clientes minoristas (unidad) y otro para mayoristas (volumen). El admin también registra el costo de compra para calcular el margen de ganancia. Los precios se manejan en moneda local.

**Criterios de aceptación:**
- [x] Puedo asignar a cada perfume: costo de compra, precio minorista, precio mayorista
- [x] Los precios se muestran en moneda local
- [x] Se calcula y muestra el margen de ganancia (%) para cada tipo de precio
- [x] Puedo editar los precios en cualquier momento
- [x] Se valida que el precio minorista sea mayor que el mayorista
- [x] Se valida que ambos precios sean mayores que cero
- [x] Se muestra un listado con los precios actuales de todos los perfumes

---

### NIX-021: Gestionar stock de perfumes
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 4
**Como** admin, **quiero** registrar entradas y salidas de stock de perfumes, **para** saber cuántas unidades tengo disponibles de cada producto.

**Descripción:**
El admin registra la recepción de lotes de perfumes (entradas) y las ventas o ajustes (salidas). El sistema calcula el stock actual automáticamente. Se muestran alertas cuando el stock de un producto baja de un mínimo configurable.

**Criterios de aceptación:**
- [x] Puedo registrar una entrada de stock: perfume, cantidad, costo unitario, proveedor, fecha
- [x] Puedo registrar una salida de stock: perfume, cantidad, tipo (Venta/Ajuste/Merma), nota
- [x] El sistema calcula el stock actual de cada perfume (entradas - salidas)
- [x] No puedo registrar una salida mayor al stock disponible
- [x] Puedo ver el historial de movimientos de un perfume (entradas y salidas)
- [x] Se muestra una alerta visual cuando el stock está por debajo del mínimo (configurable)
- [x] Puedo ver un resumen general: total de unidades, valor del inventario a costo

---

### NIX-022: Registrar proveedores de perfumes
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 3 | **Sprint:** 4
**Como** admin, **quiero** registrar los proveedores de perfumes, **para** tener un directorio organizado y asociar compras a cada proveedor.

**Descripción:**
El admin puede crear y gestionar una lista de proveedores con datos de contacto. Los proveedores se asocian a las entradas de stock para tener trazabilidad de dónde vienen los productos.

**Criterios de aceptación:**
- [x] Puedo crear un proveedor con: nombre, teléfono, email, dirección, notas
- [x] Puedo editar los datos de un proveedor existente
- [x] Puedo ver la lista de proveedores con búsqueda por nombre
- [x] Al registrar una entrada de stock, puedo seleccionar el proveedor
- [x] Puedo ver cuántas entradas de stock tiene asociadas cada proveedor
- [x] No puedo eliminar un proveedor que tenga movimientos asociados

---

### NIX-023: Navegación y dashboard del módulo perfumes
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 4
**Como** admin, **quiero** acceder al módulo de perfumes desde la navegación principal con su propio dashboard, **para** tener una vista general del negocio de perfumes separada de las importaciones.

**Descripción:**
Se agrega una sección "Perfumes" en la navegación del sidebar con sub-ítems: Catálogo, Stock, Proveedores. El dashboard de perfumes muestra métricas clave: total de productos, valor del inventario, productos con stock bajo, y los últimos movimientos.

**Criterios de aceptación:**
- [x] Hay una sección "Perfumes" en el sidebar con sub-navegación: Catálogo, Stock, Proveedores
- [x] El dashboard de perfumes muestra: total de productos en catálogo, unidades en stock, valor del inventario a costo
- [x] Se muestran los perfumes con stock bajo (debajo del mínimo configurado)
- [x] Se muestran los últimos 5 movimientos de stock (entradas/salidas)
- [x] La navegación es responsive y funciona en móvil
- [x] Las nuevas rutas están integradas con react-router-dom

---

## Sprint 5 - Scope

**Fechas:** 23 Dic 2026 - 05 Ene 2027
**Objetivo:** Registrar ventas de perfumes (minorista y mayorista), gestionar stock con trazabilidad completa y consolidar la operación de proveedores.

**Historias incluidas:** NIX-024, NIX-025, NIX-026, NIX-027, NIX-028, NIX-029

### NIX-024: Registrar venta de perfumes
**Estado Scrum:** En progreso (falta mensaje de confirmación al guardar)
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 5
**Como** admin, **quiero** registrar una venta de perfumes indicando cliente, productos y tipo de venta (minorista/mayorista), **para** llevar control de las ventas y aplicar el precio correspondiente.

**Descripción:**
El admin crea una venta seleccionando el tipo (minorista o mayorista), un cliente existente o datos de venta rápida, y agrega uno o más perfumes con su cantidad. El sistema aplica automáticamente el precio según el tipo de venta, calcula el total y descuenta del stock al confirmar.

**Criterios de aceptación:**
- [x] Puedo crear una venta seleccionando tipo: Minorista o Mayorista
- [x] Puedo asociar la venta a un cliente existente o registrar un nombre de referencia (venta rápida)
- [x] Puedo agregar uno o más perfumes a la venta con cantidad deseada
- [x] El precio unitario se carga automáticamente según el tipo de venta (minorista/mayorista)
- [x] Puedo ajustar el precio manualmente en una venta específica si es necesario
- [x] Se muestra el subtotal por línea y el total general de la venta
- [x] No puedo vender más unidades de las que hay en stock
- [x] Al confirmar la venta, se descuenta automáticamente del stock (movimiento tipo "Venta")
- [x] La venta genera un código único visible (VTA-XXXX)
- [ ] Se muestra confirmación al guardar exitosamente

---

### NIX-025: Listar ventas con filtros
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 5
**Como** admin, **quiero** ver un listado de todas las ventas de perfumes con filtros, **para** consultar el historial de ventas y hacer seguimiento.

**Descripción:**
Vista principal de ventas en formato tabla con la información más relevante. El admin puede filtrar por tipo de venta, rango de fechas y buscar por cliente o código de venta.

**Criterios de aceptación:**
- [x] Veo una tabla con: código, fecha, cliente, tipo (minorista/mayorista), cantidad de ítems, total, estado
- [x] Puedo filtrar por tipo de venta (Minorista/Mayorista/Todos)
- [x] Puedo filtrar por rango de fechas
- [x] Puedo buscar por nombre de cliente o código de venta
- [x] Puedo ordenar por fecha o total
- [x] Al hacer clic en una venta, veo su detalle con el desglose de productos
- [x] Veo un contador de resultados y totales acumulados

---

### NIX-026: Detalle y anulación de venta
**Estado Scrum:** En progreso (la anulación resta stock en vez de devolverlo)
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 5
**Como** admin, **quiero** ver el detalle de una venta y poder anularla si fue un error, **para** corregir errores y mantener el stock correcto.

**Descripción:**
Desde el listado de ventas el admin accede al detalle que muestra toda la información de la transacción. Si la venta fue registrada por error, puede anularla, lo que devuelve las unidades al stock automáticamente.

**Criterios de aceptación:**
- [x] Puedo ver el detalle completo de una venta: código, fecha, cliente, tipo, productos vendidos con cantidad y precio, total
- [x] Puedo anular una venta que no haya sido anulada previamente
- [ ] Al anular, se genera un movimiento de tipo "Ajuste" que devuelve las unidades al stock
- [x] La venta anulada queda marcada visualmente como "Anulada" y no se contabiliza en reportes
- [x] Se pide confirmación antes de anular
- [x] Se muestra la fecha de anulación y una nota de motivo

---

### NIX-027: Historial de compras a proveedores
**Estado Scrum:** En progreso (no existe detalle de perfume al que navegar)
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 5
**Como** admin, **quiero** ver el historial de compras (entradas de stock) de cada proveedor, **para** evaluar proveedores y tener trazabilidad de costos.

**Descripción:**
Desde el detalle de un proveedor, el admin puede ver todas las entradas de stock asociadas: qué perfumes se compraron, cuántas unidades, a qué costo y en qué fecha. También se muestra un resumen con total invertido y unidades compradas.

**Criterios de aceptación:**
- [x] Desde un proveedor puedo ver su historial de entradas de stock
- [x] Cada entrada muestra: perfume, cantidad, costo unitario, costo total, fecha
- [x] Las entradas se muestran desde la más reciente
- [x] Se muestra un resumen: total de unidades compradas y monto total invertido
- [x] Puedo filtrar las entradas por rango de fechas
- [ ] Puedo navegar al detalle del perfume desde cada entrada

---

### NIX-028: Reporte de ventas de perfumes
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 5
**Como** admin, **quiero** generar un reporte de ventas de perfumes por periodo, **para** conocer las ganancias y el rendimiento de esta línea de negocio.

**Descripción:**
El admin consulta un reporte filtrado por rango de fechas que muestra las ventas realizadas, ingresos totales, costo de la mercadería vendida, ganancia bruta y desglose por tipo de venta (minorista vs mayorista). Se puede exportar a PDF o Excel.

**Criterios de aceptación:**
- [x] Puedo seleccionar un rango de fechas para generar el reporte
- [x] El reporte muestra solo ventas confirmadas (no anuladas) dentro del rango
- [x] Veo: total de ventas, ingresos totales, costo de mercadería vendida, ganancia bruta
- [x] Veo el desglose separado entre ventas minoristas y mayoristas
- [x] Veo un detalle por venta con: código, cliente, tipo, total y ganancia
- [x] Puedo ver los perfumes más vendidos (top 5) en el periodo
- [x] Puedo exportar el reporte a PDF
- [x] Puedo exportar el reporte a Excel (CSV)
- [x] Se muestra un mensaje cuando no hay datos en el rango seleccionado

---

### NIX-029: Integrar ventas de perfumes en navegación y dashboard
**Estado Scrum:** En progreso (las últimas ventas no enlazan al detalle de la venta)
**Prioridad:** Media | **Puntos:** 3 | **Sprint:** 5
**Como** admin, **quiero** acceder a las ventas de perfumes desde la navegación y ver métricas de ventas en el dashboard de perfumes, **para** tener una vista completa del negocio.

**Descripción:**
Se agrega "Ventas" como sub-ítem de la sección Perfumes en el sidebar. El dashboard de perfumes se actualiza para incluir métricas de ventas: ventas del mes, ingresos, ganancia bruta y un gráfico o resumen de ventas recientes.

**Criterios de aceptación:**
- [x] Hay un sub-ítem "Ventas" en la sección Perfumes del sidebar
- [x] El dashboard de perfumes muestra: ventas del mes actual, ingresos del mes, ganancia bruta del mes
- [ ] Se muestran las últimas 5 ventas realizadas con acceso al detalle
- [x] Se muestra un comparativo simple: ventas minoristas vs mayoristas del mes (cantidad e ingresos)
- [x] Las nuevas rutas están integradas con react-router-dom
- [x] La navegación funciona en móvil

---

## Sprint 6 - Scope

**Fechas:** 06 Ene - 19 Ene 2027
**Objetivo:** Consolidar un dashboard avanzado que unifique importaciones y perfumes, con gráficos de tendencia, reportes financieros cruzados y métricas de análisis del negocio.

**Historias incluidas:** NIX-030, NIX-031, NIX-032, NIX-033, NIX-034, NIX-035

### NIX-030: Dashboard unificado con métricas de ambos negocios
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 6
**Como** admin, **quiero** ver en el dashboard principal un resumen que combine las métricas de importaciones y perfumes, **para** tener una visión completa del estado financiero y operativo de todo el negocio en un solo lugar.

**Descripción:**
El dashboard principal se transforma en un panel unificado que muestra métricas de ambas líneas de negocio: importaciones (pedidos, comisiones) y perfumes (ventas, stock, ganancias). Se organizan en secciones claras con tarjetas de resumen y accesos directos a cada módulo.

**Criterios de aceptación:**
- [x] El dashboard muestra una sección "Importaciones" con: pedidos activos, entregados, total facturado, comisiones
- [x] El dashboard muestra una sección "Perfumes" con: ventas del mes, ingresos, ganancia bruta, stock total
- [x] Se muestra un resumen general consolidado: ingresos totales del negocio (comisiones + ganancias perfumes)
- [x] Cada sección tiene un enlace directo al módulo correspondiente
- [x] Se muestran indicadores de cambio respecto al mes anterior (sube/baja/igual)
- [x] Los datos se cargan con estados de loading y error independientes por sección
- [x] El layout es responsive y funcional en móvil

---

### NIX-031: Gráficos de tendencia de ingresos y pedidos
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 6
**Como** admin, **quiero** ver gráficos de tendencia de ingresos y actividad por mes, **para** identificar patrones de crecimiento o caída en el negocio.

**Descripción:**
Se agregan gráficos al dashboard que muestran la evolución mensual de los últimos 6 meses: ingresos por importaciones (comisiones), ingresos por perfumes (ganancias), y cantidad de operaciones. Los gráficos usan una librería ligera (recharts) integrada con el stack existente.

**Criterios de aceptación:**
- [x] Se muestra un gráfico de barras o líneas con ingresos mensuales de los últimos 6 meses
- [x] El gráfico diferencia visualmente importaciones vs perfumes con colores distintos
- [x] Se muestra un gráfico de actividad: cantidad de pedidos cerrados + ventas de perfumes por mes
- [x] Los gráficos tienen tooltip al hacer hover con el detalle del mes
- [x] Los gráficos se adaptan al ancho de la pantalla (responsive)
- [x] Se muestra un estado vacío si no hay datos suficientes
- [x] Los datos se calculan desde las tablas existentes sin requerir nuevas migraciones

---

### NIX-032: Reporte financiero consolidado
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 6
**Como** admin, **quiero** generar un reporte financiero que combine importaciones y perfumes en un solo documento, **para** tener una vista completa de los ingresos y ganancias del negocio por periodo.

**Descripción:**
Una nueva pantalla de reportes financieros permite seleccionar un rango de fechas y genera un reporte que incluye: ingresos por importaciones (comisiones cobradas), ingresos por perfumes (ventas - costo), total consolidado, y desglose por línea de negocio. Se puede exportar a PDF y CSV.

**Criterios de aceptación:**
- [x] Puedo seleccionar un rango de fechas para generar el reporte
- [x] El reporte muestra una sección de importaciones: pedidos entregados, total facturado, comisiones cobradas
- [x] El reporte muestra una sección de perfumes: ventas confirmadas, ingresos, costo de mercadería, ganancia bruta
- [x] Se muestra un total consolidado: comisiones de importaciones + ganancia bruta de perfumes
- [x] Se muestra el porcentaje de participación de cada línea en los ingresos totales
- [x] Puedo exportar el reporte consolidado a PDF
- [x] Puedo exportar el reporte consolidado a CSV
- [x] Se muestra un mensaje cuando no hay datos en el rango seleccionado
- [x] Se muestran estados de carga y error

---

### NIX-033: Reporte de rentabilidad por línea de negocio
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 6
**Como** admin, **quiero** comparar la rentabilidad entre importaciones y perfumes, **para** saber cuál línea de negocio genera más ganancia y tomar decisiones estratégicas.

**Descripción:**
Dentro del reporte financiero o como vista separada, se muestra una comparación directa entre ambas líneas: ingresos, costos, margen de ganancia (%), y evolución mensual. Permite identificar cuál línea es más rentable y cómo evoluciona cada una.

**Criterios de aceptación:**
- [x] Se muestra una tabla comparativa: importaciones vs perfumes con ingresos, costos y margen (%)
- [x] El margen de importaciones se calcula como: comisiones / total facturado
- [x] El margen de perfumes se calcula como: ganancia bruta / ingresos totales
- [x] Se destaca visualmente la línea con mejor rentabilidad
- [x] Se muestra la evolución del margen por mes (últimos 6 meses) en formato tabla o mini-gráfico
- [x] Los datos respetan el rango de fechas seleccionado en el reporte consolidado

---

### NIX-034: Métricas de clientes y ranking de compradores
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 6
**Como** admin, **quiero** ver un ranking de clientes por volumen de compras y frecuencia, **para** identificar a los mejores clientes y priorizar la atención.

**Descripción:**
Una sección de métricas de clientes muestra los clientes ordenados por total gastado, combinando importaciones y perfumes. Se muestra cuántos pedidos y ventas tiene cada cliente, el total acumulado, y la fecha de su última operación.

**Criterios de aceptación:**
- [x] Se muestra un ranking de los top 10 clientes por total gastado
- [x] Cada fila muestra: nombre, pedidos de importación, ventas de perfumes, total gastado, última operación
- [x] El total gastado combina pedidos de importación (total_usd) y ventas de perfumes
- [x] Puedo filtrar por rango de fechas
- [x] Se muestra un badge para clientes recurrentes (más de 3 operaciones)
- [x] Puedo navegar al detalle del cliente desde el ranking
- [x] Se muestra un estado vacío si no hay clientes con operaciones

---

### NIX-035: Indicadores de rendimiento (KPIs) configurables en dashboard
**Estado Scrum:** Implementada
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 6
**Como** admin, **quiero** configurar qué indicadores se muestran de forma destacada en el dashboard, **para** personalizar la vista según las métricas que más me importan.

**Descripción:**
El admin puede elegir hasta 4 KPIs principales que se muestran como tarjetas destacadas en la parte superior del dashboard. Los KPIs disponibles incluyen métricas de ambas líneas de negocio. La selección se persiste en la tabla de configuración.

**Criterios de aceptación:**
- [x] Puedo abrir un selector de KPIs desde el dashboard
- [x] Los KPIs disponibles incluyen: pedidos activos, pedidos del mes, comisiones del mes, ventas perfumes del mes, ingresos perfumes del mes, ganancia bruta perfumes, stock total perfumes, clientes nuevos del mes, ingresos totales del negocio
- [x] Puedo seleccionar hasta 4 KPIs para mostrar como tarjetas destacadas
- [x] La selección se persiste en Supabase y se mantiene entre sesiones
- [x] Los KPIs seleccionados se muestran en la parte superior del dashboard con valor actual
- [x] Cada KPI muestra un indicador de tendencia respecto al mes anterior
- [x] Si no hay KPIs configurados, se muestran los 4 por defecto (pedidos activos, comisiones mes, ventas perfumes mes, ingresos totales)

---

## Sprint 7 - Scope

**Fechas:** 20 Ene - 02 Feb 2027
**Objetivo:** Blindar el sistema con autenticación robusta, control de acceso granular (RBAC + RLS), auditoría completa de operaciones y protección contra vulnerabilidades comunes.

**Historias incluidas:** NIX-036, NIX-037, NIX-038, NIX-039, NIX-040, NIX-041, NIX-042

### NIX-036: Autenticación segura con Supabase Auth
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 7
**Como** admin, **quiero** que el sistema requiera autenticación segura para acceder a cualquier funcionalidad, **para** garantizar que solo usuarios autorizados puedan operar el ERP.

**Descripción:**
Implementar el flujo completo de autenticación usando Supabase Auth: login con email/contraseña, registro controlado (solo por invitación o por un superadmin), recuperación de contraseña, y protección de todas las rutas del SPA. Se aplican políticas de contraseñas seguras y protección contra fuerza bruta.

**Criterios de aceptación:**
- [X] El sistema muestra una pantalla de login como punto de entrada obligatorio
- [X] Solo se puede iniciar sesión con email y contraseña registrados en Supabase Auth
- [X] El registro de nuevos usuarios está restringido: solo un superadmin puede crear cuentas (no hay auto-registro público)
- [X] Existe un flujo de "Olvidé mi contraseña" que envía un enlace de recuperación al email registrado
- [X] Las contraseñas deben cumplir: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
- [X] Se muestra un indicador de fortaleza de contraseña al crear o cambiar la contraseña
- [X] Después de 5 intentos fallidos de login, la cuenta se bloquea temporalmente por 15 minutos (rate limiting en Supabase)
- [X] Todas las rutas del SPA están protegidas: si no hay sesión activa, se redirige al login
- [X] Los errores de autenticación muestran mensajes genéricos (no revelan si el email existe o no)
- [X] Se registra en log cada intento de login (exitoso y fallido) con IP y timestamp

---

### NIX-037: Gestión segura de sesiones y tokens
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 7
**Como** admin, **quiero** que las sesiones se gestionen de forma segura con expiración y renovación automática, **para** prevenir el secuestro de sesión y el acceso no autorizado desde dispositivos olvidados.

**Descripción:**
Configurar la gestión de tokens JWT de Supabase con tiempos de expiración adecuados, refresh token rotation, cierre de sesión seguro y detección de sesiones inactivas. El usuario puede ver sus sesiones activas y cerrarlas remotamente.

**Criterios de aceptación:**
- [x] Los access tokens tienen una duración máxima de 15 minutos (configuración de Supabase)
- [x] Los refresh tokens se rotan en cada uso (refresh token rotation habilitado)
- [x] Si el refresh token expira (7 días de inactividad), se fuerza un nuevo login
- [x] Al cerrar sesión se invalidan tanto el access token como el refresh token en el servidor
- [x] Los tokens no se almacenan en localStorage: se usa el storage seguro de Supabase (httpOnly donde sea posible)
- [x] Si el usuario está inactivo por más de 30 minutos, se muestra un modal de advertencia con cuenta regresiva de 60 segundos antes de cerrar la sesión automáticamente
- [x] El usuario puede cerrar sesión manualmente desde cualquier pantalla (botón visible en el header/sidebar)
- [x] Al detectar un token inválido o expirado durante una operación, se redirige al login con un mensaje claro
- [x] No se puede acceder a la API de Supabase sin un token válido (anon key protegida por RLS)

---

### NIX-038: Roles y permisos de usuario (RBAC)
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 7
**Como** superadmin, **quiero** asignar roles con permisos diferenciados a cada usuario del sistema, **para** controlar quién puede ver, crear, editar o eliminar datos según su responsabilidad.

**Descripción:**
Se implementa un sistema de control de acceso basado en roles (RBAC) con al menos tres roles: superadmin (acceso total), admin (operaciones del día a día) y viewer (solo lectura). Los roles se almacenan en una tabla de perfiles vinculada a Supabase Auth y se verifican tanto en el frontend (UI condicional) como en el backend (RLS policies).

**Criterios de aceptación:**
- [x] Existen al menos 3 roles: `superadmin`, `admin`, `viewer`
- [x] El rol `superadmin` puede: crear/editar/eliminar usuarios, cambiar roles, acceder a configuración, ver auditoría, ejecutar respaldos y todas las operaciones CRUD
- [x] El rol `admin` puede: crear/editar pedidos, clientes, inventario, ventas, ver reportes y dashboard, pero NO puede gestionar usuarios, cambiar roles ni ver auditoría
- [x] El rol `viewer` puede: ver listados, detalles, reportes y dashboard en modo solo lectura, pero NO puede crear, editar ni eliminar ningún registro
- [x] Los roles se almacenan en una tabla `user_profiles` vinculada al `auth.users.id` de Supabase
- [x] El rol se verifica en el frontend: los botones y acciones no permitidas están ocultos o deshabilitados según el rol del usuario logueado
- [x] El rol se verifica en el backend: las RLS policies de Supabase validan el rol antes de permitir INSERT, UPDATE o DELETE
- [x] El superadmin tiene una pantalla de gestión de usuarios donde puede: ver la lista de usuarios, cambiar roles y desactivar cuentas
- [x] Un usuario desactivado no puede iniciar sesión aunque tenga credenciales válidas
- [x] Un usuario no puede escalarse de rol: la asignación solo la puede hacer el superadmin desde la UI

---

### NIX-039: Row Level Security (RLS) en todas las tablas
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 7
**Como** admin de seguridad, **quiero** que todas las tablas de Supabase tengan políticas de Row Level Security activas, **para** que ningún dato sea accesible sin autenticación y autorización verificada a nivel de base de datos.

**Descripción:**
Se activa RLS en todas las tablas del proyecto y se crean políticas explícitas para cada operación (SELECT, INSERT, UPDATE, DELETE) basadas en el rol del usuario autenticado. Sin políticas explícitas, el acceso queda denegado por defecto. Se verifica que la anon key no permita acceso sin autenticación.

**Criterios de aceptación:**
- [x] RLS está habilitado en TODAS las tablas del proyecto (pedidos, clientes, inventario, perfumes, stock_movements, configuracion, ventas, proveedores, costos_adicionales, alertas, user_profiles, audit_log)
- [x] Cada tabla tiene políticas explícitas para SELECT, INSERT, UPDATE y DELETE según el rol
- [x] Sin autenticación (anon key sola) NO se puede leer, insertar, actualizar ni eliminar ningún registro (única excepción: INSERT acotado en auth_log para registrar logins fallidos)
- [x] El rol `viewer` solo tiene políticas SELECT en las tablas de datos operativos
- [x] El rol `admin` tiene políticas SELECT, INSERT y UPDATE en tablas operativas, pero no DELETE en tablas críticas (clientes, pedidos)
- [x] El rol `superadmin` tiene acceso completo a todas las tablas incluidas audit_log y user_profiles
- [x] Las políticas usan `auth.uid()` y una función SQL `get_user_role()` que consulta user_profiles para verificar el rol
- [x] Existe una migración SQL documentada que crea todas las políticas RLS
- [x] Se incluye un test manual o script SQL que verifica que cada rol tiene exactamente los permisos esperados (no más, no menos)
- [x] La tabla `audit_log` es append-only: nadie puede hacer UPDATE ni DELETE, solo INSERT (excepto superadmin para mantenimiento)

---

### NIX-040: Registro de auditoría de operaciones críticas
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 8 | **Sprint:** 7
**Como** superadmin, **quiero** que todas las operaciones críticas queden registradas en un log de auditoría inmutable, **para** investigar incidentes, detectar actividad sospechosa y cumplir con trazabilidad.

**Descripción:**
Se crea una tabla `audit_log` que registra automáticamente (vía triggers de PostgreSQL) cada INSERT, UPDATE y DELETE en tablas sensibles. Cada registro incluye quién hizo la operación, qué cambió, cuándo y los valores antes/después. El superadmin puede consultar el log desde la UI con filtros.

**Criterios de aceptación:**
- [x] Existe una tabla `audit_log` con: id, tabla_afectada, operacion (INSERT/UPDATE/DELETE), usuario_id, usuario_email, datos_anteriores (JSONB), datos_nuevos (JSONB), ip_address, created_at
- [x] Se registran automáticamente (vía triggers SQL) las operaciones en: pedidos, clientes, inventario, perfumes, stock_movements, ventas, configuracion, user_profiles
- [x] Los triggers capturan los valores OLD y NEW completos en formato JSONB
- [x] El `usuario_id` se obtiene de `auth.uid()` dentro del trigger
- [x] La tabla `audit_log` es append-only: las RLS impiden UPDATE y DELETE (excepto superadmin para purgado)
- [x] El superadmin tiene una pantalla "Auditoría" accesible desde el sidebar
- [x] La pantalla de auditoría muestra una tabla paginada con: fecha, usuario, operación, tabla, resumen del cambio
- [x] Puedo filtrar el log por: usuario, tabla, tipo de operación y rango de fechas
- [x] Puedo expandir un registro para ver el detalle completo (datos antes/después en formato legible)
- [x] Los registros de auditoría de login fallido (NIX-036) también se consultan desde esta pantalla
- [x] El log de auditoría se retiene por al menos 90 días

---

### NIX-041: Respaldo y recuperación de datos
**Estado Scrum:** Implementada (criterio PITR parcial: Supabase no expone su estado al frontend)
**Prioridad:** Media | **Puntos:** 5 | **Sprint:** 7
**Como** superadmin, **quiero** poder generar respaldos de los datos del sistema y restaurarlos si es necesario, **para** proteger el negocio ante pérdida de datos, errores humanos o incidentes.

**Descripción:**
El superadmin puede exportar un respaldo completo de las tablas principales en formato JSON desde la UI. También puede consultar el estado de los respaldos automáticos de Supabase (Point-in-Time Recovery). Para restauración, se provee una guía y un flujo asistido para importar datos desde un respaldo JSON.

**Criterios de aceptación:**
- [x] El superadmin puede generar un respaldo manual desde la UI que exporta todas las tablas principales a un archivo JSON con estructura definida
- [x] El archivo de respaldo incluye: clientes, pedidos, inventario, perfumes, stock_movements, ventas, proveedores, costos_adicionales, configuracion
- [x] El respaldo incluye metadatos: fecha de generación, usuario que lo generó, versión del esquema, cantidad de registros por tabla
- [x] El archivo se descarga con nombre formato: `nix-backup-YYYY-MM-DD-HHmmss.json`
- [x] Se muestra una pantalla de "Respaldos" accesible solo para superadmin con: botón de respaldo manual, historial de respaldos generados (fecha, tamaño, usuario)
- [ ] Se muestra información sobre el PITR (Point-in-Time Recovery) de Supabase: estado habilitado/deshabilitado y ventana de retención (se muestra información y cómo verificarlo en el dashboard; el estado real no es consultable desde el frontend)
- [x] Los datos sensibles (contraseñas, tokens) NO se incluyen en el respaldo
- [x] El respaldo se genera en segundo plano con indicador de progreso para no bloquear la UI

---

### NIX-042: Protección contra ataques comunes (XSS, inyección, CSRF)
**Estado Scrum:** Implementada
**Prioridad:** Alta | **Puntos:** 5 | **Sprint:** 7
**Como** admin de seguridad, **quiero** que el sistema esté protegido contra las vulnerabilidades web más comunes, **para** prevenir ataques que comprometan datos o sesiones de usuarios.

**Descripción:**
Se implementan capas de defensa contra las principales amenazas del OWASP Top 10 aplicables: XSS (Cross-Site Scripting), inyección SQL, CSRF (Cross-Site Request Forgery), y exposición de datos sensibles. Se configuran headers de seguridad HTTP, se sanitizan todas las entradas de usuario y se verifica que no haya secrets expuestos en el frontend.

**Criterios de aceptación:**
- [x] Todas las entradas de usuario se sanitizan antes de renderizar: no se usa `dangerouslySetInnerHTML` en ningún componente, y si existe algún caso justificado se sanitiza con DOMPurify
- [x] Los inputs que aceptan URLs (links de compra, tracking, imágenes) validan formato con esquema permitido (solo `https://`) y rechazan esquemas peligrosos (`javascript:`, `data:`, `vbscript:`)
- [x] Las queries a Supabase usan exclusivamente el cliente JS con parámetros tipados (nunca concatenación de strings SQL ni `.rpc()` con SQL dinámico sin parametrizar)
- [x] Se configuran los siguientes headers de seguridad en el hosting (Vercel): `Content-Security-Policy` (restrictiva, sin `unsafe-inline` donde sea posible), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`
- [x] El archivo `.env` con las claves de Supabase NO está en el repositorio (verificar `.gitignore`) y las variables se configuran en Vercel (Settings → Environment Variables), nunca en el código. Las variables `VITE_*` quedan en el bundle por diseño (la anon key es pública y la protege RLS), por eso solo se usa la anon key y jamás la `service_role`
- [x] La `anon key` de Supabase expuesta en el frontend solo permite operaciones protegidas por RLS (validado en NIX-039)
- [x] La `service_role key` de Supabase NUNCA aparece en el código frontend ni en el bundle de producción
- [x] Se ejecuta un análisis estático de dependencias (`npm audit`) y no hay vulnerabilidades críticas o altas sin resolver
- [x] Los formularios de creación/edición tienen protección contra doble envío (botón deshabilitado durante submit, debounce en la acción)
- [x] Los errores del sistema no exponen stack traces, rutas internas ni nombres de tablas al usuario final: se muestra un mensaje genérico y el detalle se registra en consola solo en modo desarrollo

---

**Entidades principales:**
- **Cliente:** nombre, teléfono, email, dirección
- **Pedido:** cliente, producto_solicitado, url_producto, precio_producto, costo_envio, impuestos, comision_porcentaje, comision_monto, costo_total, estado, fecha_solicitud, notas
- **Configuración:** comision_default (%)

**Estados del pedido:**
`Solicitado → Cotizado → Aprobado → Comprado → En tránsito → Recibido → Entregado → Cancelado`

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React + Vite (SPA) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS |
| **Backend/DB** | Supabase (PostgreSQL + Auth + API REST) |
| **ORM/Cliente** | Supabase JS Client |
| **Contenedores** | Docker + Docker Compose (dev local) |
| **Hosting** | Vercel (frontend) + Supabase Cloud (backend) |
| **CI/CD** | GitHub Actions |
| **Repositorio** | GitHub |
| **Package Manager** | npm |
| **Linter/Formatter** | ESLint + Prettier |
| **Testing** | Vitest |

---

## Estructura del Proyecto

```
nix-imports/
├── .github/
│   └── workflows/          # GitHub Actions (CI/CD)
│       └── ci.yml
├── docker/
│   └── docker-compose.yml  # Supabase local para desarrollo
├── src/
│   ├── assets/             # Imágenes, íconos
│   ├── components/         # Componentes reutilizables UI
│   │   └── ui/             # Botones, inputs, modales, tablas
│   ├── layouts/            # Layout principal del admin
│   ├── pages/              # Páginas/vistas
│   │   ├── Dashboard.tsx
│   │   ├── Pedidos.tsx
│   │   ├── PedidoDetalle.tsx
│   │   ├── Clientes.tsx
│   │   ├── Inventario.tsx
│   │   └── Configuracion.tsx
│   ├── hooks/              # Custom hooks
│   ├── lib/
│   │   └── supabase.ts     # Cliente de Supabase
│   ├── types/              # Tipos TypeScript (Cliente, Pedido, etc.)
│   ├── utils/              # Funciones auxiliares (cálculos, formateo)
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/         # Migraciones SQL de la base de datos
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── PROJECT.md
```

---

## Estándares de Desarrollo

### Checklist antes de dar una HU por terminada
Antes de declarar cualquier historia como completa, verificar:
- [ ] Todos los criterios de aceptación están implementados
- [ ] Los tipos TypeScript compilan sin errores (`npx tsc --noEmit`)
- [ ] Los errores de Supabase se capturan y muestran al usuario
- [ ] Los estados de carga (loading) tienen indicador visual
- [ ] No hay optimistic updates con IDs falsos — usar refetch
- [ ] El flujo happy path funciona end-to-end contra Supabase real
- [ ] El flujo de error (campo faltante, duplicado, red caída) está cubierto

### Reglas de código
- No agregar autoría de herramientas en los commits
- No dejar `console.log` en el código
- Validación en el frontend con Zod, no confiar solo en el backend
- Cada hook maneja su propio estado de `loading` y `error`

---

## Convención de Commits

Seguimos **Conventional Commits**. Formato: `tipo(scope): descripción`

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin cambiar comportamiento |
| `style` | Cambios de estilos/UI sin lógica |
| `chore` | Tareas de configuración, dependencias |
| `docs` | Cambios en documentación |

**El scope es el ID de la historia:** `feat(NIX-001)`, `fix(NIX-002)`, etc.

**Ejemplos:**
```
feat(NIX-001): agregar formulario de registro de pedido
fix(NIX-001): mostrar error si falla creacion de pedido
feat(NIX-002): calcular cotizacion con comision automatica
```

**Reglas:**
- Descripción en minúsculas y sin punto final
- Sin tildes ni caracteres especiales en el mensaje
- Un commit por cambio lógico, no un commit por archivo
- No se agrega autoría de herramientas en los commits

---

## Notas
- El sistema es solo para el administrador (no hay portal de cliente)
- MVP1 = solo productos tecnológicos (celulares, laptops, etc.)
- Los perfumes y otras líneas se agregarán en MVPs futuros
