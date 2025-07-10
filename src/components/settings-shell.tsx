
'use client';

import React, { useState } from 'react';
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
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '@/components/category-provider';
import type { Category } from '@/types';
import { ResponsiveDialog, ResponsiveDialogTrigger, ResponsiveDialogContent, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogDescription, ResponsiveDialogFooter } from './ui/responsive-dialog';
import { availableIcons, getIcon, IconName } from '@/lib/icon-map';

const categorySchema = z.object({
  name: z.string().min(1, { message: 'O nome da categoria é obrigatório.' }),
  icon: z.string().min(1, { message: 'Por favor, selecione um ícone.' }),
});

export default function SettingsShell() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingCategory(null);
      form.reset({
        name: '',
        icon: '',
      });
    }
    setIsDialogOpen(open);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      icon: category.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    const categoryData = { name: values.name, icon: values.icon as IconName };
    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    handleDialogChange(false);
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
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas categorias personalizadas.</p>
        </div>
        <ResponsiveDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <ResponsiveDialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Nova Categoria</span>
            </Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {editingCategory ? 'Atualize os detalhes da sua categoria.' : 'Crie uma nova categoria para organizar seus gastos.'}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 -mr-4">
              <Form {...form}>
                <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Categoria</FormLabel>
                        <FormControl><Input placeholder="Ex: Educação" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="icon" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                                {field.value ? (
                                    <span className="flex items-center gap-2">
                                        {React.createElement(getIcon(field.value as IconName), { className: 'h-4 w-4' })}
                                        {field.value}
                                    </span>
                                ) : (
                                    <SelectValue placeholder="Selecione um ícone" />
                                )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="grid grid-cols-5 gap-2 p-2">
                                {availableIcons.map(iconInfo => (
                                    <SelectItem key={iconInfo.name} value={iconInfo.name} className="flex justify-center items-center p-2 h-12">
                                        <iconInfo.icon className="h-5 w-5" />
                                    </SelectItem>
                                ))}
                            </div>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
            <ResponsiveDialogFooter>
              <Button type="submit" form="category-form" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : (editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria')}
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map(cat => {
            const Icon = getIcon(cat.icon);
            return (
                <Card key={cat.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">{cat.name}</CardTitle>
                        <Icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {!cat.isCustom && (
                            <p className="text-xs text-muted-foreground">Categoria padrão</p>
                        )}
                    </CardContent>
                    {cat.isCustom && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(cat)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            )
        })}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a categoria. Transações associadas a ela precisarão ser recategorizadas manualmente.
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
