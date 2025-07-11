/**
 * `Footer` é um componente simples que exibe as informações de copyright no final da página.
 *
 * @returns {JSX.Element} O componente de rodapé.
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t py-4 px-4 md:px-8">
      <div className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Desenvolvido por{" "}
        <a
          href="https://viniciusperico.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Vinicius Périco
        </a>
        .
      </div>
    </footer>
  );
}
