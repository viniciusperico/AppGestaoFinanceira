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
 * Schema Zod para validar o formulário de registro.
 */
const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

/**
 * `RegisterForm` é um componente que fornece uma interface de usuário para criar uma nova conta.
 * Ele lida com a validação do formulário, submissão e exibe erros de registro.
 * Também redireciona o usuário para o dashboard após um registro bem-sucedido.
 *
 * @returns {JSX.Element} O componente de formulário de registro.
 */
export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useAuth();

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
      await register(values.email, values.password);
      router.push('/');
    } catch (error: any) {
      let description = 'Ocorreu um erro ao tentar se registrar.';
       // Fornece mensagens de erro amigáveis com base nos códigos de erro do Firebase.
       if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'Este endereço de email já está em uso.';
            break;
          case 'auth/weak-password':
            description = 'A senha é muito fraca. Tente uma mais forte.';
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
        title: 'Erro de Registro',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Crie sua conta</CardTitle>
        <CardDescription>É rápido e fácil. Comece agora a organizar suas finanças.</CardDescription>
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
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="underline">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
