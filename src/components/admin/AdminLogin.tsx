import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticateAdmin } from "@/lib/admin-auth";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe o e-mail e a senha.");
      return;
    }

    if (authenticateAdmin(email, password)) {
      onSuccess();
      return;
    }

    setError("E-mail ou senha incorretos.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full border border-primary-foreground/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full border border-primary-foreground/10"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] bg-card p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
              <LockKeyhole className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-deep">
                Área restrita
              </p>
              <h1 className="font-serif text-xl leading-tight">
                Painel administrativo
              </h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Acesso exclusivo da liderança para publicar textos, imagens, links,
            agenda e mensagens da igreja.
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <Label
                htmlFor="admin-email"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                E-mail
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@adrenovar.com.br"
                className="h-11 rounded-xl border-border bg-background"
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="admin-password"
                className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-background pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-1 h-11 rounded-full">
              Entrar no painel
            </Button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Logo variant="dark" size="sm" showWordmark={false} />
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
