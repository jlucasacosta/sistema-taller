# Backend — Inventario (kárdex)
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- Tablas: piezas (sku, descripcion, ubicacion, costo, stock, punto_reorden, maximo),
  movimientos (pieza_id, ot_id, cantidad, tipo).
- El stock NO se guarda: se deriva de la suma de movimientos (ingresos - consumos).
- `bloqueaOT` sale del join con `ordenes`: pieza con stock 0 requerida por una OT abierta.
- Job (pg-boss): orden de compra automática al tocar el punto de reorden.
- Reemplazar: modules/inventario/api.ts. Misma firma.
- Errores de carga: `useCarga(getPiezas)` muestra «No pudimos cargar el inventario.» con Reintentar si la función lanza.
- Clic o Enter en una pieza abre su ficha: todos los datos, valor en stock (costo x stock) y lo que falta para llegar al máximo (derivados). Acciones demo: pedir pieza, ajustar stock (insert en `movimientos`), avisar al cliente de la OT bloqueada.
- Una pieza «bloquea» una OT solo si su stock es cero y una orden abierta la necesita.
