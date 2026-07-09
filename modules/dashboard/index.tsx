"use client"
import { useEffect, useState } from "react"
import { getTiles, getBullets, getAvisos, type Tile, type Bullet, type Aviso } from "./api"
import { getOrdenes, cerrarOT, type OT } from "@/modules/ordenes/api"
import { TableroBahias } from "@/shell/tablero-bahias"

// El dashboard hospeda la PLANTA, no metricas ornamentales (componente eliminado
// segun DISENO.md: nada de header-con-metricas). stat-tiles + bullet, ambos unicos
// en la coleccion. Numero en mono XXL: se lee de reojo, con las manos con grasa.

const tono: Record<Tile["tono"], string> = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
}
const dot: Record<Aviso["tono"], string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
}

// bullet chart: barra de real, marca de objetivo, banda de rango. Real vs meta, sin adornos.
function BulletBar({ b }: { b: Bullet }) {
  const real = Math.min(b.real / b.max, 1) * 100
  const obj = Math.min(b.objetivo / b.max, 1) * 100
  const cumple = b.real >= b.objetivo

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-muted">{b.label}</span>
        <span className={"dato text-xs font-bold " + (cumple ? "text-success" : "text-warning")}>
          {b.real} <span className="text-muted">/ {b.objetivo} {b.unidad}</span>
        </span>
      </div>
      <div className="relative mt-1.5 h-3 w-full bg-subtle">
        <div className={"h-full " + (cumple ? "bg-success" : "bg-accent")} style={{ width: real + "%" }} />
        {/* la marca del objetivo: la regla contra la que se mide */}
        <span className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-fg" style={{ left: obj + "%" }} />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [ordenes, setOrdenes] = useState<OT[]>([])
  const [tick, setTick] = useState(0)
  const [saliendo, setSaliendo] = useState<string[]>([])

  useEffect(() => {
    getTiles().then(setTiles)
    getBullets().then(setBullets)
    getAvisos().then(setAvisos)
    getOrdenes().then(setOrdenes)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const enBahia = ordenes.filter((o) => o.bahia !== null)
  const cola = ordenes.filter((o) => o.estado === "en cola")

  const entregar = (id: string) => {
    cerrarOT(id)
    setSaliendo((s) => [...s, id])
    setTimeout(() => {
      setOrdenes((rs) => rs.map((r) => (r.id === id ? { ...r, bahia: null, estado: "entregado" } : r)))
      setSaliendo((s) => s.filter((x) => x !== id))
    }, 430)
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Tablero</h1>

      <div className="overflow-x-auto">
        <div className="min-w-[70rem]">
          <TableroBahias autos={enBahia} cola={cola} tick={tick} saliendo={saliendo} onCerrar={entregar} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(tiles.length ? tiles : Array(4).fill(null)).map((t: Tile | null, i) => (
          <div key={i} className="surface-card p-4">
            {t ? (
              <>
                <p className="text-[10px] uppercase tracking-widest text-muted">{t.label}</p>
                <p className={"dato mt-1 text-5xl font-bold leading-none " + tono[t.tono]}>{t.valor}</p>
              </>
            ) : (
              <div className="h-14 animate-pulse bg-subtle" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="surface-card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest">Horas reales vs objetivo</h2>
          {bullets.map((b) => (
            <BulletBar key={b.id} b={b} />
          ))}
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest">Actividad reciente</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {avisos.map((a) => (
              <li key={a.id} className="flex gap-2 border-b border-border pb-2 last:border-0">
                <span className={"mt-1.5 h-1.5 w-1.5 shrink-0 " + dot[a.tono]} />
                <div className="min-w-0">
                  <p className="text-[11px] leading-snug">{a.texto}</p>
                  <p className="dato mt-0.5 text-[10px] text-muted">{a.tiempo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
