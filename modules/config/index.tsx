"use client"
import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { theme } from "@/shell/theme"
import { chipEstado, etiquetaEstado, leyendaEstados, type EstadoOT } from "@/shell/taller"

// ACORDEON: secciones colapsables, plomeria del sistema. Todo sale de shell/theme.ts.
// El chevron gira al abrir: es un cambio de estado que provoca el usuario, no una animacion decorativa.

const ESTADOS: EstadoOT[] = ["en cola", "diagnostico", "aprobacion", "reparacion", "espera repuesto", "qc", "entregado"]

function Fila({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="dato flex items-center gap-2 text-xs font-medium">
        {swatch && <span className="h-4 w-4 border border-border" style={{ background: value }} aria-hidden="true" />}
        {value}
      </span>
    </div>
  )
}

function Seccion({ titulo, children, abierta }: { titulo: string; children: React.ReactNode; abierta?: boolean }) {
  const [open, setOpen] = useState(!!abierta)
  const panelId = useId()
  return (
    <section className="surface-card overflow-hidden">
      <h2 className="font-heading text-xs font-bold uppercase tracking-widest">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left uppercase tracking-widest transition-colors hover:bg-subtle"
        >
          {titulo}
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            aria-hidden="true"
            className={"text-muted transition-transform motion-reduce:transition-none " + (open ? "rotate-180" : "")}
          />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="border-t border-border px-4 py-3">
        {children}
      </div>
    </section>
  )
}

export function ConfigPage() {
  const c = theme.colors
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Configuración</h1>

      <div className="space-y-2">
        <Seccion titulo="Taller" abierta>
          <Fila label="Marca" value={theme.brand.name} />
          <Fila label="Bahías / elevadores" value={String(theme.bahias)} />
          <Fila label="Mecánicos activos" value="3" />
          <Fila label="Horario" value="08:00 a 18:00" />
        </Seccion>

        <Seccion titulo="Mano de obra (dominio)">
          <Fila label="Umbral 'cerca del estimado'" value={`${Math.round(theme.labor.cerca * 100)}%`} />
          <Fila label="Umbral 'excedido'" value={`${Math.round(theme.labor.excedido * 100)}%`} />
          <p className="pt-2 text-xs leading-snug text-muted">
            El Estado de bahías marca cada auto según estos dos umbrales. Bajá el de excedido y más autos se marcan en rojo antes.
          </p>
        </Seccion>

        <Seccion titulo="Forma">
          <Fila label="Modo" value={theme.mode} />
          <Fila label="Navegación" value={theme.nav} />
          <Fila label="Elevación" value={theme.elevation} />
          <Fila label="Bordes" value={theme.radius} />
          <Fila label="Densidad" value={theme.density} />
          <Fila label="Chips" value={theme.badge} />
          <Fila label="Títulos" value={theme.font.heading} />
          <Fila label="Dato" value={theme.font.body} />
        </Seccion>

        <Seccion titulo="Paleta">
          <Fila label="Petróleo (primario)" value={c.primary} swatch />
          <Fila label="Naranja señal (acento, solo relleno)" value={c.accent} swatch />
          <Fila label="Acero (en cola)" value={c.info} swatch />
          <Fila label="Teal (entregado)" value={c.success} swatch />
          <Fila label="Ámbar (espera de un tercero)" value={c.warning} swatch />
          <Fila label="Rojo (excedido, quebrado, reclamo)" value={c.danger} swatch />
        </Seccion>

        <Seccion titulo="Estados de la OT">
          <div className="flex flex-wrap gap-2 pt-1">
            {ESTADOS.map((e) => (
              <span key={e} className={"chip " + chipEstado[e]}>
                {etiquetaEstado[e]}
              </span>
            ))}
            <span className="chip bg-danger/15 text-danger">excedida</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {leyendaEstados.map((l) => (
              <li key={l.titulo} className="flex items-baseline gap-2 text-xs">
                <span className={"chip shrink-0 " + l.clase}>{l.titulo}</span>
                <span className="text-muted">{l.detalle}</span>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-xs text-muted">«Calidad» es el control de calidad antes de entregar el auto.</p>
        </Seccion>

        <Seccion titulo="Integraciones">
          <Fila label="Facturación" value="mock (sin backend)" />
          <Fila label="WhatsApp" value="mock (sin backend)" />
          <Fila label="Catálogo de repuestos" value="mock (sin backend)" />
          <p className="pt-2 text-xs text-muted">
            Demo frontend con datos de ejemplo. Todo el diseño sale de shell/theme.ts.
          </p>
        </Seccion>
      </div>
    </div>
  )
}
