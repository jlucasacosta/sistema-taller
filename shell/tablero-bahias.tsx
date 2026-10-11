"use client"
import { useState, type CSSProperties } from "react"
import { ArrowUpFromLine, CircleCheck } from "lucide-react"
import { theme } from "./theme"
import { Esqueleto } from "./carga"
import {
  nivelDeLabor,
  bordeLabor,
  textoLabor,
  rellenoLabor,
  rotuloLabor,
  leyendaLabor,
  chipEstado,
  etiquetaEstado,
  hhmm,
  mecanicoTexto,
  type EstadoOT,
} from "./taller"

// COMPONENTE ESTRELLA · Tablero de Bahias.
// N columnas verticales = los elevadores fisicos de la planta, mas un carril COLA.
// El movimiento del taller es VERTICAL: el auto SUBE al puente. Por eso lift-lanes,
// no un plano horizontal (eso es el salon del restaurante).
// Vive en shell/ porque lo consumen dos modulos: /dashboard y /ordenes.
//
// Sin animaciones (decision del 2026-10-11): el reloj de cada bahia muestra la mano de obra
// registrada (dato), y la barra de progreso es estatica: cambia solo si cambian los datos.
// Clic o Enter en la patente de un auto abre la ficha de su OT (la maneja quien usa el tablero).
//
// Responsive: 1 columna en movil, 2 en sm, 3 en lg. La composicion completa
// (N elevadores + carril de cola en una sola fila) aparece desde xl (1280px), donde cabe.

export type AutoEnBahia = {
  id: string
  patente: string
  vehiculo: string
  mecanico: string
  trabajo: string
  estado: EstadoOT
  bahia: number | null
  laborHecha: number
  laborEstimada: number
}

// La cola muestra los primeros 6 autos; el resto se expande en la misma pagina.
const COLA_VISIBLE = 6

function Tarjeta({
  o,
  onAbrir,
  onCerrar,
}: {
  o: AutoEnBahia
  onAbrir: (id: string) => void
  onCerrar: (o: AutoEnBahia) => void
}) {
  const hecha = o.laborHecha
  const nivel = nivelDeLabor(hecha, o.laborEstimada)
  const progreso = Math.min(hecha / o.laborEstimada, 1)

  return (
    // El clic en toda la tarjeta es un extra para el mouse; el boton de la patente es el acceso con teclado.
    <div onClick={() => onAbrir(o.id)} className={"surface-card cursor-pointer border-l-4 p-3 transition-colors hover:bg-bg " + bordeLabor[nivel]}>
      <button
        type="button"
        aria-label={`Abrir la orden ${o.id}, patente ${o.patente}`}
        className="patente hit block text-left text-lg leading-none xl:text-xl"
      >
        {o.patente}
      </button>
      <p className="mt-1 truncate text-xs text-muted" title={o.vehiculo}>
        {o.vehiculo}
      </p>
      <p className="dato mt-1 truncate text-xs text-muted">
        {o.id} · {mecanicoTexto(o.mecanico)}
      </p>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className={"dato text-lg font-bold " + textoLabor[nivel]}>{hhmm(hecha)}</span>
        <span className="dato text-xs text-muted">est. {hhmm(o.laborEstimada)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full bg-subtle" aria-hidden="true">
        <div className={"h-full " + rellenoLabor[nivel]} style={{ width: progreso * 100 + "%" }} />
      </div>
      {/* el nivel de labor viaja en texto, no solo en color */}
      {nivel === "dentro" ? (
        <span className="sr-only">Mano de obra {rotuloLabor[nivel]}</span>
      ) : (
        <p className={"dato mt-1 text-xs font-bold uppercase " + textoLabor[nivel]}>
          <span className="sr-only">Mano de obra </span>
          {rotuloLabor[nivel]}
        </p>
      )}

      <p className="mt-2 truncate text-xs" title={o.trabajo}>
        {o.trabajo}
      </p>

      <div className="mt-3">
        <span className={"chip " + chipEstado[o.estado]}>{etiquetaEstado[o.estado]}</span>
      </div>

      {o.estado === "qc" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCerrar(o)
          }}
          aria-label={`Entregar ${o.patente}`}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 bg-success px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
        >
          <CircleCheck size={14} strokeWidth={2.5} aria-hidden="true" />
          Entregar
        </button>
      )}
    </div>
  )
}

export function TableroBahias({
  autos,
  cola,
  cargando = false,
  onAbrir,
  onSubir,
  onCerrar,
}: {
  autos: AutoEnBahia[]
  cola: AutoEnBahia[]
  cargando?: boolean
  onAbrir: (id: string) => void
  onSubir?: (id: string, bahia: number) => void
  onCerrar: (id: string) => void
}) {
  const bahias = Array.from({ length: theme.bahias }, (_, i) => i + 1)
  const libres = bahias.filter((b) => !autos.some((a) => a.bahia === b))
  // Region de estado para lectores de pantalla: anuncia lo que paso al accionar.
  const [anuncio, setAnuncio] = useState("")
  const [colaCompleta, setColaCompleta] = useState(false)

  const cerrar = (o: AutoEnBahia) => {
    onCerrar(o.id)
    setAnuncio(`${o.patente} entregado. La orden ${o.id} pasa a entregado.`)
  }
  const subir = (c: AutoEnBahia, bahia: number) => {
    onSubir?.(c.id, bahia)
    setAnuncio(`${c.patente} sube a la bahía ${bahia}.`)
  }

  const colaVisible = colaCompleta ? cola : cola.slice(0, COLA_VISIBLE)

  // La cantidad de elevadores viaja como variable CSS: la grilla de xl la lee de ahi.
  const grilla = { "--bahias": theme.bahias } as CSSProperties

  return (
    <section className="surface-card p-4" aria-labelledby="tablero-bahias-titulo" aria-busy={cargando}>
      <header className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tablero-bahias-titulo" className="font-heading text-sm font-bold uppercase tracking-widest">
          Estado de bahías
        </h2>
        <div className="flex gap-2">
          <span className="chip bg-primary/15 text-primary">
            {cargando ? "—" : autos.length}/{theme.bahias} ocupadas
          </span>
          <span className="chip bg-info/15 text-info">{cargando ? "—" : cola.length} en cola</span>
        </div>
      </header>
      <p className="mb-3 text-xs text-muted">{leyendaLabor()}</p>

      <p role="status" className="sr-only">
        {anuncio}
      </p>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:[grid-template-columns:repeat(var(--bahias),minmax(9rem,1fr))_11rem]"
        style={grilla}
      >
        {bahias.map((b) => {
          const auto = autos.find((a) => a.bahia === b)
          const rotulo = `Bahía ${String(b).padStart(2, "0")}`
          return (
            <div key={b} role="group" aria-label={rotulo} className="flex min-w-0 flex-col">
              <p aria-hidden="true" className="dato mb-2 text-center text-xs uppercase tracking-widest text-muted">
                {rotulo}
              </p>
              {/* el carril del elevador: el auto ocupa la parte de arriba del puente */}
              <div className="flex flex-col justify-end xl:min-h-[15rem]">
                {cargando ? (
                  <Esqueleto className="min-h-24 xl:min-h-[15rem]" />
                ) : auto ? (
                  <Tarjeta o={auto} onAbrir={onAbrir} onCerrar={cerrar} />
                ) : (
                  <div className="bahia-libre flex min-h-24 items-center justify-center xl:min-h-[15rem]">
                    <span className="dato text-xs uppercase tracking-[0.3em] text-muted">Libre</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* El carril de COLA: los autos que esperan un elevador */}
        <div
          role="group"
          aria-label="Cola"
          className="flex min-w-0 flex-col border-t border-border pt-3 sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:border-l xl:border-t-0 xl:pl-3 xl:pt-0"
        >
          <p aria-hidden="true" className="dato mb-2 text-center text-xs uppercase tracking-widest text-muted">
            Cola
          </p>
          <div className="space-y-2">
            {colaVisible.map((c) => (
              <div
                key={c.id}
                onClick={() => onAbrir(c.id)}
                className="surface-card cursor-pointer border-l-4 border-info p-2 transition-colors hover:bg-bg"
              >
                <button
                  type="button"
                  aria-label={`Abrir la orden ${c.id}, patente ${c.patente}`}
                  className="patente hit block text-left text-sm leading-none"
                >
                  {c.patente}
                </button>
                <p className="mt-1 truncate text-xs text-muted" title={c.trabajo}>
                  {c.trabajo}
                </p>
                {onSubir && libres.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      subir(c, libres[0])
                    }}
                    aria-label={`Subir ${c.patente} a la bahía ${libres[0]}`}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 bg-primary px-2 py-1 text-xs font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
                  >
                    <ArrowUpFromLine size={12} strokeWidth={2.5} aria-hidden="true" />
                    Subir
                  </button>
                )}
              </div>
            ))}
            {!cargando && cola.length > COLA_VISIBLE && (
              <button
                type="button"
                onClick={() => setColaCompleta((v) => !v)}
                aria-expanded={colaCompleta}
                className="tap flex w-full items-center justify-center border border-border bg-surface px-2 text-xs font-medium hover:bg-subtle"
              >
                {colaCompleta ? "Ver menos" : `Ver todo (${cola.length})`}
              </button>
            )}
            {!cargando && cola.length === 0 && (
              <p className="dato py-6 text-center text-xs uppercase tracking-widest text-muted">vacía</p>
            )}
            {cargando && <Esqueleto className="h-16" />}
          </div>
        </div>
      </div>
    </section>
  )
}
