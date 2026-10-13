import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Activity, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function AppShell({ title, subtitle, back, children, action }: Props) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="brand-gradient sticky top-0 z-30 px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-primary-foreground shadow-[var(--shadow-raised)]">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          {back ? (
            <Link
              to={back}
              aria-label="Voltar"
              className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Activity className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm opacity-90">{subtitle}</p> : null}
          </div>
          {action}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair da conta"
            className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 transition active:scale-95"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
