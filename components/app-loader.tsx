'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function AppLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)

  // Hide after full window load (initial nav)
  useEffect(() => {
    let fallback: number | undefined
    const onLoad = () => {
      // small delay so components have time to paint
      fallback = window.setTimeout(() => setVisible(false), 120)
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad)
      // fallback in case 'load' doesn't fire
      fallback = window.setTimeout(() => setVisible(false), 2000)
    }

    return () => {
      window.removeEventListener("load", onLoad)
      if (fallback) window.clearTimeout(fallback)
    }
  }, [])

  // Show briefly on client navigation, then hide after content renders
  useEffect(() => {
    // show immediately so users see transition
    setVisible(true)
    const id = window.setTimeout(() => setVisible(false), 300)
    return () => window.clearTimeout(id)
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm pointer-events-auto"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src="/images/lyra-logo.png"
          alt="Lyra"
          className="h-12 w-12 rounded-full object-cover motion-safe:animate-spin"
        />
        <div className="text-xs font-medium text-emerald-500">Loading…</div>
      </div>
    </div>
  )
}