// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// En el taller un mensaje NO es un chat: es un ticket atado a una patente y a una OT.
// Por eso el arquetipo es lista-ticket y no el inbox con burbujas.
export type Ticket = {
  id: string
  patente: string
  ot: string
  cliente: string
  asunto: string
  ultimo: string
  hora: string
  sinLeer: number
  tipo: "aprobacion" | "consulta" | "aviso" | "reclamo"
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getTickets(): Promise<Ticket[]> {
  await sleep(300)
  return [
    { id: "1", patente: "AB 749 MK", ot: "OT-4827", cliente: "Camila Ferrero", asunto: "Presupuesto bomba de agua", ultimo: "Lo consulto con mi marido y te aviso", hora: "16:40", sinLeer: 1, tipo: "aprobacion" },
    { id: "2", patente: "AE 203 XZ", ot: "OT-4824", cliente: "Hector Quintana", asunto: "Demora por cremallera", ultimo: "Hace once dias que esta el auto ahi", hora: "15:58", sinLeer: 3, tipo: "reclamo" },
    { id: "3", patente: "AF 558 GT", ot: "OT-4820", cliente: "Vanina Recalde", asunto: "Aprobacion amortiguadores", ultimo: "Dale, arranquen nomas", hora: "15:12", sinLeer: 0, tipo: "aprobacion" },
    { id: "4", patente: "AE 776 QS", ot: "OT-4826", cliente: "Milagros Ayala", asunto: "Auto listo para retirar", ultimo: "Paso mañana a la mañana", hora: "14:35", sinLeer: 0, tipo: "aviso" },
    { id: "5", patente: "AA 231 LP", ot: "OT-4818", cliente: "Estanislao Vergara", asunto: "Llego la rotula", ultimo: "Perfecto, avisenme cuando este", hora: "13:20", sinLeer: 1, tipo: "aviso" },
    { id: "6", patente: "AD 728 KV", ot: "OT-4822", cliente: "Federico Bunge", asunto: "Presupuesto pastillas + discos", ultimo: "Cuanto me sale solo pastillas?", hora: "12:48", sinLeer: 2, tipo: "aprobacion" },
    { id: "7", patente: "AB 054 DH", ot: "OT-4815", cliente: "Panaderia Suarez", asunto: "Estado de la Kangoo", ultimo: "Necesitamos la camioneta para el lunes", hora: "11:55", sinLeer: 1, tipo: "consulta" },
    { id: "8", patente: "AH 155 EQ", ot: "OT-4828", cliente: "Marcos Otegui", asunto: "Radiador en camino", ultimo: "Ok, gracias por avisar", hora: "11:10", sinLeer: 0, tipo: "aviso" },
    { id: "9", patente: "AC 908 RT", ot: "OT-4823", cliente: "Delia Sobrero", asunto: "Service 60.000", ultimo: "Incluye cambio de filtro de habitaculo?", hora: "10:32", sinLeer: 0, tipo: "consulta" },
    { id: "10", patente: "AC 830 TU", ot: "OT-4819", cliente: "Distribuidora Nolasco", asunto: "Factura de inyectores", ultimo: "Nos la mandan por mail?", hora: "09:47", sinLeer: 0, tipo: "consulta" },
    { id: "11", patente: "AF 412 KM", ot: "OT-4821", cliente: "Transporte Aldabe", asunto: "Embrague Amarok", ultimo: "Confirmado, procedan", hora: "09:05", sinLeer: 0, tipo: "aprobacion" },
    { id: "12", patente: "AB 292 SW", ot: "OT-4825", cliente: "Vidrieria Ancar", asunto: "Distribucion Partner", ultimo: "Cuanto tiempo se demora?", hora: "Ayer", sinLeer: 0, tipo: "consulta" },
    { id: "13", patente: "AA 664 PL", ot: "OT-4812", cliente: "Corralon Zabalza", asunto: "Turbo entregado", ultimo: "Todo perfecto, gracias", hora: "Ayer", sinLeer: 0, tipo: "aviso" },
    { id: "14", patente: "AG 610 VN", ot: "OT-4829", cliente: "Ezequiel Nardelli", asunto: "Luz de motor encendida", ultimo: "Que dio el diagnostico?", hora: "Ayer", sinLeer: 1, tipo: "consulta" },
  ]
}
