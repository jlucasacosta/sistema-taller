"use client"
import { memo, useMemo, useState } from "react"
import { getBullets, getAvisos, type Bullet, type Aviso } from "./api"
import { getOrdenes, cerrarOT, type OT } from "@/modules/ordenes/api"
import { FichaOT } from "@/modules/ordenes/ficha-ot"
import { TableroBahias } from "@/shell/tablero-bahias"
import { useCarga, Esqueleto, ErrorCarga } from "@/shell/carga"
import { nivelDeLabor, type EstadoOT } from "@/shell/taller"

// El dashboard hospeda la PLANTA, no metricas ornamentales (componente eliminado
// segun DISENO.md: nada de header-con-metricas). stat-tiles + bullet, ambos unicos
// en la coleccion. Numero en mono XXL: se lee de reojo, con las manos con grasa.
// Los contadores salen de las ordenes (se calculan, no son texto fijo) y no repiten lo que
// ya dice el Estado de bahias (ocupadas y en cola).

const dot: Record<Aviso["tono"], string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
}

// El feed muestra los primeros 6 avisos; el resto se expande en la misma pagina.
const AVISOS_VISIBLES = 6

// bullet chart: barra de real, marca de objetivo, banda de rango. Real vs meta, sin adornos.
const BulletBar = memo(function BulletBar({ b }: { b: Bullet }) {
  const real = Math.min(b.real / b.max, 1) * 100
  const obj = Math.min(b.objetivo / b.max, 1) * 100
  const cumple = b.real >= b.objetivo

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted">{b.label}</span>
        <span className={"dato text-xs font-bold " + (cumple ? "text-success" : "text-warning")}>
          {b.real} <span className="text-muted">/ {b.objetivo} {b.unidad}</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-3 w-full bg-subtle" aria-hidden="true">
        <div className={"h-full " + (cumple ? "bg-success" : "bg-accent")} style={{ width: real + "%" }} />
        {/* la marca del objetivo: la regla contra la que se mide */}
        <span className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-fg" style={{ left: obj + "%" }} />
      </div>
    </div>
  )
})

type Tile = { id: string; label: string; valor: number; color: string }

export function DashboardPage() {
  const { data, error, cargando, reintentar } = useCarga(() => Promise.all([getBullets(), getAvisos(), getOrdenes()]))
  const [entregadas, setEntregadas] = useState<string[]>([])
  const [selId, setSelId] = useState<string | null>(null)
  const [avisosCompletos, setAvisosCompletos] = useState(false)

  const bullets: Bullet[] = data?.[0] ?? []
  const avisos: Aviso[] = data?.[1] ?? []
  // Las entregas de la demo viven en estado de React: F5 vuelve a los datos del JSON.
  const ordenes: OT[] = useMemo(
    () =>
      (data?.[2] ?? []).map((o) =>
        entregadas.includes(o.id) ? { ...o, bahia: null, estado: "entregado" as EstadoOT } : o,
      ),
    [data, entregadas],
  )

  const enBahia = ordenes.filter((o) => o.bahia !== null)
  const cola = ordenes.filter((o) => o.estado === "en cola")
  const abiertas = ordenes.filter((o) => o.estado !== "entregado")
  const sel = ordenes.find((o) => o.id === selId) ?? null

  const tiles: Tile[] = [
    { id: "abiertas", label: "Órdenes abiertas", valor: abiertas.length, color: "text-primary" },
    { id: "repuesto", label: "Esperando repuesto", valor: abiertas.filter((o) => o.estado === "espera repuesto").length, color: "text-warning" },
    {
      id: "excedidas",
      label: "Excedidas",
      valor: abiertas.filter((o) => o.laborHecha > 0 && nivelDeLabor(o.laborHecha, o.laborEstimada) === "excedido").length,
      color: "text-danger",
    },
    { id: "calidad", label: "Para entregar", valor: abiertas.filter((o) => o.estado === "qc").length, color: "text-success" },
  ]

  const entregar = (id: string) => {
    cerrarOT(id)
    setEntregadas((e) => [...e, id])
  }

  const titulo = <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Tablero</h1>
  if (error) {
    return (
      <div className="space-y-4">
        {titulo}
        <ErrorCarga mensaje="No pudimos cargar el tablero de la planta." onReintentar={reintentar} />
      </div>
    )
  }

  const avisosVisibles = avisosCompletos ? avisos : avisos.slice(0, AVISOS_VISIBLES)

  return (
    <div className="space-y-4">
      {titulo}

      <TableroBahias autos={enBahia} cola={cola} cargando={cargando} onAbrir={setSelId} onCerrar={entregar} />

      {/* En celular los cuatro contadores van en una sola fila compacta; desde md, cuatro tarjetas. */}
      <section aria-label="Resumen de la planta" aria-busy={cargando} className="grid grid-cols-4 gap-px bg-border md:gap-3 md:bg-transparent">
        {tiles.map((t) => (
          <div key={t.id} className="bg-surface px-0.5 py-2 text-center md:surface-card md:p-4 md:text-left">
            <p className="text-xs leading-tight text-muted [overflow-wrap:anywhere] md:uppercase md:tracking-widest">{t.label}</p>
            <p className={"dato mt-1 text-2xl font-bold leading-none md:text-5xl " + t.color}>{cargando ? "—" : t.valor}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="surface-card space-y-4 p-5 lg:col-span-2" aria-busy={cargando} aria-labelledby="horas-titulo">
          <div>
            <h2 id="horas-titulo" className="font-heading text-sm font-bold uppercase tracking-widest">
              Horas reales vs objetivo
            </h2>
            <p className="mt-1 text-xs text-muted">Barra: lo real. Marca negra: el objetivo. Verde si lo alcanza, naranja si no llega.</p>
          </div>
          {cargando
            ? Array.from({ length: 4 }, (_, i) => <Esqueleto key={i} className="h-8" />)
            : bullets.map((b) => <BulletBar key={b.id} b={b} />)}
        </section>

        <section className="surface-card p-5" aria-busy={cargando} aria-labelledby="actividad-titulo">
          <h2 id="actividad-titulo" className="mb-4 font-heading text-sm font-bold uppercase tracking-widest">
            Actividad reciente
          </h2>
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: AVISOS_VISIBLES }, (_, i) => (
                <Esqueleto key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {avisosVisibles.map((a) => (
                  <li key={a.id} className="flex gap-2 border-b border-border pb-2 last:border-0">
                    <span className={"mt-1.5 h-2 w-2 shrink-0 " + dot[a.tono]} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs leading-snug">{a.texto}</p>
                      <p className="dato mt-0.5 text-xs text-muted">{a.tiempo}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {avisos.length > AVISOS_VISIBLES && (
                <button
                  type="button"
                  onClick={() => setAvisosCompletos((v) => !v)}
                  aria-expanded={avisosCompletos}
                  className="tap mt-3 flex w-full items-center justify-center border border-border bg-surface px-2 text-xs font-medium hover:bg-subtle"
                >
                  {avisosCompletos ? "Ver menos" : `Ver todo (${avisos.length})`}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      <FichaOT ot={sel} onCerrar={() => setSelId(null)} />
    </div>
  )
}
