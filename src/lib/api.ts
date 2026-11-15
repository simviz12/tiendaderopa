import { useSyncExternalStore } from "react"
import { catalogStore, type Product } from "./store"

/**
 * Conexión con el servidor (funciones de Vercel en /api).
 * - "remote": hay base de datos; lo que el admin guarda lo ven todos.
 * - "local": no hay servidor (p. ej. `npm run dev`); los cambios quedan en este navegador.
 */
export type Mode = "loading" | "remote" | "local"

let mode: Mode = "loading"
const listeners = new Set<() => void>()
const setMode = (m: Mode) => {
  mode = m
  listeners.forEach((l) => l())
}
export const useMode = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => void listeners.delete(l)
    },
    () => mode,
  )

const PIN_KEY = "viper.admin.pin"
const getPin = () => sessionStorage.getItem(PIN_KEY) || ""
export const hasSession = () => Boolean(getPin())
export const logout = () => sessionStorage.removeItem(PIN_KEY)

class ApiError extends Error {}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, { ...init, headers: { "x-admin-pin": getPin(), ...(init.headers || {}) } })
  } catch {
    throw new ApiError("Sin conexión. Revisa tu internet e inténtalo de nuevo.")
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(data?.error || `Error del servidor (${res.status}).`)
  return data as T
}

/** Trae el catálogo publicado. Se llama una vez al abrir la página. */
let synced: Promise<void> | null = null
export function syncCatalog() {
  synced ??= (async () => {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" })
      const type = res.headers.get("content-type") || ""
      if (!res.ok || !type.includes("application/json")) return setMode("local")
      const data = (await res.json()) as { configured: boolean; products: Product[] | null }
      if (!data.configured) return setMode("local")
      if (Array.isArray(data.products)) catalogStore.set(data.products)
      setMode("remote")
    } catch {
      setMode("local")
    }
  })()
  return synced
}

/** Entra al panel. En modo local (solo desarrollo) acepta el PIN de prueba. */
export async function login(pin: string): Promise<{ database: boolean; uploads: boolean }> {
  await syncCatalog()
  if (mode === "local") {
    const devPin = import.meta.env.VITE_DEV_ADMIN_PIN || "1234"
    if (!import.meta.env.DEV) throw new ApiError("El servidor no está configurado todavía. Revisa el README (variables de Vercel).")
    if (pin !== devPin) throw new ApiError("PIN incorrecto.")
    sessionStorage.setItem(PIN_KEY, pin)
    return { database: false, uploads: false }
  }
  sessionStorage.setItem(PIN_KEY, pin)
  try {
    return await call("/api/login", { method: "POST" })
  } catch (e) {
    logout()
    throw e
  }
}

/** Guarda el catálogo completo. En modo remoto lo publica para todos. */
export async function saveCatalog(next: Product[]) {
  await syncCatalog()
  if (mode === "remote") {
    await call("/api/catalog", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ products: next }) })
    catalogStore.set(next)
    return
  }
  if (!catalogStore.set(next)) throw new ApiError("El navegador se quedó sin espacio. Usa enlaces de fotos en vez de subirlas.")
}

/** Reduce la foto en el navegador (más liviana y rápida de cargar). */
function shrink(file: File, max = 1200): Promise<Blob> {
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
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.82)
    }
    img.onerror = () => reject(new ApiError("No pudimos leer esa foto. Prueba con otra."))
    img.src = url
  })
}

/** Sube una foto y devuelve el enlace que se guarda en el producto. */
export async function uploadImage(file: File): Promise<string> {
  const blob = await shrink(file)
  if (mode === "remote") {
    const { url } = await call<{ url: string }>("/api/upload", { method: "POST", headers: { "content-type": "image/jpeg" }, body: blob })
    return url
  }
  return await new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.readAsDataURL(blob)
  })
}
