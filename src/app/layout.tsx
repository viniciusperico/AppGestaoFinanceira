import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TransactionProvider } from '@/components/transaction-provider';
import { CreditCardProvider } from '@/components/credit-card-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { CategoryProvider } from '@/components/category-provider';
import { FutureExpenseProvider } from '@/components/future-expense-provider';

/**
 * Metadados para a aplicação.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */
export const metadata: Metadata = {
  title: 'Controle de Gastos Simples',
  description: 'Uma forma simples de controlar seus gastos.',
  manifest: '/manifest.json',
};

/**
 * Configuração da viewport para a aplicação.
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = {
  themeColor: '#09090b',
};

/**
 * Layout raiz da aplicação.
 * Envolve todas as páginas com os provedores de contexto necessários.
 *
 * @param {object} props - As props do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos a serem renderizados dentro do layout.
 * @returns {JSX.Element} O componente do layout raiz.
 */
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
                  <FutureExpenseProvider>
                    <SidebarProvider>
                      {children}
                    </SidebarProvider>
                  </FutureExpenseProvider>
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
