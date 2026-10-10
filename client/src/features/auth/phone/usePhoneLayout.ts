import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // 1. User Agent detection (primary - detecta celulares reales)
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile'
  ]
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))
  
  // 2. Viewport detection (secondary - para viewports pequeños)
  const isMobileViewport = window.innerWidth < 768
  
  // 3. Touch detection (tertiary)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Retorna true si CUALQUIERA de las condiciones se cumple
  return isMobileUA || isMobileViewport || isTouchDevice
}

export function usePhoneLayout(): boolean {
  const [phone, setPhone] = useState(() => isMobileDevice())

  useEffect(() => {
    const checkMobile = () => setPhone(isMobileDevice())
    
    // Check on mount
    checkMobile()
    
    // Listen for viewport changes
    const media = window.matchMedia(QUERY)
    const sync = () => checkMobile()
    media.addEventListener('change', sync)
    
    // Listen for resize (additional safety)
    window.addEventListener('resize', sync)
    
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return phone
}
