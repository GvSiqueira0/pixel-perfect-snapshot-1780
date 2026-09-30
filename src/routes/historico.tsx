import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
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
import type { Patient } from "@/lib/types";

export const Route = createFileRoute("/historico")({
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
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setPatients(loadPatients());
  }, []);

  return (
    <AppShell title="Histórico de pacientes" subtitle={`${patients.length} paciente(s) registado(s)`} back="/">
      {patients.length === 0 ? (
        <p className="surface-card p-6 text-center text-sm text-muted-foreground">
          Ainda não há registos. Grave uma conduta após gerar os parâmetros.
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {patients.map((p) => (
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
                  <article key={s.id} className="rounded-xl border border-border bg-background p-4">
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
                        {s.protocol.modalidade === "laser" ? "Laser" : "LED"} · EVA {s.assessment.dor}/10
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
    </AppShell>
  );
}
