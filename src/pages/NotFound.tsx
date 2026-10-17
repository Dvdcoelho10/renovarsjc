import { Link } from "react-router-dom";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";

const NotFound = () => {
  usePageTitle("Página não encontrada");

  return (
    <SiteLayout>
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
          Erro 404
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Página não encontrada</h1>
        <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted-foreground">
          O endereço acessado não existe ou foi movido. Você pode voltar ao início
          e continuar navegando pelo site.
        </p>
        <Button asChild className="mt-8 h-12 rounded-full px-7">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </section>
    </SiteLayout>
  );
};

export default NotFound;
