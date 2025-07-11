import * as React from "react"

/**
 * Ponto de quebra para dispositivos móveis em pixels.
 */
const MOBILE_BREAKPOINT = 768

/**
 * `useIsMobile` é um hook personalizado que detecta se a largura da viewport atual
 * é considerada "móvel" com base em um ponto de quebra predefinido.
 * Ele retorna `undefined` durante a renderização no lado do servidor e a renderização inicial no cliente,
 * e depois um valor booleano.
 *
 * @returns {boolean} `true` se a largura da viewport for menor que o ponto de quebra móvel, `false` caso contrário.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Define o estado inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
