// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// La unidad del taller es el VEHICULO, no la persona: la ficha se indexa por patente.
// Emails de patron variado y telefonos plausibles (CLAUDE.md §8). Todo ficticio.
import raw from "./data.json"

export type Visita = { fecha: string; ot: string; trabajo: string; costo: string }

export type Vehiculo = {
  id: string
  patente: string
  vehiculo: string
  vin: string
  km: number
  cliente: string
  telefono: string
  email: string
  proximoService: string
  estado: "en taller" | "al dia" | "service vencido"
  historial: Visita[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getVehiculos(): Promise<Vehiculo[]> {
  await sleep(300)
  return structuredClone(raw.vehiculos) as Vehiculo[]
}
