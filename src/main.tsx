import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import Admin from "./admin/Admin"
import "./index.css"

/** El panel vive en /admin (o #/admin en hostings estáticos sin rutas). */
const isAdmin = () => /\/admin\/?$/.test(location.pathname) || location.hash.startsWith("#/admin")

function Root() {
  const [admin, setAdmin] = useState(isAdmin)
  useEffect(() => {
    const on = () => setAdmin(isAdmin())
    window.addEventListener("hashchange", on)
    window.addEventListener("popstate", on)
    return () => {
      window.removeEventListener("hashchange", on)
      window.removeEventListener("popstate", on)
    }
  }, [])
  return admin ? <Admin /> : <App />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
