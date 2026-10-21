import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — FotoBio Clínica" },
      {
        name: "description",
        content:
          "Acesse o FotoBio Clínica com e-mail ou Google para usar o simulador de fotobiomodulação.",
      },
      { property: "og:title", content: "Entrar — FotoBio Clínica" },
      {
        property: "og:description",
        content:
          "Acesse o FotoBio Clínica com e-mail ou Google para usar o simulador de fotobiomodulação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setAwaitingConfirmation(true);
        } else {
          navigate({ to: "/" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const handleSocial = async () => {
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login social. Tente novamente.");
      setLoading(null);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card w-full max-w-md p-8 text-center">
          <span className="brand-gradient mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra o e-mail e clique no
            link para ativar sua conta.
          </p>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => {
              setAwaitingConfirmation(false);
              setMode("signin");
            }}
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="brand-gradient px-4 pb-16 pt-[max(3rem,env(safe-area-inset-top))] text-center text-primary-foreground shadow-[var(--shadow-raised)]">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
          <Activity className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">FotoBio Clínica</h1>
        <p className="mt-1 text-sm opacity-90">
          Fotobiomodulação com Laser e LED na prática clínica
        </p>
      </div>

      <main className="mx-auto -mt-8 max-w-md px-4 pb-12">
        <div className="surface-card p-6">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist">
            {[
              { id: "signin" as const, label: "Entrar" },
              { id: "signup" as const, label: "Criar conta" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => setMode(tab.id)}
                className={cn(
                  "min-h-11 rounded-lg text-sm font-medium transition",
                  mode === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                  className="min-h-12"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                required
                className="min-h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                className="min-h-12"
              />
            </div>
            <Button type="submit" className="min-h-12 w-full" disabled={loading !== null}>
              {loading === "email" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {mode === "signin" ? "Entrar com e-mail" : "Criar minha conta"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou continue com
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-12 w-full"
              disabled={loading !== null}
              onClick={handleSocial}
            >
              {loading === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              Continuar com Google
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com o uso educacional e clínico responsável da ferramenta.
        </p>
      </main>
    </div>
  );
}
