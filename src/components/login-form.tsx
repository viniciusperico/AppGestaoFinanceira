'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-provider';

/**
 * Schema Zod para validar o formulário de login.
 */
const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

/**
 * `LoginForm` é um componente que fornece uma interface de usuário para login.
 * Ele lida com a validação do formulário, submissão e exibe erros de autenticação.
 * Também redireciona o usuário para o dashboard após um login bem-sucedido.
 *
 * @returns {JSX.Element} O componente de formulário de login.
 */
export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  // Redireciona para o dashboard se o usuário já estiver logado.
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (error: any) {
      let description = 'Ocorreu um erro ao tentar entrar.';
      // Fornece mensagens de erro amigáveis com base nos códigos de erro do Firebase.
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case 'auth/invalid-credential':
            description = 'Credenciais inválidas. Verifique seu email e senha.';
            break;
          case 'auth/user-not-found':
            description = 'Nenhum usuário encontrado com este email.';
            break;
          case 'auth/invalid-api-key':
            description = 'Chave de API inválida. Verifique sua configuração do Firebase.';
            break;
          default:
            description = 'Ocorreu um erro desconhecido. Tente novamente.';
        }
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Bem-vindo(a)!</CardTitle>
        <CardDescription>Acesse sua conta para gerenciar suas finanças.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Sua senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{' '}
          <Link href="/register" className="underline">
            Registre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
