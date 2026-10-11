import { LayoutDashboard, Wrench, Package, MessageSquare, Car, Settings, type LucideIcon } from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon }

// La unidad del taller es el VEHICULO, no la persona: /contactos se rotula "Vehiculos".
export const nav: NavItem[] = [
  { label: "Tablero", href: "/dashboard", icon: LayoutDashboard },
  { label: "Órdenes de trabajo", href: "/ordenes", icon: Wrench },
  { label: "Inventario", href: "/inventario", icon: Package },
  { label: "Mensajes", href: "/conversaciones", icon: MessageSquare },
  { label: "Vehículos", href: "/contactos", icon: Car },
  { label: "Configuración", href: "/config", icon: Settings },
]
