# Cómo llevar BULÓN a producción (guía de implementación)

Esta guía te lleva de "clone el demo" a "mi taller usando el sistema con datos reales". Está escrita para principiantes: cada paso es copiable y dice cómo comprobar que salió bien.

> **Importante:** este repositorio es un **demo frontend con datos de ejemplo y sin backend**. Esta guía **describe** cómo conectar el backend (Supabase, Railway, IA); nada de lo que aparece acá viene instalado en el repo. Los bloques de código son ejemplos para que copies en **tu clon**.
>
> Todo lo que ves con `tu-proyecto`, `tu-dominio` o `<...>` es un marcador: reemplazalo por lo tuyo. En esta guía no hay datos, claves ni direcciones reales.

---

## 0. Qué vas a lograr, en qué orden y cuánto tarda

Al terminar vas a tener:

- El sistema corriendo en tu computadora y publicado en internet con tu dominio.
- Una base de datos real (Supabase) con las órdenes, los repuestos, los vehículos y los mensajes de tu taller.
- Usuarios que inician sesión (Supabase Auth); nadie sin cuenta ve nada.
- Tareas automáticas en segundo plano (Railway): avisos de "auto listo", recordatorios de service, seguimiento de presupuestos.
- Opcional: asistente de IA que sugiere respuestas a los mensajes de los clientes.

| Etapa | Qué hacés | Tiempo estimado (primera vez) |
|---|---|---|
| 1 | Clonar y correr local | 15 a 30 min |
| 2 | Entender el mapa del sistema | 15 min de lectura |
| 3 | Supabase: base de datos, datos de ejemplo, Auth y conectar el frontend | 2 a 4 h |
| 4 | Railway: worker con pg-boss | 1 a 2 h |
| 5 | Vercel: publicar | 30 a 60 min |
| 6 | IA (opcional) | 1 a 2 h |
| 7 | Checklist de seguridad antes de cargar datos reales | 30 min |

Los tiempos son orientativos para alguien que lo hace por primera vez. **El orden importa:** primero la base de datos (3), después publicar (5), y recién después las tareas en segundo plano (4) y la IA (6).

---

## 1. Clonar y correr local

### 1.1 Requisitos

| Programa | Para qué | Descarga |
|---|---|---|
| Node.js (versión LTS) | Corre el proyecto | https://nodejs.org |
| Git | Baja el código | https://git-scm.com |

Verificá que quedaron instalados (abrí una terminal):

```bash
node -v
git --version
```

Si cada comando devuelve un número de versión, está listo. Este proyecto necesita Node 18.18 o mayor.

### 1.2 Clonar y arrancar

```bash
git clone https://github.com/jlucasacosta/sistema-taller.git
cd sistema-taller
npm install
npm run dev
```

Abrí http://localhost:3000. Tenés que ver el tablero de bahías con los autos. Para frenar el servidor, `Ctrl + C` en la terminal.

### 1.3 Si algo falla: los 3 errores típicos

| Qué ves | Qué pasó | Solución |
|---|---|---|
| `node` / `npm` / `git` "no se reconoce como un comando" | La instalación no terminó o la terminal es anterior a instalar | Instalá desde los links de arriba, **cerrá y abrí de nuevo la terminal**, repetí `node -v` |
| `You are using Node.js 16...` o un error de versión | Tu Node es viejo | Instalá la versión LTS desde https://nodejs.org y repetí |
| Next dice que el puerto 3000 está ocupado y usa 3001, o no abre nada | Hay otro programa en el 3000 | Abrí la dirección que imprime la terminal (por ejemplo `http://localhost:3001`) o corré `npm run dev -- -p 3005` |

Un cuarto caso: errores raros después de cambiar de rama o de versión. Se arregla borrando e instalando de nuevo (en Windows PowerShell: `Remove-Item -Recurse -Force node_modules`):

```bash
rm -rf node_modules .next
npm install
```

---

## 2. Mapa de este sistema

El sistema tiene 6 módulos. Cada módulo con datos tiene un `api.ts` (hoy devuelve datos de ejemplo) y un `data.json`. **Conectar el backend es cambiar el cuerpo de las funciones de `api.ts`; la firma (nombre, parámetros y tipo de lo que devuelve) no se toca**, así las pantallas siguen funcionando igual.

| Módulo (ruta) | Funciones de `api.ts` | Archivo de datos (clave) | Tablas sugeridas en la base |
|---|---|---|---|
| Tablero (`/dashboard`) | `getBullets()`, `getAvisos()` (más `getOrdenes()` y `cerrarOT()` del módulo de órdenes) | `modules/dashboard/data.json` (`bullets`, `avisos`) | `avisos`, `ajustes` y vistas calculadas `dashboard_resumen`, `dashboard_bullets` |
| Órdenes (`/ordenes`) | `getOrdenes()`, `moverABahia(id, bahia)`, `cerrarOT(id)` | `modules/ordenes/data.json` (`ordenes`) | `ordenes`, `bahias`, `mecanicos`, `ordenes_repuestos` y vista `ordenes_detalle` |
| Inventario (`/inventario`) | `getPiezas()` | `modules/inventario/data.json` (`piezas`) | `piezas`, `movimientos` y vista `piezas_estado` |
| Mensajes (`/conversaciones`) | `getTickets()` | `modules/conversaciones/data.json` (`tickets`) | `conversaciones`, `mensajes` y vista `tickets` |
| Vehículos (`/contactos`) | `getVehiculos()` | `modules/contactos/data.json` (`vehiculos`, con `historial` adentro) | `clientes`, `vehiculos` (y `ordenes` para el historial) y vista `vehiculos_estado` |
| Configuración (`/config`) | no tiene `api.ts`: lee `shell/theme.ts` | no tiene | las constantes de mano de obra podrían vivir en `ajustes` |

Cada módulo trae un `BACKEND.md` con las ideas de diseño del backend. Esta guía las convierte en SQL concreto.

Dos cosas del demo que conviene saber antes de empezar:

- El **estado de bahías** (el componente estrella) sale de la lista de órdenes: una orden con `bahia` distinta de `null` está sobre un elevador; una en estado `en cola` espera. No hay una tabla "estado de bahías": se calcula.
- Los cuatro contadores del Tablero (órdenes abiertas, esperando repuesto, excedidas, para entregar) **ya se calculan en la pantalla** a partir de `getOrdenes()`: no hay una función `getTiles()`. Los *bullets* de horas por mecánico son texto fijo en el demo; con datos reales salen de consultas sobre `ordenes` (más abajo).
- Cada pantalla que carga datos usa el hook `useCarga` (`shell/carga.tsx`): mientras llegan muestra `—` y bloques grises, y si la función de `api.ts` lanza un error muestra «No pudimos cargar…» con un botón **Reintentar**. Por eso, con backend real, tus funciones tienen que **lanzar** el error (ver 3.6).
- Vehículos, inventario y órdenes abren una **ficha lateral** (`shell/ficha-lateral.tsx`) con todos los datos de la fila y acciones de demostración que no guardan nada: son el punto de partida para conectar las escrituras reales.

---

## 3. Supabase: base de datos y Auth

Supabase te da una base Postgres, el inicio de sesión de usuarios y una API lista para usar desde el navegador.

### 3.1 Crear el proyecto

1. Entrá a https://supabase.com y creá una cuenta.
2. **New project**: ponele un nombre (por ejemplo `bulon`), elegí una contraseña fuerte para la base (guardala en tu gestor de contraseñas: no se vuelve a mostrar) y la región más cercana a tus usuarios.
3. Esperá a que termine de crearse.
4. Abrí **SQL Editor** (menú de la izquierda). Ahí vas a pegar los bloques SQL de abajo, de a uno, en este orden.

### 3.2 Crear las tablas (SQL)

El diseño sale de los tipos reales de cada `api.ts` y de las claves reales de cada `data.json`:

- `OT` (`ordenes`): `id` ("OT-4821"), `patente`, `vehiculo`, `km`, `cliente`, `mecanico`, `trabajo`, `estado`, `bahia`, `laborHecha`, `laborEstimada` (minutos), `diasEnTaller`, `presupuesto` (pesos; `null` mientras no se diagnosticó; en una orden entregada es el total facturado), `repuestoFaltante?`.
- `Pieza` (`inventario`): `id`, `sku`, `descripcion`, `ubicacion`, `costo`, `stock`, `reorden`, `maximo`, `bloqueaOT?`.
- `Vehiculo` (`contactos`): `id`, `patente`, `vehiculo`, `vin`, `km`, `cliente`, `telefono`, `email`, `proximoService`, `estado`, `historial: { fecha, ot, trabajo, costo }[]`.
- `Ticket` (`conversaciones`): `id`, `patente`, `ot`, `cliente`, `asunto`, `ultimo`, `hora`, `sinLeer`, `tipo`.
- Dashboard: `Bullet` (`label`, `real`, `objetivo`, `max`, `unidad`), `Aviso` (`texto`, `tiempo`, `tono`).

Reglas que se respetan en el SQL (son las del demo):

- Estados de una orden: `en cola`, `diagnostico`, `aprobacion`, `reparacion`, `espera repuesto`, `qc`, `entregado`.
- Una bahía no puede tener dos órdenes activas a la vez (índice único).
- Una orden `en cola` o `entregado` no ocupa bahía.
- El stock **no se guarda**: se calcula sumando los movimientos (ingresos menos consumos).
- Los estados de un vehículo (`en taller`, `al dia`, `service vencido`) **no se guardan**: se calculan.

**Bloque A: tablas e índices.** Pegalo completo y apretá **Run**.

```sql
-- ============ Personas y vehículos ============
create table public.mecanicos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null unique,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.clientes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  created_at timestamptz not null default now()
);

create table public.vehiculos (
  id                 uuid primary key default gen_random_uuid(),
  patente            text not null unique,                       -- "AF 412 KM"
  modelo             text not null,                              -- data.json: "vehiculo" ("VW Amarok 2019")
  vin                text unique check (vin is null or char_length(vin) = 17),
  km                 integer not null default 0 check (km >= 0),
  proximo_service_km integer check (proximo_service_km is null or proximo_service_km >= 0),
  cliente_id         uuid not null references public.clientes(id) on delete restrict,
  created_at         timestamptz not null default now()
);
create index vehiculos_cliente_idx on public.vehiculos (cliente_id);

-- ============ Planta y órdenes de trabajo ============
create table public.bahias (
  numero smallint primary key check (numero > 0),
  activa boolean not null default true
);

-- El Nº de orden ("OT-4835") se genera solo a partir de esta secuencia.
create sequence public.ordenes_numero_seq start with 4835;

create table public.ordenes (
  id                 text primary key default ('OT-' || nextval('public.ordenes_numero_seq')::text),
  vehiculo_id        uuid not null references public.vehiculos(id) on delete restrict,
  mecanico_id        uuid references public.mecanicos(id) on delete set null,   -- null = sin asignar (el demo muestra "—")
  trabajo            text not null,
  estado             text not null default 'en cola'
                       check (estado in ('en cola','diagnostico','aprobacion','reparacion','espera repuesto','qc','entregado')),
  bahia              smallint references public.bahias(numero),                -- null = no está sobre un elevador
  km_ingreso         integer check (km_ingreso is null or km_ingreso >= 0),
  labor_hecha_min    numeric(8,2) not null default 0 check (labor_hecha_min >= 0),   -- minutos
  labor_estimada_min integer not null check (labor_estimada_min > 0),                 -- minutos
  costo_total        numeric(12,2) check (costo_total is null or costo_total >= 0),
  ingreso_at         timestamptz not null default now(),
  entregado_at       timestamptz,
  created_at         timestamptz not null default now(),
  constraint ordenes_entregado_coherente check ((estado = 'entregado') = (entregado_at is not null)),
  constraint ordenes_entregado_sin_bahia check (estado <> 'entregado' or bahia is null),
  constraint ordenes_cola_sin_bahia      check (estado <> 'en cola'   or bahia is null)
);
-- Una bahía, una orden activa:
create unique index ordenes_una_ot_por_bahia on public.ordenes (bahia) where bahia is not null;
create index ordenes_vehiculo_idx on public.ordenes (vehiculo_id);
create index ordenes_estado_idx   on public.ordenes (estado);
create index ordenes_mecanico_idx on public.ordenes (mecanico_id);

-- ============ Inventario (kárdex) ============
create table public.piezas (
  id            uuid primary key default gen_random_uuid(),
  sku           text not null unique,                 -- "48068-0K040"
  descripcion   text not null,
  ubicacion     text,                                 -- "A-01-3"
  costo         numeric(12,2) not null default 0 check (costo >= 0),   -- data.json trae "$ 8.400" (texto)
  punto_reorden integer not null default 0 check (punto_reorden >= 0), -- data.json: "reorden"
  stock_maximo  integer not null check (stock_maximo > 0),             -- data.json: "maximo"
  created_at    timestamptz not null default now(),
  constraint piezas_reorden_menor_maximo check (punto_reorden <= stock_maximo)
);

-- El stock real = suma de movimientos. Ingreso positivo, consumo negativo.
create table public.movimientos (
  id         uuid primary key default gen_random_uuid(),
  pieza_id   uuid not null references public.piezas(id) on delete cascade,
  orden_id   text references public.ordenes(id) on delete set null,
  tipo       text not null check (tipo in ('ingreso','consumo','ajuste')),
  cantidad   integer not null check (cantidad <> 0),
  created_at timestamptz not null default now(),
  constraint movimientos_signo check (
    (tipo = 'ingreso' and cantidad > 0) or (tipo = 'consumo' and cantidad < 0) or tipo = 'ajuste'
  )
);
create index movimientos_pieza_idx on public.movimientos (pieza_id);

-- Qué repuestos necesita cada orden (de acá sale "bloquea OT" y "repuesto faltante").
create table public.ordenes_repuestos (
  orden_id text not null references public.ordenes(id) on delete cascade,
  pieza_id uuid not null references public.piezas(id) on delete restrict,
  cantidad integer not null default 1 check (cantidad > 0),
  primary key (orden_id, pieza_id)
);
create index ordenes_repuestos_pieza_idx on public.ordenes_repuestos (pieza_id);

-- ============ Mensajes (cada hilo atado a una patente y a una OT) ============
create table public.conversaciones (
  id                uuid primary key default gen_random_uuid(),
  vehiculo_id       uuid not null references public.vehiculos(id) on delete cascade,
  orden_id          text references public.ordenes(id) on delete set null,
  asunto            text not null,
  tipo              text not null check (tipo in ('aprobacion','consulta','aviso','reclamo')),
  sin_leer          smallint not null default 0 check (sin_leer >= 0),
  ultimo_mensaje_at timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
create index conversaciones_vehiculo_idx on public.conversaciones (vehiculo_id);
create index conversaciones_orden_idx    on public.conversaciones (orden_id);
create index conversaciones_ultimo_idx   on public.conversaciones (ultimo_mensaje_at desc);

create table public.mensajes (
  id              uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.conversaciones(id) on delete cascade,
  autor           text not null check (autor in ('cliente','taller')),
  cuerpo          text not null,
  created_at      timestamptz not null default now()
);
create index mensajes_conversacion_idx on public.mensajes (conversacion_id, created_at desc);

-- ============ Tablero ============
create table public.ajustes (            -- umbrales y objetivos del taller
  clave text primary key,
  valor numeric not null
);
insert into public.ajustes (clave, valor) values
  ('labor_cerca', 0.85),                          -- = theme.labor.cerca
  ('labor_excedido', 1),                          -- = theme.labor.excedido
  ('objetivo_horas_facturables_semana', 36),
  ('objetivo_ots_entregadas_semana', 6);

create table public.avisos (             -- feed de "Actividad reciente"
  id         uuid primary key default gen_random_uuid(),
  texto      text not null,
  tono       text not null check (tono in ('primary','accent','success','warning','danger','info')),
  created_at timestamptz not null default now()
);
create index avisos_created_idx on public.avisos (created_at desc);
```

**Bloque B: vistas.** Entregan a la app los datos ya calculados y con la forma que esperan los tipos (`security_invoker = true` hace que las vistas respeten el RLS de las tablas; sin eso saltearían la seguridad).

```sql
-- Stock = suma de movimientos
create view public.piezas_stock with (security_invoker = true) as
select p.*, coalesce(sum(m.cantidad), 0)::int as stock
from public.piezas p
left join public.movimientos m on m.pieza_id = p.id
group by p.id;

-- Stock + "bloquea OT": una orden abierta pide más unidades de las que hay
create view public.piezas_estado with (security_invoker = true) as
select s.*,
  (select r.orden_id
     from public.ordenes_repuestos r
     join public.ordenes o on o.id = r.orden_id
    where r.pieza_id = s.id and o.estado <> 'entregado' and s.stock < r.cantidad
    order by r.orden_id
    limit 1) as bloquea_ot
from public.piezas_stock s;

-- Orden con todo lo que muestra la pantalla de Órdenes y el Tablero de Bahías
create view public.ordenes_detalle with (security_invoker = true) as
select
  o.id,
  v.patente,
  v.modelo                                   as vehiculo,
  coalesce(o.km_ingreso, v.km)               as km,
  c.nombre                                   as cliente,
  coalesce(m.nombre, '—')                    as mecanico,
  o.trabajo,
  o.estado,
  o.bahia,
  o.labor_hecha_min,
  o.labor_estimada_min,
  o.costo_total                              as presupuesto,
  (coalesce(o.entregado_at, now())::date - o.ingreso_at::date) as dias_en_taller,
  (select p.descripcion || ' (' || p.sku || ')'
     from public.ordenes_repuestos r
     join public.piezas_stock p on p.id = r.pieza_id
    where r.orden_id = o.id and p.stock < r.cantidad
    order by p.sku
    limit 1)                                 as repuesto_faltante
from public.ordenes o
join public.vehiculos v on v.id = o.vehiculo_id
join public.clientes  c on c.id = v.cliente_id
left join public.mecanicos m on m.id = o.mecanico_id;

-- Vehículo con su estado calculado
create view public.vehiculos_estado with (security_invoker = true) as
select v.*, c.nombre as cliente, c.telefono, c.email,
  case
    when exists (select 1 from public.ordenes o where o.vehiculo_id = v.id and o.estado <> 'entregado')
      then 'en taller'
    when v.proximo_service_km is not null and v.km >= v.proximo_service_km
      then 'service vencido'
    else 'al dia'
  end as estado
from public.vehiculos v
join public.clientes c on c.id = v.cliente_id;

-- Bandeja de mensajes
create view public.tickets with (security_invoker = true) as
select
  c.id,
  v.patente,
  c.orden_id as ot,
  cl.nombre  as cliente,
  c.asunto,
  c.tipo,
  c.sin_leer,
  c.ultimo_mensaje_at,
  (select m.cuerpo from public.mensajes m
    where m.conversacion_id = c.id
    order by m.created_at desc limit 1) as ultimo
from public.conversaciones c
join public.vehiculos v  on v.id = c.vehiculo_id
join public.clientes  cl on cl.id = v.cliente_id;

-- Contadores del Tablero. En el demo se calculan en la pantalla; con backend real podés
-- dejarlos así (suman sobre getOrdenes) o traerlos de esta vista (las definiciones son un ejemplo).
create view public.dashboard_resumen with (security_invoker = true) as
select
  (select count(*) from public.ordenes where estado <> 'entregado')::int                              as ots_abiertas,
  (select count(*) from public.ordenes where estado = 'espera repuesto')::int                         as esperando_repuesto,
  (select count(*) from public.ordenes
    where estado <> 'entregado' and labor_hecha_min > 0
      and labor_hecha_min >= labor_estimada_min * (select valor from public.ajustes where clave = 'labor_excedido'))::int as excedidas,
  (select count(*) from public.ordenes where estado = 'qc')::int                                      as para_entregar;

-- Bullets del Tablero: real vs objetivo
create view public.dashboard_bullets with (security_invoker = true) as
select m.id::text as id,
       m.nombre || ' · horas facturables' as label,
       round(coalesce(sum(o.labor_hecha_min) / 60.0, 0), 1) as valor_real,
       (select valor from public.ajustes where clave = 'objetivo_horas_facturables_semana') as objetivo,
       44::numeric as maximo,
       'h'::text as unidad
from public.mecanicos m
left join public.ordenes o
       on o.mecanico_id = m.id and o.entregado_at >= date_trunc('week', now())
where m.activo
group by m.id, m.nombre
union all
select 'entregadas', 'OTs entregadas / semana',
       count(*)::numeric,
       (select valor from public.ajustes where clave = 'objetivo_ots_entregadas_semana'),
       10::numeric, 'OT'
from public.ordenes where estado = 'entregado' and entregado_at >= date_trunc('week', now());
```

**Bloque C: seguridad (RLS y permisos).** Este bloque es el más importante: sin RLS cualquiera que tenga la clave pública podría leer o borrar todo.

```sql
-- 1) Activar RLS en TODAS las tablas
alter table public.mecanicos         enable row level security;
alter table public.clientes          enable row level security;
alter table public.vehiculos         enable row level security;
alter table public.bahias            enable row level security;
alter table public.ordenes           enable row level security;
alter table public.piezas            enable row level security;
alter table public.movimientos       enable row level security;
alter table public.ordenes_repuestos enable row level security;
alter table public.conversaciones    enable row level security;
alter table public.mensajes          enable row level security;
alter table public.ajustes           enable row level security;
alter table public.avisos            enable row level security;

-- 2) Políticas de EJEMPLO: cualquier usuario autenticado (con sesión iniciada) puede
--    leer y escribir. Sirve para un taller con su equipo. El visitante anónimo NO accede a nada.
do $$
declare t text;
begin
  foreach t in array array[
    'mecanicos','clientes','vehiculos','bahias','ordenes','piezas','movimientos',
    'ordenes_repuestos','conversaciones','mensajes','ajustes','avisos'
  ]
  loop
    execute format('create policy "autenticados leen" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "autenticados escriben" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- 3) Permisos de la API para usuarios con sesión (y NINGUNO para anónimos)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
```

Qué hay que saber de esas políticas:

- Son un **punto de partida**. Si algún día el sistema atiende **varios talleres**, agregá una columna `taller_id` a cada tabla y cambiá `using (true)` por una condición que compare ese id con el del usuario (por ejemplo, guardado en una tabla `taller_miembros`). No lo armamos acá para que el primer taller funcione simple.
- Si ves el error `permission denied for table ...` al consultar, falta el `grant` del paso 3: volvé a correr esas tres líneas.
- Para **ver cambios en vivo** (que el tablero se mueva solo cuando otro usuario sube un auto), podés activar Realtime en `ordenes` desde el panel (Database > Replication) o con `alter publication supabase_realtime add table public.ordenes;`. Es opcional y no está conectado en el demo.

> Los tres bloques se probaron en un Postgres local cargando los datos de ejemplo del demo (tablas, vistas, restricciones y reglas de bahía). Los permisos y el RLS dependen de tu proyecto de Supabase: por eso conviene hacer la comprobación de abajo.

**Cómo comprobar que quedó bien:** en el panel andá a **Table Editor**: tienen que aparecer las 12 tablas, cada una con el candado de RLS activado. En **Database > Views** (o en el editor SQL con `select * from public.piezas_estado;`) tienen que existir las vistas y devolver 0 filas sin error.

### 3.3 Cargar los datos de ejemplo

Para probar con algo real (no con tablas vacías) podés cargar los mismos datos de ejemplo del demo.

**Opción recomendada: un script que lee los `data.json`.** Las tablas se relacionan con identificadores (uuid), así que a mano es engorroso; el script los resuelve solo. Guardalo como `seed-supabase.mjs` en la raíz **de tu clon** (no lo subas a un repo público) y corrélo **una sola vez**.

Antes necesitás las variables de entorno (sección 3.4) y la librería instalada (sección 3.5). Para esta carga usás la clave secreta (`SUPABASE_SERVICE_ROLE_KEY`), que se salta el RLS: **solo en tu computadora, desde `.env.local`**, jamás en el frontend.

```js
// seed-supabase.mjs · carga los data.json del demo en Supabase. Correlo UNA vez:
//   node --env-file=.env.local seed-supabase.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")
const db = createClient(url, key, { auth: { persistSession: false } })

const leer = (modulo) => JSON.parse(readFileSync(`modules/${modulo}/data.json`, "utf8"))
const ok = (res, paso) => {
  if (res.error) throw new Error(`${paso}: ${res.error.message}`)
  return res.data
}
const plata = (texto) => Number(texto.replace(/[^0-9]/g, "")) // "$ 486.000" -> 486000

// --- fechas: el demo trae textos ("hace 2 h", "mar 2026", "Ayer", "16:40") ---
const ahora = Date.now()
const DIA = 86_400_000
const hace = (ms) => new Date(ahora - ms).toISOString()
const MES = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 }
function fechaHistorial(texto) {
  if (texto === "hoy") return hace(0)
  if (texto === "esta semana") return hace(3 * DIA)
  const [mes, anio] = texto.split(" ")
  return new Date(Date.UTC(Number(anio), MES[mes], 15, 12)).toISOString()
}
function haceTexto(texto) {
  if (texto === "ayer") return hace(DIA)
  const [, n, unidad] = texto.match(/hace (\d+) (min|h|días)/)
  return hace(Number(n) * (unidad === "min" ? 60_000 : unidad === "h" ? 3_600_000 : DIA))
}
function horaDeHoy(texto) {
  if (texto === "Ayer") return hace(DIA)
  const [h, m] = texto.split(":").map(Number)
  const d = new Date(ahora)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const ordenes = leer("ordenes").ordenes
const vehiculos = leer("contactos").vehiculos
const piezas = leer("inventario").piezas
const tickets = leer("conversaciones").tickets
const dash = leer("dashboard")

// 1) bahías (los ajustes ya los cargó el bloque A)
const NUM_BAHIAS = 6 // = theme.bahias
ok(await db.from("bahias").upsert(Array.from({ length: NUM_BAHIAS }, (_, i) => ({ numero: i + 1 }))), "bahias")

// 2) mecánicos ("—" significa sin asignar: no es una persona)
const nombresMecanicos = [...new Set(ordenes.map((o) => o.mecanico).filter((n) => n !== "—"))]
const mecanicos = ok(
  await db.from("mecanicos").upsert(nombresMecanicos.map((nombre) => ({ nombre })), { onConflict: "nombre" }).select("id,nombre"),
  "mecanicos",
)
const mecId = Object.fromEntries(mecanicos.map((m) => [m.nombre, m.id]))

// 3) clientes y vehículos (en el demo, cada vehículo tiene un titular distinto)
const clientes = ok(
  await db.from("clientes").insert(vehiculos.map((v) => ({ nombre: v.cliente, telefono: v.telefono, email: v.email }))).select("id,nombre"),
  "clientes",
)
const cliId = Object.fromEntries(clientes.map((c) => [c.nombre, c.id]))
const vehs = ok(
  await db.from("vehiculos").insert(
    vehiculos.map((v) => ({
      patente: v.patente,
      modelo: v.vehiculo,
      vin: v.vin,
      km: v.km,
      // "160.000 km" -> 160000. "vencido" -> el km actual (así km >= proximo y sale "service vencido")
      proximo_service_km: v.proximoService === "vencido" ? v.km : plata(v.proximoService),
      cliente_id: cliId[v.cliente],
    })),
  ).select("id,patente"),
  "vehiculos",
)
const vehId = Object.fromEntries(vehs.map((v) => [v.patente, v.id]))

// 4) órdenes: las 22 del tablero + las del historial que no están en el tablero (15 trabajos viejos)
const historial = vehiculos.flatMap((v) => v.historial.map((h) => ({ ...h, patente: v.patente })))
const hist = Object.fromEntries(historial.map((h) => [h.ot, h]))
const filasOrdenes = ordenes.map((o) => ({
  id: o.id,
  vehiculo_id: vehId[o.patente],
  mecanico_id: mecId[o.mecanico] ?? null,
  trabajo: o.trabajo,
  estado: o.estado,
  bahia: o.bahia,
  km_ingreso: o.km,
  labor_hecha_min: o.laborHecha,
  labor_estimada_min: o.laborEstimada,
  costo_total: o.presupuesto, // el presupuesto de la orden (null si todavía está en cola)
  ingreso_at: hace(o.diasEnTaller * DIA),
  entregado_at: o.estado === "entregado" ? fechaHistorial(hist[o.id]?.fecha ?? "hoy") : null,
}))
const filasPasadas = historial
  .filter((h) => !ordenes.some((o) => o.id === h.ot))
  .map((h) => ({
    id: h.ot,
    vehiculo_id: vehId[h.patente],
    trabajo: h.trabajo,
    estado: "entregado",
    labor_estimada_min: 60, // el demo no guarda la estimación de trabajos viejos: valor de relleno
    costo_total: plata(h.costo),
    ingreso_at: fechaHistorial(h.fecha),
    entregado_at: fechaHistorial(h.fecha),
  }))
ok(await db.from("ordenes").insert([...filasOrdenes, ...filasPasadas]), "ordenes")

// 5) inventario: el stock inicial entra como un movimiento de ingreso
const ps = ok(
  await db.from("piezas").insert(
    piezas.map((p) => ({
      sku: p.sku,
      descripcion: p.descripcion,
      ubicacion: p.ubicacion,
      costo: plata(p.costo),
      punto_reorden: p.reorden,
      stock_maximo: p.maximo,
    })),
  ).select("id,sku"),
  "piezas",
)
const pzId = Object.fromEntries(ps.map((p) => [p.sku, p.id]))
ok(
  await db.from("movimientos").insert(
    piezas.filter((p) => p.stock > 0).map((p) => ({ pieza_id: pzId[p.sku], tipo: "ingreso", cantidad: p.stock })),
  ),
  "movimientos",
)
// la pieza que "bloquea" una OT: la orden pide una unidad más de las que hay, así queda bloqueada como en el demo
ok(
  await db.from("ordenes_repuestos").insert(
    piezas.filter((p) => p.bloqueaOT).map((p) => ({ orden_id: p.bloqueaOT, pieza_id: pzId[p.sku], cantidad: p.stock + 1 })),
  ),
  "ordenes_repuestos",
)

// 6) mensajes: un hilo por ticket, con su último mensaje
const convs = ok(
  await db.from("conversaciones").insert(
    tickets.map((t) => ({
      vehiculo_id: vehId[t.patente],
      orden_id: t.ot,
      asunto: t.asunto,
      tipo: t.tipo,
      sin_leer: t.sinLeer,
      ultimo_mensaje_at: horaDeHoy(t.hora),
    })),
  ).select("id,orden_id"),
  "conversaciones",
)
const convId = Object.fromEntries(convs.map((c) => [c.orden_id, c.id]))
ok(
  await db.from("mensajes").insert(
    tickets.map((t) => ({ conversacion_id: convId[t.ot], autor: "cliente", cuerpo: t.ultimo, created_at: horaDeHoy(t.hora) })),
  ),
  "mensajes",
)

// 7) feed de actividad
ok(await db.from("avisos").insert(dash.avisos.map((a) => ({ texto: a.texto, tono: a.tono, created_at: haceTexto(a.tiempo) }))), "avisos")

console.log("Listo: datos de ejemplo cargados.")
```

Notas para correrlo bien:

- Es de **una sola vez**: si lo corrés dos veces vas a ver errores de duplicados. Para empezar de cero, en el editor SQL:

  ```sql
  truncate public.mensajes, public.conversaciones, public.ordenes_repuestos, public.movimientos,
           public.ordenes, public.piezas, public.vehiculos, public.clientes, public.mecanicos,
           public.avisos, public.bahias restart identity cascade;
  ```

- Lee los datos de `modules/*/data.json`, por eso se corre desde la raíz del repo.
- Con `--env-file` necesitás Node 20.6 o mayor.
- Usa nombres de persona y de patente ficticios del demo. **Son datos de ejemplo: borralos antes de cargar los reales** (usá el `truncate` de arriba).

**Alternativa por CSV (solo para tablas simples):** en **Table Editor** abrí la tabla y usá **Insert > Import data from CSV** (el nombre exacto del botón puede variar según la versión del panel). Sirve para `piezas` o `mecanicos`, pero exige que las columnas del CSV se llamen igual que las de la tabla, que `costo` vaya sin `$` ni puntos y que los vínculos (uuid) estén resueltos: por eso para las tablas relacionadas el script es mucho más cómodo.

**Cómo comprobar:** en el editor SQL, `select count(*) from public.ordenes;` debería dar 37 (las 22 del tablero + 15 trabajos viejos que solo aparecían en el historial de los vehículos), y `select * from public.piezas_estado where bloquea_ot is not null;` debería devolver 3 piezas.

### 3.4 Variables de entorno

1. En tu clon, copiá el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   En Windows PowerShell: `Copy-Item .env.example .env.local`.

2. En el panel de Supabase abrí **Connect** (o **Project Settings > API Keys**) y copiá:
   - la **URL del proyecto** (algo como `https://tu-proyecto.supabase.co`) a `NEXT_PUBLIC_SUPABASE_URL`
   - la **clave pública** a `NEXT_PUBLIC_SUPABASE_ANON_KEY`. En el panel puede llamarse **publishable key** (empieza con `sb_publishable_`) o **anon** (la versión anterior). Las dos sirven; si copiás ejemplos de la documentación oficial vas a ver el nombre `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: es la misma clave, acá mantenemos `ANON_KEY` por compatibilidad con el `.env.example` de este repo.

3. La clave **secreta** (`service_role` o *secret key*) va solo en `SUPABASE_SERVICE_ROLE_KEY`, y solo si la necesitás (el script de carga, el worker de Railway).

Reglas que no se negocian:

- **La clave secreta jamás va al frontend ni lleva el prefijo `NEXT_PUBLIC_`.** Todo lo que empieza con `NEXT_PUBLIC_` se incluye en el JavaScript que baja el navegador y lo puede leer cualquiera. La clave pública es segura ahí **solo si el RLS está activado en todas las tablas** (bloque C).
- `.env.local` está ignorado por Git (`.gitignore`): comprobalo con `git status`; no tiene que aparecer.
- `.env.example` queda **siempre vacío**: es la lista de nombres de variables, no un lugar para guardar valores.

### 3.5 Instalar y crear los clientes de Supabase

En tu clon:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Creá dos archivos pequeños en `lib/supabase/`. Esta es la forma que documenta Supabase para Next.js con `@supabase/ssr`.

`lib/supabase/client.ts` (para componentes del navegador; hoy todos los módulos son `"use client"`):

```ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

`lib/supabase/server.ts` (para Route Handlers, Server Actions y componentes de servidor; lo vas a usar en la IA y en el login):

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Se llamó desde un componente de servidor: se puede ignorar si el
            // middleware (sección 3.7) ya refresca la sesión.
          }
        },
      },
    },
  )
}
```

### 3.6 Ejemplo ANTES / DESPUÉS: una función real

Tomamos `getOrdenes` de `modules/ordenes/api.ts`. **La firma es idéntica**; solo cambia el cuerpo.

**ANTES (demo):**

```ts
export async function getOrdenes(): Promise<OT[]> {
  await sleep(300)
  return structuredClone(raw.ordenes) as OT[]
}
```

**DESPUÉS (Supabase):**

```ts
import { createClient } from "@/lib/supabase/client"

export async function getOrdenes(): Promise<OT[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("ordenes_detalle")
    .select("*")
    .order("id", { ascending: false })

  if (error) throw new Error(`getOrdenes: ${error.message}`)

  return data.map((r) => ({
    id: r.id,
    patente: r.patente,
    vehiculo: r.vehiculo,
    km: r.km,
    cliente: r.cliente,
    mecanico: r.mecanico,
    trabajo: r.trabajo,
    estado: r.estado,
    bahia: r.bahia,
    laborHecha: Number(r.labor_hecha_min),
    laborEstimada: r.labor_estimada_min,
    diasEnTaller: r.dias_en_taller,
    presupuesto: r.presupuesto === null ? null : Number(r.presupuesto),
    ...(r.repuesto_faltante ? { repuestoFaltante: r.repuesto_faltante } : {}),
  }))
}
```

Qué hay que notar:

- Supabase siempre devuelve `{ data, error }` y **no lanza excepciones por sí solo**: revisá `error` y lanzalo vos.
- Las columnas de la base son `snake_case` y los tipos de la app son `camelCase`: el `map` traduce. Ese `map` es lo único que cambia entre la base y las pantallas.
- Las pantallas cargan con `useCarga(getOrdenes)`, que **captura el rechazo** de la promesa y muestra «No pudimos cargar…» con un botón **Reintentar**. Por eso es importante que la función lance el error (`throw new Error(...)`) en vez de devolver una lista vacía: así el usuario ve que algo falló y no confunde un fallo con «no hay órdenes».

Una función de escritura, `moverABahia`, queda así (la restricción única de la bahía hace de red de seguridad si dos personas suben un auto al mismo elevador):

```ts
export async function moverABahia(id: string, bahia: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("ordenes")
    .update({ bahia, estado: "diagnostico" })
    .eq("id", id)

  if (error) {
    // 23505 = violación de la restricción única: esa bahía ya tiene una orden activa
    throw new Error(error.code === "23505" ? "Esa bahía ya está ocupada" : error.message)
  }
}
```

Hacé lo mismo, una función por vez, con el resto: `getPiezas` (vista `piezas_estado`), `getVehiculos` (vista `vehiculos_estado` + historial desde `ordenes`), `getTickets` (vista `tickets`), `getBullets` (vista `dashboard_bullets`), `getAvisos` (tabla `avisos`), `cerrarOT` (update de `estado = 'entregado'`, `entregado_at = now()` y `bahia = null`).

Diferencias de forma que tenés que resolver en esos `map` (el demo guarda texto ya formateado):

| Campo del demo | En la base | Qué hacer en `api.ts` |
|---|---|---|
| `costo: "$ 8.400"` | `numeric` | Formatear: `` `$ ${n.toLocaleString("es-AR")}` `` |
| `proximoService: "160.000 km"` | `proximo_service_km` (número) | Formatear a texto; si el estado es `service vencido`, devolver `"vencido"` |
| `hora: "16:40"` / `"Ayer"` | `ultimo_mensaje_at` (fecha) | Formatear según sea hoy o ayer |
| `tiempo: "hace 12 min"` | `created_at` (fecha) | Calcular el "hace" con `Intl.RelativeTimeFormat` o a mano |
| `fecha: "mar 2026"` (historial) | `entregado_at` | Formatear mes y año |
| `presupuesto: 486000` (orden) | `costo_total` (`numeric`) | Pasarlo a número con `Number(n)`; `null` si todavía no hay presupuesto |

Los datos del demo son inventados, pero cierran entre pantallas: los vehículos «en taller» son los que tienen una orden abierta, el presupuesto de cada orden coincide con su monto en el historial del vehículo y las piezas que «bloquean» una orden tienen stock en cero. Con datos reales esas cifras salen de las reglas del SQL.

Opcional: para que TypeScript conozca tus tablas, generá los tipos con la CLI de Supabase (`npx supabase gen types typescript --project-id tu-proyecto --schema public > lib/supabase/types.ts`) y pasalos a `createClient<Database>()`.

### 3.7 Auth con Supabase Auth

El archivo `shell/auth-stub.ts` es un marcador: devuelve un "Usuario Demo" fijo. Se reemplaza por **Supabase Auth** (nunca otro proveedor de login).

1. **Crear a tus usuarios.** En el panel: **Authentication > Users > Add user** (email y contraseña). Creá uno para vos y uno por cada persona del taller.
2. **Cerrar el registro abierto.** Mientras las políticas sean "cualquier usuario autenticado", **si dejás que cualquiera se registre, cualquiera ve todo**. En **Authentication > Sign In / Providers** desactivá la opción que permite que se registren usuarios nuevos por su cuenta (el nombre exacto del interruptor puede cambiar entre versiones del panel; buscá "allow new users to sign up").
3. **Pantalla de login.** `app/login/page.tsx`:

   ```tsx
   "use client"
   import { useState } from "react"
   import { useRouter } from "next/navigation"
   import { createClient } from "@/lib/supabase/client"

   export default function LoginPage() {
     const router = useRouter()
     const [error, setError] = useState("")

     async function entrar(e: React.FormEvent<HTMLFormElement>) {
       e.preventDefault()
       const f = new FormData(e.currentTarget)
       const { error } = await createClient().auth.signInWithPassword({
         email: String(f.get("email")),
         password: String(f.get("password")),
       })
       if (error) return setError("Email o contraseña incorrectos")
       router.push("/dashboard")
       router.refresh()
     }

     return (
       <form onSubmit={entrar} className="mx-auto mt-24 flex max-w-sm flex-col gap-3">
         <h1 className="font-heading text-2xl font-bold uppercase">Ingresar</h1>
         <label className="text-sm">
           Email
           <input name="email" type="email" required autoComplete="email" className="mt-1 w-full border border-border bg-surface p-2" />
         </label>
         <label className="text-sm">
           Contraseña
           <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-border bg-surface p-2" />
         </label>
         {error && <p role="alert" className="text-sm text-danger">{error}</p>}
         <button className="min-h-11 bg-primary px-4 py-2 text-sm font-bold uppercase tracking-widest text-surface">Entrar</button>
       </form>
     )
   }
   ```

4. **Proteger todas las rutas.** `middleware.ts` en la raíz (Next.js 15; en versiones nuevas de Next este archivo se llama `proxy.ts`). Refresca la sesión y manda al login a quien no tenga una:

   ```ts
   import { createServerClient } from "@supabase/ssr"
   import { NextResponse, type NextRequest } from "next/server"

   export async function middleware(request: NextRequest) {
     let response = NextResponse.next({ request })

     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return request.cookies.getAll()
           },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
             response = NextResponse.next({ request })
             cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
           },
         },
       },
     )

     // No pongas código entre createServerClient y getUser(): puede desloguear usuarios al azar.
     const { data: { user } } = await supabase.auth.getUser()

     if (!user && !request.nextUrl.pathname.startsWith("/login")) {
       const url = request.nextUrl.clone()
       url.pathname = "/login"
       return NextResponse.redirect(url)
     }
     return response
   }

   export const config = {
     matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
   }
   ```

5. **Cerrar sesión:** `await createClient().auth.signOut()` desde un botón en el menú.
6. **Dónde se configura el redirect:** cuando publiques en Vercel (sección 5), agregá tu dominio en **Authentication > URL Configuration** (Site URL y Redirect URLs); si no, los links de los correos de Supabase apuntan a `localhost`.

**Cómo comprobar:** entrá a `http://localhost:3000` sin sesión: te manda a `/login`. Con un usuario creado, entrás y ves las órdenes que cargaste. Desde una ventana de incógnito sin sesión no tenés que poder ver nada.

---

## 4. Railway: tareas en segundo plano (pg-boss)

### 4.1 Para qué sirve, en criollo

Vercel responde cuando alguien abre una página y listo: no es un lugar donde dejar un programa corriendo 24 horas "mirando" si pasó algo. Para eso se usa un **worker**: un programa chiquito que vive siempre prendido en Railway, mira la base de datos y hace tareas por vos aunque nadie tenga el sistema abierto. **pg-boss** es la librería que le da una cola de tareas usando la misma base de Postgres (Supabase), sin pagar ni instalar nada más.

Casos de un taller que lo necesitan:

| Tarea | Qué hace el worker |
|---|---|
| **Aviso de vehículo listo** | Cuando una orden pasa a `qc` o `entregado`, le avisa al cliente que ya puede retirar el auto |
| **Recordatorio de service** | Cada día busca vehículos con `km >= proximo_service_km` (o próximos a cumplirse) y le recuerda al titular |
| **Seguimiento de presupuestos** | Si un hilo de tipo `aprobacion` lleva más de 48 horas sin respuesta, genera un recordatorio |
| **Alerta de mano de obra excedida** | Si `labor_hecha_min` supera `labor_estimada_min`, avisa al jefe de taller |
| **Reposición de repuestos** | Cuando el stock toca el punto de reorden, arma el pedido de compra |

(Son las mismas ideas que ya figuran en los `BACKEND.md` de cada módulo.)

### 4.2 Conexión a la base: directa o pooler

Supabase ofrece varias cadenas de conexión (las encontrás en el botón **Connect** del panel). Para un worker que queda prendido siempre:

| Cadena | Puerto | Cuándo usarla |
|---|---|---|
| **Conexión directa** (`db.<proyecto>.supabase.co`) | 5432 | Ideal para servidores que quedan siempre prendidos, pero **solo funciona por IPv6** salvo que actives el complemento IPv4 de pago |
| **Pooler en modo sesión** (`...pooler.supabase.com`) | 5432 | Servidores persistentes en redes que solo tienen IPv4: **es la opción que recomendamos para el worker** salvo que tu red soporte IPv6 |
| Pooler en modo transacción | 6543 | Para funciones serverless que abren muchas conexiones cortas. **No lo uses con pg-boss** |

Por qué no el modo transacción: pg-boss mantiene conexiones abiertas y usa bloqueos de sesión de Postgres; el modo transacción comparte conexiones entre clientes y eso no es compatible con ese uso. (Es la recomendación general para este tipo de librerías; no la probamos con tu proyecto, por eso la regla simple: **puerto 5432**.)

Cómo se ve la cadena del pooler en modo sesión (copiala desde **Connect**; no la escribas a mano):

```text
postgresql://postgres.tu-proyecto:TU-CONTRASEÑA@aws-0-tu-region.pooler.supabase.com:5432/postgres
```

pg-boss crea **su propio esquema** (`pgboss`) con sus tablas dentro de tu base la primera vez que arranca. No pisa tus tablas de `public`.

### 4.3 Armar el worker (en un repositorio aparte)

Este repo es el frontend del demo y no tiene backend, así que el worker va en **otro repositorio** tuyo (por ejemplo `bulon-worker`). Estructura mínima:

```text
bulon-worker/
  package.json
  index.mjs
```

`package.json` (pg-boss pide Node 22.12 o mayor; Railway lo lee de `engines`):

```json
{
  "name": "bulon-worker",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": { "start": "node index.mjs" },
  "dependencies": {
    "pg-boss": "^12.0.0",
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

Instalá y generá el `package-lock.json` en tu computadora (`npm install`) y subí ese archivo al repo.

`index.mjs`: esqueleto mínimo. Es un **ejemplo**: reemplazá `avisarCliente` por el canal que elijas (WhatsApp Business, SMS, email).

```js
import { PgBoss } from "pg-boss"
import { createClient } from "@supabase/supabase-js"

const boss = new PgBoss(process.env.DATABASE_URL)
boss.on("error", (error) => console.error("pg-boss:", error))

// El worker usa la clave secreta (se salta el RLS). Vive SOLO en las variables de Railway.
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function avisarCliente(telefono, texto) {
  // Acá va tu canal de envío. En esta guía no hay ninguno conectado.
  console.log("Aviso a", telefono, "->", texto)
}

await boss.start() // crea el esquema pgboss la primera vez

const COLA = "presupuestos-sin-respuesta"
await boss.createQueue(COLA)

// El worker recibe un arreglo de trabajos
await boss.work(COLA, async ([job]) => {
  const hace48h = new Date(Date.now() - 48 * 3_600_000).toISOString()
  const { data, error } = await db
    .from("conversaciones")
    .select("id, asunto, vehiculos(patente)")
    .eq("tipo", "aprobacion")
    .lt("ultimo_mensaje_at", hace48h)
  if (error) throw error // pg-boss reintenta el trabajo si lanza un error

  for (const c of data) {
    console.log(`Recordar presupuesto de ${c.vehiculos?.patente}: ${c.asunto}`)
  }
  console.log(`Trabajo ${job.id} terminado: ${data.length} presupuestos sin respuesta`)
})

// Se dispara solo cada hora, en punto (zona horaria de tu taller)
await boss.schedule(COLA, "0 * * * *", {}, { tz: "America/Argentina/Buenos_Aires" })

console.log("Worker listo")

// Apagado ordenado cuando Railway reinicia el servicio
process.on("SIGTERM", async () => {
  await boss.stop()
  process.exit(0)
})
```

Por qué un cron del worker y no mandar el trabajo desde la web: en Vercel cada petición es una función de vida corta; es más simple y más seguro que el **worker consulte la base** cada tanto con la clave secreta, en vez de abrirle a Vercel una conexión directa a pg-boss.

### 4.4 Crear el servicio en Railway

1. Entrá a https://railway.com y creá una cuenta (revisá los precios vigentes antes de dejar algo corriendo 24 horas).
2. **New Project > Deploy from GitHub repo** y elegí el repo del worker (te pide autorizar el acceso a GitHub).
3. Railway detecta que es un proyecto Node.js (Railpack), instala las dependencias y arranca con `npm start`; no hace falta configurar nada más.
4. Abrí el servicio > **Variables** y cargá:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la cadena del **pooler en modo sesión** (puerto 5432) de la sección 4.2 |
   | `NEXT_PUBLIC_SUPABASE_URL` | la URL de tu proyecto |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clave secreta de Supabase |

5. Si el repo tiene el worker dentro de una subcarpeta, en **Settings** poné el **Root Directory** de esa carpeta. Si querés otro comando de arranque, en **Settings > Deploy** está **Custom Start Command** (por ejemplo `node index.mjs`).
6. La versión de Node: Railpack la toma de `engines.node` del `package.json` (también podés fijarla con la variable `RAILPACK_NODE_VERSION`). Como pg-boss necesita 22.12 o mayor, dejá el `engines` como está arriba.
7. Mirá la pestaña **Deployments** > **View logs**.

**Cómo comprobar:** en los logs tiene que aparecer `Worker listo` y ningún error de conexión. En el editor SQL de Supabase, `select * from pgboss.queue;` debería mostrar tu cola `presupuestos-sin-respuesta` (si esa consulta falla, mirá el esquema `pgboss` en el Table Editor: lo importante es que exista).

Si falla: `ENETUNREACH` o error de conexión casi siempre es la cadena (usaste la directa por IPv6 en una red IPv4: pasá a la del pooler en modo sesión); `password authentication failed` es la contraseña de la base mal copiada (sin los corchetes); si dice que la versión de Node no sirve, revisá `engines`.

---

## 5. Vercel: publicar el sistema

1. Subí tu clon a **tu propio repositorio de GitHub** (si es privado, mejor: ahí van a vivir tus decisiones, no los datos).
2. Entrá a https://vercel.com, **Add New > Project** y elegí el repositorio. Vercel detecta **Next.js** solo: no cambies ni el comando de build ni la carpeta de salida.
3. Antes de apretar **Deploy**, abrí **Environment Variables** y cargá estas dos (marcando **Production** y **Preview**; si querés usar Vercel con `vercel dev`, también **Development**):

   | Variable | Para qué |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave pública |

   Si activás la IA, agregá también `OPENAI_API_KEY` y `OPENAI_MODEL` (o las de Gemini): **sin** el prefijo `NEXT_PUBLIC_`. **No cargues la clave secreta de Supabase acá** salvo que una función de servidor tuya la necesite de verdad.
4. **Deploy.** En un par de minutos tenés una dirección `https://tu-proyecto.vercel.app`.
5. **Dominio propio:** **Settings > Domains > Add**, escribí `tu-dominio.com` y seguí las instrucciones de DNS que te muestra Vercel (un registro `A` o `CNAME` en tu proveedor de dominio).
6. **Deploy automático:** cada `git push` a la rama principal publica a producción solo; las otras ramas generan una dirección de prueba (preview).
7. **Supabase Auth:** agregá `https://tu-dominio.com` (y la dirección de Vercel) en **Authentication > URL Configuration** de Supabase.

Algo importante: las variables `NEXT_PUBLIC_*` se **incrustan al construir**. Si las cambiás, hay que hacer un **redeploy** (Deployments > los tres puntos > Redeploy) para que tomen efecto.

**Si el build falla:**

1. Abrí el deploy fallido > **Build Logs** y buscá la primera línea que dice `Error`.
2. Reproducilo en tu computadora: `npm run build`. Si falla igual, el error está en el código: corregilo, hacé `git push` y se vuelve a publicar.
3. Si en tu computadora anda y en Vercel no, casi siempre es una **variable de entorno que falta** o una **versión de Node** distinta (**Settings > General > Node.js Version**).
4. Un error de tipos de TypeScript también corta el build: corré `npx tsc --noEmit` para verlos todos juntos.

**Cómo comprobar:** abrís la dirección pública, te manda a `/login`, entrás y ves tus datos.

---

## 6. IA para el taller (OpenAI o Gemini)

### 6.1 Dónde encaja en este sistema

El módulo **Mensajes** (`/conversaciones`) es el natural: cada hilo es un ticket atado a una patente y a una orden ("¿aprobás el presupuesto?", "auto listo para retirar"). Usos concretos y de bajo riesgo:

- **Sugerir una respuesta** al último mensaje del cliente (la persona la revisa y la manda).
- **Clasificar** un mensaje nuevo en `aprobacion` / `consulta` / `aviso` / `reclamo` (los cuatro tipos que ya usa la bandeja).
- **Resumir** un hilo largo para el jefe de taller.

Regla de oro: **la IA sugiere, una persona confirma.** El texto del cliente es contenido no confiable (puede incluir instrucciones tipo "ignorá lo anterior"); no dejes que la IA mande mensajes, cobre ni cambie órdenes sola.

### 6.2 La clave vive solo en el servidor

- La clave (`OPENAI_API_KEY` o `GEMINI_API_KEY`) **nunca** lleva `NEXT_PUBLIC_` ni se usa en un componente `"use client"`. Si estuviera en el navegador, cualquiera la copia y gasta tu cuenta.
- La llamada se hace desde un **Route Handler** (o una Server Action). El navegador le habla a **tu** ruta; tu ruta le habla al proveedor.
- Cargala en `.env.local` (local) y en las variables de Vercel (producción).

### 6.3 Ejemplo mínimo

Instalá el SDK del proveedor que elijas:

```bash
npm install openai
```

(o `npm install @google/genai` para Gemini).

`app/api/ia/sugerir-respuesta/route.ts` con **OpenAI**:

```ts
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  // 1) Solo usuarios con sesión: sin esto cualquiera gasta tu cuenta
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  // 2) Validar la entrada y acotar el tamaño
  let body: { asunto?: unknown; ultimoMensaje?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 })
  }
  const { asunto, ultimoMensaje } = body
  if (typeof asunto !== "string" || typeof ultimoMensaje !== "string" || ultimoMensaje.length > 1000) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 })
  }

  // 3) Llamar al modelo con un tope de salida
  const respuesta = await client.responses.create({
    model: process.env.OPENAI_MODEL!, // el modelo lo elegís vos en las variables de entorno
    instructions:
      "Sos el asistente de un taller mecánico. Respondé en español rioplatense, breve y amable. No inventes precios ni plazos.",
    input: `Asunto: ${asunto}\nÚltimo mensaje del cliente: ${ultimoMensaje}`,
    max_output_tokens: 200,
  })

  return Response.json({ texto: respuesta.output_text, uso: respuesta.usage })
}
```

La misma ruta con **Gemini** (cambia solo la llamada):

```ts
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const respuesta = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL!,
  contents: `Asunto: ${asunto}\nÚltimo mensaje del cliente: ${ultimoMensaje}`,
  config: {
    systemInstruction: "Sos el asistente de un taller mecánico. Respondé en español rioplatense, breve y amable.",
    maxOutputTokens: 200,
  },
})
return Response.json({ texto: respuesta.text, uso: respuesta.usageMetadata })
```

Los nombres de modelos cambian seguido: **no los escribas en el código**; ponelos en `OPENAI_MODEL` / `GEMINI_MODEL` y elegí uno vigente en la documentación del proveedor.

Desde la pantalla de Mensajes, un botón "Sugerir respuesta" haría un `fetch("/api/ia/sugerir-respuesta", { method: "POST", body: JSON.stringify({ asunto, ultimoMensaje }) })` y mostraría el texto para que lo edites.

### 6.4 Costos y límites que tenés que vigilar

- **Se paga por uso** (tokens de entrada y de salida). Mirá la página de precios del proveedor y poné un **límite de gasto mensual** en su panel.
- **Acotá la salida** (`max_output_tokens` / `maxOutputTokens`) y la **entrada** (cortá los textos largos antes de enviarlos).
- **Limitá las llamadas por usuario** (por ejemplo, 20 por hora). Vercel Firewall permite reglas de límite de tasa (revisá qué incluye tu plan) o podés llevar un contador en una tabla.
- **Guardá el uso** (`respuesta.usage` en OpenAI, `usageMetadata` en Gemini) para saber cuánto gastás por función.
- **Privacidad:** lo que mandás sale de tu sistema hacia un tercero. No envíes datos que no hacen falta (el email o el VIN del cliente no sirven para redactar una respuesta) y fijate la política de retención de datos del proveedor.
- **Errores y cuotas:** el proveedor puede devolver errores por límite de uso o saturación; capturalos y mostrá un mensaje, no dejes la pantalla colgada.

---

## 7. Checklist de seguridad antes de publicar con datos reales

Marcá cada punto. Si uno no está, no cargues clientes reales.

- [ ] **RLS activado en todas las tablas** (Table Editor: candado en cada una) y probado: una ventana de incógnito sin sesión no ve nada.
- [ ] **Las vistas son `security_invoker = true`** (las del bloque B ya lo son). Una vista sin eso salta el RLS.
- [ ] **El registro abierto de Supabase Auth está desactivado** (sección 3.7, punto 2). Si no, cualquiera crea una cuenta y entra.
- [ ] **La clave secreta (`service_role` / *secret*) no está en el frontend**: ni con `NEXT_PUBLIC_`, ni en componentes `"use client"`, ni en el repo. Buscala: `git grep -n "service_role"` no debe mostrar claves reales.
- [ ] **`.env.local` en `.gitignore`** y `git status` no lo lista. `.env.example` solo tiene nombres, sin valores.
- [ ] **Ningún secreto en el historial de Git.** Si alguna vez subiste una clave, **rotala** (generá una nueva en el panel y desactivá la vieja): borrarla del último commit no alcanza.
- [ ] **Los datos reales no están en un repositorio público.** Los `data.json` del demo son ficticios; no los reemplaces por datos de tus clientes dentro del repo. Los datos reales viven en Supabase.
- [ ] **Datos de ejemplo borrados** de la base antes de cargar los reales (`truncate` de la sección 3.3).
- [ ] **Límite de tasa (rate limiting)** en las rutas que gastan plata (IA) o aceptan escritura: por usuario y por hora.
- [ ] **Backups.** Revisá en Supabase qué copias de seguridad incluye tu plan y cada cuánto; si es poco, programá un volcado propio (`pg_dump`) a un lugar aparte. Probá **restaurar** al menos una vez.
- [ ] **Contraseñas fuertes** (y, si tu plan lo permite, segundo factor) para quienes tengan acceso al panel de Supabase, Vercel y Railway.
- [ ] **Permisos mínimos en las políticas:** si no todos los empleados deben ver costos o editar inventario, reemplazá `using (true)` por reglas por rol.
- [ ] **Validación de entradas en el servidor** en cada Route Handler (como en el ejemplo de IA): el navegador se puede manipular.
- [ ] **Datos personales:** teléfonos, emails y patentes son datos personales. Cumplí la normativa de tu país (aviso de privacidad, derecho de baja) y no los copies a planillas sueltas.

---

## 8. Errores comunes y cómo resolverlos

| Error | Causa probable | Solución |
|---|---|---|
| `permission denied for table ordenes` | Faltan los `grant` o la sesión no es de un usuario autenticado | Corré las 3 líneas `grant` del bloque C y verificá que iniciaste sesión |
| La pantalla carga pero no muestra datos y no hay error visible | RLS activado sin política que permita leer, o la función de `api.ts` devuelve una lista vacía en vez de lanzar el error | Revisá las políticas (`autenticados leen`) y verificá que la función hace `throw` si `error` viene lleno: así la pantalla muestra «No pudimos cargar…» |
| `new row violates row-level security policy` | Falta la política de escritura (`with check`) | Verificá que existe `autenticados escriben` en esa tabla |
| `duplicate key value violates unique constraint "ordenes_una_ot_por_bahia"` | Dos órdenes quieren la misma bahía | Es la regla funcionando: mostrá "Esa bahía ya está ocupada" (código `23505`) |
| `violates check constraint "ordenes_entregado_coherente"` | Pusiste `estado = 'entregado'` sin `entregado_at` (o al revés) | Al cerrar una orden actualizá `estado`, `entregado_at` y `bahia = null` juntos |
| `relation "public.ordenes_detalle" does not exist` | No corriste el bloque B | Corré el bloque B de vistas |
| `Invalid API key` / `Invalid JWT` | Clave mal copiada o de otro proyecto | Copiala de nuevo desde **Connect**, sin espacios ni comillas; reiniciá `npm run dev` |
| Cambié una variable `NEXT_PUBLIC_*` y no hace efecto | Se incrustan al construir | Reiniciá `npm run dev` en local; en Vercel hacé **Redeploy** |
| En Vercel el build falla y en mi PC no | Falta una variable de entorno o la versión de Node es distinta | Cargá las variables en Vercel y revisá **Settings > General > Node.js Version** |
| Te desloguea al azar | Falta `middleware.ts` o hay código entre `createServerClient` y `getUser()` | Usá el middleware de la sección 3.7 tal cual |
| El link del correo de Supabase abre `localhost` | No cargaste tu dominio en **Authentication > URL Configuration** | Agregá tu dominio en Site URL y Redirect URLs |
| El worker de Railway no conecta (`ENETUNREACH`, `timeout`) | Cadena directa por IPv6 desde una red IPv4 | Usá la cadena del **pooler en modo sesión** (puerto 5432) |
| El worker dice que pg-boss no arranca por la versión de Node | Node menor a 22.12 | Fijá `engines.node` a `>=22.12.0` o `RAILPACK_NODE_VERSION` |
| La IA devuelve 401 o "quota exceeded" | Clave inválida, sin saldo o límite de uso alcanzado | Revisá la clave y el saldo/límite en el panel del proveedor |
| La IA responde en tu navegador pero la clave quedó expuesta | La llamada se hizo desde un componente cliente | Mové la llamada a un Route Handler y **rotá** la clave |

---

## 9. Siguiente paso

Ya sabés cómo se conecta un sistema real. El siguiente paso es convertir esto en un servicio: elegir un nicho, armar el sistema para un cliente y cobrarle por él.

**Aprendé a crear tu Agencia de IA y conseguir tu primer cliente.** Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

Entrá acá: https://www.skool.com/club-de-la-ia-8047/about
