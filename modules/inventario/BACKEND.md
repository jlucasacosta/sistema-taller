# Backend — Inventario (kárdex)
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- Tablas: piezas (sku, descripcion, ubicacion, costo, stock, punto_reorden, maximo),
  movimientos (pieza_id, ot_id, cantidad, tipo).
- El stock NO se guarda: se deriva de la suma de movimientos (ingresos - consumos).
- `bloqueaOT` sale del join con `ordenes`: pieza con stock 0 requerida por una OT abierta.
- Job (pg-boss): orden de compra automática al tocar el punto de reorden.
- Reemplazar: modules/inventario/api.ts. Misma firma.
