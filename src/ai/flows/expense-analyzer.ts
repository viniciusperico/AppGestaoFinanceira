'use server';

/**
 * @fileOverview An AI agent that analyzes user expenses.
 * - analyzeExpenses - A function that handles the expense analysis process.
 * - ExpenseAnalysisInput - The input type for the analyzeExpenses function.
 * - ExpenseAnalysisOutput - The return type for the analyzeExpenses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionForAnalysisSchema = z.object({
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  date: z.string(),
  description: z.string(),
});

const ExpenseAnalysisInputSchema = z.object({
  transactions: z.array(TransactionForAnalysisSchema).describe("A list of the user's financial transactions."),
  categories: z.array(z.object({ value: z.string(), label: z.string() })).describe("A list of category mappings to their display names."),
});
export type ExpenseAnalysisInput = z.infer<typeof ExpenseAnalysisInputSchema>;

const ExpenseAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the user's spending habits in markdown format. Provide insights and actionable advice."),
});
export type ExpenseAnalysisOutput = z.infer<typeof ExpenseAnalysisOutputSchema>;

export async function analyzeExpenses(input: ExpenseAnalysisInput): Promise<ExpenseAnalysisOutput> {
  return analyzeExpensesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'expenseAnalysisPrompt',
    input: { schema: ExpenseAnalysisInputSchema },
    output: { schema: ExpenseAnalysisOutputSchema },
    prompt: `Você é um consultor financeiro especialista. Analise a lista de transações do usuário fornecida.

    Seu objetivo é fornecer uma análise clara, útil e acionável sobre os hábitos de gastos do usuário.

    Siga estas etapas para sua análise:
    1.  **Visão Geral:** Comece com um resumo geral dos gastos do período.
    2.  **Principais Categorias:** Identifique as 3 principais categorias de despesas e o valor gasto em cada uma.
    3.  **Padrões de Gastos:** Destaque quaisquer padrões de gastos interessantes ou incomuns que você observar (por exemplo, gastos elevados em lazer nos fins de semana, muitas compras pequenas, etc.).
    4.  **Dicas de Economia:** Ofereça de 2 a 3 dicas práticas e personalizadas para ajudar o usuário a economizar, com base nas suas despesas.
    5.  **Tom:** Mantenha um tom encorajador e prestativo, não julgador.

    Use o formato Markdown para sua resposta. Comece com um título, como "# Análise dos seus Gastos".

    Aqui estão os dados das transações:
    {{{jsonStringify transactions}}}

    E aqui estão os nomes das categorias para referência (para usar nos seus textos):
    {{{jsonStringify categories}}}
    `,
});

const analyzeExpensesFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesFlow',
    inputSchema: ExpenseAnalysisInputSchema,
    outputSchema: ExpenseAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('A análise da IA não retornou uma resposta.');
    }
    return output;
  }
);
