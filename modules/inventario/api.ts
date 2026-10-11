// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Kardex: el vinculo orden<->inventario es la friccion real del rubro.
// No se cierra una reparacion sin la pieza.
import raw from "./data.json"

export type Pieza = {
  id: string
  sku: string
  descripcion: string
  ubicacion: string
  costo: string
  stock: number
  reorden: number
  maximo: number
  bloqueaOT?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getPiezas(): Promise<Pieza[]> {
  await sleep(300)
  return structuredClone(raw.piezas) as Pieza[]
}
