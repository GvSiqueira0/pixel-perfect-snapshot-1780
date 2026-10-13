import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, Trash2, Volume2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { loadPatients, removePatient, updateEvolucao } from "@/lib/storage";
import { protocolToSpeech } from "@/lib/protocol";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { Patient } from "@/lib/types";

const SORT_KEYS = ["az", "za", "recent", "antigo"] as const;
type SortKey = (typeof SORT_KEYS)[number];

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "az").default("az"),
});

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
  { id: "recent", label: "Mais recentes" },
  { id: "antigo", label: "Mais antigos" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function lastActivity(p: Patient) {
  return p.sessoes.reduce((max, s) => Math.max(max, Date.parse(s.data) || 0), 0);
}

function matches(p: Patient, needle: string) {
  if (!needle) return true;
  const haystack = [
    p.nome,
    ...p.sessoes.flatMap((s) => [
      s.assessment.areaCorpo,
      s.assessment.diagnosticoClinico,
      s.assessment.diagnosticoFisio,
      s.assessment.queixaPrincipal,
    ]),
  ].join(" | ");
  return normalize(haystack).includes(needle);
}

export const Route = createFileRoute("/_authenticated/historico")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Histórico de pacientes — FotoBio Clínica" },
      {
        name: "description",
        content:
          "Registos de sessões de fotobiomodulação com evolução clínica e doses aplicadas anteriormente.",
      },
      { property: "og:title", content: "Histórico de pacientes — FotoBio Clínica" },
      {
        property: "og:description",
        content: "Consulte evolução clínica e reutilize parâmetros de laser e LED já aplicados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Historico,
});

function Historico() {
  const { q, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/historico" });
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setPatients(loadPatients());
  }, []);

  const needle = normalize(q);
  const safeSort: SortKey = SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "az";

  const visible = useMemo(() => {
    const list = patients.filter((p) => matches(p, needle));
    return [...list].sort((a, b) => {
      switch (safeSort) {
        case "za":
          return b.nome.localeCompare(a.nome, "pt", { sensitivity: "base" });
        case "recent":
          return lastActivity(b) - lastActivity(a);
        case "antigo":
          return lastActivity(a) - lastActivity(b);
        default:
          return a.nome.localeCompare(b.nome, "pt", { sensitivity: "base" });
      }
    });
  }, [patients, needle, safeSort]);

  const setParam = (patch: Partial<{ q: string; sort: string }>, focus?: "q") =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      ...(focus ? { focus } : {}),
    });

  return (
    <AppShell
      title="Histórico de pacientes"
      subtitle={
        needle
          ? `${visible.length} de ${patients.length} paciente(s)`
          : `${patients.length} paciente(s) registado(s)`
      }
      back="/"
    >
      <section className="surface-card p-4">
        <label htmlFor="buscar-paciente" className="text-sm font-medium text-muted-foreground">
          Buscar paciente
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="buscar-paciente"
            type="search"
            value={q}
            onChange={(e) => setParam({ q: e.target.value }, "q")}
            placeholder="Nome, área do corpo ou diagnóstico"
            className="h-12 pl-10 pr-10 text-base"
          />
          {q ? (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setParam({ q: "" }, "q")}
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition active:scale-95 hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <p className="mt-4 text-sm font-medium text-muted-foreground">Ordenar por</p>
        <div
          role="group"
          aria-label="Ordenar pacientes"
          className="mt-2 flex flex-wrap gap-2"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={safeSort === opt.id}
              onClick={() => setParam({ sort: opt.id })}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition active:scale-[0.98]",
                safeSort === opt.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5">
        {patients.length === 0 ? (
          <p className="surface-card p-6 text-center text-sm text-muted-foreground">
            Ainda não há registos. Grave uma conduta após gerar os parâmetros.
          </p>
        ) : visible.length === 0 ? (
          <p className="surface-card p-6 text-center text-sm text-muted-foreground">
            Nenhum paciente encontrado para «{q.trim()}». Verifique o nome ou limpe a busca.
          </p>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {visible.map((p) => (
              <AccordionItem key={p.id} value={p.id} className="surface-card border px-4">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="text-left">
                    <p className="text-base font-semibold">{p.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.idade ? `${p.idade} anos · ` : ""}
                      {p.sessoes.length} sessão(ões)
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-5">
                  {p.sessoes.map((s) => (
                    <article
                      key={s.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <header className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          {new Date(s.data).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <Badge variant="outline" className="border-primary text-primary">
                          {s.protocol.modalidade === "laser" ? "Laser" : "LED"} · EVA{" "}
                          {s.assessment.dor}/10
                        </Badge>
                      </header>

                      <p className="mt-3 text-sm">
                        <strong>Área:</strong> {s.assessment.areaCorpo} ({s.assessment.tecido})
                      </p>
                      <p className="text-sm">
                        <strong>Parâmetros:</strong> {s.protocol.comprimentoOnda} ·{" "}
                        {s.protocol.modalidade === "laser"
                          ? `${s.protocol.energiaPorPonto} J/ponto em ${s.protocol.pontos} pontos`
                          : `${s.protocol.energiaPorPonto} J/cm²`}{" "}
                        · total {s.protocol.energiaTotal} J
                      </p>

                      <label className="mt-3 block text-sm font-medium">Evolução clínica</label>
                      <Textarea
                        defaultValue={s.evolucao}
                        placeholder="Resposta ao tratamento, dor pós-sessão, ajustes..."
                        className="mt-1 min-h-20 text-base"
                        onBlur={(e) => {
                          setPatients(updateEvolucao(p.id, s.id, e.target.value));
                          toast.success("Evolução atualizada.");
                        }}
                      />

                      <Button
                        variant="outline"
                        className="mt-3 h-11 gap-2"
                        onClick={() => speak(protocolToSpeech(s.protocol))}
                      >
                        <Volume2 className="h-4 w-4" /> Ouvir parâmetros
                      </Button>
                    </article>
                  ))}

                  <Button
                    variant="ghost"
                    className="h-11 gap-2 text-destructive"
                    onClick={() => {
                      setPatients(removePatient(p.id));
                      toast.success("Paciente removido do histórico.");
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Remover paciente
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {visible.length > 0 ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          Ordem: {SORT_OPTIONS.find((o) => o.id === safeSort)?.label}
        </p>
      ) : null}
    </AppShell>
  );
}
