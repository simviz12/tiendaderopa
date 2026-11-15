import { useCallback, useMemo, useRef, useState } from "react"
import { ArrowDown, ClipboardList, Instagram, MessageCircle, MousePointerClick, Search, Sparkles, X } from "lucide-react"
import RunwayLookbook, { type RunwayLook } from "@/components/ui/runway-lookbook"
import { Header } from "@/components/site/header"
import { Logo, LogoBadge } from "@/components/site/logo"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { ProductDrawer } from "@/components/shop/product-drawer"
import { Toaster } from "@/components/shop/toast"
import { useReveal } from "@/hooks/use-reveal"
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "@/config"
import { cartCount, formatCOP, isSoldOut, useCart, useCatalog, type Product } from "@/lib/store"

const WA_CHAT = `https://wa.me/${WHATSAPP_NUMBER}`
const ticker = ["Nuevo drop", "Good vibes only", "Local support local", "Viper Store", "Ropa tan chimba"]
const QUICK = ["Chaqueta", "Buzo", "Negro", "Azul", "Nuevo"]
const FIRST = 8

/** Minúsculas y sin tildes, para que "cafe" encuentre "Café". */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

function Marquee({ reverse = false, className = "" }: { reverse?: boolean; className?: string }) {
  const row = [...ticker, ...ticker, ...ticker, ...ticker]
  return (
    <div className={"overflow-hidden " + className} aria-hidden>
      <div className={"marquee flex w-max " + (reverse ? "[animation-direction:reverse]" : "")}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-6 pr-6 font-display text-2xl uppercase sm:text-4xl">
                {t}
                <Sparkles className="size-4 sm:size-5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionLabel({ n, children, className = "" }: { n: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={"label mb-5 flex items-center gap-3 text-muted-foreground " + className}>
      <span className="text-primary">{n}</span>
      <span className="h-px w-8 bg-current opacity-30" />
      {children}
    </p>
  )
}

function ProductCard({ p, onOpen }: { p: Product; onOpen: () => void }) {
  const out = isSoldOut(p)
  const cover = (p.colors.find((c) => !c.soldOut) ?? p.colors[0])?.images[0]
  return (
    <button type="button" onClick={onOpen} className="group flex flex-col text-left" aria-label={`Ver ${p.name}, ${formatCOP(p.price)}`}>
      <div className="relative overflow-hidden rounded-xl bg-muted shadow-glow-sm ring-1 ring-border transition duration-300 group-hover:-translate-y-1 group-hover:shadow-glow group-hover:ring-primary/70">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className={"aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] " + (out ? "opacity-40 grayscale" : "")}
        />
        {(out || p.tag) && (
          <span className={"label absolute left-2.5 top-2.5 rounded-md px-2 py-1 !text-[10px] " + (out ? "bg-red-500 text-white" : "bg-white text-black")}>
            {out ? "Agotado" : p.tag}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col px-0.5">
        <h3 className="text-[15px] font-semibold leading-tight">{p.name}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="font-mono text-sm text-primary-glow">{formatCOP(p.price)}</span>
          <span className="flex items-center gap-1">
            {p.colors.map((c) => (
              <span key={c.id} title={c.name} className={"size-3.5 rounded-full ring-1 ring-white/30 " + (c.soldOut ? "opacity-30" : "")} style={{ background: c.hex }} />
            ))}
          </span>
        </div>
        <span className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-border px-3 text-center text-sm font-semibold transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
          {out ? "Ver detalles" : "Elegir talla y color"}
        </span>
      </div>
    </button>
  )
}

export default function App() {
  const catalog = useCatalog()
  const cart = useCart()
  const [productId, setProductId] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useReveal()

  const product = catalog.find((p) => p.id === productId) ?? null
  const closeProduct = useCallback(() => setProductId(null), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const openCart = useCallback(() => setCartOpen(true), [])

  const goCatalog = (opts?: { all?: boolean; focus?: boolean }) => {
    if (opts?.all) {
      setShowAll(true)
      setQuery("")
    }
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })
    if (opts?.focus) window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 500)
  }

  /* Buscador: nombre, descripción, etiqueta y colores */
  const q = norm(query.trim())
  const results = useMemo(
    () => (q ? catalog.filter((p) => norm([p.name, p.description, p.tag ?? "", ...p.colors.map((c) => c.name)].join(" ")).includes(q)) : catalog),
    [catalog, q],
  )
  const visible = q || showAll ? results : results.slice(0, FIRST)
  const hidden = results.length - visible.length

  /* Lookbook: las primeras prendas disponibles del catálogo real */
  const lookProducts = useMemo(() => catalog.filter((p) => !isSoldOut(p) && p.colors.some((c) => c.images.length)).slice(0, 6), [catalog])
  const looks: RunwayLook[] = useMemo(
    () =>
      lookProducts.map((p) => {
        const colors = p.colors.filter((c) => !c.soldOut && c.images.length)
        return {
          src: colors[0].images[0],
          alt: p.name,
          products: colors.slice(0, 3).map((c) => ({ name: `${p.name} · ${c.name}`, price: formatCOP(p.price), src: c.images[0] })),
        }
      }),
    [lookProducts],
  )

  return (
    <div id="top" className="grain relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Header cart={cartCount(cart)} onCart={openCart} onSearch={() => goCatalog({ focus: true })} />

      {/* ───────── PORTADA ───────── */}
      <section className="relative isolate pt-20 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[90%] bg-[radial-gradient(60%_50%_at_75%_30%,rgb(47_107_255/0.18),transparent_70%)]" />

        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-10 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:pb-0">
          <div className="relative z-10 flex flex-col justify-center lg:col-span-6 lg:py-16">
            <h1 className="font-display uppercase leading-[0.84]">
              <span className="hero-in block text-[clamp(4.2rem,15vw,11rem)]" style={{ ["--d" as string]: "80ms" }}>
                Ropa tan
              </span>
              <span className="hero-in relative block text-[clamp(4.2rem,15vw,11rem)]" style={{ ["--d" as string]: "160ms" }}>
                <span className="relative z-10 text-primary">chimba</span>
                <svg aria-hidden viewBox="0 0 300 20" className="absolute -bottom-1 left-0 w-[min(60%,26rem)] text-primary/60" preserveAspectRatio="none">
                  <path d="M2 14 C 60 4, 140 4, 298 10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="draw" />
                </svg>
              </span>
              <span className="hero-in outline-text block text-[clamp(2.6rem,8.4vw,6rem)]" style={{ ["--d" as string]: "240ms" }}>
                que no se vende.
              </span>
            </h1>

            <p className="hero-in mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ ["--d" as string]: "320ms" }}>
              Ropa con corona. Elige tu prenda, su color y su talla, y confirma el pedido por WhatsApp en un minuto.
            </p>

            <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "400ms" }}>
              <button type="button" onClick={() => goCatalog({ all: true })} className="btn-primary group">
                Ver todo el catálogo
                <ArrowDown className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>
              <button type="button" onClick={() => goCatalog({ focus: true })} className="btn-ghost">
                <Search className="size-4" /> Buscar una prenda
              </button>
            </div>
          </div>

          <div className="relative lg:col-span-6 lg:py-10">
            <div className="hero-in relative mx-auto max-w-[560px] lg:ml-auto" style={{ ["--d" as string]: "200ms" }}>
              <div className="relative overflow-hidden rounded-2xl shadow-glow-lg ring-1 ring-primary/30 sm:rotate-[1.5deg]">
                <img src="/img/fachada.jpeg" alt="Vitrina de Viper Store con grafiti azul: Hptas no vendan ropa tan chimba" className="aspect-[4/5] w-full object-cover" fetchPriority="high" />
              </div>
              <span className="sticker absolute -left-3 top-8 -rotate-[8deg] bg-primary text-white sm:-left-8">Good vibes only ☺</span>
              <span className="sticker absolute -right-2 top-1/2 rotate-[6deg] bg-foreground text-background sm:-right-6">Local support local</span>
              <LogoBadge className="absolute -bottom-6 left-6 size-24 -rotate-6 sm:size-28" />
            </div>
          </div>
        </div>

        <p aria-hidden className="select-none overflow-hidden whitespace-nowrap text-center font-display text-[19.5vw] uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-border)] lg:-mt-6">
          Viper Store
        </p>
      </section>

      <div className="relative z-10 -mt-[4vw] py-6">
        <Marquee className="-rotate-2 bg-primary py-3 text-white shadow-[0_20px_40px_-20px_rgb(47_107_255/0.6)] sm:py-4" />
        <Marquee reverse className="-mt-2 rotate-1 border-y border-border bg-surface py-3 text-muted-foreground sm:py-4" />
      </div>

      {/* ───────── LOOKBOOK con la ropa del catálogo ───────── */}
      {looks.length >= 2 && (
        <section id="lookbook">
          <RunwayLookbook
            className="vs-look"
            looks={looks}
            loop={false}
            scrollPerLook={0.45}
            nav={[]}
            title="Lookbook · Drop 01"
            blurb="La ropa del drop, en fila. Baja con el scroll: la del frente es la que puedes pedir."
            lookLabel="Look"
            caption={(i) =>
              lookProducts[i] && (
                <div className="look-cap">
                  <span className="look-name">{lookProducts[i].name}</span>
                  <span className="look-price">{formatCOP(lookProducts[i].price)}</span>
                </div>
              )
            }
            ctaLabel="Elegir talla y color →"
            onShopLook={(i) => lookProducts[i] && setProductId(lookProducts[i].id)}
            onCardClick={(i) => lookProducts[i] && setProductId(lookProducts[i].id)}
            ariaLabel="Lookbook Viper Store"
          />
        </section>
      )}

      {/* ───────── CATÁLOGO ───────── */}
      <section id="catalogo" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel n="01">Catálogo</SectionLabel>
            <h2 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85]">
              Toda la <span className="text-primary">ropa</span>
            </h2>
          </div>
          <p className="max-w-xs text-[15px] text-muted-foreground">Toca una prenda para ver sus fotos y elegir color y talla.</p>
        </div>

        {/* Buscador */}
        <div className="mt-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="buscar" className="sr-only">Buscar en el catálogo</label>
            <input
              id="buscar"
              ref={searchRef}
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por nombre o color: chaqueta, negro, denim…"
              className="input h-14 rounded-full pl-12 pr-12 shadow-glow-sm focus:shadow-glow [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus() }} aria-label="Borrar búsqueda" className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {QUICK.map((t) => {
              const on = norm(t) === q
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setQuery(on ? "" : t)}
                  aria-pressed={on}
                  className={"label h-10 shrink-0 rounded-full border px-4 transition-colors " + (on ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")}
                >
                  {t}
                </button>
              )
            })}
          </div>
          <p className="label mt-4 text-muted-foreground" aria-live="polite">
            {q ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${query.trim()}”` : `${catalog.length} prendas`}
          </p>
        </div>

        {catalog.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center text-muted-foreground">Estamos preparando el próximo drop. Vuelve pronto.</p>
        ) : results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="font-display text-3xl uppercase">No encontramos “{query.trim()}”</p>
            <p className="mt-2 text-muted-foreground">Prueba con otra palabra o mira todo el catálogo.</p>
            <button type="button" onClick={() => goCatalog({ all: true })} className="btn-primary mt-6">
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.id} p={p} onOpen={() => setProductId(p.id)} />
              ))}
            </div>
            {!q && results.length > FIRST && (
              <div className="mt-12 flex justify-center">
                <button type="button" onClick={() => setShowAll((v) => !v)} className={showAll ? "btn-ghost w-full sm:w-auto" : "btn-primary w-full sm:w-auto"}>
                  {showAll ? "Ver menos" : `Ver todo el catálogo (${hidden} más)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ───────── CÓMO COMPRAR (sección clara) ───────── */}
      <section id="como-comprar" className="scroll-mt-20 bg-paper py-16 text-ink sm:py-24">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <SectionLabel n="02" className="!text-ink/60">Cómo comprar</SectionLabel>
          <h2 data-reveal className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85]">
            Tres pasos y <span className="text-primary">listo</span>
          </h2>
          <ol className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              { icon: MousePointerClick, k: "Elige tu prenda", v: "Toca la que te guste, escoge color y talla, y agrégala a la bolsa." },
              { icon: ClipboardList, k: "Llena tus datos", v: "Nombre, dirección de entrega y si pagas por Nequi o contraentrega." },
              { icon: MessageCircle, k: "Confirma por WhatsApp", v: "Se abre el chat con tu pedido ya escrito. Solo tocas Enviar." },
            ].map((s, i) => (
              <li key={s.k} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className="rounded-2xl bg-white p-6 shadow-[0_24px_50px_-28px_rgb(47_107_255/0.55)] ring-1 ring-primary/10 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-display text-6xl text-primary">0{i + 1}</span>
                  <s.icon className="size-7 text-ink/40" />
                </div>
                <h3 className="mt-6 font-display text-3xl uppercase">{s.k}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{s.v}</p>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => goCatalog({ all: true })} className="btn-primary mt-8 w-full sm:w-auto">
            Empezar: ver todo el catálogo
          </button>
        </div>
      </section>

      {/* ───────── LA TIENDA ───────── */}
      <section id="tienda" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-reveal className="relative order-2 lg:order-1">
            <img src="/img/fachada.jpeg" alt="Fachada de Viper Store de noche" loading="lazy" className="aspect-square w-full rounded-2xl object-cover object-bottom shadow-glow-lg ring-1 ring-primary/30" />
            <span className="sticker absolute -top-4 right-6 rotate-[5deg] bg-primary text-white">Ven a verla ☺</span>
          </div>
          <div className="order-1 lg:order-2">
            <SectionLabel n="03">La tienda</SectionLabel>
            <h2 data-reveal className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85]">
              Una vitrina que <span className="text-primary">no pasa</span> desapercibida
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">¿Dudas de talla o disponibilidad? Escríbenos y te respondemos por WhatsApp.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={WA_CHAT} target="_blank" rel="noopener" className="btn-primary">
                <MessageCircle className="size-4" /> Escribir por WhatsApp
              </a>
              {INSTAGRAM_URL && (
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="btn-ghost">
                  <Instagram className="size-4" /> Seguir en Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── PIE ───────── */}
      <footer className="relative overflow-hidden border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <Logo size="lg" />
            <p className="mt-3 text-sm text-muted-foreground">Good vibes only · Local support local</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Pie">
            <a href="#lookbook" className="hover:text-foreground">Lookbook</a>
            <a href="#catalogo" className="hover:text-foreground">Catálogo</a>
            <a href="#como-comprar" className="hover:text-foreground">Cómo comprar</a>
            <a href="#/admin" className="hover:text-foreground">Admin</a>
          </nav>
          <a href={WA_CHAT} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary-glow">
            <MessageCircle className="size-5" />
          </a>
        </div>
        <p aria-hidden className="select-none whitespace-nowrap text-center font-display text-[26vw] uppercase leading-[0.8] text-primary [text-shadow:0_0_80px_rgb(47_107_255/0.6)]">
          Viper
        </p>
        <p className="label border-t border-border py-5 text-center text-muted-foreground">© 2026 Viper Store</p>
      </footer>

      <ProductDrawer product={product} onClose={closeProduct} onOpenCart={openCart} />
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <Toaster />
    </div>
  )
}
