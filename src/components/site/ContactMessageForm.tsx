import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

type FormState = typeof EMPTY_FORM;
type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Informe seu nome.";
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido para receber a resposta.";
  }
  if (form.message.trim().length < 10) {
    errors.message = "Escreva um pouco mais na sua mensagem.";
  }

  return errors;
}

function errorText(code: string | undefined, recipient: string) {
  switch (code) {
    case "mail_not_configured":
      return `O envio automático ainda não está configurado no servidor. Escreva direto para ${recipient}.`;
    case "rate_limited":
      return `Você enviou várias mensagens em pouco tempo. Aguarde alguns minutos ou escreva direto para ${recipient}.`;
    case "invalid_payload":
      return "Revise os campos preenchidos e tente novamente.";
    case "payload_too_large":
      return "Sua mensagem ficou muito longa. Resuma um pouco e tente novamente.";
    default:
      return `Não foi possível enviar agora. Tente novamente em instantes ou escreva para ${recipient}.`;
  }
}

export function ContactMessageForm({ recipient }: { recipient: string }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const setField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setStatus("idle");
        setError(errorText(payload.error, recipient));
        return;
      }

      setForm(EMPTY_FORM);
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError(
        `Não conseguimos falar com o servidor. Verifique sua conexão e tente novamente, ou escreva para ${recipient}.`,
      );
    }
  };

  return (
    <div className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-[0_24px_50px_-40px_rgba(19,37,74,0.5)] sm:p-8">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-deep">
        Mensagem direta
      </p>
      <h2 className="mt-3 text-[1.5rem] leading-snug sm:text-2xl">
        Envie sua mensagem para a igreja
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
        Sua mensagem vai direto para{" "}
        <strong className="font-medium text-foreground">{recipient}</strong>.
        Responderemos pelo e-mail informado.
      </p>

      {status === "sent" ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-2xl border border-primary/15 bg-secondary/60 p-6 text-center"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-primary">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
          </span>
          <p className="mt-4 font-serif text-lg text-foreground">
            Mensagem enviada!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Recebemos o seu contato e vamos responder pelo e-mail informado. Se
            precisar complementar algo, escreva para {recipient}.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStatus("idle")}
            className="mt-5 h-10 rounded-full border-border px-5 hover:bg-card"
          >
            Enviar outra mensagem
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label
                htmlFor="contact-name"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Seu nome
              </Label>
              <Input
                id="contact-name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                className="h-11 rounded-xl border-border bg-background"
                placeholder="Como podemos chamar você?"
              />
              {fieldErrors.name && (
                <p id="contact-name-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="contact-email"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Seu e-mail
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                className="h-11 rounded-xl border-border bg-background"
                placeholder="voce@email.com"
              />
              {fieldErrors.email && (
                <p id="contact-email-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="contact-phone"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Telefone <span className="font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="contact-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                autoComplete="tel"
                className="h-11 rounded-xl border-border bg-background"
                placeholder="(12) 90000-0000"
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="contact-subject"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Assunto <span className="font-normal normal-case">(opcional)</span>
              </Label>
              <Input
                id="contact-subject"
                value={form.subject}
                onChange={(event) => setField("subject", event.target.value)}
                className="h-11 rounded-xl border-border bg-background"
                placeholder="Visita, aconselhamento, dúvida..."
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="contact-message"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Mensagem
            </Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              rows={5}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={
                fieldErrors.message ? "contact-message-error" : undefined
              }
              className="min-h-[8rem] rounded-xl border-border bg-background leading-relaxed"
              placeholder="Escreva sua mensagem para a igreja."
            />
            {fieldErrors.message && (
              <p id="contact-message-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.message}
              </p>
            )}
          </div>

          {/* Campo invisível: só robôs preenchem. */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(event) => setField("website", event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-sm leading-relaxed text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Seus dados são usados apenas para responder esta mensagem.
            </p>
            <Button
              type="submit"
              disabled={status === "sending"}
              className="h-11 rounded-full px-6"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  Enviar mensagem
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
