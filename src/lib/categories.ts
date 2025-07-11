
/**
 * @file Este arquivo define as categorias padrão para a aplicação.
 * Essas categorias estão disponíveis para todos os usuários por padrão e não podem ser excluídas.
 */

import type { IconName } from "./icon-map";

/**
 * Representa a estrutura de um objeto de categoria padrão.
 */
export interface DefaultCategory {
  /** Um identificador único para a categoria. */
  id: string;
  /** O nome de exibição da categoria. */
  name: string;
  /** O nome do ícone lucide-react associado à categoria. */
  icon: IconName;
}

/**
 * Um array de categorias padrão fornecidas a todos os usuários.
 * Elas servem como um ponto de partida para organizar as transações.
 */
export const defaultCategories: DefaultCategory[] = [
  { id: 'moradia', name: 'Moradia', icon: 'Home' },
  { id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed' },
  { id: 'transporte', name: 'Transporte', icon: 'Car' },
  { id: 'lazer', name: 'Lazer', icon: 'Smile' },
  { id: 'saude', name: 'Saúde', icon: 'HeartPulse' },
  { id: 'compras', name: 'Compras', icon: 'ShoppingBag' },
  { id: 'salario', name: 'Salário', icon: 'DollarSign' },
  { id: 'recorrente', name: 'Recorrente', icon: 'Repeat' },
  { id: 'outros', name: 'Outros', icon: 'Sprout' },
];
