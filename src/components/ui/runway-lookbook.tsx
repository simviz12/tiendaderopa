"use client"

import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * Runway Lookbook — a fashion-house runway page. The collection's looks queue
 * up in depth across the stage, smaller, softer and paler the further back
 * they stand. Scroll and the front look walks off to the right while the whole
 * queue steps forward, sharpening as it comes; the look number rolls over and
 * the product rail beside the stage scrolls to the pieces of the new look.
 *
 * The page scroll drives it. The stage pins while you scroll through the
 * section, one look per stretch of scroll, and letting go settles on the
 * nearest look with a broad ease in and out. With `loop` on it runs on
 * forever both ways.
 *
 * Note: this copy loads the display face (Lexend Zetta) from Google Fonts in
 * index.html instead of embedding it as base64; pass `fontSrc` to embed one.
 */

gsap.registerPlugin(ScrollTrigger)

export type RunwayProduct = {
  name: string
  price: string
  /** Image for the card. Defaults to the look's own image. */
  src?: string
  /**
   * The slice of the image to show, as fractions of its height: from `top`
   * to `bottom`, centred on `x` (a fraction of its width). Default: all of it.
   */
  crop?: { top: number; bottom: number; x?: number }
}

export type RunwayLink = string | { label: string; href?: string }

export type RunwayLook = {
  /** A cut-out figure on a transparent background. */
  src: string
  alt?: string
  products?: RunwayProduct[]
}

export type RunwayLookbookProps = {
  looks: RunwayLook[]
  /** Height of the pinned stage. **Must be a definite length.** */
  height?: string
  brand?: React.ReactNode
  /** Header tabs: a label, or a label with an `href`. */
  tabs?: RunwayLink[]
  /** Index of the current tab. */
  activeTab?: number
  /** The category row under the header. */
  nav?: RunwayLink[]
  /** Index of the current category, or -1 for none. */
  activeNav?: number
  /** Called when a tab, category or header action without an `href` is pressed. */
  onNavigate?: (target: { kind: "tab" | "nav" | "login" | "search" | "wishlist" | "cart"; index?: number; label?: string }) => void
  title?: string
  blurb?: string
  /** Number of the first look. */
  firstNumber?: number
  ctaLabel?: string
  onShopLook?: (index: number) => void
  cartCount?: number
  /** Show the product rail (it hides itself on narrow stages). */
  rail?: boolean
  /** Scroll per look, as a fraction of the stage height. */
  scrollPerLook?: number
  /**
   * Scroll on forever: past the last look the first walks in again, and up
   * past the first the last comes back. Use it as the page or a full view.
   */
  loop?: boolean
  /** woff2 URL for the display face. `null` uses the host-loaded Lexend Zetta. */
  fontSrc?: string | null
  onIndexChange?: (index: number) => void
  ariaLabel?: string
  className?: string
  /** Labels for the header actions. */
  loginLabel?: string
  cartLabel?: string
  lookLabel?: string
  /** Extra content under the look number (e.g. the piece's name and price). */
  caption?: (index: number) => React.ReactNode
  /** Called when a card in the product rail is pressed. */
  onCardClick?: (look: number, product: number) => void
}

// #region queue
/**
 * Where look `i` stands relative to the position, wrapped to [-1, n-1): 0 is
 * the front, 1 to n-2 queue behind, and one look at most has walked off.
 */
export function offsetOf(i: number, pos: number, n: number): number {
  if (n <= 0) return 0
  const d = (((i - pos + 1) % n) + n) % n
  return d - 1
}

export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0
  return ((Math.round(i) % n) + n) % n
}

/**
 * The queue, measured off the reference: slot -1 has walked off right, 0 is
 * the front look, 1-5 wait behind. x is the centre and feet the floor line as
 * fractions of the stage; h is the figure's height and blur its softness as
 * fractions of the stage height.
 */
const SLOTS = [
  { x: 1.28, feet: 0.93, h: 0.83, blur: 0, alpha: 1 },
  { x: 0.74, feet: 0.9, h: 0.79, blur: 0, alpha: 1 },
  { x: 0.47, feet: 0.82, h: 0.58, blur: 0.0022, alpha: 1 },
  { x: 0.33, feet: 0.745, h: 0.42, blur: 0.0065, alpha: 0.95 },
  { x: 0.245, feet: 0.7, h: 0.32, blur: 0.011, alpha: 0.78 },
  { x: 0.17, feet: 0.667, h: 0.26, blur: 0.016, alpha: 0.52 },
  { x: 0.11, feet: 0.65, h: 0.22, blur: 0.021, alpha: 0.26 },
  { x: 0.07, feet: 0.64, h: 0.19, blur: 0.026, alpha: 0 },
]

/** On narrow stages the queue tucks left and the figures shrink to fit. */
const NARROW_X = [1.45, 0.5, 0.3, 0.19, 0.12, 0.07, 0.04, 0.02]

export type Pose = { x: number; y: number; scale: number; blur: number; alpha: number }

/**
 * Pose of a look `d` places behind the front, for a stage `w` x `h`. `base`
 * is the front figure's height in px, so `scale` is relative to it.
 */
export function pose(d: number, w: number, h: number, n = Infinity, forceNarrow = false): Pose & { base: number } {
  const narrow = forceNarrow || w < 0.9 * h
  // Narrow: the figure is sized by the width and lifted, leaving the bottom third for the caption.
  const k = narrow ? Math.min(0.78, w / (0.95 * h)) : 1
  const lift = narrow ? 0.74 : 1
  const s = Math.max(-1, Math.min(SLOTS.length - 2, d)) + 1
  const i = Math.min(SLOTS.length - 2, Math.floor(s))
  const t = s - i
  const a = SLOTS[i]
  const b = SLOTS[i + 1]
  const mix = (p: number, q: number) => p + (q - p) * t
  const xs = narrow ? mix(NARROW_X[i], NARROW_X[i + 1]) : mix(a.x, b.x)
  const base = SLOTS[1].h * h * k
  return {
    base,
    x: xs * w,
    y: mix(a.feet, b.feet) * h * lift,
    scale: (mix(a.h, b.h) * h * k) / base,
    blur: mix(a.blur, b.blur) * h,
    // The look rejoining the back of the queue fades in rather than popping.
    alpha: mix(a.alpha, b.alpha) * Math.max(0, Math.min(1, n - 1 - d)),
  }
}

/** Card offsets down the rail: products of look 0, then look 1, and so on. */
export function railStops(counts: number[], cardH: number, gap: number): { tops: number[]; groups: number[]; total: number } {
  const tops: number[] = []
  const groups: number[] = []
  let y = 0
  for (const c of counts) {
    groups.push(y)
    for (let j = 0; j < c; j++) {
      tops.push(y)
      y += cardH + gap
    }
  }
  return { tops, groups, total: y }
}

/** How far the rail has scrolled at position `pos`, gliding between groups. */
export function railScroll(pos: number, groups: number[], total: number): number {
  const n = groups.length
  if (!n) return 0
  const lap = Math.floor(pos / n)
  const p = pos - lap * n
  const i = Math.floor(p)
  const t = p - i
  const from = groups[i]
  const to = i + 1 < n ? groups[i + 1] : total
  return lap * total + from + (to - from) * t
}

/** Wrap a card's offset into [-span, total - span) so the rail never runs dry. */
export function wrapOffset(y: number, total: number, span: number): number {
  if (total <= 0) return y
  return ((((y + span) % total) + total) % total) - span
}

/** Card steps along the section. Looping, it runs one look past the last, back to the first. */
export function spans(count: number, loop: boolean): number {
  return Math.max(0, loop ? count : count - 1)
}

/** The position for a scroll progress (0-1) after `laps` trips through the section. */
export function positionAt(progress: number, laps: number, steps: number): number {
  return (progress + laps) * steps
}
// #endregion

const FONT = "rwl-display"

const CSS =
  ".rwl-track{position:relative;background:var(--color-background);color:var(--color-foreground)}" +
  ".rwl-pin{position:sticky;top:0;display:flex;flex-direction:column;overflow:hidden;background:var(--color-background)}" +
  ".rwl-cap{font-family:" + FONT + ",'Lexend Zetta',ui-sans-serif,system-ui,sans-serif;text-transform:uppercase}" +
  ".rwl-head{flex:none;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(16px,3.4vw,44px);height:clamp(48px,6.4vh,64px)}" +
  ".rwl-brand{font-size:11px;font-weight:600;letter-spacing:.06em;white-space:nowrap}" +
  ".rwl-lnk{appearance:none;background:none;border:0;margin:0;padding:0;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;text-decoration:none;cursor:pointer;white-space:nowrap;transition:color .25s ease,opacity .25s ease}" +
  ".rwl-lnk:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px;border-radius:2px}" +
  ".rwl-tabs{display:flex;align-items:center;gap:clamp(16px,2.2vw,34px);font-size:clamp(11px,1vw,14px);font-weight:600;letter-spacing:.05em}" +
  ".rwl-tabs .rwl-lnk{color:color-mix(in oklab,var(--color-muted-foreground) 50%,transparent)}" +
  ".rwl-tabs .rwl-lnk:hover,.rwl-tabs .rwl-lnk[aria-current]{color:var(--color-foreground)}" +
  ".rwl-util{justify-self:end;display:flex;align-items:center;gap:14px;font-size:9px;font-weight:600;letter-spacing:.08em;white-space:nowrap}" +
  ".rwl-util .rwl-lnk{display:inline-flex;align-items:center;gap:6px;color:var(--color-foreground)}" +
  ".rwl-util .rwl-lnk:hover{opacity:.55}" +
  ".rwl-util svg{width:14px;height:14px;display:block}" +
  ".rwl-badge{display:inline-grid;place-items:center;min-width:15px;height:15px;padding:0 4px;border-radius:999px;font-size:8px;letter-spacing:0;" +
  "background:var(--color-foreground);color:var(--color-background)}" +
  ".rwl-nav{flex:none;display:flex;justify-content:center;gap:clamp(22px,3.6vw,56px);padding:2px 16px 0;font-size:9px;font-weight:600;letter-spacing:.1em;white-space:nowrap;" +
  "overflow-x:auto;scrollbar-width:none;border-bottom:1px solid color-mix(in oklab,var(--color-border) 70%,transparent)}" +
  ".rwl-nav::-webkit-scrollbar{display:none}" +
  ".rwl-nav .rwl-lnk{position:relative;flex:none;padding:6px 0 13px;color:var(--color-muted-foreground)}" +
  ".rwl-nav .rwl-lnk::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:currentColor;transform:scaleX(0);transition:transform .35s cubic-bezier(.2,.7,.2,1)}" +
  ".rwl-nav .rwl-lnk:hover,.rwl-nav .rwl-lnk[aria-current]{color:var(--color-foreground)}" +
  ".rwl-nav .rwl-lnk:hover::after,.rwl-nav .rwl-lnk[aria-current]::after{transform:scaleX(1)}" +
  "@media (prefers-reduced-motion:reduce){.rwl-lnk,.rwl-nav .rwl-lnk::after{transition:none}}" +
  ".rwl-body{position:relative;flex:1;min-height:0;display:flex}" +
  ".rwl-stage{position:relative;flex:1;min-width:0;overflow:hidden;cursor:default;" +
  "background:linear-gradient(90deg,color-mix(in oklab,var(--color-foreground) 3%,var(--color-background)),color-mix(in oklab,var(--color-foreground) 6.5%,var(--color-background)) 62%,color-mix(in oklab,var(--color-foreground) 4.5%,var(--color-background)))}" +
  ".rwl-fig{position:absolute;left:0;top:0;width:0;height:0;will-change:transform,filter,opacity;transform-origin:0 0}" +
  ".rwl-fig>img{position:absolute;bottom:0;left:0;width:auto;max-width:none;transform:translateX(-50%);pointer-events:none;user-select:none}" +
  ".rwl-fig>i{position:absolute;left:0;bottom:-1px;transform:translate(-50%,50%);border-radius:50%;pointer-events:none;" +
  "background:radial-gradient(closest-side,color-mix(in oklab,var(--color-foreground) 22%,transparent),transparent)}" +
  ".rwl-hit{position:absolute;bottom:0;left:0;transform:translateX(-50%);background:none;border:0;padding:0;cursor:pointer;border-radius:4px}" +
  ".rwl-hit:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px}" +
  ".rwl-copy{position:absolute;left:clamp(16px,3.4vw,44px);top:clamp(20px,4.5vh,44px);z-index:500;max-width:min(440px,52%);pointer-events:none}" +
  ".rwl-title{margin:0 0 16px;font-size:clamp(15px,1.5vw,22px);font-weight:300;letter-spacing:.08em;line-height:1.2}" +
  ".rwl-blurb{margin:0;max-width:300px;font-size:clamp(10px,.82vw,12px);line-height:1.65;color:var(--color-muted-foreground)}" +
  ".rwl-foot{position:absolute;left:clamp(16px,3.4vw,44px);bottom:clamp(20px,4.5vh,40px);z-index:500}" +
  ".rwl-look{margin:0;display:flex;align-items:flex-end;gap:.55em;font-size:clamp(18px,2vw,30px);font-weight:400;letter-spacing:.1em;line-height:1}" +
  ".rwl-look>span:first-child{line-height:1.15em}" +
  ".rwl-num{display:flex;font-variant-numeric:tabular-nums}" +
  ".rwl-dg{display:block;overflow:hidden;height:1.15em;line-height:1.15em}" +
  ".rwl-dg>span{display:block}" +
  ".rwl-shop{margin-top:12px;display:inline-block;background:none;border:0;padding:0 0 1px;color:var(--color-foreground);cursor:pointer;" +
  "font-size:8px;font-weight:600;letter-spacing:.06em;border-bottom:1px solid currentColor}" +
  ".rwl-shop:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}" +
  ".rwl-rail{position:relative;flex:none;width:24%;min-width:200px;max-width:340px;overflow:hidden;background:var(--color-background)}" +
  ".rwl-card{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;padding:14px 16px 14px;will-change:transform}" +
  ".rwl-card[data-tint]{background:color-mix(in oklab,var(--color-foreground) 4%,var(--color-background))}" +
  ".rwl-heart{width:13px;height:13px;flex:none}" +
  ".rwl-pic{position:relative;flex:1;min-height:0;overflow:hidden;margin:6px 16% 14px}" +
  ".rwl-pic>img{position:absolute;left:50%;max-width:none;width:auto;pointer-events:none;user-select:none}" +
  ".rwl-meta{display:grid;grid-template-columns:1fr auto;align-items:end;gap:4px 10px}" +
  ".rwl-pname{font-size:8px;font-weight:600;letter-spacing:.05em;line-height:1.5}" +
  ".rwl-price{grid-column:1;font-size:9px;letter-spacing:.06em;color:var(--color-muted-foreground)}" +
  ".rwl-plus{grid-row:1/3;grid-column:2;width:12px;height:12px;color:var(--color-muted-foreground)}" +
  ".rwl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}" +
  ".rwl-track[data-narrow] .rwl-tabs,.rwl-track[data-narrow] .rwl-rail,.rwl-track[data-narrow] .rwl-login,.rwl-track[data-narrow] .rwl-wish{display:none}" +
  ".rwl-track[data-narrow] .rwl-nav{justify-content:flex-start;gap:26px;padding:2px 20px 0;" +
  "mask-image:linear-gradient(90deg,transparent,#000 20px,#000 calc(100% - 28px),transparent)}" +
  ".rwl-track[data-narrow] .rwl-head{grid-template-columns:1fr auto}" +
  ".rwl-track[data-narrow] .rwl-copy{max-width:62%}"

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
const Heart = (p: { className?: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className={p.className} {...icon}>
    <path d="M8 13.4S2.2 9.9 2.2 6.1A2.9 2.9 0 0 1 8 4.8a2.9 2.9 0 0 1 5.8 1.3C13.8 9.9 8 13.4 8 13.4Z" />
  </svg>
)

const labelOf = (l: RunwayLink) => (typeof l === "string" ? l : l.label)

/** A header link: an anchor when it has an `href`, otherwise a button. */
function NavLink({ link, current, onPress }: { link: RunwayLink; current: boolean; onPress: () => void }) {
  const href = typeof link === "string" ? undefined : link.href
  const label = labelOf(link)
  if (href)
    return (
      <a className="rwl-lnk" href={href} aria-current={current ? "page" : undefined}>
        {label}
      </a>
    )
  return (
    <button type="button" className="rwl-lnk" aria-current={current ? "page" : undefined} onClick={onPress}>
      {label}
    </button>
  )
}

/** One digit of the look number; when it changes the new one rolls up from below. */
function Digit({ ch, reduced }: { ch: string; reduced: boolean }) {
  const ref = React.useRef(null as HTMLSpanElement | null)
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (reduced || !ref.current) return
    const tw = gsap.fromTo(ref.current, { yPercent: 105 }, { yPercent: 0, duration: 0.55, ease: "power3.out" })
    return () => void tw.kill()
  }, [ch, reduced])
  return (
    <span className="rwl-dg">
      <span ref={ref}>{ch}</span>
    </span>
  )
}

export default function RunwayLookbook({
  looks,
  height = "100svh",
  brand = "Maison Halden",
  tabs = ["Runway", "The House", "Atelier"],
  activeTab = 0,
  nav = ["Collections", "Clothing", "Lookbook", "Beauty", "Accessories", "The Edit"],
  activeNav = 2,
  onNavigate,
  title = "Spring Summer 2026",
  blurb = "Cut close and finished by hand. Every piece in the collection is made in our own workshop, in runs small enough to keep each one exact.",
  firstNumber = 1,
  ctaLabel = "Shop the look",
  onShopLook,
  cartCount = 0,
  rail = true,
  scrollPerLook = 0.55,
  loop = true,
  fontSrc = null,
  onIndexChange,
  ariaLabel = "Runway lookbook",
  className = "",
  loginLabel = "Login",
  cartLabel = "Cart",
  lookLabel = "Look",
  caption,
  onCardClick,
}: RunwayLookbookProps) {
  const count = looks.length
  const trackRef = React.useRef(null as HTMLDivElement | null)
  const stageRef = React.useRef(null as HTMLDivElement | null)
  const railRef = React.useRef(null as HTMLDivElement | null)
  const figRefs = React.useRef([] as (HTMLDivElement | null)[])
  const cardRefs = React.useRef([] as (HTMLDivElement | null)[])
  const pos = React.useRef({ v: 0 })
  const st = React.useRef(null as ScrollTrigger | null)
  const size = React.useRef({ w: 1, h: 1, railH: 1, narrow: false })
  const [index, setIndex] = React.useState(0)
  const [narrow, setNarrow] = React.useState(false)
  const [reduced, setReduced] = React.useState(false)
  const onIndexRef = React.useRef(onIndexChange)
  onIndexRef.current = onIndexChange

  const cards = React.useMemo(() => {
    const out: { look: number; j: number; p: RunwayProduct; src: string }[] = []
    looks.forEach((lk, look) => (lk.products ?? []).forEach((p, j) => out.push({ look, j, p, src: p.src ?? lk.src })))
    return out
  }, [looks])
  const counts = React.useMemo(() => looks.map((lk) => (lk.products ?? []).length), [looks])

  const render = React.useCallback(() => {
    const { w, h, railH, narrow: nar } = size.current
    const p = pos.current.v
    for (let i = 0; i < count; i++) {
      const el = figRefs.current[i]
      if (!el) continue
      const d = offsetOf(i, p, count)
      const q = pose(d, w, h, count, nar)
      el.style.transform =
        "translate3d(" + q.x.toFixed(2) + "px," + q.y.toFixed(2) + "px,0) scale(" + q.scale.toFixed(4) + ")"
      el.style.filter = q.blur > 0.15 ? "blur(" + (q.blur / q.scale).toFixed(2) + "px)" : "none"
      el.style.opacity = q.alpha.toFixed(3)
      el.style.visibility = q.alpha < 0.01 || q.x > w * 1.6 ? "hidden" : "visible"
      el.style.zIndex = String(Math.round(400 - d * 40))
      el.toggleAttribute("data-front", Math.abs(d) < 0.5)
    }
    // The rail glides from one look's pieces to the next.
    const cardH = Math.max(150, railH * 0.47)
    const gap = 4
    const stops = railStops(counts, cardH, gap)
    const scroll = railScroll(p, stops.groups, stops.total)
    for (let c = 0; c < cards.length; c++) {
      const el = cardRefs.current[c]
      if (!el) continue
      const y = wrapOffset(stops.tops[c] - scroll, stops.total, cardH + gap)
      el.style.height = cardH + "px"
      el.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)"
    }
    const now = wrapIndex(p, count)
    setIndex((prev) => (prev === now ? prev : now))
  }, [count, counts, cards.length])

  React.useEffect(() => {
    onIndexRef.current?.(index)
  }, [index])

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  // Size: the queue is laid out in fractions of the stage.
  React.useEffect(() => {
    const el = stageRef.current
    const track = trackRef.current
    if (!el || !track) return
    const ro = new ResizeObserver(() => {
      // Celular y tablet: una prenda centrada, sin la columna de productos.
      const isNarrow = track.clientWidth < 900
      setNarrow(isNarrow)
      size.current = { w: el.clientWidth, h: el.clientHeight, railH: railRef.current?.clientHeight ?? el.clientHeight, narrow: isNarrow }
      const base = pose(0, el.clientWidth, el.clientHeight, Infinity, isNarrow).base
      for (const f of figRefs.current) {
        if (!f) continue
        const img = f.firstElementChild as HTMLImageElement | null
        if (img) img.style.height = base + "px"
        const shadow = f.children[1] as HTMLElement | undefined
        if (shadow) {
          shadow.style.width = base * 0.36 + "px"
          shadow.style.height = base * 0.035 + "px"
        }
        const hit = f.children[2] as HTMLElement | undefined
        if (hit) {
          hit.style.height = base + "px"
          hit.style.width = base * 0.3 + "px"
        }
      }
      render()
    })
    ro.observe(el)
    ro.observe(track)
    return () => ro.disconnect()
  }, [render])

  // The page scroll walks the queue; letting go settles on the nearest look.
  const steps = spans(count, loop)
  React.useEffect(() => {
    const track = trackRef.current
    if (!track || count < 2) return
    let laps = 0
    let target = 0
    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      snap: reduced ? undefined : { snapTo: 1 / steps, duration: { min: 0.45, max: 1.1 }, delay: 0.1, ease: "power2.inOut" },
      onUpdate: (self) => {
        // Looping: the bottom of the section looks like its top, so jump there unseen.
        if (loop && self.progress >= 1 && self.direction > 0) {
          laps += 1
          self.scroll(self.start + 1)
          return
        }
        target = positionAt(self.progress, laps, steps)
      },
    })
    // At the very top there is no scroll left to fire onUpdate, so a wheel up wraps.
    const onWheel = (e: WheelEvent) => {
      if (!loop || e.deltaY >= 0 || trigger.scroll() > trigger.start + 1) return
      const r = track.getBoundingClientRect()
      if (r.top > 1 || r.bottom < window.innerHeight - 1) return
      laps -= 1
      trigger.scroll(trigger.end - 1)
    }
    window.addEventListener("wheel", onWheel, { passive: true })
    target = positionAt(trigger.progress, 0, steps)
    pos.current.v = target
    const tick = (_t: number, dt: number) => {
      const p = pos.current.v
      const next = reduced ? target : p + (target - p) * (1 - Math.exp(-dt / 160))
      if (Math.abs(next - p) < 1e-4 && next === target) return
      pos.current.v = Math.abs(target - next) < 1e-4 ? target : next
      render()
    }
    gsap.ticker.add(tick)
    st.current = trigger
    render()
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener("wheel", onWheel)
      trigger.kill()
      st.current = null
    }
  }, [count, steps, loop, reduced, render])

  /** Scroll so look `i` stands at the front. */
  const bringForward = (i: number) => {
    const s = st.current
    if (!s || !steps) return
    let k = i
    if (loop && i < index) k = i + count
    const top = s.start + (Math.min(k, steps) / steps) * (s.end - s.start)
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" })
  }

  const number = String(firstNumber + index)
  const look = looks[index]
  return (
    <div
      ref={trackRef}
      className={"rwl-track " + className}
      data-narrow={narrow ? "" : undefined}
      style={{ height: "calc(" + height + " * " + (1 + steps * scrollPerLook) + ")" }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <style>
        {(fontSrc ? "@font-face{font-family:" + FONT + ";src:url(" + fontSrc + ") format('woff2');font-weight:200 600;font-display:swap}" : "") + CSS}
      </style>
      <div className="rwl-pin" style={{ height }}>
        <header className="rwl-head rwl-cap">
          <span className="rwl-brand">{brand}</span>
          <nav className="rwl-tabs" aria-label="Sections">
            {tabs.map((t, i) => (
              <NavLink key={i} link={t} current={i === activeTab} onPress={() => onNavigate?.({ kind: "tab", index: i, label: labelOf(t) })} />
            ))}
          </nav>
          <div className="rwl-util">
            <button type="button" className="rwl-lnk rwl-login" onClick={() => onNavigate?.({ kind: "login" })}>
              {loginLabel}
            </button>
            <button type="button" className="rwl-lnk" aria-label="Search" onClick={() => onNavigate?.({ kind: "search" })}>
              <svg viewBox="0 0 16 16" aria-hidden="true" {...icon}>
                <circle cx="7" cy="7" r="4.3" />
                <path d="m10.2 10.2 3.3 3.3" />
              </svg>
            </button>
            <button type="button" className="rwl-lnk rwl-wish" aria-label="Wishlist" onClick={() => onNavigate?.({ kind: "wishlist" })}>
              <Heart />
            </button>
            <button
              type="button"
              className="rwl-lnk"
              aria-label={cartLabel + ", " + cartCount}
              onClick={() => onNavigate?.({ kind: "cart" })}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" {...icon}>
                <path d="M3.2 5.5h9.6l-.7 8H3.9Z" />
                <path d="M5.8 5.5V4.4a2.2 2.2 0 0 1 4.4 0v1.1" />
              </svg>
              <span aria-hidden="true">{cartLabel}</span>
              {cartCount > 0 ? (
                <span className="rwl-badge" aria-hidden="true">
                  {cartCount}
                </span>
              ) : (
                <span aria-hidden="true">(0)</span>
              )}
            </button>
          </div>
        </header>
        <nav className="rwl-nav rwl-cap" aria-label="Categories">
          {nav.map((t, i) => (
            <NavLink key={i} link={t} current={i === activeNav} onPress={() => onNavigate?.({ kind: "nav", index: i, label: labelOf(t) })} />
          ))}
        </nav>
        <div className="rwl-body">
          <div ref={stageRef} className="rwl-stage">
            <div className="rwl-copy">
              <h2 className="rwl-title rwl-cap">{title}</h2>
              {blurb && <p className="rwl-blurb">{blurb}</p>}
            </div>
            {looks.map((lk, i) => (
              <div
                key={i}
                ref={(el) => {
                  figRefs.current[i] = el
                }}
                className="rwl-fig"
              >
                <img src={lk.src} alt={lk.alt ?? ""} draggable={false} decoding="async" />
                <i />
                <button
                  type="button"
                  className="rwl-hit"
                  tabIndex={i === index ? -1 : 0}
                  aria-label={lookLabel + " " + (firstNumber + i) + (lk.alt ? ": " + lk.alt : "")}
                  onClick={() => bringForward(i)}
                />
              </div>
            ))}
            <div className="rwl-foot">
              <p className="rwl-look rwl-cap" aria-hidden="true">
                <span>{lookLabel}</span>
                <span className="rwl-num">
                  {number.split("").map((ch, i) => (
                    <Digit key={number.length + "-" + i} ch={ch} reduced={reduced} />
                  ))}
                </span>
              </p>
              {caption?.(index)}
              <button type="button" className="rwl-shop rwl-cap" onClick={() => onShopLook?.(index)}>
                {ctaLabel}
              </button>
            </div>
          </div>
          {rail && cards.length > 0 && (
            <div ref={railRef} className="rwl-rail" aria-label={lookLabel + " " + number}>
              {cards.map((c, k) => {
                const crop = c.p.crop ?? { top: 0, bottom: 1 }
                const span = Math.max(0.05, crop.bottom - crop.top)
                return (
                  <div
                    key={k}
                    ref={(el) => {
                      cardRefs.current[k] = el
                    }}
                    className="rwl-card"
                    data-tint={c.j % 2 === 0 ? "" : undefined}
                    aria-hidden={c.look !== index}
                    onClick={onCardClick ? () => onCardClick(c.look, c.j) : undefined}
                    style={onCardClick ? { cursor: "pointer" } : undefined}
                  >
                    <Heart className="rwl-heart" />
                    <div className="rwl-pic">
                      <img
                        src={c.src}
                        alt=""
                        draggable={false}
                        decoding="async"
                        style={{
                          height: (100 / span).toFixed(3) + "%",
                          top: ((-crop.top / span) * 100).toFixed(3) + "%",
                          transform: "translateX(" + (-(crop.x ?? 0.5) * 100).toFixed(2) + "%)",
                        }}
                      />
                    </div>
                    <div className="rwl-meta">
                      <span className="rwl-pname rwl-cap">{c.p.name}</span>
                      <span className="rwl-price">{c.p.price}</span>
                      <svg className="rwl-plus" viewBox="0 0 16 16" aria-hidden="true" {...icon}>
                        <path d="M8 2.5v11M2.5 8h11" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <p className="rwl-sr" aria-live="polite">
          {count ? lookLabel + " " + number + " / " + count + (look?.alt ? ": " + look.alt : "") : ""}
        </p>
      </div>
    </div>
  )
}
