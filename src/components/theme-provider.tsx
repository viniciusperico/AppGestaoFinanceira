"use client"

import * as React from "react"

/**
 * Define os possíveis valores de tema.
 */
type Theme = "dark" | "light" | "system"

/**
 * Props para o componente `ThemeProvider`.
 */
type ThemeProviderProps = {
  children: React.ReactNode
  /** O tema padrão a ser usado. */
  defaultTheme?: Theme
  /** A chave a ser usada para armazenar o tema no localStorage. */
  storageKey?: string
}

/**
 * A forma do estado do provedor de tema.
 */
type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

/**
 * `ThemeProvider` é um componente que fornece o estado do tema e uma função para atualizá-lo.
 * Ele lida com a troca de temas (claro, escuro, sistema) e persiste a escolha no localStorage.
 *
 * @param {ThemeProviderProps} props - As props do componente.
 * @returns {JSX.Element} O componente provedor de tema.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Retorna o tema padrão no servidor.
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    // Obtém o tema do localStorage no cliente.
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    let effectiveTheme = theme
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    root.classList.add(effectiveTheme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Hook personalizado para acessar o contexto de tema.
 * Lança um erro se for usado fora de um `ThemeProvider`.
 *
 * @returns {ThemeProviderState} O valor do contexto de tema.
 */
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
