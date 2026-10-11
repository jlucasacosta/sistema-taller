# Backend — Vehículos
> Guía paso a paso para conectar el backend: docs/IMPLEMENTAR.md.

- La entidad raíz es el VEHÍCULO, no el contacto: vehiculos (patente, vin, modelo, km, cliente_id).
- Tablas: vehiculos, clientes, ordenes (historial por vehiculo).
- `estado` se deriva: en taller (tiene OT abierta) / service vencido (km o fecha superados) / al día.
- RLS por owner_id del taller.
- Reemplazar: modules/contactos/api.ts. Misma firma.
- Errores de carga: `useCarga(getVehiculos)` muestra «No pudimos cargar los vehículos.» con Reintentar si la función lanza.
- Clic o Enter en una patente abre la ficha lateral (reemplaza al panel fijo de detalle, que en celular quedaba debajo de toda la lista): datos del vehículo, km que faltan para el próximo service, orden en curso e historial con montos. Acciones demo: avisar al titular, recordatorio de service, agendar service, enviar ficha.
- Un vehículo con una orden abierta está siempre «en taller», aunque tenga el service vencido.
