'use client';

import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useEffect } from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { ThemeToggle } from './theme-toggle';

/**
 * `Header` é o principal componente de cabeçalho da aplicação, exibido em páginas autenticadas.
 * Contém o gatilho da barra lateral para dispositivos móveis, o alternador de tema e um menu de usuário
 * com opções para configurações e logout. Também lida com o redirecionamento de usuários não autenticados.
 *
 * @returns {JSX.Element | null} O componente de cabeçalho, ou nulo se o usuário não estiver autenticado.
 */
export default function Header() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Redireciona para a página de login se o usuário não estiver autenticado após o carregamento.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Não renderiza o cabeçalho se não houver usuário.
  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">Alternar menu de usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || 'Minha Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
