"use client"
import { useEffect, useState } from "react"
import { getOrdenes, moverABahia, cerrarOT, type OT } from "./api"
import { TableroBahias } from "@/shell/tablero-bahias"
import { chipEstado, nivelDeLabor, textoLabor, hhmm, type EstadoOT } from "@/shell/taller"

// La pantalla que manda. El mecanico ejecuta ordenes, no abre reportes.
// Arriba el Tablero de Bahias (la planta fisica). Abajo, la OT fluyendo por sus estados.

const COLUMNAS: EstadoOT[] = ["en cola", "diagnostico", "aprobacion", "reparacion", "espera repuesto", "qc", "entregado"]

function TarjetaOT({ o, tick }: { o: OT; tick: number }) {
  const hecha = o.laborHecha + (o.bahia ? tick / 60 : 0)
  const nivel = nivelDeLabor(hecha || 1, o.laborEstimada)
  const excedida = o.laborHecha > 0 && nivel === "excedido"

  return (
    <article className="surface-card border-l-2 border-border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="patente text-sm leading-none">{o.patente}</span>
        <span className="dato text-[10px] text-muted">{o.id}</span>
      </div>
      <p className="mt-1 truncate text-[11px] text-muted">{o.vehiculo}</p>
      <p className="mt-2 truncate text-[11px]">{o.trabajo}</p>

      {o.repuestoFaltante && (
        <p className="dato mt-2 truncate text-[10px] text-warning" title={o.repuestoFaltante}>
          falta: {o.repuestoFaltante}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="dato text-[10px] text-muted">{o.diasEnTaller}d en taller</span>
        {o.laborHecha > 0 && (
          <span className={"dato text-[11px] font-bold " + (excedida ? textoLabor.excedido : "text-muted")}>
            {hhmm(hecha)} / {hhmm(o.laborEstimada)}
          </span>
        )}
      </div>
      {o.bahia && <p className="dato mt-1 text-[10px] text-primary">bahia {String(o.bahia).padStart(2, "0")}</p>}
    </article>
  )
}

export function OrdenesPage() {
  const [rows, setRows] = useState<OT[]>([])
  const [tick, setTick] = useState(0)
  const [saliendo, setSaliendo] = useState<string[]>([])

  useEffect(() => {
    getOrdenes().then(setRows)
  }, [])

  // El cronometro de mano de obra corre en vivo.
  useEffect(() => {
    const t = setInterval(() => setTick((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const enBahia = rows.filter((o) => o.bahia !== null)
  const cola = rows.filter((o) => o.estado === "en cola")

  const subir = (id: string, bahia: number) => {
    moverABahia(id, bahia)
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, bahia, estado: "diagnostico" as EstadoOT, mecanico: "Cortes", laborHecha: 0.1 } : r)),
    )
  }

  const entregar = (id: string) => {
    cerrarOT(id)
    setSaliendo((s) => [...s, id])
    setTimeout(() => {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, bahia: null, estado: "entregado" as EstadoOT } : r)))
      setSaliendo((s) => s.filter((x) => x !== id))
    }, 430)
  }

  const excedidas = enBahia.filter((o) => nivelDeLabor(o.laborHecha + tick / 60, o.laborEstimada) === "excedido").length
  const esperando = rows.filter((o) => o.estado === "espera repuesto").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Ordenes de trabajo</h1>
        <div className="flex gap-2">
          {excedidas > 0 && <span className="chip bg-danger/15 text-danger">{excedidas} excedidas</span>}
          {esperando > 0 && <span className="chip bg-warning/15 text-warning">{esperando} esperando repuesto</span>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[70rem]">
          <TableroBahias autos={enBahia} cola={cola} tick={tick} saliendo={saliendo} onSubir={subir} onCerrar={entregar} />
        </div>
      </div>

      {/* Kanban: la OT avanza de estado. El peso visual cae en el tablero, no aca. */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: "72rem" }}>
          {COLUMNAS.map((estado) => {
            const cols = rows.filter((o) => o.estado === estado)
            return (
              <section key={estado} className="w-52 shrink-0">
                <header className="mb-2 flex items-center justify-between gap-2 px-1">
                  <span className={"chip " + chipEstado[estado]}>{estado}</span>
                  <span className="dato text-xs text-muted">{cols.length}</span>
                </header>
                <div className="space-y-2">
                  {cols.map((o) => (
                    <TarjetaOT key={o.id} o={o} tick={tick} />
                  ))}
                  {cols.length === 0 && (
                    <p className="bahia-libre dato py-6 text-center text-[10px] uppercase tracking-widest text-muted">
                      vacia
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
