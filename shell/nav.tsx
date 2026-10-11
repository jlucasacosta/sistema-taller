"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { nav } from "./nav-config"
import { theme } from "./theme"

// Tres chasis distintos sobre el mismo nav-config. La palanca `theme.nav` decide.
// Cambiar de variante cambia la CARA del sistema, no solo su color.

function Marca({ compact = false }: { compact?: boolean }) {
  const iniciales = theme.brand.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  if (compact) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded bg-primary text-sm font-bold text-bg">
        {iniciales}
      </span>
    )
  }
  return <span className="font-heading text-lg font-semibold">{theme.brand.name}</span>
}

// --- sidebar: herramienta de escritorio. Etiquetas siempre visibles. ---
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-[var(--pad)]">
      <div className="mb-8 px-3 pt-2">
        <Marca />
      </div>
      <nav aria-label="Principal" className="space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
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
    </aside>
  )
}

// --- topbar: app de consulta rapida. Pestañas arriba, lienzo ancho. ---
function Topbar({ path }: { path: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="flex items-center gap-8 px-[var(--pad)] py-3">
        <Marca />
        <nav aria-label="Principal" className="flex flex-1 items-center gap-1 overflow-x-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors " +
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
      </div>
    </header>
  )
}

// --- rail: solo iconos. Maxima superficie para el contenido. ---
function Rail({ path }: { path: string }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      <nav aria-label="Principal" className="flex flex-col items-center gap-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={
                "group relative flex h-11 w-11 items-center justify-center rounded transition-colors " +
                (active ? "bg-primary text-bg" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
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
    </aside>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "topbar") return <Topbar path={path} />
  if (theme.nav === "rail") return <Rail path={path} />
  return <Sidebar path={path} />
}
