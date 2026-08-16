"use client"
import React, { useEffect, useState } from 'react'

export default function VersionChecker() {
  const [remote, setRemote] = useState<string | null>(null)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const v = json?.version || null
        if (!mounted) return
        setRemote(v)
        const local = localStorage.getItem('app_version')
        if (!local && v) localStorage.setItem('app_version', v)
        if (local && v && local !== v) setStale(true)
      } catch (e) {
        // ignore
      }
    }

    check()
    const id = setInterval(check, 60_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const doReload = () => {
    try {
      // update local version and hard reload
      if (remote) localStorage.setItem('app_version', remote)
      // normal reload; instruct user to hard-refresh if service-worker or aggressive cache interferes
      window.location.reload()
    } catch (e) {
      window.location.href = window.location.href
    }
  }

  if (!stale) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-amber-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-3">
        <div className="text-sm">A new version of the app is available.</div>
        <button onClick={doReload} className="bg-white text-amber-600 px-3 py-1 rounded text-sm font-semibold">Reload</button>
        <button onClick={() => localStorage.setItem('app_version', remote || '') && setStale(false)} className="text-white/90 text-xs underline">Dismiss</button>
      </div>
    </div>
  )
}
