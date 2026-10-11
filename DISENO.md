# Ficha de Diseño — sistema-taller-mecanico

## Marca
**BULÓN — Servicio Automotor** (marca ficticia, 100% inventada).
Voz: hoja de taller / scanner OBD. La identidad no es la persona: es la **patente + Nº OT en mono**.

## Usuario y contexto
El jefe de taller / recepcionista, de pie junto al mostrador, con las manos con grasa, el teléfono sonando y tres autos esperando diagnóstico. Poca paciencia para leer: mira de reojo. Luz de nave industrial (tubos fluorescentes), pantalla táctil o mouse compartido con mugre. Por eso **light**: el reflejo mata las pantallas oscuras en planta.

Lee sin leer: cuántos autos hay en cada estado, cuáles llevan demasiado tiempo parados (auto envejecido = plata quieta = elevación ocupada) y el punto que bloquea todo: **esperando repuesto**. El vínculo orden↔inventario es la fricción real del rubro: no se cierra una reparación sin la pieza.

## La pantalla que manda
**ordenes** — el tablero de la OT fluyendo por sus estados (Recibido → Diagnóstico → Aprobación → Reparación → QC → Entregado), coronado por el **Estado de Bahías**. No es un dashboard de métricas: el mecánico ejecuta órdenes, no abre reportes. El resto es soporte (conversaciones, contactos), plomería (config) o alimento de la orden (inventario con semáforo de stock).

## Dirección de arte
Estética de **manual de servicio + scanner de diagnóstico**: tinta técnica sobre papel/hormigón de taller, reglas de 1px, cero sombras. Números tabulares que se leen como odómetro. Movimiento **vertical** (los autos suben en el elevador), no horizontal.

**Cliché rechazado:** el kit racing. Fibra de carbono, rojo-carrera sobre negro glossy, bandera a cuadros, franjas hazard amarillo-negro en diagonal, cromo. Eso es tuning de vidriera, no la operación de un taller que factura horas. Se descarta entero. También se descarta la **variante dark+topbar+hazard** del Productor: colisiona en `mode` con restaurante Y gimnasio, y un tablero que "envejece/pulsa" roza el Riel del Pase del restaurante. Ganó la spec LIGHT.

## Palancas del theme (PIEL)
| Palanca | Valor | Por qué |
|---|---|---|
| mode | **light** | planta bajo fluorescentes; el reflejo mata el dark |
| nav | **rail** | riel vertical de íconos (tablero de herramientas); libera ancho para grabar 9:16 |
| elevation | **flat** | paneles tipo hoja de especificación, sin sombra: acero, no vidrio |
| radius | **sharp** | chapa cortada, cero redondeo |
| density | **compact** | taller data-pesado (patentes, part#, torques, horas) |
| badge | **square** | etiqueta-stencil de repuesto |
| fuentes | **Sora** (heading/spec) + **JetBrains_Mono** (patente, VIN, SKU, Nº OT, horas) | liderar con mono como cara de dato es la firma; nadie más lo hace |
| color | primary **petróleo-diésel #0C5460** + accent **naranja-señal #E8571E** | tinta del manual/OBD + etiqueta de torque industrial |

**Semánticos (4 estados distinguibles en light, fix del abogado aplicado):**
- idle / en cola → **acero** (gris-azulado)
- en reparación → **teal #0C5460**
- espera de un tercero (aprobación del cliente, repuesto) → **ámbar oscuro #7A4F00** (era naranja #E8571E; ver nota del 2026-10-11)
- vencido / excedido → **#B00020** (rojo más oscuro y frío, separado del naranja para que no se confundan de lejos)

Todo el color sale de `shell/theme.ts`. Cero hardcodeo en componentes.

## Módulos → arquetipo (componentes y tamaños)
| Módulo | Arquetipo | Componentes / tamaños |
|---|---|---|
| **dashboard** | plano-bahías | Hospeda el **Estado de Bahías** full-bleed arriba. Debajo, fila de 4 **stat-tiles** (órdenes abiertas · esperando repuesto · excedidas · para entregar; se calculan de las órdenes), número JetBrains XXL. Panel de **bullet** (horas reales vs facturables por mecánico). Sin gráficos de torta. |
| **ordenes** ⭐ | kanban | Pantalla que manda. Columnas por estado (Recibido→Diagnóstico→Aprobación→Reparación→QC→Entregado), tarjetas OT flat/sharp arrastrables con patente mono grande + cronómetro días-en-taller. El **Estado de Bahías** corona la vista. Chip square de estado. Arrastrar = momento grabable. |
| **contactos** | master-detail | La unidad es el **VEHÍCULO**, no la persona. Lista de patentes (stencil mono) → ficha: historial de OTs, km, próximo service, part# usados. Sin avatares (acá manda el vehículo). |
| **inventario** | tabla-densa | **Kárdex**: part#, descripción, ubicación, costo, stock. Cada fila trae un **gauge bullet** (stock actual vs punto de reorden con banda objetivo). Filas apretadas, mono para SKU y cantidades. |
| **conversaciones** | lista-ticket | Hilos WhatsApp como tickets ("¿aprobás presupuesto?", "auto listo para retirar"). Bandeja densa, sin burbujas grandes. Cada ticket linkea a su patente/OT. |
| **config** | acordeon | Secciones colapsables (taller, mecánicos, estados de OT, integraciones, marca). Plomería. |

## KPI · Gráfico · Iconos · Estructura
- **KPI: stat-tiles** — mosaico de contadores duros, número mono XXL. Nadie más lo usa.
- **Gráfico: bullet** — real vs objetivo (ocupación de bahías, horas facturables, stock vs reorden). Nadie más lo usa. Combo stat-tiles+bullet = único.
- **Iconos: lucide-grueso** (2.5px: llave, manómetro, aceite), tinta sobre hormigón, sin chip.
- **Estructura de página: titulo-simple** tipo ficha de taller (Nº OT + patente stencil + estado), sin barra de métricas ornamental.

## Componente estrella — Estado de Bahías (plano-bahías)
Panel **full-bleed**. N columnas = elevadores físicos (**BAHÍA 01–06** + un carril **COLA**). Grid CSS de N columnas verticales (lift-lanes).

Cada bahía ocupada = tarjeta del auto "sobre el puente":
- **Patente JetBrains_Mono gigante** (stencil), modelo, mecánico asignado, Nº OT mono.
- **Cronómetro de mano de obra**: transcurrido vs estimado (MM:SS o HH:MM), mono tabular.
- **Borde tinta por umbral desde theme.ts**: dentro de estimado = acero; cerca = naranja-señal #E8571E; excedido = #B00020 fijo, con el rótulo «excedido» (ya no pulsa).
- Chip square de estado (idle / en reparación / espera repuesto / listo).

Bahía vacía = celda hormigón con contorno punteado y rótulo **"LIBRE"** (sin el chevron hazard amarillo-negro: descartado con el kit racing).

**Interacción grabable (retirada el 2026-10-11, ver nota; hoy: botones «Subir» y «Entregar»):** arrastrar un auto de **COLA** a una bahía → la tarjeta "sube" (barra hidráulica anima de abajo hacia arriba), el timer arranca en 00:00, el borde pasa a acero. Al marcar **repuesto llegó** el estado salta de naranja a teal. Al cerrar **QC** se arrastra fuera de la bahía → la OT salta a **Entregado** y el chip square flipea a "LISTO".

Firma que lo separa del vecino: **lift-lanes verticales + cronómetro de labor**, distinto del `plano-mesas` horizontal del restaurante y del `heatmap`/mapa de inmobiliaria. Ningún otro sistema tiene un tablero de elevadores.

## Componente eliminado
**Buscador global del shell.** En un taller cada entidad se indexa por **PATENTE** o **Nº OT**, y ambos están surfaceados en cada tarjeta del Estado de Bahías y del kanban: el tablero ES el índice. Fuera el buscador dominante.

## Frame-firma
Autos "subiendo" en bahías/elevadores verticales bajo el Estado de Bahías, patente mono gigante, la mano de obra de cada bahía con su barra, el borde de una tarjeta pasando de acero → naranja-señal → #B00020 según los datos mientras otra, al cerrar QC, sale de la bahía y su chip square flipea a **LISTO** teal. Todo en light petróleo+naranja, movimiento vertical, sin hazard ni ámbar.

## Veredicto
**PASA** (spec LIGHT; variante dark descartada; rojo-vencido ajustado a #B00020).

### Diferenciación verificada
**PIEL** vs cada sistema decidido (≥3 palancas):
- vs inmobiliaria (light/sidebar/outlined/sharp/compact/square/Fraunces·Inter/verde+terracota): **nav, elevation, fuentes, color** (4) ✓
- vs restaurante (dark/rail/raised/round/comfortable/pill): mode, elevation, radius, density, badge, fuentes, color ✓
- vs barbería (light/topbar/flat/soft/comfortable/square): **nav, radius, density, fuentes, color** (5) ✓
- vs gimnasio (dark/sidebar/outlined/sharp/compact/pill): **mode, nav, elevation, badge, fuentes, color** (6) ✓

**ESQUELETO:** combo **stat-tiles + bullet** único (nadie usa ninguno) · arquetipo **plano-bahías** que nadie más tiene · segundo diferencial **Kárdex con gauge bullet por fila** · estrella **Estado de Bahías** (lift-lanes verticales + timer de labor) inexistente en el resto · eliminado real (buscador global). `ordenes=kanban` no es único (barbería lo usa en ventas) pero el peso cae en el estado de bahías, no en el kanban. Dos dashboards lado a lado: plano de elevadores con autos que suben, teal/naranja, light → no se confunde con ninguno.

## Nota del 2026-10-11 · Sistema más serio, tipo dashboard-CRM (decisión de Lucas)

Lucas pidió que los sistemas se vean "más profesionales, como sistemas normales", sin animaciones decorativas, y que se corrigieran los hallazgos de la crítica de Impeccable. **La identidad (paleta base, tipografías, palancas, plano-bahías, kárdex con gauge) no cambia.** Lo que cambió y por qué:

- **Movimiento.** Se sacaron: los autos que *suben* al montarse la tarjeta (`subiendo`) y que *bajan* al entregar (`bajando`), el pulso infinito de la OT excedida (`latir-ot`), los relojes que corrían solos cada segundo, los esqueletos con `animate-pulse` y el bloque `prefers-reduced-motion` que quedó huérfano. Ahora el reloj de cada bahía muestra la mano de obra registrada y la barra es estática. Se conserva solo lo funcional: color en hover/foco y los cambios de estado que provoca el usuario (subir, entregar, abrir el acordeón). La OT excedida se marca con borde rojo fijo y el rótulo "excedido". Si Lucas quiere reponer la firma "el auto sube", es el único movimiento que vale la pena devolver.
- **Color que contradecía el dato.** El `warning` pasó de terracota `#AB390B` (parecía rojo junto al `danger` `#B00020`) a ámbar oscuro `#7A4F00` (5,2:1 en chips). Reglas: acero = todavía no arrancó, petróleo = en manos del taller (diagnóstico, reparación, calidad), **ámbar = detenida esperando a otro** (aprobación del cliente, espera de repuesto), verde = entregado, **rojo = solo excedido, stock quebrado o reclamo**. "Espera repuesto" ya no se lee como error. En órdenes entregadas no se muestran días en taller ni se pinta la mano de obra como excedida. En Configuración está la leyenda.
- **Operar.** Vehículos, inventario, las órdenes del kanban y las bahías del Tablero abren una ficha lateral con todos los datos y acciones de demostración ("Pedir pieza", "Avisar al cliente", "Cerrar OT"...). Vehículos pasó de panel fijo a lista + ficha: en celular el panel quedaba debajo de toda la lista. Mensajes no se tocó en este punto: es una bandeja de tickets que ya muestra asunto, último mensaje y OT, y no se le agregó ficha.
- **Carga y error.** `—` en vez de `0` mientras llegan los datos, esqueletos estáticos y "Reintentar" si falla.
- **Navegación.** Riel de 64 px con pie de cuenta demo (CD + "Demo"). Verificado por código que entra completo en 375x568. El menú "Órdenes" se llama "Órdenes de trabajo", igual que el título.
- **Redundancia y leyendas.** Se quitó "Ocupación de bahías" del panel de horas (ya está en "6/6 ocupadas") y los contadores dejaron de repetir autos en planta. Cada gráfico lleva su leyenda inline; la cola y la actividad reciente muestran 6 ítems y "Ver todo" en vez de una caja con scroll. Ningún texto con datos baja de 12 px.
- **Datos.** La rótula y el radiador ahora tienen stock cero (antes decían que "bloqueaban" la orden con stock disponible), cada orden trae su `presupuesto` y coincide con el historial del vehículo, los vehículos con orden abierta están "en taller", se sumaron 4 vehículos sin orden (3 con service vencido) y se corrigieron montos por debajo del costo del repuesto.
