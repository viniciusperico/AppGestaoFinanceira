import type { IconName } from "@/lib/icon-map";

/**
 * Representa uma única transação financeira.
 */
export interface Transaction {
  /** O identificador único para a transação, gerado pelo Firestore. */
  id: string;
  /** Uma descrição da transação (ex: "Compras de supermercado", "Salário"). */
  description: string;
  /** O valor da transação. Positivo para receita, negativo para despesa. */
  amount: number;
  /** O tipo da transação. */
  type: 'income' | 'expense';
  /** O ID da categoria a que esta transação pertence. */
  category: string;
  /** A data da transação no formato de string ISO. */
  date: string;
  /** O método de pagamento, aplicável apenas a despesas. */
  paymentMethod?: 'cash' | 'creditCard';
  /** O ID do cartão de crédito usado, se aplicável. */
  creditCardId?: string;
  /** Um ID único para agrupar transações relacionadas (ex: parcelas ou despesas recorrentes). */
  groupId?: string;
  /** Uma flag para identificar a primeira transação em um grupo. */
  isOriginal?: boolean;
}

/**
 * Representa uma categoria de gasto ou receita.
 */
export interface Category {
  /** O identificador único para a categoria. */
  id: string;
  /** O nome de exibição da categoria (ex: "Moradia", "Alimentação"). */
  name: string;
  /** O nome do ícone lucide-react associado à categoria. */
  icon: IconName;
  /** Uma flag para distinguir entre categorias padrão e categorias personalizadas criadas pelo usuário. */
  isCustom?: boolean;
}

/**
 * Representa a bandeira de um cartão de crédito.
 */
export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outra';

/**
 * Representa um cartão de crédito do usuário.
 */
export interface CreditCard {
    /** O identificador único para o cartão de crédito. */
    id: string;
    /** Um nome ou apelido definido pelo usuário para o cartão (ex: "Visa Pessoal"). */
    name: string;
    /** A bandeira do cartão. */
    brand: CardBrand;
    /** O limite de crédito do cartão. */
    limit: number;
    /** O dia do mês em que a fatura do cartão fecha. */
    closingDay: number;
    /** O dia do mês em que o pagamento do cartão é devido. */
    dueDay: number;
}

/**
 * Representa uma despesa futura ou uma conta a ser paga, sem uma data específica.
 */
export interface FutureExpense {
  /** O identificador único para a despesa futura. */
  id: string;
  /** Uma descrição da despesa futura (ex: "Seguro do carro"). */
  description: string;
  /** O valor estimado da despesa. */
  amount: number;
}
