import { useEffect, useState } from "react"
import { Menu, ShoppingBag, X } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "#lookbook", label: "Lookbook" },
  { href: "#categorias", label: "Categorías" },
  { href: "#drop", label: "Drop 01" },
  { href: "#tienda", label: "La tienda" },
]

export function Header({ cart, bump }: { cart: number; bump: number }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : ""
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled ? "border-b border-border/70 bg-background/80 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:h-20 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Viper Store, inicio">
            <img src="/img/logo.jpeg" alt="" className="size-10 rounded-full object-cover ring-1 ring-white/15 sm:size-11" />
            <span className="font-display text-xl uppercase leading-none tracking-wide sm:text-2xl">
              Viper<span className="text-primary">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#drop"
              className="relative flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform active:scale-[0.96]"
              aria-label={`Bolsa, ${cart} productos`}
            >
              <ShoppingBag className="size-4" />
              <span key={bump} className="tabular-nums [animation:pop_.35s_cubic-bezier(.2,.8,.3,1)]">
                {cart}
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-background transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span className="font-display text-xl uppercase tracking-wide">
            Viper<span className="text-primary">.</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-10 place-items-center rounded-full border border-border"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col justify-center gap-2 px-6" aria-label="Móvil">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-baseline justify-between border-b border-border py-4 font-display text-5xl uppercase transition-[opacity,transform] duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              {l.label}
              <span className="font-sans text-xs text-muted-foreground">0{i + 1}</span>
            </a>
          ))}
        </nav>
        <p className="px-6 pb-8 font-tag text-2xl text-primary">Good vibes only ☺</p>
      </div>
    </>
  )
}
