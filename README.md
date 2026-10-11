# BULON — Sistema para talleres mecánicos

Un sistema de gestión para talleres: tablero de bahías con los autos sobre el elevador, órdenes de trabajo que avanzan por sus estados, kárdex de repuestos y ficha por vehículo. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). **No tiene backend conectado** ni base de datos: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo. Todo lo que ves está inventado (marca, clientes, patentes).

---

## Demo en vivo
👉 https://sistema-taller-chi.vercel.app

## Sumate al Club de la IA

Aprendé a crear tu Agencia de IA y conseguir tu primer cliente. Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about

---

## Qué incluye
- Tablero: el **Estado de Bahías** con los autos sobre los elevadores y el cronómetro de mano de obra corriendo
- Órdenes de trabajo (kanban por estado: en cola, diagnóstico, aprobación, reparación, espera de repuesto, control de calidad, entregado)
- Inventario: kárdex de repuestos con punto de reorden y las piezas que bloquean una OT
- Mensajes: cada consulta atada a una patente y a una orden
- Vehículos: ficha por patente con VIN, kilometraje e historial de trabajos
- Configuración

## Requisitos (instalá esto primero)

Necesitás dos programas gratis en tu computadora:

1. **Node.js** (versión 18.18 o mayor). Descargalo en https://nodejs.org y elegí la opción **LTS**.
2. **Git**. Descargalo en https://git-scm.com

Para chequear que quedaron instalados, abrí una terminal y escribí:

    node -v
    git --version

Si te devuelven un número de versión, ya está.

## Cómo clonar y correr (paso a paso)

1. Abrí una terminal en la carpeta donde quieras guardar el proyecto.
2. Cloná el repo:

       git clone https://github.com/jlucasacosta/sistema-taller.git

3. Entrá a la carpeta del proyecto:

       cd sistema-taller

4. Instalá las dependencias (baja lo que el proyecto necesita):

       npm install

5. Levantá el proyecto:

       npm run dev

6. Abrí el navegador en http://localhost:3000

Listo. Vas a ver el sistema funcionando.

## Personalizarlo

Todo el diseño (colores, tipografía, nombre de la marca) vive en un solo archivo: `shell/theme.ts`. Cambiás eso y muta el sistema entero.

Probá algo concreto: en ese archivo, bajá `labor.excedido` de `1` a `0.7`. Toda la planta se pone en rojo antes, porque el Estado de Bahías lee sus umbrales de ahí. Ningún componente tiene un número ni un color escrito a mano.

## Cambiar los datos de ejemplo

Los datos del demo viven en un archivo `data.json` por módulo:

| Módulo | Archivo |
|---|---|
| Tablero | `modules/dashboard/data.json` |
| Órdenes | `modules/ordenes/data.json` |
| Inventario | `modules/inventario/data.json` |
| Mensajes | `modules/conversaciones/data.json` |
| Vehículos | `modules/contactos/data.json` |

Editá el JSON, guardá y mirá el cambio en el navegador. Los datos son **solo de lectura**: si en la pantalla movés un auto de bahía o entregás una orden, el cambio vive solo en esa pestaña, no se guarda en ningún lado y **al recargar con F5 vuelve todo a como está en el JSON**.

## Estructura de carpetas

```text
app/            rutas (cada una muestra un módulo) y estilos globales
modules/        un módulo por pantalla: index.tsx, api.ts, data.json y BACKEND.md
  ordenes/  inventario/  contactos/  conversaciones/  dashboard/  config/
shell/          lo compartido: theme.ts (el diseño), nav.tsx, tablero-bahias.tsx, taller.ts
docs/           IMPLEMENTAR.md: guía para conectar el backend real
DISENO.md       la ficha de diseño de la marca
.env.example    lista de variables de entorno (vacía, sin valores)
```

## Llevalo a producción

Este repo es un demo: **no tiene base de datos ni login conectados**. Para usarlo con datos reales de tu taller, cada módulo ya tiene una función `api.ts` cuya **firma no cambia**: solo se reemplaza el cuerpo para que consulte una base en vez de leer el JSON. El camino es:

1. **Supabase** como base de datos y para el login (Supabase Auth).
2. **Railway** con **pg-boss** para las tareas en segundo plano (avisos de "auto listo", recordatorios de service, seguimiento de presupuestos).
3. **Vercel** para publicar el sistema con tu dominio.
4. **OpenAI o Gemini** (opcional) para sugerir respuestas a los mensajes de los clientes.

La guía paso a paso, con el SQL de las tablas hecho a medida de este sistema, está en [`docs/IMPLEMENTAR.md`](docs/IMPLEMENTAR.md).

## Licencia

MIT. Podés usarlo, copiarlo y modificarlo. Ver el archivo [`LICENSE`](LICENSE).

## Te trabaste

Si algo no te salió, preguntá en el Club de la IA:

👉 https://www.skool.com/club-de-la-ia-8047/about
