// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// La OT es la unidad de trabajo. `laborHecha` y `laborEstimada` van en MINUTOS:
// el cronometro de mano de obra arranca de ahi y sigue corriendo en el cliente.
// `bahia` es el elevador fisico (1..theme.bahias) o null si el auto esta en COLA.
import type { EstadoOT } from "@/shell/taller"

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
  return [
    { id: "OT-4821", patente: "AF 412 KM", vehiculo: "VW Amarok 2019", km: 148320, cliente: "Transporte Aldabe", mecanico: "Ruiz", trabajo: "Embrague completo", estado: "reparacion", bahia: 1, laborHecha: 214, laborEstimada: 240, diasEnTaller: 2 },
    { id: "OT-4823", patente: "AC 908 RT", vehiculo: "Ford Ranger 2021", km: 62740, cliente: "Delia Sobrero", mecanico: "Pinto", trabajo: "Service 60.000 km", estado: "reparacion", bahia: 2, laborHecha: 96, laborEstimada: 120, diasEnTaller: 1 },
    { id: "OT-4818", patente: "AA 231 LP", vehiculo: "Toyota Hilux 2017", km: 211050, cliente: "Estanislao Vergara", mecanico: "Ruiz", trabajo: "Tren delantero + alineacion", estado: "espera repuesto", bahia: 3, laborHecha: 340, laborEstimada: 300, diasEnTaller: 6, repuestoFaltante: "Rotula sup. der. (48068-0K040)" },
    { id: "OT-4826", patente: "AE 776 QS", vehiculo: "Chevrolet Onix 2022", km: 34890, cliente: "Milagros Ayala", mecanico: "Cortes", trabajo: "Cambio de correa", estado: "qc", bahia: 4, laborHecha: 178, laborEstimada: 180, diasEnTaller: 1 },
    { id: "OT-4815", patente: "AB 054 DH", vehiculo: "Renault Kangoo 2016", km: 189430, cliente: "Panaderia Suarez", mecanico: "Pinto", trabajo: "Junta de tapa de cilindros", estado: "reparacion", bahia: 5, laborHecha: 502, laborEstimada: 420, diasEnTaller: 8 },
    { id: "OT-4829", patente: "AG 610 VN", vehiculo: "Fiat Cronos 2023", km: 18760, cliente: "Ezequiel Nardelli", mecanico: "Cortes", trabajo: "Diagnostico luz de motor", estado: "diagnostico", bahia: 6, laborHecha: 38, laborEstimada: 60, diasEnTaller: 1 },

    { id: "OT-4830", patente: "AD 385 WJ", vehiculo: "Peugeot 208 2020", km: 71200, cliente: "Rosario Bianchi", mecanico: "—", trabajo: "Ruido tren trasero", estado: "en cola", bahia: null, laborHecha: 0, laborEstimada: 90, diasEnTaller: 0 },
    { id: "OT-4831", patente: "AC 117 BF", vehiculo: "Citroen Berlingo 2018", km: 156980, cliente: "Ferreteria Machuca", mecanico: "—", trabajo: "Frenos completos", estado: "en cola", bahia: null, laborHecha: 0, laborEstimada: 150, diasEnTaller: 0 },
    { id: "OT-4832", patente: "AH 902 CD", vehiculo: "Nissan Frontier 2022", km: 44310, cliente: "Agro Puelches", mecanico: "—", trabajo: "Service + filtros", estado: "en cola", bahia: null, laborHecha: 0, laborEstimada: 110, diasEnTaller: 0 },
    { id: "OT-4827", patente: "AB 749 MK", vehiculo: "Honda Fit 2015", km: 198760, cliente: "Camila Ferrero", mecanico: "Pinto", trabajo: "Bomba de agua", estado: "aprobacion", bahia: null, laborHecha: 0, laborEstimada: 130, diasEnTaller: 3 },
    { id: "OT-4824", patente: "AE 203 XZ", vehiculo: "VW Gol Trend 2014", km: 224500, cliente: "Hector Quintana", mecanico: "Ruiz", trabajo: "Caja de direccion", estado: "espera repuesto", bahia: null, laborHecha: 145, laborEstimada: 260, diasEnTaller: 11, repuestoFaltante: "Cremallera (6R1423055)" },
    { id: "OT-4820", patente: "AF 558 GT", vehiculo: "Ford EcoSport 2019", km: 96140, cliente: "Vanina Recalde", mecanico: "Cortes", trabajo: "Amortiguadores traseros", estado: "aprobacion", bahia: null, laborHecha: 25, laborEstimada: 140, diasEnTaller: 4 },
    { id: "OT-4812", patente: "AA 664 PL", vehiculo: "Chevrolet S10 2016", km: 245900, cliente: "Corralon Zabalza", mecanico: "Ruiz", trabajo: "Turbo + intercooler", estado: "entregado", bahia: null, laborHecha: 388, laborEstimada: 360, diasEnTaller: 9 },
    { id: "OT-4813", patente: "AD 019 NR", vehiculo: "Renault Sandero 2018", km: 132470, cliente: "Ignacio Peluffo", mecanico: "Pinto", trabajo: "Service 120.000 km", estado: "entregado", bahia: null, laborHecha: 118, laborEstimada: 120, diasEnTaller: 2 },
    { id: "OT-4816", patente: "AG 447 HY", vehiculo: "Toyota Etios 2021", km: 58200, cliente: "Sol Miranda", mecanico: "Cortes", trabajo: "Embrague", estado: "entregado", bahia: null, laborHecha: 232, laborEstimada: 240, diasEnTaller: 3 },
    { id: "OT-4819", patente: "AC 830 TU", vehiculo: "Fiat Toro 2020", km: 88940, cliente: "Distribuidora Nolasco", mecanico: "Ruiz", trabajo: "Inyectores", estado: "qc", bahia: null, laborHecha: 268, laborEstimada: 280, diasEnTaller: 4 },
    { id: "OT-4825", patente: "AB 292 SW", vehiculo: "Peugeot Partner 2017", km: 174300, cliente: "Vidrieria Ancar", mecanico: "Pinto", trabajo: "Distribucion", estado: "diagnostico", bahia: null, laborHecha: 52, laborEstimada: 320, diasEnTaller: 1 },
    { id: "OT-4828", patente: "AH 155 EQ", vehiculo: "VW Saveiro 2019", km: 119680, cliente: "Marcos Otegui", mecanico: "Cortes", trabajo: "Radiador", estado: "espera repuesto", bahia: null, laborHecha: 74, laborEstimada: 160, diasEnTaller: 5, repuestoFaltante: "Radiador (5U0121253)" },
    { id: "OT-4833", patente: "AA 907 JB", vehiculo: "Ford Focus 2015", km: 203400, cliente: "Lucila Aguirregomezcorta", mecanico: "—", trabajo: "Suspension delantera", estado: "en cola", bahia: null, laborHecha: 0, laborEstimada: 180, diasEnTaller: 0 },
    { id: "OT-4834", patente: "AE 481 FC", vehiculo: "Chevrolet Cruze 2021", km: 51230, cliente: "Bruno Etchegaray", mecanico: "—", trabajo: "Aire acondicionado", estado: "en cola", bahia: null, laborHecha: 0, laborEstimada: 100, diasEnTaller: 0 },
    { id: "OT-4817", patente: "AF 336 LD", vehiculo: "Renault Duster 2019", km: 108550, cliente: "Agustina Lastra", mecanico: "Cortes", trabajo: "Kit de distribucion", estado: "entregado", bahia: null, laborHecha: 296, laborEstimada: 300, diasEnTaller: 3 },
    { id: "OT-4822", patente: "AD 728 KV", vehiculo: "Toyota Corolla 2020", km: 76890, cliente: "Federico Bunge", mecanico: "Pinto", trabajo: "Pastillas + discos", estado: "aprobacion", bahia: null, laborHecha: 0, laborEstimada: 90, diasEnTaller: 2 },
  ]
}

// Firma estable: contra el backend real esto es un UPDATE + evento realtime.
export async function moverABahia(_id: string, _bahia: number): Promise<void> {
  await sleep(120)
}
export async function cerrarOT(_id: string): Promise<void> {
  await sleep(120)
}
