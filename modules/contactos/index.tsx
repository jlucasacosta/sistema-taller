"use client"
import { useEffect, useState } from "react"
import { getVehiculos, type Vehiculo } from "./api"

// MASTER-DETAIL indexado por PATENTE. Sin avatares: aca manda el vehiculo, no la persona.
// Sin buscador global (componente eliminado): la lista de patentes ES el indice.

const estadoChip: Record<Vehiculo["estado"], string> = {
  "en taller": "bg-primary/15 text-primary",
  "al dia": "bg-success/15 text-success",
  "service vencido": "bg-danger/15 text-danger",
}

export function ContactosPage() {
  const [rows, setRows] = useState<Vehiculo[]>([])
  const [sel, setSel] = useState<Vehiculo | null>(null)

  useEffect(() => {
    getVehiculos().then((v) => {
      setRows(v)
      setSel(v[0] ?? null)
    })
  }, [])

  const vencidos = rows.filter((v) => v.estado === "service vencido").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Vehiculos</h1>
        <div className="flex gap-2">
          <span className="chip bg-subtle text-muted">{rows.length} en cartera</span>
          <span className="chip bg-danger/15 text-danger">{vencidos} service vencido</span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[20rem_1fr]">
        {/* master: la tira de patentes, stencil sobre chapa */}
        <div className="surface-card max-h-[38rem] overflow-y-auto">
          {rows.map((v) => (
            <button
              key={v.id}
              onClick={() => setSel(v)}
              className={
                "flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 " +
                (sel?.id === v.id ? "bg-subtle" : "hover:bg-subtle")
              }
            >
              <div className="min-w-0">
                <p className="patente text-sm leading-none">{v.patente}</p>
                <p className="mt-1 truncate text-[11px] text-muted">{v.vehiculo}</p>
              </div>
              <span className={"chip shrink-0 " + estadoChip[v.estado]}>{v.estado === "en taller" ? "taller" : v.estado === "al dia" ? "ok" : "vencido"}</span>
            </button>
          ))}
        </div>

        {/* detail: la ficha del vehiculo */}
        {sel && (
          <div className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="patente text-3xl leading-none">{sel.patente}</p>
                <p className="mt-2 font-heading text-sm font-bold uppercase tracking-wide">{sel.vehiculo}</p>
              </div>
              <span className={"chip " + estadoChip[sel.estado]}>{sel.estado}</span>
            </div>

            <dl className="grid gap-x-6 gap-y-3 py-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">VIN</dt>
                <dd className="dato text-xs">{sel.vin}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">Kilometraje</dt>
                <dd className="dato text-xs">{sel.km.toLocaleString("es-AR")} km</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">Proximo service</dt>
                <dd className="dato text-xs">{sel.proximoService}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">Titular</dt>
                <dd className="text-xs">{sel.cliente}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">Telefono</dt>
                <dd className="dato text-xs text-muted">{sel.telefono}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-widest text-muted">Email</dt>
                <dd className="dato truncate text-xs text-muted">{sel.email}</dd>
              </div>
            </dl>

            <h2 className="mt-2 font-heading text-sm font-bold uppercase tracking-widest">Historial de OTs</h2>
            {sel.historial.length === 0 ? (
              <p className="dato mt-3 text-xs text-muted">sin trabajos registrados</p>
            ) : (
              <table className="mt-3 w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted">
                    <th className="py-2 font-medium">Fecha</th>
                    <th className="py-2 font-medium">OT</th>
                    <th className="py-2 font-medium">Trabajo</th>
                    <th className="py-2 text-right font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {sel.historial.map((h) => (
                    <tr key={h.ot} className="border-b border-border last:border-0">
                      <td className="dato py-2 text-muted">{h.fecha}</td>
                      <td className="dato py-2 font-bold">{h.ot}</td>
                      <td className="py-2">{h.trabajo}</td>
                      <td className="dato py-2 text-right">{h.costo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
