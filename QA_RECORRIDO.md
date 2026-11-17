# NIX IMPORTS - Recorrido de prueba (navegando el sistema)

Guion para probar **todo el sistema como lo usaría el negocio**, de principio a fin, sin tocar código ni SQL.
Se sigue en orden, como un día de trabajo real: configurar, registrar clientes, importar un pedido completo, vender perfumes, mirar reportes y revisar la parte de seguridad.

**Antes de empezar** (una sola vez): tener la app corriendo (`npm run dev`, abrir `http://localhost:5173`), las migraciones ejecutadas y tu usuario `superadmin`. Si no, ver la sección 2 de `QA.md`.

**Cómo usarlo:** marca cada casilla. Si algo no pasa como dice "Debe pasar", anota en qué paso fue, qué viste y, si puedes, una captura. Los nombres exactos de los botones pueden variar un poco.

**Datos de prueba:** todo lo que crees aquí lleva la palabra **PRUEBA** para identificarlo después.

---

## Señales de que algo está mal (en cualquier paso)

- Una pantalla **en blanco** o un indicador de carga que no termina en unos 10 segundos.
- Mensajes técnicos o en inglés (nombres de tablas, "violates", "row-level security", "JWT").
- Números que **no cuadran** con lo que acabas de hacer.
- Un botón que no hace nada, o que crea el registro **dos veces**.
- Algo que ves con un rol que no debería verlo.
L@mamaosa1234
---

## Parte 1. Entrar al sistema

**1.1 Acceso**
- [X] Abre `http://localhost:5173/pedidos` **sin haber iniciado sesión**. Debe pasar: te manda a la pantalla de login.
- [ ] Escribe tu email con una contraseña incorrecta. Debe pasar: mensaje genérico ("Credenciales incorrectas...") que no dice si el email existe.
- [X] Escribe un email que no existe. Debe pasar: **el mismo mensaje** que en el paso anterior.
- [X] Entra con tus datos correctos. Debe pasar: llegas al Dashboard.

**1.2 Primer vistazo**
- [X] El menú lateral muestra: Dashboard, Pedidos, Clientes, Inventario, Reportes, Financiero, Rentabilidad, Clientes Top, Perfumes, Configuración, Usuarios, Auditoría y Respaldos.
- [X] Abajo del menú ves tu email y el botón de cerrar sesión.
- [X] Cambia de módulo 5 o 6 veces seguidas. Debe pasar: cada pantalla carga rápido, sin quedarse "cargando".

---

## Parte 2. Configuración inicial

Ve a **Configuración**.

- [X] Pon la **comisión** en `15` y guarda. Debe pasar: mensaje de éxito; al recargar la página sigue en 15.
- [X] Pon un **tipo de cambio** (por ejemplo `3.80`) y guarda. Debe pasar: queda guardado y se ve la fecha de última actualización.
- [X] Pon `0` o un número negativo en el tipo de cambio. Debe pasar: lo rechaza.
- [X] Pon el **umbral de días de alerta** en `1` y guarda. (Se usa en la Parte 5.)

---

## Parte 3. Clientes

Ve a **Clientes**.

- [ ] Crea el cliente **PRUEBA Uno**, teléfono `70000001`, con email y dirección.
- [ ] Crea **PRUEBA Dos**, teléfono `70000002`, sin email ni dirección. Debe pasar: se crea (esos campos son opcionales).
- [ ] Intenta crear otro cliente con el teléfono `70000001`. Debe pasar: error **en el campo teléfono** ("Ya existe un cliente con ese teléfono"), no un mensaje técnico.
- [ ] Edita PRUEBA Dos: agrégale una nota y guarda. Debe pasar: el cambio se ve en la lista.
- [ ] Busca por nombre (`PRUEBA`) y por teléfono (`70000002`). Debe pasar: filtra bien en ambos casos.
- [ ] Mira la columna de pedidos: ambos deben mostrar `0` por ahora.

---

## Parte 4. Un pedido de importación completo

Este es el corazón del negocio. Sigue **un pedido de principio a fin**.

**4.1 Crear el pedido**
Ve a **Pedidos > Nuevo pedido**.
- [ ] Intenta guardar sin cliente y sin producto. Debe pasar: no lo permite y te dice qué falta.
- [ ] Elige el cliente **PRUEBA Uno**, producto `iPhone 15 Pro 256GB PRUEBA`, categoría Celular.
- [ ] En "URL del producto" escribe `http://amazon.com/algo`. Debe pasar: lo rechaza (solo `https://`).
- [ ] Prueba también `javascript:alert(1)`. Debe pasar: lo rechaza.
- [ ] Ahora usa `https://www.amazon.com/dp/PRUEBA` y guarda. Debe pasar: confirmación de éxito, estado **Solicitado**, y un código `NIX-XXXX`. Anótalo: ______
- [ ] Crea otro pedido pero eligiendo **"crear cliente nuevo"** desde el mismo formulario (nombre `PRUEBA Tres`, teléfono `70000003`). Debe pasar: se crea el cliente y el pedido.
- [ ] Desde el formulario, intenta crear un cliente con el teléfono `70000001`. Debe pasar: marca el campo teléfono como duplicado.

**4.2 Cotizar**
Abre el primer pedido (clic en la fila).
- [ ] Ingresa precio `900`, envío `60`, impuestos `45`.
- [ ] Debe pasar: ves el desglose **precio + envío + impuestos + comisión = total**, y el total en moneda local usando el tipo de cambio.
- [ ] **Comprueba los números con una calculadora** según tu regla de negocio. Anota la comisión y el total: ______ / ______
- [ ] Cambia la comisión solo para este pedido (por ejemplo a 20%). Debe pasar: el total se recalcula.
- [ ] Guarda la cotización. Debe pasar: el estado cambia solo a **Cotizado**.

**4.3 Avanzar el pedido por todos los estados**
- [ ] Pasa a **Aprobado**. Debe pasar: pide confirmación (y notas opcionales); queda registrado en el historial con fecha.
- [ ] Pasa a **Comprado**.
- [ ] Registra el **link de compra** (`http://...` debe rechazarse; usa `https://www.ebay.com/itm/PRUEBA`) y un **número de tracking** `TRK-PRUEBA-001`, y su enlace de seguimiento `https://tracking.example.com/TRK-PRUEBA-001`. Debe pasar: se guardan, y los enlaces se abren en una pestaña nueva.
- [ ] Pasa a **En tránsito**, luego **Recibido**.
- [ ] Mira las opciones disponibles en cada estado. Debe pasar: solo puedes ir al **siguiente** (no hay forma de saltar de Solicitado a Comprado).
- [ ] Pasa a **Entregado**. Debe pasar: ya no se puede cancelar ni avanzar.
- [ ] Revisa el **historial de cambios**. Debe pasar: ves cada estado con su fecha, en orden.

**4.4 Costos adicionales**
En el detalle de un pedido que aún no esté entregado (usa el segundo):
- [ ] Agrega un costo `Seguro PRUEBA` de `25`. Debe pasar: aparece y el total acumulado y el total del pedido suben.
- [ ] Intenta agregar un costo de `0`. Debe pasar: lo rechaza.
- [ ] Elimina el costo. Debe pasar: el total vuelve a su valor anterior.

**4.5 Cancelar**
- [ ] En el segundo pedido, cancélalo. Debe pasar: pide confirmación y queda **Cancelado**.

**4.6 Lista de pedidos**
Vuelve a **Pedidos**.
- [ ] Filtra por estado (uno y varios a la vez), por rango de fechas y por búsqueda (cliente o producto).
- [ ] Ordena por fecha y por estado.
- [ ] Debe pasar: el contador de resultados se actualiza con cada filtro.
- [ ] Ve a **Clientes**: PRUEBA Uno debe mostrar `1` pedido. Abre su historial. Debe pasar: ves el pedido con código, producto, estado, fecha y total, y puedes entrar a su detalle.

---

## Parte 5. Inventario temporal y alertas

**5.1 Inventario**
Ve a **Inventario**.
- [ ] Registra un producto recibido: nombre `iPhone 15 Pro PRUEBA`, serie `SN-PRUEBA-001`, cantidad `1`, asociado al pedido de la Parte 4.
- [ ] Intenta con cantidad `0`. Debe pasar: lo rechaza.
- [ ] Debe pasar: los contadores muestran 1 unidad pendiente.
- [ ] Márcalo como **entregado**. Debe pasar: cambia a "Entregado", aparece la fecha, y deja de contar como pendiente.
- [ ] Prueba la búsqueda por nombre y por serie, y el filtro "En almacén / Entregado".

**5.2 Alertas de pedidos estancados**
- [ ] Crea un pedido nuevo para PRUEBA Dos y déjalo en "Solicitado". Con el umbral en 1 día, la alerta aparece cuando pase ese tiempo (puedes comprobarlo mañana). Si ya tienes un pedido viejo sin avanzar, debe aparecer ya.
- [ ] Debe pasar: la campana de arriba muestra un contador; al abrirla ves código, estado y días sin cambio; puedes ir al pedido y marcar la alerta como revisada (el contador baja).

---

## Parte 6. Perfumes

**6.1 Proveedores** (Perfumes > Proveedores)
- [ ] Crea `Proveedor PRUEBA A` y `Proveedor PRUEBA B` con teléfono y email.
- [ ] Edítalos y búscalos por nombre.

**6.2 Catálogo** (Perfumes > Catálogo)
- [ ] Crea tres perfumes: `Perfume PRUEBA 1` (marca `Marca X`, 100 ml, Hombre), `Perfume PRUEBA 2` (Marca X, 50 ml, Mujer), `Perfume PRUEBA 3` (Marca Y, 100 ml, Unisex).
- [ ] Intenta crear de nuevo `Perfume PRUEBA 1` de `Marca X` y 100 ml. Debe pasar: lo rechaza como duplicado.
- [ ] En la URL de imagen pon `http://...`. Debe pasar: lo rechaza (solo `https://`).
- [ ] Busca por nombre y por marca; filtra por género (Hombre, Mujer, Unisex, Todos).

**6.3 Precios** (Perfumes > Precios)
- [ ] A cada perfume asígnale costo `20`, minorista `50`, mayorista `35` (en el 3, costo `15`, minorista `40`, mayorista `28`).
- [ ] Prueba poner mayorista **mayor** que minorista. Debe pasar: lo rechaza.
- [ ] Prueba un precio `0`. Debe pasar: lo rechaza.
- [ ] Debe pasar: ves el margen (%) de cada tipo de precio calculado.

**6.4 Stock** (Perfumes > Stock)
- [ ] Registra una **entrada** de `10` unidades de `Perfume PRUEBA 1`, costo `20`, con `Proveedor PRUEBA A`.
- [ ] Registra entradas de `8` unidades para `Perfume PRUEBA 2` (Proveedor B) y `3` unidades para `Perfume PRUEBA 3` (Proveedor A).
- [ ] Intenta una **salida** de 50 unidades del Perfume 1. Debe pasar: "Stock insuficiente".
- [ ] Registra una **merma** de `1` unidad del Perfume 1 con una nota.
- [ ] Debe pasar: el Perfume 1 queda en **9**, y el Perfume 3 (3 unidades) muestra **alerta de stock bajo**.
- [ ] Anota el stock actual de cada uno. P1: ___ P2: ___ P3: ___
- [ ] Abre el historial de movimientos de un perfume. Debe pasar: entradas en verde con `+`, salidas en rojo con `-`.
- [ ] Debe pasar: el resumen muestra total de unidades y valor del inventario a costo.

**6.5 Ventas** (Perfumes > Ventas)
*Venta 1 (minorista, cliente registrado):*
- [ ] Nueva venta, tipo **Minorista**, cliente PRUEBA Uno, `2` unidades del Perfume 1.
- [ ] Debe pasar: el precio se carga solo (50); se muestran subtotal y total.
- [ ] Cambia el precio manualmente a `45` en esa línea. Debe pasar: el total se recalcula.
- [ ] Intenta vender más unidades de las que hay. Debe pasar: no lo permite.
- [ ] Guarda. Debe pasar: aparece un **mensaje verde con el código** `VTA-XXXX`, y la venta aparece en la lista. Anótalo: ______
- [ ] Debe pasar: el stock del Perfume 1 bajó de 9 a **7**.

*Venta 2 (mayorista, venta rápida):*
- [ ] Nueva venta, tipo **Mayorista**, modo "venta rápida" con el nombre `Comprador PRUEBA`, `4` unidades del Perfume 2 y `1` del Perfume 3.
- [ ] Debe pasar: el precio mayorista (35 y 28) se carga automáticamente.
- [ ] Guarda. Stock esperado: P2 = **4**, P3 = **2**.

*Lista de ventas:*
- [ ] Debe pasar: la tabla muestra código, fecha, cliente, tipo, cantidad de ítems, total y estado.
- [ ] Filtra por tipo, rango de fechas y busca por cliente o código. Ordena por fecha y por total.
- [ ] Debe pasar: abajo hay un contador de ventas y el total de las confirmadas.
- [ ] Abre el detalle de una venta (ícono del ojo). Debe pasar: ves cada producto con cantidad y precio.

**6.6 Anular una venta** *(prueba muy importante)*
- [ ] Anota el stock actual del Perfume 2: ___ (debería ser 4).
- [ ] Abre la **Venta 2**, anúlala escribiendo un motivo. Debe pasar: pide confirmación.
- [ ] Debe pasar: la venta queda marcada **Anulada** con fecha y motivo.
- [ ] **Ve a Stock.** Debe pasar: el Perfume 2 volvió a **8** y el Perfume 3 a **3**. (Las unidades **regresan**; si bajan, hay un error grave.)
- [ ] Debe pasar: en el historial del perfume se ve un movimiento de devolución en **verde con `+`**.
- [ ] Intenta anular la misma venta otra vez. Debe pasar: no se puede.

**6.7 Historial del proveedor**
- [ ] En Proveedores, abre el historial de `Proveedor PRUEBA A`. Debe pasar: ves las entradas más recientes primero, con perfume, cantidad, costo unitario, costo total y fecha, y un resumen de unidades y monto invertido.
- [ ] Filtra por rango de fechas. Debe pasar: resumen y lista se ajustan.
- [ ] Haz clic en el nombre de un perfume. Debe pasar: abre el **detalle del perfume** (datos, precios con márgenes, stock e historial).
- [ ] Intenta eliminar un proveedor que ya tiene movimientos. Debe pasar: no lo permite.
- [ ] Intenta eliminar un perfume con movimientos. Debe pasar: no lo permite.

**6.8 Dashboard de perfumes** (Perfumes > Dashboard)
- [ ] Debe pasar: ves total de productos, unidades en stock y valor del inventario; perfumes con stock bajo; y los últimos movimientos.
- [ ] Debe pasar: muestra ventas del mes, ingresos y ganancia bruta (la venta anulada **no** cuenta).
- [ ] Debe pasar: el comparativo minorista vs mayorista del mes tiene sentido.
- [ ] Haz clic en una de las últimas ventas. Debe pasar: abre **el detalle de esa venta**.

---

## Parte 7. Dashboard, reportes y métricas

**7.1 Dashboard principal**
- [ ] Debe pasar: ves la sección **Importaciones** (pedidos activos, entregados, facturado, comisiones) y la sección **Perfumes** (ventas, ingresos, ganancia, stock).
- [ ] **Comprueba los números** contra lo que hiciste: 1 pedido entregado, ventas del mes sin contar la anulada, etc.
- [ ] Debe pasar: hay un resumen consolidado y flechas de cambio frente al mes anterior.
- [ ] Debe pasar: los gráficos de 6 meses muestran tooltip al pasar el mouse y diferencian importaciones de perfumes.
- [ ] Abre el selector de **KPIs**: elige exactamente 4 y guarda. Intenta elegir un quinto. Debe pasar: no lo permite.
- [ ] **Recarga la página.** Debe pasar: tus 4 KPIs siguen ahí.

**7.2 Reportes de importaciones** (Reportes)
- [ ] Elige un rango de fechas que incluya hoy. Debe pasar: ves solo pedidos **Entregados**, con total facturado, comisiones y desglose por pedido.
- [ ] Exporta a **PDF** y a **CSV**. Ábrelos. Debe pasar: los datos coinciden con la pantalla.
- [ ] Elige un rango sin datos. Debe pasar: mensaje de "sin datos".

**7.3 Otros reportes**
- [ ] **Financiero:** muestra importaciones + perfumes, total consolidado y porcentaje de participación. Exporta PDF y CSV.
- [ ] **Rentabilidad:** tabla comparativa con márgenes, destaca la línea más rentable y muestra la evolución mensual.
- [ ] **Clientes Top:** ranking con totales, última operación, y filtro por fechas. Entra al cliente desde el ranking.
- [ ] **Reportes de perfumes:** ventas confirmadas, desglose minorista/mayorista, **top 5** más vendidos, exportación PDF/CSV. La venta anulada no debe aparecer.

**7.4 Búsqueda global**
- [ ] Presiona **Ctrl+K**. Escribe `PRUEBA`. Debe pasar: resultados agrupados en pedidos, clientes e inventario; al elegir uno, navega al detalle.
- [ ] Escribe símbolos raros: `a,b)(%`. Debe pasar: no se rompe nada.
- [ ] Busca algo que no existe. Debe pasar: mensaje de "sin resultados".

---

## Parte 8. Administración y seguridad (solo superadmin)

**8.1 Usuarios**
- [ ] Debe pasar: ves tu cuenta y las de prueba, con rol y estado.
- [ ] Cambia el rol de `viewer@test.com` a Admin y vuelve a dejarlo en Solo lectura.
- [ ] Intenta cambiar **tu propio rol** o desactivarte. Debe pasar: está bloqueado.
- [ ] Desactiva `viewer@test.com`, intenta entrar con esa cuenta en otra ventana (ver Parte 9) y luego actívalo otra vez.

**8.2 Auditoría**
- [ ] En **Operaciones** debe pasar: aparecen todo lo que creaste y editaste (clientes, pedidos, perfumes, ventas, configuración) con tu email, fecha, tabla y resumen.
- [ ] Abre un registro de modificación. Debe pasar: ves **antes y después** de cada campo cambiado.
- [ ] Filtra por tabla, tipo de operación, usuario y fechas.
- [ ] En **Accesos** debe pasar: ves tu login, el intento fallido de la Parte 1 y los cierres de sesión, con la **IP**.

**8.3 Respaldos**
- [ ] Pulsa **Generar respaldo**. Debe pasar: barra de progreso, descarga de `nix-backup-AAAA-MM-DD-HHMMSS.json` y una fila nueva en el historial con fecha, tamaño y usuario.
- [ ] Abre el archivo. Debe pasar: trae metadatos (fecha, quién lo generó, versión, cantidad de registros por tabla) y los datos de tus clientes, pedidos y perfumes. **No** debe traer contraseñas ni cuentas de usuario.
- [ ] Lee el panel informativo de PITR y revisa en el dashboard de Supabase (Database > Backups) si tu plan lo incluye. Anótalo: ______

---

## Parte 9. Lo que ve cada rol

Abre **ventanas de incógnito** (una por rol) para no cerrar tu sesión.

**9.1 Admin (`admin@test.com`)**
- [ ] Debe pasar: **no** aparecen Configuración, Usuarios, Auditoría ni Respaldos en el menú.
- [ ] Escribe a mano `http://localhost:5173/auditoria` en la barra. Debe pasar: te devuelve al inicio.
- [ ] Puede crear clientes, pedidos, ventas y movimientos de stock.
- [ ] Intenta eliminar un cliente o un pedido. Debe pasar: no existe esa opción o no funciona.

**9.2 Viewer (`viewer@test.com`)**
- [ ] Debe pasar: puede ver listados, detalles, reportes y dashboard.
- [ ] Revisa **todas** las pantallas: Pedidos, detalle de pedido, Clientes, Inventario, los cuatro módulos de Perfumes (catálogo, precios, stock, proveedores), Ventas y el Dashboard. Debe pasar: **no hay ningún botón** para crear, editar, eliminar, cambiar estado ni marcar alertas.

**9.3 Cuenta desactivada**
- [ ] Con una cuenta que desactivaste en 8.1, intenta iniciar sesión. Debe pasar: no entra y muestra que no tiene acceso.

---

## Parte 10. Sesión, contraseña y móvil

**10.1 Cerrar sesión y recuperar contraseña**
- [ ] Cierra sesión. Debe pasar: vuelves al login y no puedes volver a las pantallas con el botón "atrás".
- [ ] Pulsa **¿Olvidaste tu contraseña?** y escribe tu email. Debe pasar: mensaje de envío.
- [ ] Abre el correo (revisa spam; puede tardar). Haz clic en el enlace. Debe pasar: abre "Nueva contraseña".
- [ ] Prueba una contraseña débil (`abc`). Debe pasar: la rechaza y el indicador de fortaleza lo muestra.
- [ ] Usa una que cumpla (8+ caracteres, mayúscula, minúscula, número y símbolo), repítela y guarda. Debe pasar: entras al sistema.
- [ ] Abre el mismo enlace otra vez. Debe pasar: dice que ya no es válido.

**10.2 Inactividad** *(opcional, tarda)*
- [ ] Deja la pestaña sin tocarla ~29 minutos. Debe pasar: aparece un aviso con cuenta regresiva de 60 s; si no haces nada, cierra la sesión y el login avisa "Tu sesión ha expirado". Si pulsas "Continuar trabajando" a tiempo, sigue.

**10.3 Móvil**
En el navegador, abre las herramientas (F12) y activa el modo de dispositivo móvil con ancho **375 px**.
- [ ] Debe pasar: el menú se convierte en un botón de hamburguesa que abre un panel lateral.
- [ ] Recorre Dashboard, Pedidos, un detalle de pedido, Ventas y la creación de una venta. Debe pasar: nada se corta ni desborda; las tablas se desplazan de lado; los botones son fáciles de tocar.
- [ ] Debe pasar: el botón de cerrar sesión está en la barra superior.

---

## Parte 11. Cuadre final

Al terminar, estos números tienen que cuadrar con lo que hiciste. Si uno falla, anótalo: ahí hay una inconsistencia.

| Qué | Esperado | Obtenido |
|---|---|---|
| Pedidos creados | 3 (1 entregado, 1 cancelado, 1 solicitado) | |
| Clientes de prueba | 3 | |
| Stock Perfume 1 | 10 - 1 (merma) - 2 (venta 1) = **7** | |
| Stock Perfume 2 | 8 (venta anulada devolvió todo) | |
| Stock Perfume 3 | 3 (venta anulada devolvió todo) | |
| Ventas que cuentan en reportes | solo la Venta 1 | |
| Ingresos de la Venta 1 | 2 x 45 = **90** | |
| Registros en Auditoría | uno por cada alta/cambio que hiciste | |

---

## Qué reportar

Para cada problema, anota:
1. Número del paso (por ejemplo "6.6, tercer punto").
2. Con qué usuario/rol estabas.
3. Qué esperabas y qué pasó.
4. El mensaje de error textual y una captura. Si la pantalla quedó en blanco, abre F12 > Consola y copia lo que salga en rojo.
5. Si es lentitud: F12 > Network, qué petición tarda o falla.

Pégalo en una conversación nueva junto con la ruta de este archivo (`QA_RECORRIDO.md`) y el paso.
