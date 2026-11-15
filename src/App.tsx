import { useState } from "react"
import { ArrowDown, ArrowUpRight, Instagram, MessageCircle, Plus, Sparkles } from "lucide-react"
import RunwayLookbook from "@/components/ui/runway-lookbook"
import { Header } from "@/components/site/header"
import { useReveal } from "@/hooks/use-reveal"
import { categories, INSTAGRAM, looks, products, WHATSAPP } from "@/data"

const ticker = ["Nuevo drop", "Good vibes only", "Local support local", "Viper Store", "Ropa tan chimba"]

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

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
      <span className="text-primary">{n}</span>
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  )
}

export default function App() {
  const [cart, setCart] = useState(0)
  const [bump, setBump] = useState(0)
  const [added, setAdded] = useState<string | null>(null)
  useReveal()

  const add = (n = 1, id?: string) => {
    setCart((c) => c + n)
    setBump((b) => b + 1)
    if (id) {
      setAdded(id)
      window.setTimeout(() => setAdded((a) => (a === id ? null : a)), 1400)
    }
  }

  return (
    <div id="top" className="grain relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Header cart={cart} bump={bump} />

      {/* ───────── HERO ───────── */}
      <section className="relative isolate pt-20 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[90%] bg-[radial-gradient(60%_50%_at_75%_30%,rgb(31_123_255/0.16),transparent_70%)]" />

        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-10 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:pb-0">
          {/* Copy */}
          <div className="relative z-10 flex flex-col justify-center lg:col-span-6 lg:py-16">
            <p className="hero-in mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-glow" style={{ ["--d" as string]: "0ms" }}>
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary-glow/70" />
                <span className="relative size-2 rounded-full bg-primary-glow" />
              </span>
              Drop 01 · Disponible
            </p>

            <h1 className="font-display uppercase leading-[0.86] tracking-tight">
              <span className="hero-in block text-[clamp(3.6rem,13vw,9.5rem)]" style={{ ["--d" as string]: "80ms" }}>
                Ropa tan
              </span>
              <span className="hero-in relative block text-[clamp(3.6rem,13vw,9.5rem)]" style={{ ["--d" as string]: "160ms" }}>
                <span className="relative z-10 text-primary">chimba</span>
                <svg aria-hidden viewBox="0 0 300 20" className="absolute -bottom-1 left-0 w-[min(70%,30rem)] text-primary/60" preserveAspectRatio="none">
                  <path d="M2 14 C 60 4, 140 4, 298 10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="draw" />
                </svg>
              </span>
              <span className="hero-in outline-text block text-[clamp(2.4rem,8.5vw,6.2rem)]" style={{ ["--d" as string]: "240ms" }}>
                que no se vende.
              </span>
            </h1>

            <p className="hero-in mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ ["--d" as string]: "320ms" }}>
              Streetwear con corona. Prendas para la calle en negro, gris y azul — piezas que se notan sin tener que gritar.
            </p>

            <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "400ms" }}>
              <a href="#drop" className="btn-primary group">
                Comprar el drop
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a href="#lookbook" className="btn-ghost group">
                Ver lookbook
                <ArrowDown className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:col-span-6 lg:py-10">
            <div className="hero-in relative mx-auto max-w-[560px] lg:ml-auto" style={{ ["--d" as string]: "200ms" }}>
              <div className="relative overflow-hidden rounded-[28px] ring-1 ring-white/10 sm:rotate-[1.5deg]">
                <img
                  src="/img/fachada.jpeg"
                  alt="Vitrina de Viper Store con grafiti azul: Hptas no vendan ropa tan chimba"
                  className="aspect-[4/5] w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 to-transparent p-5 pt-20">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">La vitrina</p>
                    <p className="font-display text-2xl uppercase">Viper Store</p>
                  </div>
                  <a href="#tienda" className="grid size-11 place-items-center rounded-full bg-white text-black transition-transform hover:rotate-45" aria-label="Ver la tienda">
                    <ArrowUpRight className="size-5" />
                  </a>
                </div>
              </div>

              {/* stickers */}
              <span className="sticker absolute -left-3 top-8 -rotate-[8deg] bg-primary text-white sm:-left-8">Good vibes only ☺</span>
              <span className="sticker absolute -right-2 top-1/2 rotate-[6deg] bg-foreground text-background sm:-right-6">Local support local</span>
              <img
                src="/img/logo.jpeg"
                alt=""
                className="absolute -bottom-6 left-6 size-24 -rotate-6 rounded-full object-cover shadow-2xl ring-4 ring-background sm:size-28"
              />
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <p aria-hidden className="select-none overflow-hidden whitespace-nowrap text-center font-display text-[24vw] uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1px_var(--color-border)] lg:-mt-6">
          Viper Store
        </p>
      </section>

      {/* ───────── MARQUEES ───────── */}
      <div className="relative z-10 -mt-[4vw] py-6">
        <Marquee className="-rotate-2 bg-primary py-3 text-white shadow-[0_20px_40px_-20px_rgb(31_123_255/0.6)] sm:py-4" />
        <Marquee reverse className="-mt-2 rotate-1 border-y border-border bg-surface py-3 text-muted-foreground sm:py-4" />
      </div>

      {/* ───────── MANIFESTO ───────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 sm:py-28">
        <SectionLabel n="01">Manifiesto</SectionLabel>
        <h2 data-reveal className="max-w-5xl font-display text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[0.92]">
          Hecho para la calle. <span className="text-muted-foreground">Pensado para que te miren.</span>{" "}
          <span className="font-tag normal-case text-primary">sin repetir.</span>
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {[
            { k: "Drops limitados", v: "Pocas unidades por referencia. Cuando se acaba, se acaba." },
            { k: "Diseño con corona", v: "Gráficos propios, cortes oversize y detalles que se notan de cerca." },
            { k: "Local support local", v: "Tienda de barrio con actitud. Compra local, viste distinto." },
          ].map((f, i) => (
            <div key={f.k} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className="bg-background p-6 sm:p-8">
              <p className="font-display text-sm text-primary">0{i + 1}</p>
              <h3 className="mt-6 font-display text-2xl uppercase sm:text-3xl">{f.k}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── LOOKBOOK ───────── */}
      <section id="lookbook" className="scroll-mt-0">
        <RunwayLookbook
          className="vs-look"
          looks={looks}
          loop={false}
          brand="Viper Store"
          nav={["Novedades", "Camisetas", "Buzos", "Chaquetas", "Jeans", "Accesorios"]}
          activeNav={0}
          title="Lookbook — Drop 01"
          blurb="Seis looks, una sola actitud. Baja con el scroll y la fila avanza: cada look trae sus piezas al lado."
          ctaLabel="Agregar el look"
          onShopLook={(i) => add(looks[i].products?.length ?? 1)}
          cartCount={cart}
          lookLabel="Look"
          ariaLabel="Lookbook Viper Store"
        />
      </section>

      {/* ───────── CATEGORÍAS ───────── */}
      <section id="categorias" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel n="02">Categorías</SectionLabel>
            <h2 data-reveal className="font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[0.9]">
              Escoge tu <span className="text-primary">uniforme</span>
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2">
          {categories.map((c, i) => {
            const layout = [
              "col-span-2 lg:col-span-7 lg:row-span-2 aspect-[4/3] lg:aspect-auto",
              "lg:col-span-5 aspect-[3/4] lg:aspect-[16/9]",
              "lg:col-span-2 aspect-[3/4] lg:aspect-auto",
              "col-span-2 lg:col-span-3 aspect-[16/9] lg:aspect-auto",
            ][i]
            return (
              <a
                key={c.name}
                href="#drop"
                data-reveal
                style={{ ["--d" as string]: `${i * 70}ms` }}
                className={"group relative overflow-hidden rounded-2xl bg-muted ring-1 ring-border " + layout}
              >
                <img
                  src={c.img}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover grayscale transition-[transform,filter] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{c.count}</p>
                    <h3 className="font-display text-2xl uppercase leading-none text-white sm:text-4xl">{c.name}</h3>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-primary">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      {/* ───────── DROP ───────── */}
      <section id="drop" className="scroll-mt-20 border-y border-border bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel n="03">Drop 01</SectionLabel>
              <h2 data-reveal className="font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[0.9]">
                Lo más <span className="font-tag normal-case text-primary">chimba</span>
              </h2>
            </div>
            <p className="max-w-xs text-[15px] text-muted-foreground">
              Unidades limitadas por referencia. <span className="text-foreground">Desliza →</span>
              <span className="hidden lg:inline"> o explora la grilla.</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:gap-4 sm:px-8 lg:mx-auto lg:grid lg:max-w-[1400px] lg:grid-cols-4 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {products.map((p, i) => (
            <article
              key={p.id}
              data-reveal
              style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}
              className="group w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-auto"
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover grayscale-[0.85] transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                {p.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
                    {p.tag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => add(1, p.id)}
                  className="absolute bottom-3 right-3 flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black shadow-lg transition-[transform,background-color] duration-200 hover:bg-primary hover:text-white active:scale-[0.95]"
                  aria-label={`Agregar ${p.name} a la bolsa`}
                >
                  {added === p.id ? "¡Listo!" : <><Plus className="size-4" /> Agregar</>}
                </button>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
                <h3 className="truncate text-[15px] font-semibold">{p.name}</h3>
                <span className="shrink-0 font-display text-lg text-primary-glow">{p.price}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── LA TIENDA ───────── */}
      <section id="tienda" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div data-reveal className="relative order-2 lg:order-1">
            <img src="/img/fachada.jpeg" alt="Fachada de Viper Store de noche" loading="lazy" className="aspect-square w-full rounded-[28px] object-cover object-bottom ring-1 ring-border" />
            <span className="sticker absolute -top-4 right-6 rotate-[5deg] bg-primary text-white">Ven a verla ☺</span>
          </div>
          <div className="order-1 lg:order-2">
            <SectionLabel n="04">La tienda</SectionLabel>
            <h2 data-reveal className="font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[0.9]">
              Una vitrina que <span className="text-primary">no pasa</span> desapercibida
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pásate por la tienda, mídete el drop y sal con algo que nadie más tiene. ¿Dudas de talla o disponibilidad? Escríbenos y te respondemos por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={WHATSAPP} className="btn-primary group">
                <MessageCircle className="size-4" /> Escribir por WhatsApp
              </a>
              <a href={INSTAGRAM} className="btn-ghost group">
                <Instagram className="size-4" /> Seguir en Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA + FOOTER ───────── */}
      <footer id="contacto" className="relative overflow-hidden border-t border-border bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 pt-20 sm:px-8 sm:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h2 data-reveal className="font-display text-[clamp(2.6rem,7vw,5.5rem)] uppercase leading-[0.9]">
              Entérate del <span className="text-primary">próximo drop</span> antes que nadie.
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                f.reset()
                f.querySelector("button")!.textContent = "¡Estás dentro!"
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="mail" className="sr-only">Correo</label>
              <input
                id="mail"
                type="email"
                required
                placeholder="tu@correo.com"
                className="h-13 min-w-0 flex-1 rounded-full border border-border bg-background px-5 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <button className="btn-primary h-13 shrink-0">Avísame</button>
            </form>
          </div>

          <div className="mt-20 flex flex-col gap-8 border-t border-border py-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src="/img/logo.jpeg" alt="" className="size-14 rounded-full object-cover ring-1 ring-white/10" />
              <div>
                <p className="font-display text-xl uppercase">Viper Store</p>
                <p className="text-sm text-muted-foreground">Good vibes only · Local support local</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Pie">
              <a href="#lookbook" className="hover:text-foreground">Lookbook</a>
              <a href="#categorias" className="hover:text-foreground">Categorías</a>
              <a href="#drop" className="hover:text-foreground">Drop 01</a>
              <a href="#tienda" className="hover:text-foreground">La tienda</a>
            </nav>
            <div className="flex gap-2">
              <a href={INSTAGRAM} aria-label="Instagram" className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary-glow">
                <Instagram className="size-5" />
              </a>
              <a href={WHATSAPP} aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary-glow">
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>
        </div>
        <p aria-hidden className="select-none whitespace-nowrap text-center font-display text-[22vw] uppercase leading-[0.75] text-primary/90 [margin-bottom:-0.12em]">
          Viper
        </p>
        <p className="absolute bottom-3 right-4 text-xs text-white/70 sm:right-8">© 2026 Viper Store</p>
      </footer>
    </div>
  )
}
