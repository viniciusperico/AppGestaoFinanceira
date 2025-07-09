
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2, CreditCard as CreditCardIcon } from 'lucide-react';
import { useCreditCards } from '@/components/credit-card-provider';
import type { CreditCard, CardBrand } from '@/types';
import { ResponsiveDialog, ResponsiveDialogTrigger, ResponsiveDialogContent, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogDescription, ResponsiveDialogFooter } from './ui/responsive-dialog';

const cardBrands: { value: CardBrand, label: string }[] = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'elo', label: 'Elo' },
    { value: 'amex', label: 'American Express' },
    { value: 'hipercard', label: 'Hipercard' },
    { value: 'outra', label: 'Outra' },
];

const creditCardSchema = z.object({
  name: z.string().min(1, { message: 'O nome do cartão é obrigatório.' }),
  brand: z.enum(['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'outra']),
  limit: z.coerce.number().positive({ message: 'O limite deve ser um número positivo.' }),
  closingDay: z.coerce.number().int().min(1).max(31, { message: 'Dia inválido.' }),
  dueDay: z.coerce.number().int().min(1).max(31, { message: 'Dia inválido.' }),
});

export default function CreditCardShell() {
  const { creditCards, loading, addCreditCard, updateCreditCard, deleteCreditCard } = useCreditCards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const form = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      brand: 'mastercard',
      limit: 0,
      closingDay: 1,
      dueDay: 10,
    },
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingCardId(null);
      form.reset({
        name: '',
        brand: 'mastercard',
        limit: 0,
        closingDay: 1,
        dueDay: 10,
      });
    }
    setIsDialogOpen(open);
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCardId(card.id);
    form.reset({
      name: card.name,
      brand: card.brand,
      limit: card.limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCardToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCreditCard(cardToDelete);
      setCardToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = (values: z.infer<typeof creditCardSchema>) => {
    if (editingCardId) {
      updateCreditCard(editingCardId, values);
    } else {
      addCreditCard(values);
    }
    handleDialogChange(false);
  };
  
  const getBrandLabel = (brandValue: CardBrand) => {
    return cardBrands.find(b => b.value === brandValue)?.label || 'Outra';
  };

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">Gerencie seus cartões de crédito cadastrados.</p>
        </div>
        <ResponsiveDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <ResponsiveDialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Adicionar Cartão</span>
            </Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{editingCardId ? 'Editar Cartão' : 'Adicionar Cartão'}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {editingCardId ? 'Atualize os detalhes do seu cartão.' : 'Preencha os detalhes do novo cartão.'}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 -mr-4">
              <Form {...form}>
                <form id="credit-card-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apelido do Cartão</FormLabel>
                        <FormControl><Input placeholder="Ex: Cartão Nubank" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="brand" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bandeira</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione a bandeira" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {cardBrands.map(brand => <SelectItem key={brand.value} value={brand.value}>{brand.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="limit" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite</FormLabel>
                        <FormControl><Input type="number" placeholder="5000,00" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="closingDay" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia de Fechamento</FormLabel>
                          <FormControl><Input type="number" min="1" max="31" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="dueDay" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia de Vencimento</FormLabel>
                          <FormControl><Input type="number" min="1" max="31" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
            <ResponsiveDialogFooter>
              <Button type="submit" form="credit-card-form" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : (editingCardId ? 'Salvar Alterações' : 'Adicionar Cartão')}
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {creditCards.length > 0 ? (
          creditCards.map(card => (
            <Card key={card.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{card.name}</CardTitle>
                  <CardDescription>
                    Limite: {card.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>{getBrandLabel(card.brand)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Fechamento: Dia {card.closingDay}</span>
                  <span>Vencimento: Dia {card.dueDay}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(card)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(card.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            Nenhum cartão de crédito cadastrado. Adicione um para começar.
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o cartão.
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
