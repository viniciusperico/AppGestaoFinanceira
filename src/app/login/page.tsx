import LoginForm from "@/components/login-form";
import AuthLayout from "@/components/auth-layout";

/**
 * Renderiza a página de login.
 * Utiliza o `AuthLayout` para fornecer uma aparência consistente para as páginas de autenticação.
 *
 * @returns {JSX.Element} O componente da página de login.
 */
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
