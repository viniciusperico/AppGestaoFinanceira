
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/components/transaction-provider';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategories } from './category-provider';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

export default function ReportsShell() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isMobile = useIsMobile();

  const loading = transactionsLoading || categoriesLoading;

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const monthlyData = useMemo(() => {
    if (loading) return [];
    
    const dataByMonth: Record<string, { income: number, expense: number, balance: number }> = {};

    transactions.forEach(t => {
      const month = format(new Date(t.date), 'MMM/yy', { locale: ptBR });
      if (!dataByMonth[month]) {
        dataByMonth[month] = { income: 0, expense: 0, balance: 0 };
      }
      if (t.type === 'income') {
        dataByMonth[month].income += t.amount;
      } else {
        dataByMonth[month].expense += Math.abs(t.amount);
      }
    });

    const sortedMonths = Object.keys(dataByMonth).sort((a, b) => {
        const [aMonth, aYear] = a.split('/');
        const [bMonth, bYear] = b.split('/');
        const aDate = new Date(Number(`20${aYear}`), ptBR.locale.match.months.findIndex(m => m.test(aMonth)), 1);
        const bDate = new Date(Number(`20${bYear}`), ptBR.locale.match.months.findIndex(m => m.test(bMonth)), 1);
        return aDate.getTime() - bDate.getTime();
    });

    return sortedMonths.map(month => ({
        month,
        Receita: dataByMonth[month].income,
        Despesa: dataByMonth[month].expense,
        Saldo: dataByMonth[month].income - dataByMonth[month].expense
      }));

  }, [transactions, loading]);

  const expenseByCategoryData = useMemo(() => {
    if (loading) return [];
    
    const expenseByCategory: Record<string, number> = {};
    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' &&
               transactionDate.getMonth() === currentMonth.getMonth() &&
               transactionDate.getFullYear() === currentMonth.getFullYear();
      })
      .forEach(t => {
        const categoryLabel = categories.find(c => c.id === t.category)?.name || 'Outros';
        if (!expenseByCategory[categoryLabel]) {
          expenseByCategory[categoryLabel] = 0;
        }
        expenseByCategory[categoryLabel] += Math.abs(t.amount);
      });

    return Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  }, [transactions, loading, currentMonth, categories]);
  
  if (loading) {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  return (
    <div className="grid gap-8">
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
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria no Mês</CardTitle>
          <CardDescription>Distribuição das suas despesas para o mês selecionado.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {expenseByCategoryData.length > 0 ? (
            <div className="h-[300px] sm:h-[350px] w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isMobile ? 80 : 120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                      formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
              Nenhuma despesa encontrada para este mês.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Receitas, despesas e saldo ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$${(value/1000)}k`} />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Receita" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Despesa" stroke="hsl(var(--destructive))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
