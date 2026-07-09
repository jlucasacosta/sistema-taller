"use client"
import { useEffect, useState } from "react"
import { getPiezas, type Pieza } from "./api"
import { nivelDeStock, rellenoStock, chipStock } from "@/shell/taller"

// KARDEX: tabla-densa con un gauge bullet POR FILA (stock actual vs punto de reorden).
// Segundo diferencial del sistema: nadie mas mete el grafico adentro de la fila.

// El gauge de la fila: relleno = stock, marca vertical = punto de reorden.
function GaugeStock({ p }: { p: Pieza }) {
  const nivel = nivelDeStock(p.stock, p.reorden)
  const ancho = Math.min(p.stock / p.maximo, 1) * 100
  const marca = Math.min(p.reorden / p.maximo, 1) * 100

  return (
    <div className="relative h-2.5 w-full bg-subtle">
      <div className={"h-full " + rellenoStock[nivel]} style={{ width: ancho + "%" }} />
      <span className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-fg" style={{ left: marca + "%" }} />
    </div>
  )
}

export function InventarioPage() {
  const [rows, setRows] = useState<Pieza[]>([])
  const [soloCriticas, setSoloCriticas] = useState(false)

  useEffect(() => {
    getPiezas().then(setRows)
  }, [])

  const criticas = rows.filter((p) => nivelDeStock(p.stock, p.reorden) !== "ok")
  const bloqueantes = rows.filter((p) => p.bloqueaOT)
  const visibles = soloCriticas ? criticas : rows

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Kardex</h1>
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-danger/15 text-danger">{criticas.length} bajo reorden</span>
          <span className="chip bg-warning/15 text-warning">{bloqueantes.length} bloquean una OT</span>
          <button
            onClick={() => setSoloCriticas((s) => !s)}
            className={"chip transition-colors " + (soloCriticas ? "bg-primary text-surface" : "bg-subtle text-muted hover:text-fg")}
          >
            {soloCriticas ? "viendo criticas" : "ver solo criticas"}
          </button>
        </div>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[62rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted">
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Descripcion</th>
              <th className="px-3 py-2 font-medium">Ubicacion</th>
              <th className="px-3 py-2 text-right font-medium">Costo</th>
              <th className="px-3 py-2 text-right font-medium">Stock</th>
              <th className="w-56 px-3 py-2 font-medium">Reorden</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => {
              const nivel = nivelDeStock(p.stock, p.reorden)
              return (
                <tr key={p.id} className="border-b border-border transition-colors last:border-0 hover:bg-subtle">
                  <td className="dato px-3 py-2 text-xs font-bold">{p.sku}</td>
                  <td className="px-3 py-2 text-xs">
                    {p.descripcion}
                    {p.bloqueaOT && (
                      <span className="dato ml-2 text-[10px] text-danger">bloquea {p.bloqueaOT}</span>
                    )}
                  </td>
                  <td className="dato px-3 py-2 text-xs text-muted">{p.ubicacion}</td>
                  <td className="dato px-3 py-2 text-right text-xs">{p.costo}</td>
                  <td className="dato px-3 py-2 text-right text-base font-bold">{p.stock}</td>
                  <td className="px-3 py-2">
                    <GaugeStock p={p} />
                    <p className="dato mt-1 text-[10px] text-muted">
                      reorden {p.reorden} · max {p.maximo}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={"chip " + chipStock[nivel]}>{nivel}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
