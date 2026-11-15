import { put } from "@vercel/blob"
import { json, requireAdmin } from "./_lib.js"

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const MAX_BYTES = 4 * 1024 * 1024

/** POST /api/upload → sube una foto a Vercel Blob y devuelve su enlace público. */
export async function POST(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: "Falta conectar Vercel Blob para subir fotos." }, 503)

  const type = (req.headers.get("content-type") || "").split(";")[0].trim()
  const ext = TYPES[type]
  if (!ext) return json({ error: "Solo se aceptan fotos JPG, PNG o WebP." }, 415)

  const body = await req.arrayBuffer()
  if (!body.byteLength) return json({ error: "La foto llegó vacía." }, 400)
  if (body.byteLength > MAX_BYTES) return json({ error: "La foto pesa más de 4 MB." }, 413)

  const blob = await put(`productos/foto.${ext}`, body, { access: "public", contentType: type, addRandomSuffix: true })
  return json({ url: blob.url })
}
