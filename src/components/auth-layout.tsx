import { CircleDollarSign } from "lucide-react";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-10">
        <div className="flex items-center gap-4 text-foreground">
            <CircleDollarSign className="h-12 w-12" />
            <div className="flex flex-col">
                <h1 className="font-headline text-4xl font-bold">Controle de Gastos</h1>
                <p className="text-lg text-muted-foreground">Sua vida financeira, simplificada.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
