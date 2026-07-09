// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Kardex: el vinculo orden<->inventario es la friccion real del rubro.
// No se cierra una reparacion sin la pieza.
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
  return [
    { id: "1", sku: "W712/95", descripcion: "Filtro de aceite", ubicacion: "A-01-3", costo: "$ 8.400", stock: 0, reorden: 6, maximo: 30 },
    { id: "2", sku: "48068-0K040", descripcion: "Rotula suspension sup. der.", ubicacion: "C-04-1", costo: "$ 41.200", stock: 2, reorden: 2, maximo: 10, bloqueaOT: "OT-4818" },
    { id: "3", sku: "6R1423055", descripcion: "Cremallera de direccion", ubicacion: "D-02-2", costo: "$ 386.000", stock: 0, reorden: 1, maximo: 4, bloqueaOT: "OT-4824" },
    { id: "4", sku: "5U0121253", descripcion: "Radiador", ubicacion: "D-05-1", costo: "$ 174.500", stock: 1, reorden: 2, maximo: 6, bloqueaOT: "OT-4828" },
    { id: "5", sku: "GDB1330", descripcion: "Pastillas de freno ceramicas", ubicacion: "B-02-4", costo: "$ 32.900", stock: 5, reorden: 8, maximo: 40 },
    { id: "6", sku: "DF4318", descripcion: "Disco de freno ventilado", ubicacion: "B-03-1", costo: "$ 54.700", stock: 12, reorden: 6, maximo: 24 },
    { id: "7", sku: "CT1028WP1", descripcion: "Kit distribucion + bomba", ubicacion: "C-01-2", costo: "$ 218.300", stock: 3, reorden: 2, maximo: 8 },
    { id: "8", sku: "OC90", descripcion: "Filtro de aceite (linea VW)", ubicacion: "A-01-4", costo: "$ 9.100", stock: 21, reorden: 8, maximo: 40 },
    { id: "9", sku: "LS7-5W40", descripcion: "Aceite sintetico 5W40 (litro)", ubicacion: "A-06-1", costo: "$ 12.600", stock: 48, reorden: 20, maximo: 120 },
    { id: "10", sku: "K068PK1705", descripcion: "Correa poly-V", ubicacion: "C-02-3", costo: "$ 27.800", stock: 7, reorden: 4, maximo: 16 },
    { id: "11", sku: "334/175", descripcion: "Amortiguador trasero", ubicacion: "E-01-2", costo: "$ 96.400", stock: 4, reorden: 4, maximo: 12 },
    { id: "12", sku: "0281002757", descripcion: "Sensor de presion riel", ubicacion: "F-03-1", costo: "$ 128.900", stock: 2, reorden: 1, maximo: 6 },
    { id: "13", sku: "BKR6E-11", descripcion: "Bujia niquel", ubicacion: "A-04-2", costo: "$ 4.900", stock: 64, reorden: 24, maximo: 120 },
    { id: "14", sku: "CU2939", descripcion: "Filtro de habitaculo", ubicacion: "A-02-1", costo: "$ 11.300", stock: 9, reorden: 6, maximo: 30 },
    { id: "15", sku: "SKF-VKBA3644", descripcion: "Rodamiento de rueda", ubicacion: "E-02-3", costo: "$ 68.200", stock: 6, reorden: 3, maximo: 12 },
    { id: "16", sku: "0986452041", descripcion: "Filtro de combustible", ubicacion: "A-03-2", costo: "$ 18.700", stock: 3, reorden: 5, maximo: 20 },
    { id: "17", sku: "31262-90000", descripcion: "Kit de embrague", ubicacion: "C-05-1", costo: "$ 312.500", stock: 2, reorden: 1, maximo: 5 },
    { id: "18", sku: "17801-38010", descripcion: "Filtro de aire", ubicacion: "A-05-1", costo: "$ 22.400", stock: 15, reorden: 8, maximo: 36 },
    { id: "19", sku: "TU-4530", descripcion: "Turbocompresor recambio", ubicacion: "F-01-1", costo: "$ 640.000", stock: 1, reorden: 1, maximo: 3 },
    { id: "20", sku: "R134A-500", descripcion: "Gas refrigerante R134a (500g)", ubicacion: "G-01-2", costo: "$ 26.100", stock: 11, reorden: 6, maximo: 24 },
    { id: "21", sku: "MB-JT4501", descripcion: "Junta de tapa de cilindros", ubicacion: "C-03-4", costo: "$ 74.800", stock: 2, reorden: 2, maximo: 8 },
    { id: "22", sku: "BAT-12X75", descripcion: "Bateria 12V 75Ah", ubicacion: "G-02-1", costo: "$ 152.000", stock: 5, reorden: 3, maximo: 10 },
    { id: "23", sku: "INJ-0445110", descripcion: "Inyector common rail", ubicacion: "F-02-2", costo: "$ 289.400", stock: 4, reorden: 2, maximo: 8 },
    { id: "24", sku: "LIQ-DOT4", descripcion: "Liquido de frenos DOT4 (500ml)", ubicacion: "A-07-3", costo: "$ 7.200", stock: 18, reorden: 10, maximo: 40 },
    { id: "25", sku: "AMT-DEL-K2", descripcion: "Amortiguador delantero", ubicacion: "E-01-1", costo: "$ 108.900", stock: 0, reorden: 4, maximo: 12 },
    { id: "26", sku: "CRR-ALT-6PK", descripcion: "Correa de alternador", ubicacion: "C-02-1", costo: "$ 15.600", stock: 13, reorden: 6, maximo: 24 },
    { id: "27", sku: "TRM-88C", descripcion: "Termostato 88°C", ubicacion: "B-05-2", costo: "$ 19.900", stock: 8, reorden: 4, maximo: 18 },
  ]
}
