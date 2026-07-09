// fonts.ts · La voz de BULON.
// Sora = grotesca de spec sheet: titulos y rotulos.
// JetBrains Mono = la cara del DATO. Patente, VIN, SKU, Nº OT, torques, horas.
// Liderar con mono como cuerpo es la firma del sistema: nadie mas lo hace.
// Un solo mono, apuntado por --font-body y --font-number: cargarlo dos veces lo baja dos veces.
import { Sora, JetBrains_Mono } from "next/font/google"

export const headingFont = Sora({ subsets: ["latin"], display: "swap", variable: "--font-heading-src" })
export const bodyFont = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-body-src" })

export const fontClass = `${headingFont.variable} ${bodyFont.variable}`
