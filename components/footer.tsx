export default function Footer() {
  return (
    <footer className="mt-auto border-t py-4 px-4 md:px-8">
      <div className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Desenvolvido por Vinicius Périco. Todos os direitos reservados.
      </div>
    </footer>
  );
}
