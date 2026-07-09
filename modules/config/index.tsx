"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { theme } from "@/shell/theme"

// ACORDEON: secciones colapsables, plomeria del sistema. Todo sale de shell/theme.ts.

function Fila({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="dato flex items-center gap-2 text-xs font-medium">
        {swatch && <span className="h-4 w-4 border border-border" style={{ background: value }} />}
        {value}
      </span>
    </div>
  )
}

function Seccion({ titulo, children, abierta }: { titulo: string; children: React.ReactNode; abierta?: boolean }) {
  const [open, setOpen] = useState(!!abierta)
  return (
    <section className="surface-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-subtle"
      >
        <h2 className="font-heading text-xs font-bold uppercase tracking-widest">{titulo}</h2>
        <ChevronDown size={16} strokeWidth={2.5} className={"text-muted transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && <div className="border-t border-border px-4 py-3">{children}</div>}
    </section>
  )
}

export function ConfigPage() {
  const c = theme.colors
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Configuracion</h1>

      <div className="space-y-2">
        <Seccion titulo="Taller" abierta>
          <Fila label="Marca" value={theme.brand.name} />
          <Fila label="Bahias / elevadores" value={String(theme.bahias)} />
          <Fila label="Mecanicos activos" value="3" />
          <Fila label="Horario" value="08:00 a 18:00" />
        </Seccion>

        <Seccion titulo="Mano de obra (dominio)">
          <Fila label="Umbral 'cerca del estimado'" value={`${Math.round(theme.labor.cerca * 100)}%`} />
          <Fila label="Umbral 'excedido'" value={`${Math.round(theme.labor.excedido * 100)}%`} />
          <p className="pt-2 text-[11px] leading-snug text-muted">
            El Tablero de Bahias envejece con estos dos numeros. Bajá el umbral de excedido y toda la planta se pone en rojo antes.
          </p>
        </Seccion>

        <Seccion titulo="Forma">
          <Fila label="Modo" value={theme.mode} />
          <Fila label="Navegacion" value={theme.nav} />
          <Fila label="Elevacion" value={theme.elevation} />
          <Fila label="Bordes" value={theme.radius} />
          <Fila label="Densidad" value={theme.density} />
          <Fila label="Chips" value={theme.badge} />
          <Fila label="Titulos" value={theme.font.heading} />
          <Fila label="Dato" value={theme.font.body} />
        </Seccion>

        <Seccion titulo="Paleta">
          <Fila label="Petroleo (primario)" value={c.primary} swatch />
          <Fila label="Naranja señal (acento, solo fill)" value={c.accent} swatch />
          <Fila label="Acero (en cola)" value={c.info} swatch />
          <Fila label="Teal (entregado)" value={c.success} swatch />
          <Fila label="Espera repuesto" value={c.warning} swatch />
          <Fila label="Excedido" value={c.danger} swatch />
        </Seccion>

        <Seccion titulo="Estados de la OT">
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="chip bg-info/15 text-info">en cola</span>
            <span className="chip bg-warning/15 text-warning">aprobacion</span>
            <span className="chip bg-primary/15 text-primary">reparacion</span>
            <span className="chip bg-accent/20 text-warning">espera repuesto</span>
            <span className="chip bg-success/15 text-success">entregado</span>
            <span className="chip bg-danger/15 text-danger">excedida</span>
          </div>
        </Seccion>

        <Seccion titulo="Integraciones">
          <Fila label="Facturacion" value="mock (sin backend)" />
          <Fila label="WhatsApp" value="mock (sin backend)" />
          <Fila label="Catalogo de repuestos" value="mock (sin backend)" />
          <p className="pt-2 text-[11px] text-muted">
            Demo frontend con datos de ejemplo. Todo el diseño sale de shell/theme.ts.
          </p>
        </Seccion>
      </div>
    </div>
  )
}
