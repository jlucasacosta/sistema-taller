// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// La unidad del taller es el VEHICULO, no la persona: la ficha se indexa por patente.
// Emails de patron variado y telefonos plausibles (CLAUDE.md §8). Todo ficticio.
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
  return [
    { id: "1", patente: "AF 412 KM", vehiculo: "VW Amarok 2019", vin: "8AWDB45Z1KA512834", km: 148320, cliente: "Transporte Aldabe", telefono: "+54 9 11 4783-2610", email: "flota@transportealdabe.com", proximoService: "160.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4821", trabajo: "Embrague completo", costo: "$ 486.000" },
      { fecha: "mar 2026", ot: "OT-4610", trabajo: "Service 140.000 km", costo: "$ 96.400" },
      { fecha: "oct 2025", ot: "OT-4402", trabajo: "Frenos delanteros", costo: "$ 132.800" },
    ] },
    { id: "2", patente: "AC 908 RT", vehiculo: "Ford Ranger 2021", vin: "8AFAR22N4MJ118293", km: 62740, cliente: "Delia Sobrero", telefono: "+54 9 11 6294-1187", email: "delia.sobrero@gmail.com", proximoService: "70.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4823", trabajo: "Service 60.000 km", costo: "$ 118.200" },
      { fecha: "ene 2026", ot: "OT-4551", trabajo: "Cambio de neumaticos", costo: "$ 340.000" },
    ] },
    { id: "3", patente: "AA 231 LP", vehiculo: "Toyota Hilux 2017", vin: "8AJFR22G7H0129471", km: 211050, cliente: "Estanislao Vergara", telefono: "+54 9 351 620-1934", email: "evergara77@hotmail.com", proximoService: "220.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4818", trabajo: "Tren delantero + alineacion", costo: "$ 264.500" },
      { fecha: "nov 2025", ot: "OT-4438", trabajo: "Kit de distribucion", costo: "$ 289.000" },
      { fecha: "abr 2025", ot: "OT-4187", trabajo: "Service 190.000 km", costo: "$ 104.700" },
    ] },
    { id: "4", patente: "AE 776 QS", vehiculo: "Chevrolet Onix 2022", vin: "9BGKS48X0NG204118", km: 34890, cliente: "Milagros Ayala", telefono: "+54 9 11 3126-8074", email: "mili.ayala@hotmail.com", proximoService: "40.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4826", trabajo: "Cambio de correa", costo: "$ 78.900" },
    ] },
    { id: "5", patente: "AB 054 DH", vehiculo: "Renault Kangoo 2016", vin: "8A1FW1BM4GL771203", km: 189430, cliente: "Panaderia Suarez", telefono: "+54 9 341 902-6614", email: "panaderiasuarez@outlook.com", proximoService: "vencido", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4815", trabajo: "Junta de tapa de cilindros", costo: "$ 398.400" },
      { fecha: "jun 2025", ot: "OT-4290", trabajo: "Bomba de agua", costo: "$ 87.100" },
    ] },
    { id: "6", patente: "AG 610 VN", vehiculo: "Fiat Cronos 2023", vin: "8AP359A1XPU012774", km: 18760, cliente: "Ezequiel Nardelli", telefono: "+54 9 11 5840-3962", email: "eze_nardelli@yahoo.com", proximoService: "20.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4829", trabajo: "Diagnostico luz de motor", costo: "$ 34.000" },
    ] },
    { id: "7", patente: "AD 385 WJ", vehiculo: "Peugeot 208 2020", vin: "8AD2CHMZ5LG338204", km: 71200, cliente: "Rosario Bianchi", telefono: "+54 9 11 2957-6431", email: "rosariobianchi@outlook.com", proximoService: "80.000 km", estado: "al dia", historial: [
      { fecha: "sep 2025", ot: "OT-4371", trabajo: "Service 60.000 km", costo: "$ 92.300" },
    ] },
    { id: "8", patente: "AC 117 BF", vehiculo: "Citroen Berlingo 2018", vin: "VF7GJKFVC8N441029", km: 156980, cliente: "Ferreteria Machuca", telefono: "+54 9 261 801-7352", email: "compras@ferreteriamachuca.com", proximoService: "160.000 km", estado: "al dia", historial: [
      { fecha: "feb 2026", ot: "OT-4588", trabajo: "Embrague", costo: "$ 412.000" },
      { fecha: "may 2025", ot: "OT-4231", trabajo: "Service 140.000 km", costo: "$ 88.600" },
    ] },
    { id: "9", patente: "AH 902 CD", vehiculo: "Nissan Frontier 2022", vin: "94DVCUD23NB110385", km: 44310, cliente: "Agro Puelches", telefono: "+54 9 11 7013-5528", email: "administracion@agropuelches.com", proximoService: "50.000 km", estado: "al dia", historial: [] },
    { id: "10", patente: "AB 749 MK", vehiculo: "Honda Fit 2015", vin: "93HGE8650FZ200417", km: 198760, cliente: "Camila Ferrero", telefono: "+54 9 11 4406-9173", email: "cami.ferrero@hotmail.com", proximoService: "vencido", estado: "service vencido", historial: [
      { fecha: "ago 2025", ot: "OT-4318", trabajo: "Frenos completos", costo: "$ 148.900" },
    ] },
    { id: "11", patente: "AE 203 XZ", vehiculo: "VW Gol Trend 2014", vin: "9BWAB45U0EP066123", km: 224500, cliente: "Hector Quintana", telefono: "+54 9 11 6672-2049", email: "hquintana@yahoo.com", proximoService: "vencido", estado: "service vencido", historial: [
      { fecha: "hoy", ot: "OT-4824", trabajo: "Caja de direccion", costo: "$ 512.000" },
      { fecha: "dic 2024", ot: "OT-3980", trabajo: "Service 200.000 km", costo: "$ 76.200" },
    ] },
    { id: "12", patente: "AF 558 GT", vehiculo: "Ford EcoSport 2019", vin: "9BFZB55P3K8419270", km: 96140, cliente: "Vanina Recalde", telefono: "+54 9 11 5217-4486", email: "vaninarecalde@outlook.com", proximoService: "100.000 km", estado: "al dia", historial: [
      { fecha: "hoy", ot: "OT-4820", trabajo: "Amortiguadores traseros", costo: "$ 218.400" },
    ] },
    { id: "13", patente: "AA 664 PL", vehiculo: "Chevrolet S10 2016", vin: "9BG138ND0GC403811", km: 245900, cliente: "Corralon Zabalza", telefono: "+54 9 11 8842-3057", email: "corralonzabalza@gmail.com", proximoService: "250.000 km", estado: "al dia", historial: [
      { fecha: "esta semana", ot: "OT-4812", trabajo: "Turbo + intercooler", costo: "$ 894.000" },
    ] },
    { id: "14", patente: "AD 019 NR", vehiculo: "Renault Sandero 2018", vin: "93YBSR6RHJJ722095", km: 132470, cliente: "Ignacio Peluffo", telefono: "+54 9 11 4550-7268", email: "nacho.peluffo@yahoo.com", proximoService: "140.000 km", estado: "al dia", historial: [
      { fecha: "esta semana", ot: "OT-4813", trabajo: "Service 120.000 km", costo: "$ 98.100" },
    ] },
    { id: "15", patente: "AG 447 HY", vehiculo: "Toyota Etios 2021", vin: "9BRB29BT3M2334019", km: 58200, cliente: "Sol Miranda", telefono: "+54 9 11 6134-8890", email: "solmiranda@hotmail.com", proximoService: "60.000 km", estado: "al dia", historial: [
      { fecha: "esta semana", ot: "OT-4816", trabajo: "Embrague", costo: "$ 376.500" },
    ] },
    { id: "16", patente: "AC 830 TU", vehiculo: "Fiat Toro 2020", vin: "988226ND1LK118440", km: 88940, cliente: "Distribuidora Nolasco", telefono: "+54 9 11 2117-4903", email: "logistica@distnolasco.com", proximoService: "90.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4819", trabajo: "Inyectores", costo: "$ 604.000" },
    ] },
    { id: "17", patente: "AB 292 SW", vehiculo: "Peugeot Partner 2017", vin: "VF37BBHY6HJ550218", km: 174300, cliente: "Vidrieria Ancar", telefono: "+54 9 11 7446-2085", email: "vidrieriaancar@hotmail.com", proximoService: "180.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4825", trabajo: "Distribucion", costo: "$ 331.200" },
    ] },
    { id: "18", patente: "AH 155 EQ", vehiculo: "VW Saveiro 2019", vin: "9BWKB45U6KP771330", km: 119680, cliente: "Marcos Otegui", telefono: "+54 9 11 3852-6640", email: "motegui85@outlook.com", proximoService: "120.000 km", estado: "en taller", historial: [
      { fecha: "hoy", ot: "OT-4828", trabajo: "Radiador", costo: "$ 214.700" },
    ] },
    { id: "19", patente: "AA 907 JB", vehiculo: "Ford Focus 2015", vin: "8AFBZZFHXFJ225604", km: 203400, cliente: "Lucila Aguirregomezcorta", telefono: "+54 9 11 5739-1264", email: "lucila.aguirre@gmail.com", proximoService: "vencido", estado: "service vencido", historial: [] },
    { id: "20", patente: "AE 481 FC", vehiculo: "Chevrolet Cruze 2021", vin: "9BGBF69X0MG221847", km: 51230, cliente: "Bruno Etchegaray", telefono: "+54 9 11 2965-8317", email: "bruno_etchegaray@outlook.com", proximoService: "60.000 km", estado: "al dia", historial: [] },
    { id: "21", patente: "AF 336 LD", vehiculo: "Renault Duster 2019", vin: "93YHSR2H1KJ440172", km: 108550, cliente: "Agustina Lastra", telefono: "+54 9 11 6708-4429", email: "agustinalastra@yahoo.com", proximoService: "120.000 km", estado: "al dia", historial: [
      { fecha: "esta semana", ot: "OT-4817", trabajo: "Kit de distribucion", costo: "$ 344.000" },
    ] },
    { id: "22", patente: "AD 728 KV", vehiculo: "Toyota Corolla 2020", vin: "9BRBLWHE2L0338902", km: 76890, cliente: "Federico Bunge", telefono: "+54 9 11 5240-9976", email: "fbunge@yahoo.com", proximoService: "80.000 km", estado: "al dia", historial: [] },
  ]
}
