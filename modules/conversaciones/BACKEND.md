# Backend — Mensajes
> Asume BACKEND_RULES.md.

- Tablas: conversaciones (vehiculo_id, ot_id), mensajes.
- Cada hilo se ata a una patente y a una OT: en el taller no hay chat suelto.
- Ingreso: webhook de WhatsApp (Meta) -> Route Handler -> insert en mensajes.
- Job (pg-boss): recordatorio de presupuesto sin responder a las 48h.
- Reemplazar: modules/conversaciones/api.ts. Misma firma.
