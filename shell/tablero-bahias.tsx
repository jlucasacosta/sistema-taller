"use client"
import { ArrowUpFromLine, CircleCheck } from "lucide-react"
import { theme } from "./theme"
import { nivelDeLabor, bordeLabor, textoLabor, rellenoLabor, chipEstado, hhmm, type EstadoOT } from "./taller"

// COMPONENTE ESTRELLA · Tablero de Bahias.
// N columnas verticales = los elevadores fisicos de la planta, mas un carril COLA.
// El movimiento del taller es VERTICAL: el auto SUBE al puente. Por eso lift-lanes,
// no un plano horizontal (eso es el salon del restaurante).
// Vive en shell/ porque lo consumen dos modulos: /dashboard y /ordenes.

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
  onCerrar: (id: string) => void
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
      <p className="patente text-xl leading-none">{o.patente}</p>
      <p className="mt-1 truncate text-[11px] text-muted">{o.vehiculo}</p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="dato text-[10px] text-muted">{o.id}</span>
        <span className={"dato text-lg font-bold " + textoLabor[nivel]}>{hhmm(hecha)}</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden bg-subtle">
        <div className={"h-full " + rellenoLabor[nivel]} style={{ width: progreso * 100 + "%" }} />
      </div>
      <p className="dato mt-1 text-right text-[10px] text-muted">est. {hhmm(o.laborEstimada)}</p>

      <p className="mt-2 truncate text-[11px]">{o.trabajo}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={"chip " + chipEstado[o.estado]}>{o.estado}</span>
        <span className="dato text-[10px] text-muted">{o.mecanico}</span>
      </div>

      {o.estado === "qc" && (
        <button
          onClick={() => onCerrar(o.id)}
          className="mt-3 flex w-full items-center justify-center gap-1 bg-success px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
        >
          <CircleCheck size={13} strokeWidth={2.5} />
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
  onSubir,
  onCerrar,
}: {
  autos: AutoEnBahia[]
  cola: AutoEnBahia[]
  tick: number
  saliendo?: string[]
  onSubir?: (id: string, bahia: number) => void
  onCerrar: (id: string) => void
}) {
  const bahias = Array.from({ length: theme.bahias }, (_, i) => i + 1)
  const libres = bahias.filter((b) => !autos.some((a) => a.bahia === b))

  return (
    <section className="surface-card p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-sm font-bold uppercase tracking-widest">Estado de bahias</h2>
        <div className="flex gap-2">
          <span className="chip bg-subtle text-muted">
            {autos.length}/{theme.bahias} ocupadas
          </span>
          <span className="chip bg-info/15 text-info">{cola.length} en cola</span>
        </div>
      </header>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${theme.bahias}, minmax(9rem, 1fr)) 11rem` }}>
        {bahias.map((b) => {
          const auto = autos.find((a) => a.bahia === b)
          return (
            <div key={b} className="flex min-w-0 flex-col">
              <p className="dato mb-2 text-center text-[10px] uppercase tracking-widest text-muted">Bahia {String(b).padStart(2, "0")}</p>
              {/* el carril del elevador: el auto ocupa la parte de arriba del puente */}
              <div className="flex min-h-[15rem] flex-col justify-end">
                {auto ? (
                  <Tarjeta o={auto} tick={tick} onCerrar={onCerrar} saliendo={saliendo.includes(auto.id)} />
                ) : (
                  <div className="bahia-libre flex min-h-[15rem] items-center justify-center">
                    <span className="dato text-[10px] uppercase tracking-[0.3em] text-muted">Libre</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* El carril de COLA: los autos que esperan un elevador */}
        <div className="flex min-w-0 flex-col border-l border-border pl-3">
          <p className="dato mb-2 text-center text-[10px] uppercase tracking-widest text-muted">Cola</p>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "18rem" }}>
            {cola.map((c) => (
              <div key={c.id} className="surface-card border-l-4 border-info p-2">
                <p className="patente text-sm leading-none">{c.patente}</p>
                <p className="mt-1 truncate text-[10px] text-muted">{c.trabajo}</p>
                {onSubir && libres.length > 0 && (
                  <button
                    onClick={() => onSubir(c.id, libres[0])}
                    className="mt-2 flex w-full items-center justify-center gap-1 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-surface transition-opacity hover:opacity-90"
                  >
                    <ArrowUpFromLine size={12} strokeWidth={2.5} />
                    Subir
                  </button>
                )}
              </div>
            ))}
            {cola.length === 0 && (
              <p className="dato py-6 text-center text-[10px] uppercase tracking-widest text-muted">vacia</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
