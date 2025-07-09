import CreditCardShell from "@/components/credit-card-shell";
import Footer from "../../components/footer";
import Header from "@/components/header";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function CreditCardPage() {
  return (
    <>
      <Sidebar className="border-r">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <CreditCardShell />
        </main>
        <Footer />
      </SidebarInset>
    </>
  );
}
