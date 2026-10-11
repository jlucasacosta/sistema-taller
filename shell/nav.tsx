"use client"
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { nav } from "./nav-config"
import { theme } from "./theme"

// Tres chasis distintos sobre el mismo nav-config. La palanca `theme.nav` decide.
// Cambiar de variante cambia la CARA del sistema, no solo su color.
//
// BULON usa `rail`: un riel de iconos de 64px, siempre visible (tambien en celular).
// Entra completo en 375x568: marca 36 + aire 24 + 6 iconos de 44 con 8 de separacion (304)
// + cuenta demo 52 + paddings 48 = ~470px de alto. Por eso el riel NO scrollea ni recorta
// (si scrolleara, el tooltip, que sale hacia afuera, quedaria cortado).
// Si se suman mas secciones y el total pasa de ~520px, hay que volver a hacer este calculo.
//
// Accesibilidad: <nav aria-label="Principal"> en cada chasis, aria-current="page" en el link
// activo (tambien en rutas hijas), iconos aria-hidden (el nombre accesible es el aria-label),
// areas de toque de 44px, tooltip del riel con hover Y con foco de teclado.

const esActivo = (path: string | null, href: string) => path === href || (!!path && path.startsWith(href + "/"))

function Marca({ compact = false }: { compact?: boolean }) {
  const iniciales = theme.brand.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  if (compact) {
    return (
      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-bg">
        {iniciales}
      </span>
    )
  }
  return <span className="font-heading text-lg font-semibold">{theme.brand.name}</span>
}

// Pie del menu: usuario de la demo. No hay login real; "CD" = Cuenta Demo.
function Cuenta({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1" role="group" aria-label={`Cuenta demo de ${theme.brand.name}`}>
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">
          CD
        </span>
        <span className="text-xs text-muted">Demo</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 border-t border-border px-3 pt-4">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary/15 text-xs font-bold text-primary">
        CD
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{theme.brand.name}</p>
        <p className="text-xs text-muted">Cuenta demo</p>
      </div>
    </div>
  )
}

// --- sidebar: herramienta de escritorio. Etiquetas siempre visibles. ---
function Sidebar({ path }: { path: string | null }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-[var(--pad)]">
      <div className="mb-8 px-3 pt-2">
        <Marca />
      </div>
      <nav aria-label="Principal" className="space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = esActivo(path, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                "flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm transition-colors " +
                (active ? "bg-subtle font-medium text-primary" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-6">
        <Cuenta />
      </div>
    </aside>
  )
}

// --- topbar: app de consulta rapida. Pestañas arriba, lienzo ancho. ---
// En celular la tira es mas ancha que la pantalla: un degrade avisa de que lado queda contenido
// y la seccion activa se centra sola. En escritorio (todo entra) no hay degrade ni scroll.
function Topbar({ path }: { path: string | null }) {
  const tira = useRef<HTMLElement>(null)
  const [fade, setFade] = useState({ izq: false, der: false })

  const medir = useCallback(() => {
    const el = tira.current
    if (!el) return
    const izq = el.scrollLeft > 4
    const der = el.scrollWidth - el.clientWidth - el.scrollLeft > 4
    setFade((f) => (f.izq === izq && f.der === der ? f : { izq, der }))
  }, [])

  // Centra la seccion activa (solo si la tira desborda) y mide el degrade.
  useEffect(() => {
    const el = tira.current
    if (!el) return
    if (el.scrollWidth > el.clientWidth) {
      el.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" })
    }
    medir()
  }, [path, medir])

  useEffect(() => {
    window.addEventListener("resize", medir)
    return () => window.removeEventListener("resize", medir)
  }, [medir])

  // Degrade con mascara: solo en el borde donde queda contenido. Es transparencia pura, sin colores.
  const borde = "2.5rem"
  const paradas = [
    fade.izq ? "transparent 0px" : "black 0px",
    `black ${fade.izq ? borde : "0px"}`,
    `black calc(100% - ${fade.der ? borde : "0px"})`,
    fade.der ? "transparent 100%" : "black 100%",
  ]
  const mascara = fade.izq || fade.der ? `linear-gradient(to right, ${paradas.join(", ")})` : undefined
  const estilo: CSSProperties = { WebkitMaskImage: mascara, maskImage: mascara }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="flex flex-col gap-1 px-[var(--pad)] py-2 md:flex-row md:items-center md:gap-8 md:py-3">
        <Marca />
        <nav
          ref={tira}
          onScroll={medir}
          style={estilo}
          aria-label="Principal"
          className="flex w-full items-center gap-1 overflow-x-auto [scrollbar-width:none] md:w-auto md:flex-1 [&::-webkit-scrollbar]:hidden"
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = esActivo(path, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "border-primary font-medium text-fg"
                    : "border-transparent text-muted hover:border-border hover:text-fg")
                }
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="hidden shrink-0 md:block">
          <Cuenta compact />
        </div>
      </div>
    </header>
  )
}

// --- rail: solo iconos. Maxima superficie para el contenido. ---
function Rail({ path }: { path: string | null }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      <nav aria-label="Principal" className="flex flex-col items-center gap-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = esActivo(path, href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={
                "group relative flex h-11 w-11 items-center justify-center rounded transition-colors " +
                (active ? "bg-primary text-bg" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
              {/* El tooltip es decoracion visual: el nombre accesible ya lo da aria-label. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-12 z-20 hidden whitespace-nowrap rounded bg-fg px-2 py-1 text-xs text-bg group-hover:block group-focus-visible:block"
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto pt-2">
        <Cuenta compact />
      </div>
    </aside>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "topbar") return <Topbar path={path} />
  if (theme.nav === "rail") return <Rail path={path} />
  return <Sidebar path={path} />
}
