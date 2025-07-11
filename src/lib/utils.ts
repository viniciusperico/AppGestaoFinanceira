import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * `cn` é uma função utilitária que combina e mescla classes CSS do Tailwind.
 * Ela usa `clsx` para lidar com classes condicionais e `tailwind-merge` para
 * resolver conflitos em classes do Tailwind de forma inteligente.
 *
 * @param {...ClassValue[]} inputs - Uma lista de nomes de classe ou objetos de classe condicionais.
 * @returns {string} A string de classes combinada e mesclada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
