# Backend — Planta (dashboard)
> Asume BACKEND_RULES.md.

- Sin tablas propias: agrega ordenes, bahias e inventario.
- Los bullet charts (horas reales vs objetivo) salen de una vista materializada por mecanico.
- Realtime: suscribir a `ordenes` para que el Tablero de Bahias se mueva solo.
- Reemplazar: modules/dashboard/api.ts (mock -> queries agregadas). Misma firma.
