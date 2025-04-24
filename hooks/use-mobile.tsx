"use client"

import { useState, useEffect } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificação inicial
    checkIsMobile()

    // Adicionar event listener
    window.addEventListener("resize", checkIsMobile)

    // Limpar
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
