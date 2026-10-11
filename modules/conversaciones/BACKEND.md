# Backend — Mensajes
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- Tablas: conversaciones (vehiculo_id, ot_id), mensajes.
- Cada hilo se ata a una patente y a una OT: en el taller no hay chat suelto.
- Ingreso: webhook de WhatsApp (Meta) -> Route Handler -> insert en mensajes.
- Job (pg-boss): recordatorio de presupuesto sin responder a las 48h.
- Reemplazar: modules/conversaciones/api.ts. Misma firma.
- Errores de carga: `useCarga(getTickets)` muestra «No pudimos cargar los mensajes.» con Reintentar si la función lanza.
- «Esperan aprobación» cuenta los hilos de tipo `aprobacion`: tiene que haber una OT en estado `aprobacion` por cada uno (el hilo se cierra al responder el cliente).
