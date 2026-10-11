// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// La OT es la unidad de trabajo. `laborHecha` y `laborEstimada` van en MINUTOS:
// el cronometro de mano de obra arranca de ahi y sigue corriendo en el cliente.
// `bahia` es el elevador fisico (1..theme.bahias) o null si el auto esta en COLA.
import type { EstadoOT } from "@/shell/taller"
import raw from "./data.json"

export type OT = {
  id: string // Nº de orden
  patente: string
  vehiculo: string
  km: number
  cliente: string
  mecanico: string
  trabajo: string
  estado: EstadoOT
  bahia: number | null
  laborHecha: number // minutos
  laborEstimada: number // minutos
  diasEnTaller: number
  repuestoFaltante?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getOrdenes(): Promise<OT[]> {
  await sleep(300)
  return structuredClone(raw.ordenes) as OT[]
}

// Firma estable: contra el backend real esto es un UPDATE + evento realtime.
export async function moverABahia(_id: string, _bahia: number): Promise<void> {
  await sleep(120)
}
export async function cerrarOT(_id: string): Promise<void> {
  await sleep(120)
}
