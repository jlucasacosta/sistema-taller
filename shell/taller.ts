// taller.ts · El reloj de la planta y el semaforo del kardex, en un solo lugar.
// Los umbrales viven en theme.labor. Ningun componente inventa un numero magico
// ni escribe un color: solo pide la clase.
import { theme } from "./theme"

// --- Mano de obra: transcurrido vs estimado ---
export type NivelLabor = "dentro" | "cerca" | "excedido"

export function nivelDeLabor(transcurrido: number, estimado: number): NivelLabor {
  const f = transcurrido / estimado
  if (f >= theme.labor.excedido) return "excedido"
  if (f >= theme.labor.cerca) return "cerca"
  return "dentro"
}

// Mapas literales: Tailwind no ve clases armadas por concatenacion.
export const bordeLabor: Record<NivelLabor, string> = {
  dentro: "border-info",
  cerca: "border-accent",
  excedido: "border-danger",
}
export const textoLabor: Record<NivelLabor, string> = {
  dentro: "text-fg",
  cerca: "text-warning",
  excedido: "text-danger",
}
export const rellenoLabor: Record<NivelLabor, string> = {
  dentro: "bg-info",
  cerca: "bg-accent",
  excedido: "bg-danger",
}

// --- Estados de la OT ---
export type EstadoOT = "en cola" | "diagnostico" | "aprobacion" | "reparacion" | "espera repuesto" | "qc" | "entregado"

export const chipEstado: Record<EstadoOT, string> = {
  "en cola": "bg-info/15 text-info",
  diagnostico: "bg-info/15 text-info",
  aprobacion: "bg-warning/15 text-warning",
  reparacion: "bg-primary/15 text-primary",
  "espera repuesto": "bg-accent/20 text-warning",
  qc: "bg-primary/15 text-primary",
  entregado: "bg-success/15 text-success",
}

// --- Kardex: stock actual contra punto de reorden ---
export type NivelStock = "ok" | "reponer" | "quebrado"

export function nivelDeStock(stock: number, reorden: number): NivelStock {
  if (stock === 0) return "quebrado"
  if (stock <= reorden) return "reponer"
  return "ok"
}

export const rellenoStock: Record<NivelStock, string> = {
  ok: "bg-success",
  reponer: "bg-accent",
  quebrado: "bg-danger",
}
export const chipStock: Record<NivelStock, string> = {
  ok: "bg-success/15 text-success",
  reponer: "bg-warning/15 text-warning",
  quebrado: "bg-danger/15 text-danger",
}

// Horas de taller: 02:45 son 2h45m, no minutos:segundos.
export function hhmm(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
