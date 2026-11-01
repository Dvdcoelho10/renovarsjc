/**
 * Aviso tracejado exibido apenas para quem está logado no painel, no lugar
 * exato onde uma seção oculta vai aparecer quando a liderança preencher os
 * dados. Visitantes nunca veem este bloco.
 */
export function AdminNotice({
  title,
  where,
  path,
}: {
  title: string;
  where: string;
  path: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-accent/60 bg-accent/[0.06] p-5">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent-deep">
        Só você vê · seção ainda oculta
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {where}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Preencher em <span className="font-medium text-foreground">{path}</span>{" "}
        e salvar. Enquanto estiver vazio, os visitantes não veem nada.
      </p>
    </div>
  );
}
