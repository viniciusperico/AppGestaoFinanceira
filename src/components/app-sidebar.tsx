'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, CreditCard, CircleDollarSign, Settings, CalendarClock } from 'lucide-react';
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

/**
 * `AppSidebar` é a barra de navegação lateral principal da aplicação.
 * Exibe links para todas as seções principais, como Dashboard, Relatórios, Cartões de Crédito, etc.
 * Utiliza o pathname atual para destacar o link ativo.
 *
 * @returns {JSX.Element} O componente da barra lateral da aplicação.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <CircleDollarSign className="h-6 w-6 text-sidebar-primary" />
          <span className="font-headline text-lg duration-200 group-data-[collapsible=icon]:opacity-0">Controle de Gastos</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Dashboard">
              <Link href="/">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/reports'} tooltip="Relatórios">
              <Link href="/reports">
                <BarChart2 />
                <span>Relatórios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/credit-card'} tooltip="Cartões">
              <Link href="/credit-card">
                <CreditCard />
                <span>Cartões de Crédito</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/future-expenses'} tooltip="Contas a Pagar">
              <Link href="/future-expenses">
                <CalendarClock />
                <span>Contas a Pagar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Configurações">
              <Link href="/settings">
                <Settings />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
