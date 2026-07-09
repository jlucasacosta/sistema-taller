# Backend — Ordenes de trabajo (OT)
> Asume BACKEND_RULES.md.

- Tablas: ordenes (vehiculo_id, estado, bahia, mecanico_id, labor_estimada, fired_at),
  bahias (numero, activa), estados_ot (catalogo).
- `laborHecha` se deriva: now() - inicio_reparacion, menos las pausas por espera de repuesto.
- El estado `espera repuesto` sale del join con inventario: si una pieza requerida tiene stock 0,
  la OT se bloquea sola. Ese es el vinculo real del rubro.
- Job (pg-boss): alerta cuando labor_hecha supera labor_estimada, y cuando una OT
  lleva mas de N dias en la misma bahia.
- Constraint: una bahia no puede tener dos OT activas.
- Reemplazar: modules/ordenes/api.ts. Misma firma.
