import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Save, Sparkles, Volume2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { MicButton } from "@/components/MicButton";
import { SafetyChecklist } from "@/components/SafetyChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { generateProtocol, protocolToSpeech } from "@/lib/protocol";
import { speak } from "@/lib/speech";
import { addSession } from "@/lib/storage";
import { emptyAssessment, type Assessment, type Modality, type Protocol } from "@/lib/types";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  modalidade: z.enum(["laser", "led"]).catch("laser"),
});

export const Route = createFileRoute("/avaliacao")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Nova avaliação — FotoBio Clínica" },
      {
        name: "description",
        content:
          "Checklist de segurança, anamnese clínica completa e geração de parâmetros de laser ou LED.",
      },
      { property: "og:title", content: "Nova avaliação — FotoBio Clínica" },
      {
        property: "og:description",
        content: "Anamnese, escala de dor e cálculo de dose em fotobiomodulação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Avaliacao,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  voice = true,
  textarea = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  voice?: boolean;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-start gap-2">
        {textarea ? (
          <Textarea
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-20 text-base"
          />
        ) : (
          <Input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 text-base"
          />
        )}
        {voice ? (
          <MicButton label={`Ditar ${label}`} onResult={(t) => onChange(value ? `${value} ${t}` : t)} />
        ) : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card mt-4 p-4">
      <h2 className="mb-4 text-base font-semibold text-primary">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "min-h-12 rounded-xl border-2 px-3 text-sm font-medium transition active:scale-[0.98]",
              value === o.id ? "border-primary bg-primary/5 text-primary" : "border-border",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Avaliacao() {
  const { modalidade: initialModality } = Route.useSearch();
  const navigate = useNavigate();
  const [modalidade, setModalidade] = useState<Modality>(initialModality);
  const [safetyOpen, setSafetyOpen] = useState(true);
  const [safetyOk, setSafetyOk] = useState(false);
  const [a, setA] = useState<Assessment>(emptyAssessment);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof Assessment>(k: K, v: Assessment[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  const gerar = () => {
    if (!safetyOk) {
      setSafetyOpen(true);
      return;
    }
    if (!a.nome.trim() || !a.queixaPrincipal.trim() || !a.areaCorpo.trim()) {
      toast.error("Preencha nome, queixa principal e área do corpo.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setProtocol(generateProtocol(a, modalidade));
      setLoading(false);
      toast.success("Conduta gerada com base nos dados da avaliação.");
    }, 700);
  };

  const gravar = () => {
    if (!protocol) return;
    addSession({
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
      assessment: a,
      protocol,
      evolucao: "",
    });
    toast.success("Registo gravado no histórico do paciente.");
    navigate({ to: "/historico" });
  };

  return (
    <AppShell
      title="Novo atendimento"
      subtitle={safetyOk ? "Checklist confirmado" : "Confirme o checklist de segurança"}
      back="/"
    >
      <SafetyChecklist
        open={safetyOpen}
        onOpenChange={(v) => {
          if (!v && !safetyOk) navigate({ to: "/" });
          else setSafetyOpen(v);
        }}
        onConfirm={() => {
          setSafetyOk(true);
          setSafetyOpen(false);
          toast.success("Segurança confirmada. Pode prosseguir com a avaliação.");
        }}
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <span className="flex items-center gap-2 text-sm">
          <ShieldCheck className={cn("h-5 w-5", safetyOk ? "text-success" : "text-warning")} />
          {safetyOk ? "Checklist de segurança confirmado" : "Checklist pendente"}
        </span>
        <Button variant="outline" size="sm" onClick={() => setSafetyOpen(true)}>
          Rever
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["laser", "led"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={modalidade === m}
            onClick={() => setModalidade(m)}
            className={cn(
              "min-h-12 rounded-xl border-2 text-sm font-semibold transition",
              modalidade === m ? "border-primary bg-primary/5 text-primary" : "border-border",
            )}
          >
            {m === "laser" ? "Laser terapêutico" : "LED"}
          </button>
        ))}
      </div>

      <Section title="Identificação">
        <Field label="Nome do paciente" value={a.nome} onChange={(v) => set("nome", v)} placeholder="Nome completo" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Idade" value={a.idade} onChange={(v) => set("idade", v)} voice={false} type="number" />
          <Field label="Sexo" value={a.sexo} onChange={(v) => set("sexo", v)} voice={false} placeholder="F / M" />
        </div>
        <Field label="Diagnóstico clínico" value={a.diagnosticoClinico} onChange={(v) => set("diagnosticoClinico", v)} />
        <Field label="Diagnóstico fisioterapêutico" value={a.diagnosticoFisio} onChange={(v) => set("diagnosticoFisio", v)} />
        <Field label="Queixa principal (QP)" textarea value={a.queixaPrincipal} onChange={(v) => set("queixaPrincipal", v)} />
      </Section>

      <Section title="Histórico e hábitos">
        <Choice
          label="Tabagismo"
          value={a.tabagismo}
          onChange={(v) => set("tabagismo", v)}
          options={[
            { id: "nao", label: "Não fumante" },
            { id: "sim", label: "Fumante" },
          ]}
        />
        <Field label="Medicação em uso" textarea value={a.medicacao} onChange={(v) => set("medicacao", v)} />
        <Field label="Alergias" value={a.alergias} onChange={(v) => set("alergias", v)} />
      </Section>

      <Section title="Exame físico">
        <Field label="Apresentação funcional" textarea value={a.apresentacaoFuncional} onChange={(v) => set("apresentacaoFuncional", v)} />
        <Field label="Palpação / inspeção (edema, cicatriz, atrofia)" textarea value={a.palpacao} onChange={(v) => set("palpacao", v)} />
        <div className="grid grid-cols-3 gap-2">
          <Field label="PA" value={a.pa} onChange={(v) => set("pa", v)} voice={false} placeholder="120/80" />
          <Field label="FC" value={a.fc} onChange={(v) => set("fc", v)} voice={false} placeholder="72" />
          <Field label="SpO2" value={a.spo2} onChange={(v) => set("spo2", v)} voice={false} placeholder="98" />
        </div>
      </Section>

      <Section title="Avaliação da dor">
        <div>
          <div className="flex items-end justify-between">
            <Label className="text-sm font-medium">Escala visual analógica (EVA)</Label>
            <span className="text-3xl font-bold text-primary">{a.dor}</span>
          </div>
          <Slider
            value={[a.dor]}
            min={0}
            max={10}
            step={1}
            onValueChange={([v]) => set("dor", v ?? 0)}
            className="mt-4"
            aria-label="Nível de dor de 0 a 10"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0 — sem dor</span>
            <span>10 — pior dor</span>
          </div>
        </div>
        <Choice
          label="Característica do quadro"
          value={a.estagio}
          onChange={(v) => set("estagio", v)}
          options={[
            { id: "agudo", label: "Agudo" },
            { id: "cronico", label: "Crónico" },
          ]}
        />
      </Section>

      <Section title="Área-alvo">
        <Field label="Área do corpo" value={a.areaCorpo} onChange={(v) => set("areaCorpo", v)} placeholder="Ex.: ombro direito" />
        <Choice
          label="Tecido-alvo"
          value={a.tecido}
          onChange={(v) => set("tecido", v)}
          options={[
            { id: "superficial", label: "Superficial" },
            { id: "profundo", label: "Profundo" },
          ]}
        />
        <Field label="Área a irradiar (cm²)" value={a.areaCm2} onChange={(v) => set("areaCm2", v)} voice={false} type="number" />
      </Section>

      <Button size="lg" className="mt-5 h-16 w-full gap-3 text-base" onClick={gerar} disabled={loading}>
        <Sparkles className="h-5 w-5" />
        {loading ? "A calcular conduta..." : "Gerar conduta e parâmetros com IA"}
      </Button>

      {protocol ? <ProtocolPanel p={protocol} onSave={gravar} /> : null}
    </AppShell>
  );
}

function ProtocolPanel({ p, onSave }: { p: Protocol; onSave: () => void }) {
  const isLaser = p.modalidade === "laser";
  const cards = isLaser
    ? [
        { k: "Comprimento de onda", v: p.comprimentoOnda },
        { k: "Potência", v: `${p.potenciaMw} mW` },
        { k: "Energia por ponto", v: `${p.energiaPorPonto} J` },
        { k: "Pontos de aplicação", v: `${p.pontos}` },
        { k: "Energia total", v: `${p.energiaTotal} J` },
        { k: "Tempo por ponto", v: `${p.tempoPorPontoSeg} s` },
      ]
    : [
        { k: "Cor / comprimento de onda", v: `${p.cor} — ${p.comprimentoOnda}` },
        { k: "Densidade", v: `${p.energiaPorPonto} J/cm²` },
        { k: "Energia total", v: `${p.energiaTotal} J` },
        { k: "Tempo de irradiação", v: `${Math.floor(p.tempoTotalSeg / 60)} min ${p.tempoTotalSeg % 60} s` },
        { k: "Potência do cluster", v: `${p.potenciaMw} mW` },
        { k: "Técnica", v: "Varredura" },
      ];

  return (
    <section className="mt-6" aria-label="Parâmetros recomendados">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Conduta recomendada</h2>
        <Badge className="bg-accent text-accent-foreground">{isLaser ? "Laser" : "LED"}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.k} className="surface-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.k}</p>
            <p className="mt-1 text-lg font-semibold leading-snug text-primary">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="surface-card mt-3 space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Resumo da conduta</p>
          <p className="mt-1 text-sm leading-relaxed">{p.resumo}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Justificativa fisiológica</p>
          <p className="mt-1 text-sm leading-relaxed">{p.justificativa}</p>
        </div>
        <div className="grid gap-1 text-sm">
          <span><strong>Técnica:</strong> {p.tecnica}</span>
          <span><strong>Sessões:</strong> {p.sessoes} — {p.frequencia}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Respaldo científico</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {p.referencias.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button size="lg" className="h-14 gap-2 text-base" onClick={onSave}>
          <Save className="h-5 w-5" /> Gravar no histórico
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 gap-2 border-2 text-base"
          onClick={() => speak(protocolToSpeech(p))}
        >
          <Volume2 className="h-5 w-5" /> Ouvir parâmetros
        </Button>
      </div>
    </section>
  );
}
