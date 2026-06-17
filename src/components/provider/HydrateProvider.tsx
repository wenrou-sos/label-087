'use client'

import { useEffect } from 'react'
import { useFireCommandStore } from '@/store'

export function HydrateProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useFireCommandStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <>{children}</>
}
