import SettingsShell from "@/components/settings-shell";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Renderiza a página de Configurações.
 * Esta página fornece um layout para o componente `SettingsShell`,
 * que contém a funcionalidade principal para gerenciar as configurações do usuário, como categorias personalizadas.
 *
 * @returns {JSX.Element} O componente da página de configurações.
 */
export default function SettingsPage() {
  return (
    <>
      <Sidebar className="border-r">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <SettingsShell />
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}
