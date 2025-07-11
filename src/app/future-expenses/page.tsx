import FutureExpensesShell from "@/components/future-expenses-shell";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Renderiza a página de gerenciamento de Contas a Pagar.
 * Esta página fornece um layout para o componente `FutureExpensesShell`,
 * que contém a funcionalidade principal para gerenciar contas e despesas futuras.
 *
 * @returns {JSX.Element} O componente da página de gerenciamento de despesas futuras.
 */
export default function FutureExpensesPage() {
  return (
    <>
      <Sidebar className="border-r">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <FutureExpensesShell />
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}
