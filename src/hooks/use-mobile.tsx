"use client"; // Add 'use client' directive

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
     // Check if window is defined (runs only on client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Add listener
    mql.addEventListener("change", onChange)

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile // Return potentially undefined during initial server render/hydration
}
