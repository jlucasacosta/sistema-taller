# Backend — Planta (dashboard)
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- Sin tablas propias: agrega las tablas `ordenes`, `bahias` e inventario.
- Los bullet charts (horas reales vs objetivo) salen de una vista materializada por mecánico.
- Realtime: suscribir a `ordenes` para que el Tablero de Bahias se mueva solo.
- Reemplazar: modules/dashboard/api.ts (mock -> queries agregadas). Misma firma.
- Errores de carga: la pantalla usa `useCarga(getBullets / getAvisos / getOrdenes)`. Si alguna función lanza un error, el Tablero muestra «No pudimos cargar el tablero de la planta.» con Reintentar. Las funciones deben lanzar, no devolver listas vacías.
- Los contadores (órdenes abiertas, esperando repuesto, excedidas, para entregar) se calculan en la pantalla sobre `getOrdenes()`; no hay `getTiles()`. La vista `dashboard_resumen` de docs/IMPLEMENTAR.md es la versión SQL.
- Clic o Enter en un auto del Estado de bahías abre la ficha de su OT (`modules/ordenes/ficha-ot.tsx`). Las acciones de la ficha son de demostración: al conectar el backend, cada una se convierte en un update sobre `ordenes`.
