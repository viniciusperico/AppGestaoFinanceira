import React from "react";
import { CircleDollarSign } from "lucide-react";
import Footer from "./footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center gap-3 text-center text-foreground">
              <CircleDollarSign className="h-10 w-10 lg:hidden" />
              <h1 className="font-headline text-3xl font-bold lg:hidden">Controle de Gastos</h1>
            </div>
            {children}
          </div>
        </div>
        <div className="hidden items-center justify-center bg-muted lg:flex lg:flex-col lg:p-10">
          <div className="flex items-center gap-4 text-foreground">
              <CircleDollarSign className="h-12 w-12" />
              <div className="flex flex-col">
                  <h1 className="font-headline text-4xl font-bold">Controle de Gastos</h1>
                  <p className="text-lg text-muted-foreground">Sua vida financeira, simplificada.</p>
              </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}