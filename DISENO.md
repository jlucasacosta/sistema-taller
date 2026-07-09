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
- espera repuesto → **naranja-señal #E8571E**
- vencido / excedido → **#B00020** (rojo más oscuro y frío, separado del naranja para que no se confundan de lejos)

Todo el color sale de `shell/theme.ts`. Cero hardcodeo en componentes.

## Módulos → arquetipo (componentes y tamaños)
| Módulo | Arquetipo | Componentes / tamaños |
|---|---|---|
| **dashboard** | plano-bahías | Hospeda el **Estado de Bahías** full-bleed arriba. Debajo, fila de 4 **stat-tiles** (autos en planta · OTs abiertas · esperando repuesto · entregas hoy), número JetBrains XXL. Panel de **bullet** (horas reales vs facturables por mecánico). Sin gráficos de torta. |
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
- **Borde tinta por umbral desde theme.ts**: dentro de estimado = acero; cerca = naranja-señal #E8571E; excedido = #B00020 pulsante.
- Chip square de estado (idle / en reparación / espera repuesto / listo).

Bahía vacía = celda hormigón con contorno punteado y rótulo **"LIBRE"** (sin el chevron hazard amarillo-negro: descartado con el kit racing).

**Interacción grabable:** arrastrar un auto de **COLA** a una bahía → la tarjeta "sube" (barra hidráulica anima de abajo hacia arriba), el timer arranca en 00:00, el borde pasa a acero. Al marcar **repuesto llegó** el estado salta de naranja a teal. Al cerrar **QC** se arrastra fuera de la bahía → la OT salta a **Entregado** y el chip square flipea a "LISTO".

Firma que lo separa del vecino: **lift-lanes verticales + cronómetro de labor**, distinto del `plano-mesas` horizontal del restaurante y del `heatmap`/mapa de inmobiliaria. Ningún otro sistema tiene un tablero de elevadores.

## Componente eliminado
**Buscador global del shell.** En un taller cada entidad se indexa por **PATENTE** o **Nº OT**, y ambos están surfaceados en cada tarjeta del Estado de Bahías y del kanban: el tablero ES el índice. Fuera el buscador dominante.

## Frame-firma
Autos "subiendo" en bahías/elevadores verticales bajo el Estado de Bahías, patente mono gigante, cronómetro de labor corriendo, el borde de una tarjeta pasando de acero → naranja-señal → #B00020 mientras otra, al cerrar QC, sale de la bahía y su chip square flipea a **LISTO** teal. Todo en light petróleo+naranja, movimiento vertical, sin hazard ni ámbar.

## Veredicto
**PASA** (spec LIGHT; variante dark descartada; rojo-vencido ajustado a #B00020).

### Diferenciación verificada
**PIEL** vs cada sistema decidido (≥3 palancas):
- vs inmobiliaria (light/sidebar/outlined/sharp/compact/square/Fraunces·Inter/verde+terracota): **nav, elevation, fuentes, color** (4) ✓
- vs restaurante (dark/rail/raised/round/comfortable/pill): mode, elevation, radius, density, badge, fuentes, color ✓
- vs barberia (light/topbar/flat/soft/comfortable/square): **nav, radius, density, fuentes, color** (5) ✓
- vs gimnasio (dark/sidebar/outlined/sharp/compact/pill): **mode, nav, elevation, badge, fuentes, color** (6) ✓

**ESQUELETO:** combo **stat-tiles + bullet** único (nadie usa ninguno) · arquetipo **plano-bahías** que nadie más tiene · segundo diferencial **Kárdex con gauge bullet por fila** · estrella **Estado de Bahías** (lift-lanes verticales + timer de labor) inexistente en el resto · eliminado real (buscador global). `ordenes=kanban` no es único (barbería lo usa en ventas) pero el peso cae en el estado de bahías, no en el kanban. Dos dashboards lado a lado: plano de elevadores con autos que suben, teal/naranja, light → no se confunde con ninguno.
