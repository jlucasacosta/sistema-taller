"use client"
import { useEffect, useState } from "react"
import { getTickets, type Ticket } from "./api"

// LISTA-TICKET: bandeja densa. Cada mensaje esta atado a una patente y a una OT.
// Sin burbujas de chat: el jefe de taller escanea, no conversa.

const tipoChip: Record<Ticket["tipo"], string> = {
  aprobacion: "bg-warning/15 text-warning",
  consulta: "bg-info/15 text-info",
  aviso: "bg-success/15 text-success",
  reclamo: "bg-danger/15 text-danger",
}

const barra: Record<Ticket["tipo"], string> = {
  aprobacion: "border-accent",
  consulta: "border-info",
  aviso: "border-success",
  reclamo: "border-danger",
}

export function ConversacionesPage() {
  const [rows, setRows] = useState<Ticket[]>([])
  const [filtro, setFiltro] = useState<Ticket["tipo"] | "todos">("todos")

  useEffect(() => {
    getTickets().then(setRows)
  }, [])

  const visibles = filtro === "todos" ? rows : rows.filter((t) => t.tipo === filtro)
  const pendientes = rows.filter((t) => t.tipo === "aprobacion").length
  const reclamos = rows.filter((t) => t.tipo === "reclamo").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Mensajes</h1>
        <div className="flex gap-2">
          <span className="chip bg-warning/15 text-warning">{pendientes} esperan aprobacion</span>
          {reclamos > 0 && <span className="chip bg-danger/15 text-danger">{reclamos} reclamo</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", "aprobacion", "consulta", "aviso", "reclamo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={"chip transition-colors " + (filtro === t ? "bg-primary text-surface" : "bg-subtle text-muted hover:text-fg")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="surface-card divide-y divide-border">
        {visibles.map((t) => (
          <article
            key={t.id}
            className={"flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 px-3 py-2.5 transition-colors hover:bg-subtle " + barra[t.tipo]}
          >
            <span className="patente w-28 shrink-0 text-xs">{t.patente}</span>
            <span className="dato w-20 shrink-0 text-[11px] text-muted">{t.ot}</span>
            <div className="min-w-[12rem] flex-1">
              <p className="text-xs font-medium">{t.asunto}</p>
              <p className="truncate text-[11px] text-muted">
                {t.cliente}: {t.ultimo}
              </p>
            </div>
            <span className={"chip w-24 shrink-0 justify-center " + tipoChip[t.tipo]}>{t.tipo}</span>
            <span className="dato w-14 shrink-0 text-right text-[11px] text-muted">{t.hora}</span>
            <span className="w-6 shrink-0 text-right">
              {t.sinLeer > 0 && (
                <span className="dato inline-block bg-accent px-1.5 text-[10px] font-bold text-surface">{t.sinLeer}</span>
              )}
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
