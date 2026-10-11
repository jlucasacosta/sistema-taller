// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard NO es un tablero de metricas: hospeda la planta. Sin header ornamental.
// Los contadores (abiertas, esperando repuesto, excedidas, para entregar) NO viven aca:
// se calculan en la pantalla a partir de las ordenes (getOrdenes).
import raw from "./data.json"

// bullet: real contra objetivo. Nadie mas en la coleccion usa este grafico.
export type Bullet = { id: string; label: string; real: number; objetivo: number; max: number; unidad: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getBullets(): Promise<Bullet[]> {
  await sleep(300)
  return structuredClone(raw.bullets) as Bullet[]
}

export type Aviso = { id: string; texto: string; tiempo: string; tono: "primary" | "accent" | "success" | "warning" | "danger" | "info" }

export async function getAvisos(): Promise<Aviso[]> {
  await sleep(300)
  return structuredClone(raw.avisos) as Aviso[]
}
