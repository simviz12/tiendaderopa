import { useSyncExternalStore } from "react"
import { Check } from "lucide-react"

type Toast = { id: number; text: string; action?: { label: string; run: () => void } }
let current: Toast | null = null
let timer = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

export function toast(text: string, action?: Toast["action"]) {
  current = { id: Date.now(), text, action }
  emit()
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    current = null
    emit()
  }, 3200)
}

export function Toaster() {
  const t = useSyncExternalStore(subscribe, () => current)
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {t && (
        <div key={t.id} className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-muted py-3 pl-4 pr-3 text-sm shadow-2xl">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className="min-w-0 flex-1">{t.text}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action!.run()
                current = null
                emit()
              }}
              className="shrink-0 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
            >
              {t.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
