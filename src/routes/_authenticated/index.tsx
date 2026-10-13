import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, BookOpen, ClipboardPlus, Users, Volume2, Zap, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MicButton } from "@/components/MicButton";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { Modality } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "FotoBio Clínica — Laser e LED na fisioterapia" },
      {
        name: "description",
        content:
          "Aplicação clínica para estudantes, estagiários e fisioterapeutas calcularem parâmetros de fotobiomodulação com laser e LED.",
      },
      { property: "og:title", content: "FotoBio Clínica — Laser e LED na fisioterapia" },
      {
        property: "og:description",
        content:
          "Checklist de segurança, anamnese, cálculo de dose e histórico de pacientes em fotobiomodulação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [modalidade, setModalidade] = useState<Modality>("laser");

  const go = (to: string) => navigate({ to });

  const handleVoice = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("histórico") || t.includes("historico") || t.includes("paciente")) go("/historico");
    else if (t.includes("guia") || t.includes("aparelho")) go("/guia");
    else if (t.includes("led")) setModalidade("led");
    else if (t.includes("laser")) setModalidade("laser");
    else go("/avaliacao");
  };

  return (
    <AppShell
      title="Olá, profissional"
      subtitle="Fotobiomodulação com Laser e LED na prática clínica"
      action={<MicButton onResult={handleVoice} label="Comando de voz" className="mt-1 border-white/30 bg-white/15 text-primary-foreground" />}
    >
      <section aria-label="Modalidade" className="surface-card p-4">
        <p className="text-sm font-medium text-muted-foreground">Modalidade de fotobiomodulação</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              { id: "laser" as const, label: "Laser terapêutico", icon: Zap, desc: "Colimado, pontual" },
              { id: "led" as const, label: "LED", icon: Lightbulb, desc: "Cluster, varredura" },
            ]
          ).map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              aria-pressed={modalidade === id}
              onClick={() => setModalidade(id)}
              className={cn(
                "flex min-h-24 flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition active:scale-[0.98]",
                modalidade === id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
              )}
            >
              <Icon className={cn("h-6 w-6", modalidade === id ? "text-primary" : "text-muted-foreground")} />
              <span className="text-base font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </section>

      <nav className="mt-5 grid gap-3">
        <Button
          size="lg"
          className="h-20 justify-start gap-4 rounded-2xl text-left text-base"
          onClick={() => navigate({ to: "/avaliacao", search: { modalidade } })}
        >
          <ClipboardPlus className="h-7 w-7" />
          <span className="flex flex-col">
            <span className="text-lg font-semibold">Novo atendimento / Avaliação</span>
            <span className="text-sm font-normal opacity-85">
              Checklist, anamnese e cálculo de dose
            </span>
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-20 justify-start gap-4 rounded-2xl border-2 text-left text-base"
          onClick={() => go("/historico")}
        >
          <Users className="h-7 w-7 text-primary" />
          <span className="flex flex-col">
            <span className="text-lg font-semibold">Histórico de pacientes</span>
            <span className="text-sm font-normal text-muted-foreground">
              Evolução e doses anteriores
            </span>
          </span>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-20 justify-start gap-4 rounded-2xl border-2 text-left text-base"
          onClick={() => go("/guia")}
        >
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="flex flex-col">
            <span className="text-lg font-semibold">Guia de uso dos aparelhos</span>
            <span className="text-sm font-normal text-muted-foreground">
              Ligar, calibrar, higienizar e posicionar
            </span>
          </span>
        </Button>
      </nav>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <Activity className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          Ferramenta de apoio educativo. Os parâmetros sugeridos seguem faixas descritas na
          literatura e não substituem o raciocínio clínico nem o manual do fabricante.
        </p>
      </div>

      <Button
        variant="ghost"
        className="mt-4 h-12 w-full gap-2 text-primary"
        onClick={() =>
          speak(
            "Ecrã inicial. Escolha entre novo atendimento, histórico de pacientes ou guia de uso dos aparelhos. Modalidade selecionada: " +
              (modalidade === "laser" ? "laser terapêutico" : "LED"),
          )
        }
      >
        <Volume2 className="h-5 w-5" /> Ouvir opções do ecrã
      </Button>
    </AppShell>
  );
}
