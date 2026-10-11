# Backend — Vehículos
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- La entidad raíz es el VEHÍCULO, no el contacto: vehiculos (patente, vin, modelo, km, cliente_id).
- Tablas: vehiculos, clientes, ordenes (historial por vehiculo).
- `estado` se deriva: en taller (tiene OT abierta) / service vencido (km o fecha superados) / al día.
- RLS por owner_id del taller.
- Reemplazar: modules/contactos/api.ts. Misma firma.
