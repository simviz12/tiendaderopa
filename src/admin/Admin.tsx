import { useState } from "react"
import { ArrowLeft, ImagePlus, Lock, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { ADMIN_PIN, STORE_NAME } from "@/config"
import { cn } from "@/lib/utils"
import { catalogStore, formatCOP, isSoldOut, SEED, uid, useCatalog, type ColorVariant, type Product } from "@/lib/store"
import { toast, Toaster } from "@/components/shop/toast"

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"]
const SESSION_KEY = "viper.admin.ok"

const blank = (): Product => ({
  id: uid(),
  name: "",
  price: 0,
  description: "",
  tag: "",
  sizes: ["S", "M", "L", "XL"].map((label) => ({ label })),
  colors: [{ id: uid(), name: "", hex: "#111111", images: [] }],
})

/** Reduce la foto antes de guardarla para que quepa en el navegador. */
function fileToDataUrl(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement("canvas")
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL("image/jpeg", 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function Admin() {
  const [ok, setOk] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1")
  return (
    <div className="min-h-screen bg-background text-foreground">
      {ok ? <Dashboard onLock={() => { sessionStorage.removeItem(SESSION_KEY); setOk(false) }} /> : <PinGate onOk={() => { sessionStorage.setItem(SESSION_KEY, "1"); setOk(true) }} />}
      <Toaster />
    </div>
  )
}

function PinGate({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState("")
  const [bad, setBad] = useState(false)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (pin === ADMIN_PIN) onOk()
        else setBad(true)
      }}
      className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6"
    >
      <span className="grid size-14 place-items-center rounded-full bg-muted">
        <Lock className="size-6 text-primary-glow" />
      </span>
      <h1 className="mt-6 font-display text-4xl uppercase">Panel {STORE_NAME}</h1>
      <p className="mt-2 text-muted-foreground">Escribe el PIN para administrar el catálogo.</p>
      <label htmlFor="pin" className="mt-8 mb-1.5 text-sm font-semibold">PIN</label>
      <input id="pin" type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setBad(false) }} className={cn("input text-center text-2xl tracking-[0.5em]", bad && "border-red-400")} />
      {bad && <p role="alert" className="mt-2 text-sm text-red-400">PIN incorrecto. Inténtalo de nuevo.</p>}
      <button className="btn-primary mt-5">Entrar</button>
      <a href="./" className="mt-6 text-center text-sm text-muted-foreground underline underline-offset-4">Volver a la tienda</a>
    </form>
  )
}

function Dashboard({ onLock }: { onLock: () => void }) {
  const catalog = useCatalog()
  const [editing, setEditing] = useState<Product | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const save = (p: Product) => {
    const exists = catalog.some((x) => x.id === p.id)
    const saved = catalogStore.set(exists ? catalog.map((x) => (x.id === p.id ? p : x)) : [p, ...catalog])
    if (!saved) return false
    toast(exists ? "Cambios guardados. Ya se ven en la tienda." : "Producto creado. Ya está en la tienda.")
    setEditing(null)
    return true
  }

  if (editing) return <Editor initial={editing} onCancel={() => setEditing(null)} onSave={save} />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">Panel administrativo</p>
          <h1 className="font-display text-4xl uppercase sm:text-5xl">Catálogo</h1>
        </div>
        <div className="flex gap-2">
          <a href="./" className="btn-ghost min-h-11 px-4 text-sm">Ver tienda</a>
          <button type="button" onClick={onLock} className="btn-ghost min-h-11 px-4 text-sm"><Lock className="size-4" /> Salir</button>
        </div>
      </header>

      <button type="button" onClick={() => setEditing(blank())} className="btn-primary mt-8 w-full sm:w-auto">
        <Plus className="size-5" /> Nueva prenda
      </button>

      <p className="mt-8 text-sm text-muted-foreground">{catalog.length} productos · los cambios se ven de inmediato en la tienda de este navegador.</p>

      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {catalog.length === 0 && <li className="p-8 text-center text-muted-foreground">No hay productos. Crea el primero con “Nueva prenda”.</li>}
        {catalog.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-3 sm:p-4">
            <img src={p.colors[0]?.images[0]} alt="" className="h-20 w-16 shrink-0 rounded-lg bg-muted object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCOP(p.price)} · {p.colors.length} {p.colors.length === 1 ? "color" : "colores"} · {p.sizes.map((s) => s.label).join(" ")}
              </p>
              {isSoldOut(p) ? (
                <span className="mt-1 inline-block rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">Agotado</span>
              ) : (
                (p.colors.some((c) => c.soldOut) || p.sizes.some((s) => s.soldOut)) && (
                  <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">Con opciones agotadas</span>
                )
              )}
            </div>
            {confirmDel === p.id ? (
              <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                <button type="button" onClick={() => { catalogStore.set(catalog.filter((x) => x.id !== p.id)); setConfirmDel(null); toast(`Eliminaste ${p.name}`) }} className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white">Sí, eliminar</button>
                <button type="button" onClick={() => setConfirmDel(null)} className="rounded-full border border-border px-3 py-2 text-xs">Cancelar</button>
              </div>
            ) : (
              <div className="flex shrink-0 gap-1.5">
                <button type="button" onClick={() => setEditing(structuredClone(p))} aria-label={`Editar ${p.name}`} className="grid size-11 place-items-center rounded-full border border-border hover:border-primary"><Pencil className="size-4" /></button>
                <button type="button" onClick={() => setConfirmDel(p.id)} aria-label={`Eliminar ${p.name}`} className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground hover:border-red-400 hover:text-red-400"><Trash2 className="size-4" /></button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-border pt-6">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>Se borrarán tus productos y volverá el catálogo de ejemplo. ¿Seguro?</span>
            <button type="button" onClick={() => { catalogStore.set(SEED); setConfirmReset(false); toast("Catálogo de ejemplo restaurado") }} className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white">Sí, restaurar</button>
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-full border border-border px-3 py-2 text-xs">Cancelar</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-4" /> Restaurar catálogo de ejemplo
          </button>
        )}
      </div>
    </div>
  )
}

function Editor({ initial, onCancel, onSave }: { initial: Product; onCancel: () => void; onSave: (p: Product) => boolean }) {
  const [p, setP] = useState<Product>(initial)
  const [error, setError] = useState("")
  const [urlDraft, setUrlDraft] = useState<Record<string, string>>({})
  const isNew = !initial.name

  const patch = (x: Partial<Product>) => { setP((v) => ({ ...v, ...x })); setError("") }
  const patchColor = (id: string, x: Partial<ColorVariant>) => patch({ colors: p.colors.map((c) => (c.id === id ? { ...c, ...x } : c)) })

  const toggleSize = (label: string) => {
    const has = p.sizes.some((s) => s.label === label)
    const next = has ? p.sizes.filter((s) => s.label !== label) : [...p.sizes, { label }]
    patch({ sizes: next.sort((a, b) => SIZE_PRESETS.indexOf(a.label) - SIZE_PRESETS.indexOf(b.label)) })
  }

  const addFiles = async (colorId: string, files: FileList | null) => {
    if (!files?.length) return
    try {
      const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)))
      const c = p.colors.find((x) => x.id === colorId)!
      patchColor(colorId, { images: [...c.images, ...urls] })
    } catch {
      setError("No pudimos leer una de las fotos. Prueba con otra imagen.")
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean: Product = {
      ...p,
      name: p.name.trim(),
      description: p.description.trim(),
      tag: p.tag?.trim() || undefined,
      colors: p.colors.map((c) => ({ ...c, name: c.name.trim() })),
    }
    if (!clean.name) return setError("Ponle un nombre a la prenda.")
    if (!(clean.price > 0)) return setError("Escribe un precio mayor a cero.")
    if (!clean.sizes.length) return setError("Marca al menos una talla.")
    if (!clean.colors.length) return setError("Agrega al menos un color.")
    const bad = clean.colors.find((c) => !c.name || !c.images.length)
    if (bad) return setError(`Cada color necesita nombre y al menos una foto${bad.name ? ` (revisa “${bad.name}”)` : ""}.`)
    if (!onSave(clean)) setError("No se pudo guardar: el navegador se quedó sin espacio. Usa menos fotos subidas o pega enlaces (URL) de las imágenes.")
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:px-8">
      <button type="button" onClick={onCancel} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver al catálogo
      </button>
      <h1 className="mt-4 font-display text-4xl uppercase">{isNew ? "Nueva prenda" : "Editar prenda"}</h1>

      <section className="mt-8 space-y-5">
        <div>
          <label htmlFor="a-name" className="mb-1.5 block text-sm font-semibold">Nombre</label>
          <input id="a-name" className="input" value={p.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Ej: Chaqueta Biker" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="a-price" className="mb-1.5 block text-sm font-semibold">Precio (COP)</label>
            <input id="a-price" className="input" type="number" inputMode="numeric" min={0} step={1000} value={p.price || ""} onChange={(e) => patch({ price: Number(e.target.value) })} placeholder="189000" />
            {p.price > 0 && <p className="mt-1 text-xs text-muted-foreground">Se verá como {formatCOP(p.price)}</p>}
          </div>
          <div>
            <label htmlFor="a-tag" className="mb-1.5 block text-sm font-semibold">Etiqueta (opcional)</label>
            <input id="a-tag" className="input" value={p.tag ?? ""} onChange={(e) => patch({ tag: e.target.value })} placeholder="Nuevo" />
          </div>
        </div>
        <div>
          <label htmlFor="a-desc" className="mb-1.5 block text-sm font-semibold">Descripción corta</label>
          <textarea id="a-desc" rows={2} className="input h-auto py-3" value={p.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Una o dos frases sobre la prenda." />
        </div>
      </section>

      {/* Tallas */}
      <section className="mt-10">
        <h2 className="font-display text-2xl uppercase">Tallas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Toca para activar las tallas que manejas.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZE_PRESETS.map((l) => {
            const on = p.sizes.some((s) => s.label === l)
            return (
              <button key={l} type="button" onClick={() => toggleSize(l)} aria-pressed={on} className={cn("h-12 min-w-14 rounded-xl border-2 px-3 text-sm font-semibold transition", on ? "border-primary bg-primary text-white" : "border-border text-muted-foreground")}>
                {l}
              </button>
            )
          })}
        </div>
        {p.sizes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {p.sizes.map((s) => (
              <label key={s.label} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={!!s.soldOut} onChange={(e) => patch({ sizes: p.sizes.map((x) => (x.label === s.label ? { ...x, soldOut: e.target.checked } : x)) })} />
                {s.label} agotada
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Colores */}
      <section className="mt-10">
        <h2 className="font-display text-2xl uppercase">Colores y fotos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cada color tiene sus propias fotos: son las que verá el cliente al elegirlo.</p>

        <div className="mt-4 space-y-4">
          {p.colors.map((c, idx) => (
            <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-end gap-3">
                <div className="shrink-0">
                  <label htmlFor={"hex-" + c.id} className="mb-1.5 block text-sm font-semibold">Tono</label>
                  <input id={"hex-" + c.id} type="color" value={c.hex} onChange={(e) => patchColor(c.id, { hex: e.target.value })} className="h-13 w-14 cursor-pointer rounded-xl border border-border bg-transparent p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor={"cn-" + c.id} className="mb-1.5 block text-sm font-semibold">Nombre del color {idx + 1}</label>
                  <input id={"cn-" + c.id} className="input" value={c.name} onChange={(e) => patchColor(c.id, { name: e.target.value })} placeholder="Ej: Negro" />
                </div>
                <button type="button" onClick={() => patch({ colors: p.colors.filter((x) => x.id !== c.id) })} aria-label="Quitar color" className="grid size-13 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:border-red-400 hover:text-red-400">
                  <Trash2 className="size-4" />
                </button>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={!!c.soldOut} onChange={(e) => patchColor(c.id, { soldOut: e.target.checked })} />
                Este color está agotado
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {c.images.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="h-24 w-20 rounded-lg bg-muted object-cover" />
                    <button type="button" onClick={() => patchColor(c.id, { images: c.images.filter((_, k) => k !== i) })} aria-label="Quitar foto" className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-red-500 text-white shadow">
                      <X className="size-4" />
                    </button>
                    {i === 0 && <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/70 py-0.5 text-center text-[10px]">Principal</span>}
                  </div>
                ))}
                <label className="grid h-24 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border text-center text-[11px] text-muted-foreground transition hover:border-primary hover:text-foreground">
                  <span>
                    <ImagePlus className="mx-auto mb-1 size-5" />
                    Subir foto
                  </span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addFiles(c.id, e.target.files); e.target.value = "" }} />
                </label>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  className="input min-w-0 flex-1"
                  aria-label="Enlace de imagen"
                  placeholder="…o pega el enlace (URL) de una foto"
                  value={urlDraft[c.id] ?? ""}
                  onChange={(e) => setUrlDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = (urlDraft[c.id] ?? "").trim()
                    if (!/^https?:\/\//.test(url)) return setError("El enlace de la foto debe empezar por http:// o https://")
                    patchColor(c.id, { images: [...c.images, url] })
                    setUrlDraft((d) => ({ ...d, [c.id]: "" }))
                  }}
                  className="btn-ghost shrink-0 px-5"
                >
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => patch({ colors: [...p.colors, { id: uid(), name: "", hex: "#1f7bff", images: [] }] })} className="btn-ghost mt-4 w-full">
          <Plus className="size-4" /> Agregar otro color
        </button>
      </section>

      {/* Barra fija de guardado */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-8">
          {error && <p role="alert" className="mb-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn-ghost px-5">Cancelar</button>
            <button className="btn-primary flex-1">{isNew ? "Crear producto" : "Guardar cambios"}</button>
          </div>
        </div>
      </div>
    </form>
  )
}
