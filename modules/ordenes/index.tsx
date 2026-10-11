"use client"
import { memo, useMemo, useState } from "react"
import { getOrdenes, moverABahia, cerrarOT, type OT } from "./api"
import { FichaOT } from "./ficha-ot"
import { TableroBahias } from "@/shell/tablero-bahias"
import { useCarga, Esqueleto, ErrorCarga } from "@/shell/carga"
import { chipEstado, etiquetaEstado, nivelDeLabor, textoLabor, hhmm, type EstadoOT } from "@/shell/taller"

// La pantalla que manda. El mecanico ejecuta ordenes, no abre reportes.
// Arriba el Tablero de Bahias (la planta fisica). Abajo, la OT fluyendo por sus estados.
// Clic o Enter en una orden (en el tablero o en el kanban) abre su ficha.

const COLUMNAS: EstadoOT[] = ["en cola", "diagnostico", "aprobacion", "reparacion", "espera repuesto", "qc", "entregado"]

const TarjetaOT = memo(function TarjetaOT({ o, onAbrir }: { o: OT; onAbrir: (id: string) => void }) {
  const entregada = o.estado === "entregado"
  const nivel = nivelDeLabor(o.laborHecha || 1, o.laborEstimada)
  const colorLabor = entregada || nivel === "dentro" ? "text-muted" : textoLabor[nivel]

  return (
    // El clic en toda la tarjeta es un extra para el mouse; el boton de la patente es el acceso con teclado.
    <article
      onClick={() => onAbrir(o.id)}
      className="surface-card cursor-pointer border-l-2 border-border p-3 transition-colors hover:bg-bg"
    >
      <div className="flex items-baseline justify-between gap-2">
        <button type="button" aria-label={`Abrir la orden ${o.id}, patente ${o.patente}`} className="patente hit text-sm leading-none">
          {o.patente}
        </button>
        <span className="dato text-xs text-muted">{o.id}</span>
      </div>
      <p className="mt-1 truncate text-xs text-muted">{o.vehiculo}</p>
      <p className="mt-2 truncate text-xs">{o.trabajo}</p>

      {o.repuestoFaltante && (
        <p className="dato mt-2 truncate text-xs text-warning" title={o.repuestoFaltante}>
          falta: {o.repuestoFaltante}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="dato text-xs text-muted">
          {entregada ? "entregada" : o.diasEnTaller === 0 ? "ingresó hoy" : `${o.diasEnTaller}d en taller`}
        </span>
        {o.laborHecha > 0 && (
          <span className={"dato text-xs font-bold " + colorLabor}>
            {hhmm(o.laborHecha)} / {hhmm(o.laborEstimada)}
          </span>
        )}
      </div>
      {o.bahia && <p className="dato mt-1 text-xs text-primary">bahía {String(o.bahia).padStart(2, "0")}</p>}
    </article>
  )
})

export function OrdenesPage() {
  const { data, error, cargando, reintentar } = useCarga(getOrdenes)
  // Cambios de la demo: viven en estado de React y se pierden con F5.
  const [subidas, setSubidas] = useState<Record<string, number>>({})
  const [entregadas, setEntregadas] = useState<string[]>([])
  const [selId, setSelId] = useState<string | null>(null)

  const rows: OT[] = useMemo(
    () =>
      (data ?? []).map((r) => {
        if (entregadas.includes(r.id)) return { ...r, bahia: null, estado: "entregado" as EstadoOT }
        if (subidas[r.id]) {
          return { ...r, bahia: subidas[r.id], estado: "diagnostico" as EstadoOT, mecanico: "Cortes", laborHecha: 0.1 }
        }
        return r
      }),
    [data, subidas, entregadas],
  )

  const enBahia = rows.filter((o) => o.bahia !== null)
  const cola = rows.filter((o) => o.estado === "en cola")
  const sel = rows.find((o) => o.id === selId) ?? null

  const subir = (id: string, bahia: number) => {
    moverABahia(id, bahia)
    setSubidas((s) => ({ ...s, [id]: bahia }))
  }
  const entregar = (id: string) => {
    cerrarOT(id)
    setEntregadas((e) => [...e, id])
  }

  const excedidas = rows.filter(
    (o) => o.estado !== "entregado" && o.laborHecha > 0 && nivelDeLabor(o.laborHecha, o.laborEstimada) === "excedido",
  ).length
  const esperando = rows.filter((o) => o.estado === "espera repuesto").length

  const titulo = <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Órdenes de trabajo</h1>
  if (error) {
    return (
      <div className="space-y-4">
        {titulo}
        <ErrorCarga mensaje="No pudimos cargar las órdenes de trabajo." onReintentar={reintentar} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        {titulo}
        <div className="flex flex-wrap gap-2">
          {(cargando || excedidas > 0) && (
            <span className="chip bg-danger/15 text-danger">{cargando ? "—" : excedidas} {excedidas === 1 ? "excedida" : "excedidas"}</span>
          )}
          {(cargando || esperando > 0) && (
            <span className="chip bg-warning/15 text-warning">{cargando ? "—" : esperando} esperando repuesto</span>
          )}
        </div>
      </div>

      <TableroBahias
        autos={enBahia}
        cola={cola}
        cargando={cargando}
        onAbrir={setSelId}
        onSubir={subir}
        onCerrar={entregar}
      />

      {/* Kanban: la OT avanza de estado. El peso visual cae en el tablero, no aca. */}
      <section aria-busy={cargando} aria-labelledby="kanban-titulo">
        <h2 id="kanban-titulo" className="sr-only">
          Órdenes por estado
        </h2>
        <p className="mb-2 text-xs text-muted md:hidden">Deslizá hacia el costado para ver los siete estados.</p>
        <div className="overflow-x-auto pb-2" tabIndex={0} role="region" aria-label="Órdenes por estado, desplazable horizontalmente">
          <div className="flex gap-3" style={{ minWidth: "72rem" }}>
            {COLUMNAS.map((estado) => {
              const cols = rows.filter((o) => o.estado === estado)
              return (
                <section key={estado} className="w-52 shrink-0" aria-label={etiquetaEstado[estado]}>
                  <header className="mb-2 flex items-center justify-between gap-2 px-1">
                    <h3>
                      <span className={"chip " + chipEstado[estado]}>{etiquetaEstado[estado]}</span>
                    </h3>
                    <span className="dato text-xs text-muted" aria-label={cargando ? "cargando" : cols.length + " órdenes"}>
                      {cargando ? "—" : cols.length}
                    </span>
                  </header>
                  <div className="space-y-2">
                    {cargando ? (
                      <Esqueleto className="h-24" />
                    ) : cols.length === 0 ? (
                      <p className="bahia-libre dato py-6 text-center text-xs uppercase tracking-widest text-muted">vacía</p>
                    ) : (
                      cols.map((o) => <TarjetaOT key={o.id} o={o} onAbrir={setSelId} />)
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </section>

      <FichaOT ot={sel} onCerrar={() => setSelId(null)} />
    </div>
  )
}
