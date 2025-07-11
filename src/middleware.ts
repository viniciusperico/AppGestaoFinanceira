import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Função de middleware do Next.js.
 *
 * Esta função é executada para cada requisição que corresponde ao padrão `config.matcher`.
 * Atualmente, serve como um placeholder e simplesmente encaminha a requisição sem modificação.
 * Pode ser usada no futuro para implementar lógicas como verificações de autenticação, redirecionamentos
 * ou modificação de cabeçalhos de requisição.
 *
 * @param {NextRequest} request - O objeto da requisição de entrada.
 * @returns {NextResponse} O objeto da resposta.
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export function middleware(request: NextRequest) {
  // Placeholder para lógica de middleware futura.
  return NextResponse.next();
}

/**
 * Configuração do middleware.
 * A propriedade `matcher` define os caminhos nos quais o middleware será executado.
 * Este padrão exclui arquivos estáticos, imagens e rotas de API.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)'],
};
