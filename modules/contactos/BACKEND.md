# Backend — Vehiculos
> Asume BACKEND_RULES.md.

- La entidad raiz es el VEHICULO, no el contacto: vehiculos (patente, vin, modelo, km, cliente_id).
- Tablas: vehiculos, clientes, ordenes (historial por vehiculo).
- `estado` se deriva: en taller (tiene OT abierta) / service vencido (km o fecha superados) / al dia.
- RLS por owner_id del taller.
- Reemplazar: modules/contactos/api.ts. Misma firma.
