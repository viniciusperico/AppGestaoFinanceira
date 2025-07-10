import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TransactionProvider } from '@/components/transaction-provider';
import { CreditCardProvider } from '@/components/credit-card-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { CategoryProvider } from '@/components/category-provider';

export const metadata: Metadata = {
  title: 'Controle de Gastos Simples',
  description: 'Uma forma simples de controlar seus gastos.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          defaultTheme="system"
          storageKey="gastos-theme"
        >
          <AuthProvider>
            <CategoryProvider>
              <TransactionProvider>
                <CreditCardProvider>
                  <SidebarProvider>
                    {children}
                  </SidebarProvider>
                </CreditCardProvider>
              </TransactionProvider>
            </CategoryProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
