
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File, Filter, Landmark, ListFilter, PlusCircle, TrendingUp, Pencil, Trash2, ChevronLeft, ChevronRight, CreditCard as CreditCardIcon, Wallet } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from './ui/form';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Checkbox } from './ui/checkbox';
import { useTransactions } from '@/components/transaction-provider';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogTrigger } from './ui/responsive-dialog';
import { useCategories } from './category-provider';
import { getIcon } from '@/lib/icon-map';
import { Skeleton } from './ui/skeleton';
import { useCreditCards } from './credit-card-provider';
import type { Transaction } from '@/types';

/**
 * Schema Zod para validar o formulário de transação.
 * Inclui validação condicional para métodos de pagamento e despesas recorrentes.
 */
const transactionSchema = z.object({
  description: z.string().min(1, { message: 'Descrição é obrigatória.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, { message: 'Categoria é obrigatória.' }),
  date: z.date(),
  paymentMethod: z.enum(['pix_debit', 'creditCard']).optional(),
  creditCardId: z.string().optional(),
  installments: z.coerce.number().int().min(1).optional(),
  isRecurring: z.boolean().default(false),
  recurringEndDate: z.date().optional(),
}).refine(data => {
    if (data.type === 'expense' && !data.paymentMethod) {
        return false;
    }
    return true;
}, {
    message: "O método de pagamento é obrigatório para despesas.",
    path: ["paymentMethod"],
}).refine(data => {
    if (data.paymentMethod === 'creditCard' && !data.creditCardId) {
        return false;
    }
    return true;
}, {
    message: "Por favor, selecione um cartão de crédito.",
    path: ["creditCardId"],
}).refine(data => {
  if (data.type === 'expense' && data.isRecurring && !data.recurringEndDate) {
      return false;
  }
  return true;
}, {
  message: "A data final é obrigatória para despesas recorrentes.",
  path: ["recurringEndDate"],
}).refine(data => {
  if (data.isRecurring && data.recurringEndDate && data.recurringEndDate <= data.date) {
      return false;
  }
  return true;
}, {
  message: "A data final deve ser posterior à data da transação.",
  path: ["recurringEndDate"],
});

/**
 * Props para o componente `DashboardShell`.
 */
interface DashboardShellProps {
    /**
     * Se o diálogo de transação deve estar aberto por padrão.
     * @default false
     */
    defaultOpen?: boolean;
    /**
     * Valores padrão para preencher o formulário de transação.
     * Útil para funcionalidades como "Marcar como Paga".
     */
    transactionDefaults?: Partial<z.infer<typeof transactionSchema>>;
}

/**
 * `DashboardShell` é o componente principal do dashboard da aplicação.
 * Exibe cartões de resumo, uma lista de transações e um gráfico de despesas por categoria.
 * Também contém o formulário para adicionar e editar transações.
 *
 * @param {DashboardShellProps} props - As props do componente.
 * @returns {JSX.Element} O componente do shell do dashboard.
 */
export default function DashboardShell({ defaultOpen = false, transactionDefaults = {} }: DashboardShellProps) {
  const { transactions, loading: transactionsLoading, addTransaction, updateTransaction, deleteTransaction, updateTransactionGroup } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();
  const [isDialogOpen, setIsDialogOpen] = useState(defaultOpen);
  const [filters, setFilters] = useState({ type: 'all' as 'all' | 'income' | 'expense', categories: [] as string[] });
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGroupEditDialogOpen, setIsGroupEditDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loading = transactionsLoading || categoriesLoading || creditCardsLoading;
  
  const editingTransactionId = editingTransaction?.id || null;

  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      setFilters(prev => ({ ...prev, categories: categories.map(c => c.id) }));
    }
  }, [categories, categoriesLoading]);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      category: '',
      date: new Date(),
      paymentMethod: 'pix_debit',
      installments: 1,
      isRecurring: false,
      ...transactionDefaults
    },
  });

  const type = form.watch('type');
  const paymentMethod = form.watch('paymentMethod');
  const isRecurring = form.watch('isRecurring');

  useEffect(() => {
    if (type === 'income') {
      form.setValue('paymentMethod', undefined);
      form.setValue('creditCardId', undefined);
      form.setValue('installments', 1);
      form.setValue('isRecurring', false);
    } else {
        form.setValue('paymentMethod', 'pix_debit');
    }
  }, [type, form]);

  useEffect(() => {
    if (paymentMethod !== 'creditCard') {
        form.setValue('installments', 1);
    }
  }, [paymentMethod, form]);

  useEffect(() => {
    if (isRecurring) {
        form.setValue('installments', 1);
    }
  }, [isRecurring, form]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingTransaction(null);
      form.reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date(),
        paymentMethod: 'pix_debit',
        installments: 1,
        isRecurring: false,
        recurringEndDate: undefined,
        creditCardId: undefined,
      });
    }
    setIsDialogOpen(open);
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    form.reset({
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date),
      paymentMethod: transaction.paymentMethod,
      creditCardId: transaction.creditCardId,
      installments: 1, 
      isRecurring: false,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };


  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    if (editingTransaction?.groupId) {
        setIsGroupEditDialogOpen(true);
    } else if (editingTransactionId) {
        updateTransaction(editingTransactionId, values);
        handleDialogChange(false);
    } else {
      addTransaction(values);
      handleDialogChange(false);
    }
  };

  const handleConfirmGroupEdit = async (updateAll: boolean) => {
    const values = form.getValues();
    if (!editingTransaction) return;

    if (updateAll && editingTransaction.groupId) {
        await updateTransactionGroup(editingTransaction.groupId, values);
    } else {
        await updateTransaction(editingTransaction.id, { ...values, groupId: editingTransaction.groupId });
    }
    setIsGroupEditDialogOpen(false);
    handleDialogChange(false);
  };
  
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth.getMonth() &&
             transactionDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [transactions, currentMonth]);
  
  const filteredTransactions = useMemo(() => {
    return monthlyTransactions.filter(t => {
      const typeMatch = filters.type === 'all' || t.type === filters.type;
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(t.category);
      return typeMatch && categoryMatch;
    });
  }, [monthlyTransactions, filters]);

  const { totalIncome, cardExpense, cashExpense } = useMemo(() => {
    return monthlyTransactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.totalIncome += t.amount;
        } else { // expense
            if (t.paymentMethod === 'creditCard') {
                acc.cardExpense += t.amount;
            } else if (t.paymentMethod === 'pix_debit') {
                acc.cashExpense += t.amount;
            }
        }
        return acc;
    }, { totalIncome: 0, cardExpense: 0, cashExpense: 0 });
  }, [monthlyTransactions]);

  const finalTotals = useMemo(() => {
      const totalExpense = cardExpense + cashExpense;
      const balance = totalIncome + totalExpense;
      return { totalIncome, totalExpense, balance, cardExpense, cashExpense };
  }, [totalIncome, cardExpense, cashExpense]);

  const chartData = useMemo(() => {
    const expenseByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryLabel = categories.find(c => c.id === t.category)?.name || 'Outros';
        if (!acc[categoryLabel]) {
          acc[categoryLabel] = 0;
        }
        acc[categoryLabel] += Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
  
    return Object.entries(expenseByCategory).map(([name, total]) => ({ name, total }));
  }, [filteredTransactions, categories]);
  

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID", "Descrição", "Valor", "Tipo", "Categoria", "Data"].join(",") + "\n"
      + filteredTransactions.map(t => 
          [t.id, `"${t.description}"`, t.amount, t.type, categories.find(c => c.id === t.category)?.name || t.category, new Date(t.date).toLocaleDateString('pt-BR')].join(',')
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transacoes_${format(currentMonth, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportado!', description: 'Suas transações foram exportadas.' });
  };


  const handleCategoryFilterChange = (categoryId: string, checked: boolean) => {
    setFilters(prev => {
      const newCategories = checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(c => c !== categoryId);
      return { ...prev, categories: newCategories };
    });
  };

  const handleSelectAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: categories.map(c => c.id)
    }));
  };

  const handleClearAllCategories = () => {
    setFilters(prev => ({
      ...prev,
      categories: []
    }));
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight capitalize">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{finalTotals.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa com Cartão</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{Math.abs(finalTotals.cardExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa com Pix/Débito</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{Math.abs(finalTotals.cashExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{finalTotals.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="grid gap-2">
              <CardTitle>Transações do Mês</CardTitle>
              <CardDescription>
                Visualize, edite ou exclua suas transações recentes.
              </CardDescription>
            </div>
            <div className="ml-auto flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Categorias
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSelectAllCategories} className="cursor-pointer">
                    Selecionar Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleClearAllCategories} className="cursor-pointer">
                    Limpar Seleção
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map(cat => (
                    <DropdownMenuCheckboxItem 
                      key={cat.id}
                      checked={filters.categories.includes(cat.id)}
                      onCheckedChange={(checked) => handleCategoryFilterChange(cat.id, !!checked)}
                    >
                      {cat.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Select value={filters.type} onValueChange={(value) => setFilters(f => ({...f, type: value as 'all' | 'income' | 'expense'}))}>
                <SelectTrigger className="h-8 w-full sm:w-[150px]">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
              </Button>
              <ResponsiveDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <ResponsiveDialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar</span>
                  </Button>
                </ResponsiveDialogTrigger>
                <ResponsiveDialogContent>
                  <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>{editingTransactionId ? 'Editar Transação' : 'Adicionar Transação'}</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>
                      {editingTransactionId
                        ? 'Atualize os detalhes do seu registro financeiro.'
                        : 'Preencha os detalhes do seu novo registro financeiro.'
                      }
                    </ResponsiveDialogDescription>
                  </ResponsiveDialogHeader>
                  <div className="flex-1 overflow-y-auto pr-4">
                    <Form {...form}>
                      <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl><Input placeholder="Ex: Compras no supermercado" {...field} disabled={!!editingTransaction?.groupId} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="amount" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor</FormLabel>
                                <FormControl><Input type="number" placeholder="0,00" {...field} disabled={!!editingTransaction?.groupId} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField control={form.control} name="type" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingTransaction?.groupId}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="expense">Despesa</SelectItem>
                                    <SelectItem value="income">Receita</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         {type === 'expense' && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="pix_debit">Pix/Débito</SelectItem>
                                                <SelectItem value="creditCard">Cartão de Crédito</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {paymentMethod === 'creditCard' && (
                                    <FormField control={form.control} name="creditCardId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cartão</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o cartão" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {creditCards.map(card => <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </div>
                        )}
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Data da Transação</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')} disabled={!!editingTransaction?.groupId}>
                                      {field.value ? (format(field.value, 'PPP', { locale: ptBR })) : <span>Escolha uma data</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={!!editingTransaction?.groupId} />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {type === 'expense' && !editingTransactionId && (
                          <>
                            <FormField
                              control={form.control}
                              name="isRecurring"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked: boolean) => {
                                        field.onChange(checked);
                                        if (checked) {
                                          form.setValue('installments', 1);
                                          form.setValue('paymentMethod', 'pix_debit');
                                        } else {
                                          form.setValue('recurringEndDate', undefined);
                                          form.clearErrors('recurringEndDate');
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Despesa Recorrente</FormLabel>
                                    <FormDescription>
                                      Lança essa despesa mensalmente até a data final especificada.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                            {isRecurring ? (
                              <FormField
                                control={form.control}
                                name="recurringEndDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Lançar até</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant={'outline'}
                                            className={cn(
                                              'w-full pl-3 text-left font-normal',
                                              !field.value && 'text-muted-foreground'
                                            )}
                                          >
                                            {field.value ? (
                                              format(field.value, 'PPP', { locale: ptBR })
                                            ) : (
                                              <span>Escolha a data final</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) =>
                                            date <= form.getValues('date')
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ) : (
                                paymentMethod === 'creditCard' && (
                                <FormField
                                    control={form.control}
                                    name="installments"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº de Parcelas</FormLabel>
                                        <FormControl><Input type="number" min="1" placeholder="1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                )
                            )}
                          </>
                        )}
                      </form>
                    </Form>
                  </div>
                  <ResponsiveDialogFooter>
                    <Button type="submit" form="transaction-form" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Salvando...' : (editingTransactionId ? 'Salvar Alterações' : 'Salvar Transação')}
                    </Button>
                  </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
              </ResponsiveDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="md:hidden">
              {loading ? (
                 <div className="flex flex-col gap-3">
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-24 w-full" />
                   <Skeleton className="h-24 w-full" />
                 </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredTransactions.map(t => {
                    const category = categories.find(c => c.id === t.category);
                    const creditCard = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : null;
                    const Icon = category ? getIcon(category.icon) : null;
                    return (
                      <div key={t.id} className="rounded-lg border bg-card p-4 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="font-medium break-words">{t.description}</div>
                                <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    {Icon && <Icon className="h-3 w-3" />}
                                    <span>{category?.name || t.category}</span>
                                </div>
                                {t.paymentMethod && (
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        {t.paymentMethod === 'creditCard' ? <CreditCardIcon className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                                        <span>{t.paymentMethod === 'creditCard' ? (creditCard?.name || 'Cartão') : 'Pix/Débito'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className={`font-medium ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(t.id)}>
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Excluir</span>
                                  </Button>
                                </div>
                            </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-24 text-center flex items-center justify-center">
                  Nenhuma transação encontrada para este mês.
                </div>
              )}
            </div>
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <>
                        <TableRow>
                            <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                    </>
                ) : filteredTransactions.length > 0 ? filteredTransactions.map(t => {
                   const category = categories.find(c => c.id === t.category);
                   const creditCard = t.creditCardId ? creditCards.find(c => c.id === t.creditCardId) : null;
                   const Icon = category ? getIcon(category.icon) : null;
                   return (
                     <TableRow key={t.id}>
                       <TableCell>
                         <div className="font-medium">{t.description}</div>
                         <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                           {category?.name || t.category}
                         </div>
                       </TableCell>
                        <TableCell>
                            {t.paymentMethod ? (
                                <div className="flex items-center gap-2">
                                    {t.paymentMethod === 'creditCard' ? <CreditCardIcon className="h-4 w-4 text-muted-foreground" /> : <Wallet className="h-4 w-4 text-muted-foreground" />}
                                    {t.paymentMethod === 'creditCard' ? (creditCard?.name || 'Cartão') : 'Pix/Débito'}
                                </div>
                            ) : null}
                        </TableCell>
                       <TableCell className={`text-right font-medium ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </TableCell>
                       <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(t.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                       </TableCell>
                     </TableRow>
                   )
                }) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação encontrada para este mês.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Uma visão geral de onde seu dinheiro foi neste mês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] md:h-[300px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
              </div>
            ) : (
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="#888" fontSize={12} width={80} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: any) => [value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 'Total']}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a transação dos seus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isGroupEditDialogOpen} onOpenChange={setIsGroupEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Transação em Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta transação faz parte de um grupo (recorrente ou parcelada). Como você deseja aplicar esta alteração?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => handleConfirmGroupEdit(false)}>Alterar Somente Esta</Button>
            <Button onClick={() => handleConfirmGroupEdit(true)}>Alterar Todas</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
