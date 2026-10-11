"use client"
import { useState } from "react"
import { getTickets, type Ticket } from "./api"
import { useCarga, Esqueleto, ErrorCarga } from "@/shell/carga"

// LISTA-TICKET: bandeja densa. Cada mensaje esta atado a una patente y a una OT.
// Sin burbujas de chat: el jefe de taller escanea, no conversa.

// Rótulo de display: el valor interno de `tipo` no se toca (clave de Record y de filtro).
const tipoEtiqueta: Record<Ticket["tipo"] | "todos", string> = {
  todos: "todos",
  aprobacion: "aprobación",
  consulta: "consulta",
  aviso: "aviso",
  reclamo: "reclamo",
}

// Ambar = esperando al cliente; rojo = reclamo (hay un problema); acero y verde = informativos.
const tipoChip: Record<Ticket["tipo"], string> = {
  aprobacion: "bg-warning/15 text-warning",
  consulta: "bg-info/15 text-info",
  aviso: "bg-success/15 text-success",
  reclamo: "bg-danger/15 text-danger",
}

const barra: Record<Ticket["tipo"], string> = {
  aprobacion: "border-warning",
  consulta: "border-info",
  aviso: "border-success",
  reclamo: "border-danger",
}

export function ConversacionesPage() {
  const { data, error, cargando, reintentar } = useCarga(getTickets)
  const [filtro, setFiltro] = useState<Ticket["tipo"] | "todos">("todos")

  const rows = data ?? []
  const visibles = filtro === "todos" ? rows : rows.filter((t) => t.tipo === filtro)
  const pendientes = rows.filter((t) => t.tipo === "aprobacion").length
  const reclamos = rows.filter((t) => t.tipo === "reclamo").length

  const titulo = <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Mensajes</h1>
  if (error) {
    return (
      <div className="space-y-4">
        {titulo}
        <ErrorCarga mensaje="No pudimos cargar los mensajes." onReintentar={reintentar} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        {titulo}
        <div className="flex gap-2">
          <span className="chip bg-warning/15 text-warning">{cargando ? "—" : pendientes} esperan aprobación</span>
          {(cargando || reclamos > 0) && (
            <span className="chip bg-danger/15 text-danger">
              {cargando ? "—" : reclamos} {reclamos === 1 ? "reclamo" : "reclamos"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
        {(["todos", "aprobacion", "consulta", "aviso", "reclamo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFiltro(t)}
            aria-pressed={filtro === t}
            className={"chip chip-btn transition-colors " + (filtro === t ? "bg-primary text-surface" : "bg-info/15 text-info hover:bg-info/25")}
          >
            {tipoEtiqueta[t]}
          </button>
        ))}
      </div>

      <section aria-busy={cargando} aria-label="Bandeja de mensajes" className="surface-card divide-y divide-border">
        {cargando ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Esqueleto key={i} className="h-12" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No hay mensajes de este tipo.</p>
        ) : (
          visibles.map((t) => (
            <article
              key={t.id}
              className={"flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 px-3 py-2.5 transition-colors hover:bg-bg " + barra[t.tipo]}
            >
              <span className="patente order-1 w-28 shrink-0 text-xs">{t.patente}</span>
              <span className="dato order-2 w-20 shrink-0 text-xs text-muted">{t.ot}</span>
              <div className="order-4 w-full min-w-0 md:order-3 md:w-auto md:min-w-[12rem] md:flex-1">
                <p className="text-sm font-medium">{t.asunto}</p>
                <p className="truncate text-xs text-muted">
                  {t.cliente}: {t.ultimo}
                </p>
              </div>
              <span className={"chip order-5 w-24 shrink-0 justify-center md:order-4 " + tipoChip[t.tipo]}>{tipoEtiqueta[t.tipo]}</span>
              <span className="dato order-3 ml-auto shrink-0 text-right text-xs text-muted md:order-5 md:ml-0 md:w-14">{t.hora}</span>
              <span className="order-6 w-6 shrink-0 text-right">
                {t.sinLeer > 0 && (
                  <span className="dato inline-block bg-accent px-1.5 text-xs font-bold text-fg">
                    <span aria-hidden="true">{t.sinLeer}</span>
                    <span className="sr-only">{t.sinLeer} sin leer</span>
                  </span>
                )}
              </span>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
