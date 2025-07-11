import ReportsShell from "@/components/reports-shell";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Renderiza a página de Relatórios.
 * Esta página fornece um layout para o componente `ReportsShell`,
 * que contém a funcionalidade principal para exibir relatórios e gráficos financeiros.
 *
 * @returns {JSX.Element} O componente da página de relatórios.
 */
export default function ReportsPage() {
  return (
    <>
      <Sidebar className="border-r">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <ReportsShell />
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}
