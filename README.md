# BULON — Sistema para talleres mecánicos

Un sistema de gestión para talleres: tablero de bahías con los autos sobre el elevador, órdenes de trabajo que avanzan por sus estados, kárdex de repuestos y ficha por vehículo. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). No tiene backend conectado: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo.

---

## Sumate a la comunidad (gratis)

Estás aprendiendo a crear sistemas como este con Claude Code, entrá a la comunidad gratuita de WhatsApp. Ahí comparto cómo se hacen desde cero.

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH

---

## Qué incluye
- Planta: el **Tablero de Bahías** con los autos sobre los elevadores y el cronómetro de mano de obra corriendo
- Órdenes de trabajo (kanban por estado: en cola, diagnóstico, aprobación, reparación, espera de repuesto, control de calidad, entregado)
- Inventario: kárdex de repuestos con punto de reorden y las piezas que bloquean una OT
- Mensajes: cada consulta atada a una patente y a una orden
- Vehículos: ficha por patente con VIN, kilometraje e historial de trabajos
- Configuración

## Requisitos (instalá esto primero)

Necesitás dos programas gratis en tu computadora:

1. **Node.js** (versión 18 o mayor). Descargalo en https://nodejs.org y elegí la opción **LTS**.
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

Probá algo concreto: en ese archivo, bajá `labor.excedido` de `1` a `0.7`. Toda la planta se pone en rojo antes, porque el Tablero de Bahías lee sus umbrales de ahí. Ningún componente tiene un número ni un color escrito a mano.

## Te trabaste

Si algo no te salió, preguntá en la comunidad:

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH
