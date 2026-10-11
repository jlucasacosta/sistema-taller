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

// El color nunca viaja solo: cada nivel tambien tiene un rotulo de texto.
export const rotuloLabor: Record<NivelLabor, string> = {
  dentro: "dentro del estimado",
  cerca: "cerca del estimado",
  excedido: "excedido",
}

// Texto de ayuda de la escala de mano de obra. Lee los umbrales del theme: nunca numeros a mano.
export function leyendaLabor() {
  const cerca = Math.round(theme.labor.cerca * 100)
  const excedido = Math.round(theme.labor.excedido * 100)
  return `Barra: mano de obra hecha sobre la estimada. Cerca del estimado desde el ${cerca}%, excedido desde el ${excedido}%.`
}

// --- Estados de la OT ---
export type EstadoOT = "en cola" | "diagnostico" | "aprobacion" | "reparacion" | "espera repuesto" | "qc" | "entregado"

// Rótulo de display: el valor interno de EstadoOT no se toca (clave de Record y de filtros).
export const etiquetaEstado: Record<EstadoOT, string> = {
  "en cola": "en cola",
  diagnostico: "diagnóstico",
  aprobacion: "aprobación",
  reparacion: "reparación",
  "espera repuesto": "espera repuesto",
  qc: "calidad",
  entregado: "entregado",
}

// Que significa cada familia de color. El rojo NO esta aca: se reserva para "excedido" y
// para el error (stock quebrado, reclamo). Un estado que espera a un tercero es ambar, no rojo.
//   acero  = todavia no arranco          (en cola)
//   petroleo = en manos del taller        (diagnostico, reparacion, calidad)
//   ambar  = detenida esperando a otro    (aprobacion del cliente, repuesto del proveedor)
//   verde  = cerrada                      (entregado)
export const chipEstado: Record<EstadoOT, string> = {
  "en cola": "bg-info/15 text-info",
  diagnostico: "bg-primary/15 text-primary",
  aprobacion: "bg-warning/15 text-warning",
  reparacion: "bg-primary/15 text-primary",
  "espera repuesto": "bg-warning/15 text-warning",
  qc: "bg-primary/15 text-primary",
  entregado: "bg-success/15 text-success",
}

// Texto de ayuda de los colores de estado (se muestra en Configuración).
export const leyendaEstados: { clase: string; titulo: string; detalle: string }[] = [
  { clase: "bg-info/15 text-info", titulo: "Acero", detalle: "todavía no arrancó (en cola)" },
  { clase: "bg-primary/15 text-primary", titulo: "Petróleo", detalle: "en manos del taller (diagnóstico, reparación, calidad)" },
  { clase: "bg-warning/15 text-warning", titulo: "Ámbar", detalle: "detenida esperando a otro (aprobación del cliente, repuesto del proveedor)" },
  { clase: "bg-success/15 text-success", titulo: "Verde", detalle: "cerrada (entregado)" },
  { clase: "bg-danger/15 text-danger", titulo: "Rojo", detalle: "solo excedido, stock quebrado o reclamo" },
]

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
export const rotuloStock: Record<NivelStock, string> = {
  ok: "ok",
  reponer: "reponer",
  quebrado: "quebrado",
}

// Horas de taller: 02:45 son 2h45m, no minutos:segundos.
export function hhmm(minutos: number) {
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

// Plata: el demo guarda "$ 486.000" como texto (costo del repuesto) o 486000 como numero (presupuesto).
export const montoATexto = (n: number) => "$ " + n.toLocaleString("es-AR")
export const textoAMonto = (t: string) => Number(t.replace(/[^0-9]/g, ""))

// El mecanico sin asignar viaja como "—" en los datos; en pantalla se lee "sin asignar".
export const mecanicoTexto = (m: string) => (m === "—" ? "sin asignar" : m)
