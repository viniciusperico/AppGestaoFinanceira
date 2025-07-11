
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/components/transaction-provider';
import { ResponsiveContainer, Area, AreaChart, Legend, Bar, BarChart, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format, eachDayOfInterval, startOfDay, endOfDay, eachMonthOfInterval, subDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/button';
import { Calendar as CalendarIcon, TrendingDown, TrendingUp, Landmark } from 'lucide-react';
import { useCategories } from './category-provider';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from './ui/table';

/**
 * Array de cores para o gráfico de categorias.
 */
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

/**
 * `ReportsShell` é o componente principal para a página de relatórios.
 * Exibe dados financeiros através de vários gráficos e resumos baseados em um intervalo de datas selecionado.
 *
 * @returns {JSX.Element} O componente do shell de relatórios.
 */
export default function ReportsShell() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Estado para o seletor de intervalo de datas, padronizando para os últimos 30 dias.
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = subDays(to, 29);
    return { from, to };
  });

  const loading = transactionsLoading || categoriesLoading;

  // Cálculo memoizado para transações filtradas pelo intervalo de datas selecionado.
  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
        return [];
    }
    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, dateRange]);

  // Cálculo memoizado para a receita e despesa total no período selecionado.
  const { totalIncome, totalExpense } = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.totalIncome += t.amount;
        } else {
            acc.totalExpense += t.amount;
        }
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTransactions]);

  // Dados memoizados para os gráficos de evolução financeira.
  // Adapta-se para mostrar dados diários ou mensais com base na duração do intervalo de datas selecionado.
  const evolutionData = useMemo(() => {
    if (loading || !dateRange?.from || !dateRange?.to) return [];
    
    const isShortRange = (dateRange.to.getTime() - dateRange.from.getTime()) <= (31 * 24 * 60 * 60 * 1000);

    if (isShortRange) {
      // Evolução diária para intervalos de até 31 dias.
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const dataByDay: Record<string, { income: number, expense: number, timestamp: number }> = {};
      
      days.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        dataByDay[dayKey] = { income: 0, expense: 0, timestamp: day.getTime() };
      });

      filteredTransactions.forEach(t => {
        const dayKey = format(new Date(t.date), 'yyyy-MM-dd');
        if (dataByDay[dayKey]) {
          if (t.type === 'income') {
            dataByDay[dayKey].income += t.amount;
          } else {
            dataByDay[dayKey].expense += Math.abs(t.amount);
          }
        }
      });
      
      let cumulativeBalance = 0;
      return Object.entries(dataByDay).sort((a,b) => a[1].timestamp - b[1].timestamp).map(([date, values]) => {
        cumulativeBalance += values.income - values.expense;
        return {
            label: format(new Date(date), 'dd/MM'),
            Receita: values.income,
            Despesa: values.expense,
            Saldo: cumulativeBalance,
        };
      });

    } else {
      // Evolução mensal para intervalos mais longos.
      const dataByMonth: Record<string, { income: number, expense: number, timestamp: number }> = {};
      const months = eachMonthOfInterval({ start: startOfMonth(dateRange.from), end: dateRange.to });
      
      months.forEach(month => {
          const monthKey = format(month, 'MMM/yy', { locale: ptBR });
          dataByMonth[monthKey] = { income: 0, expense: 0, timestamp: month.getTime() };
      });

      filteredTransactions.forEach(t => {
          const monthKey = format(new Date(t.date), 'MMM/yy', { locale: ptBR });
          if (dataByMonth[monthKey]) {
              if (t.type === 'income') {
                  dataByMonth[monthKey].income += t.amount;
              } else {
                  dataByMonth[monthKey].expense += Math.abs(t.amount);
              }
          }
      });
      
      const sortedMonths = Object.entries(dataByMonth).sort((a, b) => a[1].timestamp - b[1].timestamp);

      let cumulativeBalance = 0;
      return sortedMonths.map(([label, values]) => {
          cumulativeBalance += values.income - values.expense;
          return {
              label,
              Receita: values.income,
              Despesa: values.expense,
              Saldo: cumulativeBalance,
          };
      });
    }

  }, [filteredTransactions, loading, dateRange]);

  // Dados memoizados para o gráfico e a tabela de despesas por categoria.
  const expenseByCategoryData = useMemo(() => {
    if (loading) return [];
    
    const expenseByCategory: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryLabel = categories.find(c => c.id === t.category)?.name || 'Outros';
        if (!expenseByCategory[categoryLabel]) {
          expenseByCategory[categoryLabel] = 0;
        }
        expenseByCategory[categoryLabel] += Math.abs(t.amount);
      });

    return Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

  }, [filteredTransactions, loading, categories]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <div className="ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[260px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: ptBR })
                  )
                ) : (
                  <span>Escolha um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita no Período</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesa no Período</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{Math.abs(totalExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                  <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{(totalIncome + totalExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>}
              </CardContent>
          </Card>
      </div>

       <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs. Despesas</CardTitle>
            <CardDescription>Comparativo do fluxo de caixa no período.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evolutionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), name]}
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar dataKey="Receita" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Saldo</CardTitle>
            <CardDescription>Saldo acumulado ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[350px]">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), name]}
                       contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Area type="monotone" dataKey="Saldo" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSaldo)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
       </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição das suas despesas no período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-[400px] w-full" />
            ) : expenseByCategoryData.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={expenseByCategoryData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false} 
                                stroke="#888" 
                                fontSize={12} 
                                width={100}
                                interval={0}
                            />
                            <Tooltip 
                                cursor={{fill: 'hsl(var(--muted))'}}
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                                formatter={(value: number) => [value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 'Total']}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                {expenseByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Total Gasto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenseByCategoryData.map(item => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="flex h-[400px] w-full items-center justify-center text-muted-foreground">
                    Nenhuma despesa encontrada para o período.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
