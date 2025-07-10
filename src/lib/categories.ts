import { Car, Home, UtensilsCrossed, Smile, HeartPulse, ShoppingBag, DollarSign, Sprout, Repeat, type LucideIcon } from "lucide-react";
import type { IconName } from "./icon-map";

export interface DefaultCategory {
  id: string;
  name: string;
  icon: IconName;
}

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
