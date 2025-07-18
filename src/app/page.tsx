import DashboardShell from "@/components/dashboard-shell";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Renderiza a página inicial, que é o dashboard principal da aplicação.
 * Fornece um layout para o componente `DashboardShell`.
 *
 * @returns {JSX.Element} O componente da página inicial.
 */
export default function Home() {
  return (
    <>
      <Sidebar className="border-r">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <DashboardShell />
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}
