import { AdminNotice } from "@/components/site/AdminNotice";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useSiteContent } from "@/content/ContentProvider";
import { useAdminSession } from "@/hooks/use-admin-session";

/**
 * "Nosso Cremos": declaração de fé publicada pela liderança. A seção fica
 * oculta enquanto o painel não tiver os pontos de fé cadastrados.
 */
export function CreedSection() {
  const { content } = useSiteContent();
  const { session } = useAdminSession();
  const { about, creed } = content;

  if (creed.length === 0) {
    if (session.status !== "authenticated") return null;

    return (
      <section className="container py-10">
        <AdminNotice
          title="Nosso Cremos"
          where="Esta seção aparece aqui, logo depois de “Nossos ministérios”."
          path="/admins → aba Sobre → Nosso Cremos"
        />
      </section>
    );
  }

  return (
    <section className="border-y border-border/70 bg-secondary/35 py-16 sm:py-20">
      <div className="container">
        <SectionHeading
          eyebrow={about.creedEyebrow}
          title={about.creedTitle}
          description={about.creedIntro}
          className="max-w-3xl"
        />

        <ol className="mt-10 grid gap-5 lg:grid-cols-2">
          {creed.map((item, index) => (
            <li
              key={item.id}
              className="flex gap-5 rounded-[1.75rem] border border-border/80 bg-card p-6"
            >
              <span
                aria-hidden="true"
                className="font-serif text-2xl leading-none text-accent-deep"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg leading-snug text-foreground">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-2 whitespace-pre-line text-[0.96rem] leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
