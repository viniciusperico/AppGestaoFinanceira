'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { PlusCircle, Pencil, Trash2, DollarSign } from 'lucide-react';
import { useFutureExpenses } from '@/components/future-expense-provider';
import type { FutureExpense } from '@/types';
import { ResponsiveDialog, ResponsiveDialogTrigger, ResponsiveDialogContent, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogDescription, ResponsiveDialogFooter } from './ui/responsive-dialog';
import { Skeleton } from './ui/skeleton';
import DashboardShell from './dashboard-shell';

/**
 * Schema Zod para validar o formulário de despesa futura.
 */
const futureExpenseSchema = z.object({
  description: z.string().min(1, { message: 'A descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser um número positivo.' }),
});

/**
 * `FutureExpensesShell` é o componente principal para a página "Contas a Pagar".
 * Permite que os usuários listem, adicionem, editem e excluam despesas futuras que não têm uma data fixa.
 * Também lida com a funcionalidade "Marcar como Paga", convertendo uma despesa futura em uma transação real.
 *
 * @returns {JSX.Element} O componente de gerenciamento de despesas futuras.
 */
export default function FutureExpensesShell() {
  const { futureExpenses, loading, addFutureExpense, updateFutureExpense, deleteFutureExpense } = useFutureExpenses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FutureExpense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionDefaults, setTransactionDefaults] = useState({});

  const form = useForm<z.infer<typeof futureExpenseSchema>>({
    resolver: zodResolver(futureExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingExpense(null);
      form.reset({
        description: '',
        amount: 0,
      });
    }
    setIsDialogOpen(open);
  };

  const handleEdit = (expense: FutureExpense) => {
    setEditingExpense(expense);
    form.reset({
      description: expense.description,
      amount: expense.amount,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleMarkAsPaid = (expense: FutureExpense) => {
    // Preenche o formulário de transação com os dados da despesa futura.
    setTransactionDefaults({
      description: expense.description,
      amount: expense.amount,
      type: 'expense'
    });
    // Deleta a despesa futura da lista.
    deleteFutureExpense(expense.id);
    // Aciona a abertura do diálogo de transação no dashboard.
    setIsTransactionModalOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteFutureExpense(expenseToDelete);
      setExpenseToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = (values: z.infer<typeof futureExpenseSchema>) => {
    if (editingExpense) {
      updateFutureExpense(editingExpense.id, values);
    } else {
      addFutureExpense(values);
    }
    handleDialogChange(false);
  };

  // Esta é uma solução alternativa para abrir o diálogo de transação a partir de uma página diferente.
  // Em uma aplicação maior, um gerenciador de estado global (como Zustand ou Redux) para modais seria uma abordagem melhor.
  if (isTransactionModalOpen) {
      return <DashboardShell key={Date.now()} defaultOpen={true} transactionDefaults={transactionDefaults} />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas despesas futuras e lançamentos previstos.</p>
        </div>
        <ResponsiveDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <ResponsiveDialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Conta</span>
            </Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{editingExpense ? 'Editar Conta' : 'Adicionar Conta'}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {editingExpense ? 'Atualize os detalhes da sua conta.' : 'Preencha os detalhes da nova conta a pagar.'}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 -mr-4">
              <Form {...form}>
                <form id="future-expense-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Conta</FormLabel>
                        <FormControl><Input placeholder="Ex: Aluguel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Estimado</FormLabel>
                        <FormControl><Input type="number" placeholder="1500,00" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            <ResponsiveDialogFooter>
              <Button type="submit" form="future-expense-form" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : (editingExpense ? 'Salvar Alterações' : 'Adicionar Conta')}
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent><CardFooter><Skeleton className="h-8 w-24 ml-auto" /></CardFooter></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent><CardFooter><Skeleton className="h-8 w-24 ml-auto" /></CardFooter></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3" /></CardContent><CardFooter><Skeleton className="h-8 w-24 ml-auto" /></CardFooter></Card>
          </>
        ) : futureExpenses.length > 0 ? (
          futureExpenses.map(expense => (
            <Card key={expense.id}>
              <CardHeader>
                <CardTitle className="text-base">{expense.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => handleMarkAsPaid(expense)}>
                    <DollarSign className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Pagar</span>
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(expense)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(expense.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            Nenhuma conta a pagar cadastrada. Adicione uma para começar.
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a conta a pagar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
