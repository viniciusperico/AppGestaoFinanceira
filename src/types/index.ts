import type { LucideIcon } from "lucide-react";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO string
}

export interface Category {
  value: string;
  label: string;
  icon: LucideIcon;
}

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outra';

export interface CreditCard {
    id: string;
    name: string;
    brand: CardBrand;
    limit: number;
    closingDay: number;
    dueDay: number;
}
