"use client"
import { useEffect, useState } from "react"
import { getVehiculos, type Vehiculo } from "./api"
import { useCarga, Esqueleto, ErrorCarga } from "@/shell/carga"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"
import { montoATexto, textoAMonto } from "@/shell/taller"

// LISTA INDEXADA por PATENTE + ficha lateral. Sin avatares: aca manda el vehiculo, no la persona.
// Sin buscador global (componente eliminado): la lista de patentes ES el indice.
// Clic o Enter en una patente abre la ficha del vehiculo (acciones de demostracion: no guardan nada).

type Estado = Vehiculo["estado"]

// Rótulo de display: el valor interno de `estado` no se toca.
const estadoEtiqueta: Record<Estado, string> = {
  "en taller": "en taller",
  "al dia": "al día",
  "service vencido": "service vencido",
}

// Rojo solo para el service vencido. "En taller" es trabajo en curso (petroleo), "al dia" es verde.
const estadoChip: Record<Estado, string> = {
  "en taller": "bg-primary/15 text-primary",
  "al dia": "bg-success/15 text-success",
  "service vencido": "bg-danger/15 text-danger",
}

const FILTROS: (Estado | "todos")[] = ["todos", "en taller", "al dia", "service vencido"]

// "160.000 km" -> 160000. "vencido" -> null.
const kmDeService = (t: string) => (/\d/.test(t) ? Number(t.replace(/[^0-9]/g, "")) : null)

export function ContactosPage() {
  const { data, error, cargando, reintentar } = useCarga(getVehiculos)
  const [filtro, setFiltro] = useState<Estado | "todos">("todos")
  const [sel, setSel] = useState<Vehiculo | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => setAviso(null), [sel?.id])

  const rows = data ?? []
  const visibles = filtro === "todos" ? rows : rows.filter((v) => v.estado === filtro)
  const cuenta = (f: Estado | "todos") => (cargando ? "—" : f === "todos" ? rows.length : rows.filter((v) => v.estado === f).length)

  const titulo = <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Vehículos</h1>
  if (error) {
    return (
      <div className="space-y-4">
        {titulo}
        <ErrorCarga mensaje="No pudimos cargar los vehículos." onReintentar={reintentar} />
      </div>
    )
  }

  const demo = (accion: string) => setAviso(`${accion}. Demo: no se guardó nada.`)

  // Derivados de la fila abierta (nada inventado: sale de km, proximoService e historial).
  const objetivoKm = sel ? kmDeService(sel.proximoService) : null
  const faltanKm = sel && objetivoKm !== null ? objetivoKm - sel.km : null
  const enCurso = sel?.estado === "en taller" ? sel.historial.find((h) => h.fecha === "hoy") : undefined
  const anteriores = sel ? sel.historial.filter((h) => h !== enCurso) : []
  const totalAnteriores = anteriores.reduce((s, h) => s + textoAMonto(h.costo), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">{titulo}</div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            aria-pressed={filtro === f}
            className={"chip chip-btn transition-colors " + (filtro === f ? "bg-primary text-surface" : "bg-info/15 text-info hover:bg-info/25")}
          >
            {f === "todos" ? "todos" : estadoEtiqueta[f]} · {cuenta(f)}
          </button>
        ))}
      </div>

      <section aria-busy={cargando} aria-label="Vehículos" className="surface-card overflow-x-auto" tabIndex={0}>
        {cargando ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Esqueleto key={i} className="h-12" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No hay vehículos con este estado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Vehículos del taller indexados por patente</caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="px-3 py-2 font-medium">Patente</th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">Vehículo</th>
                <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Titular</th>
                <th scope="col" className="hidden px-3 py-2 text-right font-medium md:table-cell">Kilometraje</th>
                <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Próximo service</th>
                <th scope="col" className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSel(v)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-bg"
                >
                  <td className="px-3 py-2">
                    <button type="button" className="patente hit text-left text-sm leading-none">
                      {v.patente}
                    </button>
                    <span className="mt-1 block truncate text-xs text-muted sm:hidden">{v.vehiculo}</span>
                  </td>
                  <td className="hidden px-3 py-2 text-xs sm:table-cell">{v.vehiculo}</td>
                  <td className="hidden px-3 py-2 text-xs md:table-cell">{v.cliente}</td>
                  <td className="dato hidden px-3 py-2 text-right text-xs md:table-cell">{v.km.toLocaleString("es-AR")} km</td>
                  <td className="dato hidden px-3 py-2 text-xs lg:table-cell">{v.proximoService}</td>
                  <td className="px-3 py-2">
                    <span className={"chip " + estadoChip[v.estado]}>{estadoEtiqueta[v.estado]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <FichaLateral
        abierta={!!sel}
        titulo={sel?.patente ?? ""}
        subtitulo={sel?.vehiculo}
        onCerrar={() => setSel(null)}
        acciones={
          sel && (
            <>
              {sel.estado === "service vencido" ? (
                <button type="button" onClick={() => demo("Enviar recordatorio de service")} className={botonPrimario}>
                  Enviar recordatorio
                </button>
              ) : sel.estado === "en taller" ? (
                <button type="button" onClick={() => demo("Avisar al titular")} className={botonPrimario}>
                  Avisar al titular
                </button>
              ) : (
                <button type="button" onClick={() => demo("Agendar service")} className={botonPrimario}>
                  Agendar service
                </button>
              )}
              {sel.estado !== "al dia" && (
                <button type="button" onClick={() => demo("Agendar service")} className={botonSecundario}>
                  Agendar service
                </button>
              )}
              <button type="button" onClick={() => demo("Enviar ficha")} className={botonSecundario}>
                Enviar ficha
              </button>
            </>
          )
        }
      >
        {sel && (
          <>
            <span className={"chip " + estadoChip[sel.estado]}>{estadoEtiqueta[sel.estado]}</span>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="VIN">
                <span className="dato break-all">{sel.vin}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Kilometraje">
                <span className="dato">{sel.km.toLocaleString("es-AR")} km</span>
              </DatoFicha>
              <DatoFicha etiqueta="Próximo service">
                <span className="dato">{sel.proximoService}</span>
                {faltanKm !== null && (
                  <span className="dato block text-xs text-muted">
                    {faltanKm > 0 ? `faltan ${faltanKm.toLocaleString("es-AR")} km` : "ya se pasó"}
                  </span>
                )}
              </DatoFicha>
              <DatoFicha etiqueta="Orden en curso">
                {enCurso ? (
                  <>
                    <span className="dato">{enCurso.ot}</span>
                    <span className="block text-xs text-muted">{enCurso.trabajo}</span>
                  </>
                ) : (
                  "—"
                )}
              </DatoFicha>
              <DatoFicha etiqueta="Titular">{sel.cliente}</DatoFicha>
              <DatoFicha etiqueta="Teléfono">
                <span className="dato">{sel.telefono}</span>
              </DatoFicha>
              <div className="col-span-2 min-w-0">
                <DatoFicha etiqueta="Email">
                  <span className="dato break-all">{sel.email}</span>
                </DatoFicha>
              </div>
            </dl>

            <h3 className="mt-6 font-heading text-sm font-bold uppercase tracking-widest">Historial de OTs</h3>
            {sel.historial.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Sin trabajos registrados.</p>
            ) : (
              <>
                <table className="mt-2 w-full text-left text-xs">
                  <caption className="sr-only">Historial de órdenes de {sel.patente}</caption>
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-widest text-muted">
                      <th scope="col" className="py-2 pr-2 font-medium">Fecha</th>
                      <th scope="col" className="py-2 pr-2 font-medium">OT</th>
                      <th scope="col" className="py-2 pr-2 font-medium">Trabajo</th>
                      <th scope="col" className="py-2 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sel.historial.map((h) => (
                      <tr key={h.ot} className="border-b border-border last:border-0">
                        <td className="dato py-2 pr-2 text-muted">{h.fecha}</td>
                        <td className="dato py-2 pr-2 font-bold">{h.ot}</td>
                        <td className="py-2 pr-2">{h.trabajo}</td>
                        <td className="dato py-2 text-right">{h.costo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-muted">
                  {anteriores.length === 0
                    ? "Sin visitas anteriores a la orden en curso."
                    : `${anteriores.length} ${anteriores.length === 1 ? "visita" : "visitas"} ${enCurso ? "anteriores" : "en el historial"}: ${montoATexto(totalAnteriores)}.`}
                </p>
              </>
            )}
          </>
        )}
        <AvisoDemo texto={aviso} />
      </FichaLateral>
    </div>
  )
}
