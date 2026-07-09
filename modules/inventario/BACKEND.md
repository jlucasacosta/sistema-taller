# Backend — Inventario (kardex)
> Asume BACKEND_RULES.md.

- Tablas: piezas (sku, descripcion, ubicacion, costo, stock, punto_reorden, maximo),
  movimientos (pieza_id, ot_id, cantidad, tipo).
- El stock NO se guarda: se deriva de la suma de movimientos (ingresos - consumos).
- `bloqueaOT` sale del join con ordenes: pieza con stock 0 requerida por una OT abierta.
- Job (pg-boss): orden de compra automatica al tocar el punto de reorden.
- Reemplazar: modules/inventario/api.ts. Misma firma.
