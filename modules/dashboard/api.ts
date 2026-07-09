// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard NO es un tablero de metricas: hospeda la planta. Sin header ornamental.
export type Tile = { id: string; label: string; valor: string; tono: "primary" | "accent" | "success" | "warning" | "danger" | "info" }

// bullet: real contra objetivo. Nadie mas en la coleccion usa este grafico.
export type Bullet = { id: string; label: string; real: number; objetivo: number; max: number; unidad: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getTiles(): Promise<Tile[]> {
  await sleep(250)
  return [
    { id: "1", label: "Autos en planta", valor: "14", tono: "primary" },
    { id: "2", label: "OTs abiertas", valor: "18", tono: "info" },
    { id: "3", label: "Esperando repuesto", valor: "3", tono: "warning" },
    { id: "4", label: "Entregas hoy", valor: "4", tono: "success" },
  ]
}

export async function getBullets(): Promise<Bullet[]> {
  await sleep(300)
  return [
    { id: "1", label: "Ruiz · horas facturables", real: 34.5, objetivo: 36, max: 44, unidad: "h" },
    { id: "2", label: "Pinto · horas facturables", real: 39.2, objetivo: 36, max: 44, unidad: "h" },
    { id: "3", label: "Cortes · horas facturables", real: 28.1, objetivo: 36, max: 44, unidad: "h" },
    { id: "4", label: "Ocupacion de bahias", real: 6, objetivo: 5, max: 6, unidad: "bahias" },
    { id: "5", label: "OTs cerradas / semana", real: 11, objetivo: 15, max: 20, unidad: "OT" },
  ]
}

export type Aviso = { id: string; texto: string; tiempo: string; tono: "primary" | "accent" | "success" | "warning" | "danger" | "info" }

export async function getAvisos(): Promise<Aviso[]> {
  await sleep(300)
  return [
    { id: "1", texto: "OT-4815 excedio la mano de obra estimada (08:22 vs 07:00)", tiempo: "hace 12 min", tono: "danger" },
    { id: "2", texto: "Llego la rotula 48068-0K040: OT-4818 puede volver a reparacion", tiempo: "hace 40 min", tono: "success" },
    { id: "3", texto: "AE 776 QS paso a control de calidad", tiempo: "hace 1 h", tono: "primary" },
    { id: "4", texto: "Stock quebrado: filtro de aceite W712/95", tiempo: "hace 2 h", tono: "danger" },
    { id: "5", texto: "Presupuesto de OT-4827 enviado, sin respuesta del cliente", tiempo: "hace 3 h", tono: "warning" },
    { id: "6", texto: "AA 664 PL entregado, 9 dias en taller", tiempo: "hace 4 h", tono: "success" },
    { id: "7", texto: "Bahia 03 bloqueada hace 6 dias por espera de repuesto", tiempo: "hace 5 h", tono: "warning" },
    { id: "8", texto: "Ingreso: AH 902 CD, service + filtros", tiempo: "ayer", tono: "info" },
    { id: "9", texto: "Pinto supero su objetivo de horas facturables", tiempo: "ayer", tono: "accent" },
    { id: "10", texto: "Punto de reorden alcanzado: pastillas ceramicas", tiempo: "ayer", tono: "warning" },
    { id: "11", texto: "OT-4824 lleva 11 dias esperando cremallera", tiempo: "hace 2 dias", tono: "danger" },
    { id: "12", texto: "Alineadora calibrada por servicio tecnico", tiempo: "hace 2 dias", tono: "info" },
  ]
}
