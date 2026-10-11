"use client"
import { useState, type CSSProperties } from "react"
import { ArrowUpFromLine, CircleCheck } from "lucide-react"
import { theme } from "./theme"
import { nivelDeLabor, bordeLabor, textoLabor, rellenoLabor, rotuloLabor, chipEstado, etiquetaEstado, hhmm, type EstadoOT } from "./taller"

// COMPONENTE ESTRELLA · Tablero de Bahias.
// N columnas verticales = los elevadores fisicos de la planta, mas un carril COLA.
// El movimiento del taller es VERTICAL: el auto SUBE al puente. Por eso lift-lanes,
// no un plano horizontal (eso es el salon del restaurante).
// Vive en shell/ porque lo consumen dos modulos: /dashboard y /ordenes.
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

function Tarjeta({
  o,
  tick,
  onCerrar,
  saliendo,
}: {
  o: AutoEnBahia
  tick: number
  onCerrar: (o: AutoEnBahia) => void
  saliendo: boolean
}) {
  // El cronometro corre en minutos de taller, no en segundos de cocina.
  const hecha = o.laborHecha + tick / 60
  const nivel = nivelDeLabor(hecha, o.laborEstimada)
  const progreso = Math.min(hecha / o.laborEstimada, 1)

  return (
    <div
      className={
        "surface-card subiendo border-l-4 p-3 " +
        bordeLabor[nivel] +
        (nivel === "excedido" ? " excedida" : "") +
        (saliendo ? " bajando" : "")
      }
    >
      <p className="patente text-lg leading-none xl:text-xl">{o.patente}</p>
      <p className="mt-1 truncate text-[11px] text-muted" title={o.vehiculo}>
        {o.vehiculo}
      </p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="dato text-[10px] text-muted">{o.id}</span>
        <span className={"dato text-lg font-bold " + textoLabor[nivel]}>{hhmm(hecha)}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden bg-subtle" aria-hidden="true">
        <div className={"h-full " + rellenoLabor[nivel]} style={{ width: progreso * 100 + "%" }} />
      </div>
      <p className="dato mt-1 flex justify-between gap-2 text-[10px] text-muted">
        {/* el nivel de labor viaja en texto, no solo en color */}
        <span className={nivel === "dentro" ? "sr-only" : "font-bold uppercase " + textoLabor[nivel]}>
          <span className="sr-only">Mano de obra </span>
          {rotuloLabor[nivel]}
        </span>
        <span className="ml-auto">est. {hhmm(o.laborEstimada)}</span>
      </p>

      <p className="mt-2 truncate text-[11px]" title={o.trabajo}>
        {o.trabajo}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={"chip " + chipEstado[o.estado]}>{etiquetaEstado[o.estado]}</span>
        <span className="dato text-[10px] text-muted">{o.mecanico}</span>
      </div>

      {o.estado === "qc" && (
        <button
          onClick={() => onCerrar(o)}
          aria-label={`Entregar ${o.patente}`}
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 bg-success px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
        >
          <CircleCheck size={13} strokeWidth={2.5} aria-hidden="true" />
          Entregar
        </button>
      )}
    </div>
  )
}

export function TableroBahias({
  autos,
  cola,
  tick,
  saliendo = [],
  cargando = false,
  onSubir,
  onCerrar,
}: {
  autos: AutoEnBahia[]
  cola: AutoEnBahia[]
  tick: number
  saliendo?: string[]
  cargando?: boolean
  onSubir?: (id: string, bahia: number) => void
  onCerrar: (id: string) => void
}) {
  const bahias = Array.from({ length: theme.bahias }, (_, i) => i + 1)
  const libres = bahias.filter((b) => !autos.some((a) => a.bahia === b))
  // Region de estado para lectores de pantalla: anuncia lo que paso al accionar.
  const [anuncio, setAnuncio] = useState("")

  const cerrar = (o: AutoEnBahia) => {
    onCerrar(o.id)
    setAnuncio(`${o.patente} entregado. La orden ${o.id} pasa a entregado.`)
  }
  const subir = (c: AutoEnBahia, bahia: number) => {
    onSubir?.(c.id, bahia)
    setAnuncio(`${c.patente} sube a la bahía ${bahia}.`)
  }

  // La cantidad de elevadores viaja como variable CSS: la grilla de xl la lee de ahi.
  const grilla = { "--bahias": theme.bahias } as CSSProperties

  return (
    <section className="surface-card p-4" aria-labelledby="tablero-bahias-titulo" aria-busy={cargando}>
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tablero-bahias-titulo" className="font-heading text-sm font-bold uppercase tracking-widest">
          Estado de bahías
        </h2>
        {!cargando && (
          <div className="flex gap-2">
            <span className="chip bg-primary/15 text-primary">
              {autos.length}/{theme.bahias} ocupadas
            </span>
            <span className="chip bg-info/15 text-info">{cola.length} en cola</span>
          </div>
        )}
      </header>

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
              <p aria-hidden="true" className="dato mb-2 text-center text-[10px] uppercase tracking-widest text-muted">
                {rotulo}
              </p>
              {/* el carril del elevador: el auto ocupa la parte de arriba del puente */}
              <div className="flex flex-col justify-end xl:min-h-[15rem]">
                {cargando ? (
                  <div className="bahia-libre min-h-24 motion-safe:animate-pulse xl:min-h-[15rem]" aria-hidden="true" />
                ) : auto ? (
                  <Tarjeta o={auto} tick={tick} onCerrar={cerrar} saliendo={saliendo.includes(auto.id)} />
                ) : (
                  <div className="bahia-libre flex min-h-24 items-center justify-center xl:min-h-[15rem]">
                    <span className="dato text-[10px] uppercase tracking-[0.3em] text-muted">Libre</span>
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
          <p aria-hidden="true" className="dato mb-2 text-center text-[10px] uppercase tracking-widest text-muted">
            Cola
          </p>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "18rem" }} tabIndex={0} role="region" aria-label="Autos en cola, desplazable">
            {cola.map((c) => (
              <div key={c.id} className="surface-card border-l-4 border-info p-2">
                <p className="patente text-sm leading-none">{c.patente}</p>
                <p className="mt-1 truncate text-[10px] text-muted" title={c.trabajo}>
                  {c.trabajo}
                </p>
                {onSubir && libres.length > 0 && (
                  <button
                    onClick={() => subir(c, libres[0])}
                    aria-label={`Subir ${c.patente} a la bahía ${libres[0]}`}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
                  >
                    <ArrowUpFromLine size={12} strokeWidth={2.5} aria-hidden="true" />
                    Subir
                  </button>
                )}
              </div>
            ))}
            {!cargando && cola.length === 0 && (
              <p className="dato py-6 text-center text-[10px] uppercase tracking-widest text-muted">vacía</p>
            )}
            {cargando && <div className="bahia-libre h-16 motion-safe:animate-pulse" aria-hidden="true" />}
          </div>
        </div>
      </div>
    </section>
  )
}
