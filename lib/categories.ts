import type { Category } from "@/types";
import { Car, Home, UtensilsCrossed, Smile, HeartPulse, ShoppingBag, DollarSign, Sprout } from "lucide-react";

export const categories: Category[] = [
  { value: 'moradia', label: 'Moradia', icon: Home },
  { value: 'alimentacao', label: 'Alimentação', icon: UtensilsCrossed },
  { value: 'transporte', label: 'Transporte', icon: Car },
  { value: 'lazer', label: 'Lazer', icon: Smile },
  { value: 'saude', label: 'Saúde', icon: HeartPulse },
  { value: 'compras', label: 'Compras', icon: ShoppingBag },
  { value: 'salario', label: 'Salário', icon: DollarSign },
  { value: 'outros', label: 'Outros', icon: Sprout },
];
