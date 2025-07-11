import RegisterForm from "@/components/register-form";
import AuthLayout from "@/components/auth-layout";

/**
 * Renderiza a página de registro.
 * Utiliza o `AuthLayout` para fornecer uma aparência consistente para as páginas de autenticação.
 *
 * @returns {JSX.Element} O componente da página de registro.
 */
export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
