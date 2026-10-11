# Backend — Órdenes de trabajo (OT)
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- Tablas: ordenes (vehiculo_id, estado, bahia, mecanico_id, labor_estimada, fired_at),
  bahias (numero, activa), estados_ot (catálogo).
- `laborHecha` se deriva: now() - inicio_reparacion, menos las pausas por espera de repuesto.
- El estado `espera repuesto` sale del join con inventario: si una pieza requerida tiene stock 0,
  la OT se bloquea sola. Ese es el vinculo real del rubro.
- Job (pg-boss): alerta cuando labor_hecha supera labor_estimada, y cuando una OT
  lleva más de N días en la misma bahía.
- Constraint: una bahía no puede tener dos OT activas.
- Reemplazar: modules/ordenes/api.ts. Misma firma.
- Errores de carga: `useCarga(getOrdenes)` captura el rechazo y muestra «No pudimos cargar las órdenes de trabajo.» con Reintentar.
- Ficha de la orden (`ficha-ot.tsx`, la abren el kanban y el Estado de bahías): muestra todos los campos de la OT, el `presupuesto` (columna `costo_total`; en una orden entregada es el total facturado) y deriva lo que resta o se pasó de la mano de obra. Acciones demo: subir a bahía, enviar presupuesto, pasar a reparación/calidad, pedir pieza, cerrar OT, avisar al cliente.
- El `presupuesto` de cada orden coincide con su monto en el historial del vehículo (`ordenes.costo_total`).
- Subir a una bahía o entregar solo cambia estado de React en el demo: son `moverABahia` y `cerrarOT`, que con backend real deben lanzar si fallan (ej. bahía ocupada, código 23505).
