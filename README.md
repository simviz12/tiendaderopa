# Viper Store

Tienda online: catálogo, bolsa de compras, pedidos por WhatsApp y panel `/admin` para manejar las prendas.

## Publicar en Vercel (una sola vez)

1. Entra a [vercel.com](https://vercel.com), inicia sesión con GitHub y toca **Add New → Project**.
2. Elige el repositorio **tiendaderopa** y toca **Deploy** (Vercel detecta todo solo).
3. **Base de datos** (para que lo que guardes en el admin lo vean todos):
   en el proyecto → pestaña **Storage** → **Create Database** → **Upstash for Redis** (plan gratis) → conéctala al proyecto.
4. **Fotos** (para subir fotos desde el admin):
   **Storage** → **Create** → **Blob** → conéctalo al proyecto.
5. **PIN del admin**: **Settings → Environment Variables** → agrega
   `ADMIN_PIN` = el PIN que quieras (mínimo 6 números, no lo compartas).
6. **Deployments** → en el último, menú `⋯` → **Redeploy** (para que tome los cambios).

Listo: entra a `tu-sitio.vercel.app/admin`. Debe decir **“Conectado a la base de datos”**.
Si dice “Modo local”, falta el paso 3 o el 6.

## Usar el panel

- `/admin` → escribe el PIN.
- **Nueva prenda** → nombre, precio, tallas, colores y fotos de cada color → **Publicar prenda**.
- Los cambios se publican **solo cuando tocas Guardar / Publicar**, y en ese momento los ve todo el mundo.
- Marca tallas o colores como **agotados** sin borrar la prenda.

## Configuración

`src/config.ts`: número de WhatsApp que recibe los pedidos, Instagram y nombre de la tienda.
El PIN **no** va en el código: es la variable `ADMIN_PIN` de Vercel.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173  (sin base de datos: el admin guarda en el navegador, PIN de prueba 1234)
npm run build
```

Estructura: `api/` funciones del servidor (catálogo, login, subida de fotos) · `src/lib/api.ts` conexión con el servidor · `src/lib/store.ts` datos, bolsa y mensaje de WhatsApp · `src/admin/` panel.
