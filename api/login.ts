import { db, json, requireAdmin } from "./_lib.js"

/** POST /api/login → comprueba el PIN y cuenta qué está configurado en Vercel. */
export async function POST(req: Request) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  return json({
    ok: true,
    database: Boolean(db()),
    uploads: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  })
}
