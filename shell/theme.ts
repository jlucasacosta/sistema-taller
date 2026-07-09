// theme.ts · BULON — Servicio Automotor (sistema taller)
// LA PALANCA DE DISEÑO. Nada se hardcodea: todo lee de aca.
// Ficha de Diseño: ver DISENO.md.
//
// Cliche rechazado: el kit racing (fibra de carbono, rojo-carrera sobre negro
// glossy, bandera a cuadros, franjas hazard). Eso es tuning de vidriera.
// Esto es un manual de servicio + un scanner OBD: tinta tecnica sobre hormigon.
// LIGHT porque la planta vive bajo fluorescentes: el reflejo mata las pantallas oscuras.

export type Theme = {
  brand: { name: string; logo?: string }
  mode: "light" | "dark"
  nav: "sidebar" | "topbar" | "rail"
  elevation: "raised" | "outlined" | "flat"
  badge: "pill" | "square"
  radius: "sharp" | "soft" | "round"
  density: "compact" | "comfortable"
  font: { heading: string; body: string }
  colors: {
    primary: string
    accent: string
    bg: string
    surface: string
    fg: string
    muted: string
    border: string
    subtle: string
    success: string
    warning: string
    danger: string
    info: string
  }
  // Constantes de dominio del taller. Ningun componente inventa un numero magico.
  labor: { cerca: number; excedido: number } // fraccion del tiempo estimado
  bahias: number // elevadores fisicos de la planta
}

export const bulon: Theme = {
  brand: { name: "BULON" },
  mode: "light",
  nav: "rail",
  elevation: "flat",
  badge: "square",
  radius: "sharp",
  density: "compact",
  font: { heading: "Sora", body: "JetBrains Mono" },
  colors: {
    primary: "#0c5460", // petroleo-diesel: la tinta del manual
    accent: "#e8571e", // naranja-señal: etiqueta de torque industrial. SOLO como fill.
    bg: "#f3f4f2", // hormigon de planta
    surface: "#ffffff", // hoja de especificacion
    fg: "#10161a",
    muted: "#5d6b72",
    border: "#d6dbd8",
    subtle: "#e8ebe8",
    success: "#0f766e", // teal: repuesto llego / entregado
    warning: "#c2410c", // naranja oscuro: legible como TEXTO (el accent no llega a 4.5:1)
    danger: "#b00020", // rojo frio y oscuro: separado del naranja para no confundirlos de lejos
    info: "#475569", // acero: en cola / idle
  },
  labor: { cerca: 0.85, excedido: 1 },
  bahias: 6,
}

export const theme: Theme = bulon
