"use client"
import { useEffect, useState } from "react"
import { getPiezas, type Pieza } from "./api"
import { useCarga, Esqueleto, ErrorCarga } from "@/shell/carga"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"
import { nivelDeStock, rellenoStock, chipStock, rotuloStock, montoATexto, textoAMonto } from "@/shell/taller"

// KARDEX: tabla-densa con un gauge bullet POR FILA (stock actual vs punto de reorden).
// Segundo diferencial del sistema: nadie mas mete el grafico adentro de la fila.
// Clic o Enter en una pieza abre su ficha (acciones de demostracion: no guardan nada).

// El gauge de la fila: relleno = stock, marca vertical = punto de reorden.
function GaugeStock({ p }: { p: Pieza }) {
  const nivel = nivelDeStock(p.stock, p.reorden)
  const ancho = Math.min(p.stock / p.maximo, 1) * 100
  const marca = Math.min(p.reorden / p.maximo, 1) * 100

  return (
    <div className="relative h-2.5 w-full bg-subtle" aria-hidden="true">
      <div className={"h-full " + rellenoStock[nivel]} style={{ width: ancho + "%" }} />
      <span className="absolute top-[-2px] h-[calc(100%+4px)] w-0.5 bg-fg" style={{ left: marca + "%" }} />
    </div>
  )
}

export function InventarioPage() {
  const { data, error, cargando, reintentar } = useCarga(getPiezas)
  const [soloCriticas, setSoloCriticas] = useState(false)
  const [sel, setSel] = useState<Pieza | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  useEffect(() => setAviso(null), [sel?.id])

  const rows = data ?? []
  const quebradas = rows.filter((p) => nivelDeStock(p.stock, p.reorden) === "quebrado")
  const reponer = rows.filter((p) => nivelDeStock(p.stock, p.reorden) === "reponer")
  const bloqueantes = rows.filter((p) => p.bloqueaOT)
  const visibles = soloCriticas ? rows.filter((p) => nivelDeStock(p.stock, p.reorden) !== "ok") : rows
  const n = (x: number) => (cargando ? "—" : x)

  const titulo = <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Inventario</h1>
  if (error) {
    return (
      <div className="space-y-4">
        {titulo}
        <ErrorCarga mensaje="No pudimos cargar el inventario." onReintentar={reintentar} />
      </div>
    )
  }

  const demo = (accion: string) => setAviso(`${accion}. Demo: no se guardó nada.`)
  const nivelSel = sel ? nivelDeStock(sel.stock, sel.reorden) : "ok"
  const costoUnidad = sel ? textoAMonto(sel.costo) : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        {titulo}
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-danger/15 text-danger">{n(quebradas.length)} sin stock</span>
          <span className="chip bg-warning/15 text-warning">{n(reponer.length)} para reponer</span>
          <span className="chip bg-warning/15 text-warning">{n(bloqueantes.length)} bloquean una OT</span>
          <button
            type="button"
            onClick={() => setSoloCriticas((s) => !s)}
            aria-pressed={soloCriticas}
            className={"chip chip-btn transition-colors " + (soloCriticas ? "bg-primary text-surface" : "bg-info/15 text-info hover:bg-info/25")}
          >
            ver solo críticas
          </button>
        </div>
      </div>

      {/* Leyenda del gauge y regla de los rotulos calculados */}
      <p className="text-xs text-muted">
        Barra: stock sobre el máximo. Marca negra: punto de reorden. «Reponer» es stock igual o menor al reorden; «quebrado», stock en cero.
      </p>

      <section aria-busy={cargando} aria-label="Kárdex de repuestos" className="surface-card overflow-x-auto" tabIndex={0}>
        {cargando ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Esqueleto key={i} className="h-11" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">No hay piezas críticas: todo el stock está por encima del punto de reorden.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Kárdex de repuestos: stock actual contra punto de reorden</caption>
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-muted">
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">SKU</th>
                <th scope="col" className="px-3 py-2 font-medium">Descripción</th>
                <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Ubicación</th>
                <th scope="col" className="hidden px-3 py-2 text-right font-medium md:table-cell">Costo</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Stock</th>
                <th scope="col" className="hidden w-56 px-3 py-2 font-medium lg:table-cell">Reorden</th>
                <th scope="col" className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => {
                const nivel = nivelDeStock(p.stock, p.reorden)
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSel(p)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-bg"
                  >
                    <td className="dato hidden px-3 py-2 text-xs font-bold sm:table-cell">{p.sku}</td>
                    <td className="px-3 py-2 text-sm">
                      <button type="button" className="hit text-left font-medium hover:underline">
                        {p.descripcion}
                      </button>
                      <span className="dato block text-xs text-muted sm:hidden">{p.sku}</span>
                      {p.bloqueaOT && <span className="dato block text-xs text-warning">bloquea {p.bloqueaOT}</span>}
                      <div className="mt-1 lg:hidden">
                        <GaugeStock p={p} />
                      </div>
                    </td>
                    <td className="dato hidden px-3 py-2 text-xs text-muted md:table-cell">{p.ubicacion}</td>
                    <td className="dato hidden px-3 py-2 text-right text-xs md:table-cell">{p.costo}</td>
                    <td className="dato px-3 py-2 text-right text-base font-bold">{p.stock}</td>
                    <td className="hidden px-3 py-2 lg:table-cell">
                      <GaugeStock p={p} />
                      <p className="dato mt-1 text-xs text-muted">
                        reorden {p.reorden} · máx {p.maximo}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={"chip " + chipStock[nivel]}>{rotuloStock[nivel]}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <FichaLateral
        abierta={!!sel}
        titulo={sel?.descripcion ?? ""}
        subtitulo={sel ? `SKU ${sel.sku}` : undefined}
        onCerrar={() => setSel(null)}
        acciones={
          sel && (
            <>
              <button type="button" onClick={() => demo("Pedir pieza")} className={botonPrimario}>
                Pedir pieza
              </button>
              <button type="button" onClick={() => demo("Ajustar stock")} className={botonSecundario}>
                Ajustar stock
              </button>
              {sel.bloqueaOT && (
                <button type="button" onClick={() => demo(`Avisar al cliente de ${sel.bloqueaOT}`)} className={botonSecundario}>
                  Avisar al cliente
                </button>
              )}
            </>
          )
        }
      >
        {sel && (
          <>
            <span className={"chip " + chipStock[nivelSel]}>{rotuloStock[nivelSel]}</span>
            <div className="mt-4">
              <GaugeStock p={sel} />
              <p className="dato mt-1 text-xs text-muted">
                reorden {sel.reorden} · máx {sel.maximo}
              </p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="SKU">
                <span className="dato">{sel.sku}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Ubicación">
                <span className="dato">{sel.ubicacion}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Costo por unidad">
                <span className="dato">{sel.costo}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Stock actual">
                <span className="dato">{sel.stock}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Punto de reorden">
                <span className="dato">{sel.reorden}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Stock máximo">
                <span className="dato">{sel.maximo}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Valor en stock">
                <span className="dato">{montoATexto(costoUnidad * sel.stock)}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Para llegar al máximo">
                <span className="dato">
                  {sel.maximo - sel.stock} u · {montoATexto(costoUnidad * (sel.maximo - sel.stock))}
                </span>
              </DatoFicha>
            </dl>
            {sel.bloqueaOT && (
              <p className="mt-4 bg-warning/15 p-3 text-sm text-warning">
                <span className="font-bold">Bloquea la orden {sel.bloqueaOT}:</span> no se puede cerrar la reparación sin esta pieza.
              </p>
            )}
          </>
        )}
        <AvisoDemo texto={aviso} />
      </FichaLateral>
    </div>
  )
}
