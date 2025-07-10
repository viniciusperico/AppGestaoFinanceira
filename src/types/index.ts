import type { IconName } from "@/lib/icon-map";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // This will be the category ID
  date: string; // ISO string
}

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  isCustom?: boolean;
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
