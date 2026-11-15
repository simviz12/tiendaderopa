import { CATALOG_KEY, db, json, requireAdmin, validateCatalog } from "./_lib.js"

/** GET /api/catalog → el catálogo publicado (o null si aún no se ha guardado nada). */
export async function GET() {
  const r = db()
  if (!r) return json({ configured: false, products: null })
  const products = await r.get(CATALOG_KEY)
  return json({ configured: true, products: products ?? null })
}

/** PUT /api/catalog → guarda el catálogo completo. Requiere el PIN de admin. */
export async function PUT(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const r = db()
  if (!r) return json({ error: "Falta conectar la base de datos (Upstash Redis) en Vercel." }, 503)

  const raw = await req.text()
  if (raw.length > 900_000) return json({ error: "El catálogo es demasiado grande." }, 413)
  let body: { products?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Datos inválidos." }, 400)
  }
  const problem = validateCatalog(body.products)
  if (problem) return json({ error: problem }, 400)

  await r.set(CATALOG_KEY, body.products)
  return json({ ok: true })
}
