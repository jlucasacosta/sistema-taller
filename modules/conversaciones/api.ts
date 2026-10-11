// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// En el taller un mensaje NO es un chat: es un ticket atado a una patente y a una OT.
// Por eso el arquetipo es lista-ticket y no el inbox con burbujas.
import raw from "./data.json"

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
  return structuredClone(raw.tickets) as Ticket[]
}
