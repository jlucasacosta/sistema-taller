"use client"
import { useEffect, useState } from "react"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"
import {
  chipEstado,
  etiquetaEstado,
  nivelDeLabor,
  textoLabor,
  rellenoLabor,
  rotuloLabor,
  hhmm,
  montoATexto,
  mecanicoTexto,
  type EstadoOT,
} from "@/shell/taller"
import type { OT } from "./api"

// Ficha de una orden de trabajo. La abren el kanban de /ordenes y el Estado de bahías de /dashboard.
// Muestra todos los datos de la OT y lo que se deriva de ellos (lo que resta de mano de obra).
// Las acciones son de demostración: no guardan nada, solo avisan.

// Acción principal según el estado de la orden. Ninguna toca los datos.
const accionPrincipal: Record<EstadoOT, string> = {
  "en cola": "Subir a bahía",
  diagnostico: "Enviar presupuesto",
  aprobacion: "Pasar a reparación",
  reparacion: "Pasar a calidad",
  "espera repuesto": "Pedir pieza",
  qc: "Cerrar OT",
  entregado: "Enviar comprobante",
}

export function FichaOT({ ot, onCerrar }: { ot: OT | null; onCerrar: () => void }) {
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => setAviso(null), [ot?.id])

  const demo = (accion: string) => setAviso(`${accion}. Demo: no se guardó nada.`)

  const entregada = ot?.estado === "entregado"
  const nivel = ot ? nivelDeLabor(ot.laborHecha, ot.laborEstimada) : "dentro"
  const progreso = ot ? Math.min(ot.laborHecha / ot.laborEstimada, 1) : 0
  // Derivado: lo que resta (o lo que se pasó) de la mano de obra estimada.
  const diferencia = ot ? ot.laborEstimada - ot.laborHecha : 0

  return (
    <FichaLateral
      abierta={!!ot}
      titulo={ot?.patente ?? ""}
      subtitulo={ot ? `${ot.id} · ${ot.vehiculo}` : undefined}
      onCerrar={onCerrar}
      acciones={
        ot && (
          <>
            <button type="button" onClick={() => demo(accionPrincipal[ot.estado])} className={botonPrimario}>
              {accionPrincipal[ot.estado]}
            </button>
            {!entregada && (
              <button type="button" onClick={() => demo("Avisar al cliente")} className={botonSecundario}>
                Avisar al cliente
              </button>
            )}
          </>
        )
      }
    >
      {ot && (
        <>
          <span className={"chip " + chipEstado[ot.estado]}>{etiquetaEstado[ot.estado]}</span>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <DatoFicha etiqueta="Orden">
              <span className="dato">{ot.id}</span>
            </DatoFicha>
            <DatoFicha etiqueta="Cliente">{ot.cliente}</DatoFicha>
            <DatoFicha etiqueta="Vehículo">{ot.vehiculo}</DatoFicha>
            <DatoFicha etiqueta="Kilometraje">
              <span className="dato">{ot.km.toLocaleString("es-AR")} km</span>
            </DatoFicha>
            <DatoFicha etiqueta="Mecánico">{mecanicoTexto(ot.mecanico)}</DatoFicha>
            <DatoFicha etiqueta="Bahía">
              <span className="dato">{ot.bahia ? `Bahía ${String(ot.bahia).padStart(2, "0")}` : "—"}</span>
            </DatoFicha>
            <div className="col-span-2">
              <DatoFicha etiqueta="Trabajo">{ot.trabajo}</DatoFicha>
            </div>
            <DatoFicha etiqueta="Días en taller">
              <span className="dato">{entregada ? "—" : ot.diasEnTaller === 0 ? "ingresó hoy" : `${ot.diasEnTaller} d`}</span>
            </DatoFicha>
            <DatoFicha etiqueta={entregada ? "Total facturado" : "Presupuesto"}>
              <span className="dato">{ot.presupuesto !== null ? montoATexto(ot.presupuesto) : "—"}</span>
            </DatoFicha>
          </dl>

          {ot.presupuesto === null && (
            <p className="mt-2 text-xs text-muted">Todavía no hay presupuesto: el auto espera su turno de diagnóstico.</p>
          )}

          {ot.repuestoFaltante && (
            <p className="mt-4 bg-warning/15 p-3 text-sm text-warning">
              <span className="font-bold">Falta:</span> {ot.repuestoFaltante}
            </p>
          )}

          <h3 className="mt-6 font-heading text-sm font-bold uppercase tracking-widest">Mano de obra</h3>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className={"dato text-2xl font-bold " + (entregada ? "text-fg" : textoLabor[nivel])}>{hhmm(ot.laborHecha)}</span>
            <span className="dato text-sm text-muted">estimado {hhmm(ot.laborEstimada)}</span>
          </div>
          {!entregada && (
            <>
              <div className="mt-1 h-1.5 w-full bg-subtle" aria-hidden="true">
                <div className={"h-full " + rellenoLabor[nivel]} style={{ width: progreso * 100 + "%" }} />
              </div>
              <p className={"dato mt-2 text-xs " + (nivel === "dentro" ? "text-muted" : "font-bold " + textoLabor[nivel])}>
                {ot.laborHecha === 0
                  ? "sin horas registradas"
                  : `${rotuloLabor[nivel]} · ${diferencia >= 0 ? `restan ${hhmm(diferencia)}` : `se pasó ${hhmm(-diferencia)}`}`}
              </p>
            </>
          )}
        </>
      )}
      <AvisoDemo texto={aviso} />
    </FichaLateral>
  )
}
