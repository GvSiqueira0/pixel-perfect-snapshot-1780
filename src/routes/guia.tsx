import { createFileRoute } from "@tanstack/react-router";
import { Volume2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { speak } from "@/lib/speech";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Guia de uso dos aparelhos — FotoBio Clínica" },
      {
        name: "description",
        content:
          "Passo a passo para ligar, calibrar, higienizar e posicionar aparelhos de laser e LED na fotobiomodulação.",
      },
      { property: "og:title", content: "Guia de uso dos aparelhos — FotoBio Clínica" },
      {
        property: "og:description",
        content: "Anatomia da caneta de laser e do cluster de LED, com técnica pontual e varredura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Guia,
});

const laser = {
  partes: [
    ["Corpo / unidade de controlo", "Ecrã com seleção de comprimento de onda, potência, energia e tempo."],
    ["Caneta (aplicador)", "Contém o díodo emissor; segurar como uma caneta, perpendicular à pele."],
    ["Ponteira / lente de saída", "Janela por onde sai o feixe. Deve estar limpa, sem riscos ou fissuras."],
    ["Espaçador (opcional)", "Mantém distância padronizada em áreas sensíveis ou feridas abertas."],
    ["Pedal / botão de disparo", "Inicia a emissão; o aparelho sinaliza com som ao terminar o tempo do ponto."],
  ],
  passos: [
    ["1. Ligar", "Ligue à rede, aguarde a autocalibração do equipamento e verifique a carga da bateria."],
    ["2. Calibrar", "Confirme a potência de saída indicada pelo fabricante; recalibre periodicamente com o medidor."],
    ["3. Higienizar", "Limpe a ponteira com álcool 70% antes e depois de cada paciente; use filme protetor em feridas."],
    ["4. Proteger", "Coloque os óculos de proteção (paciente e terapeuta) específicos do comprimento de onda."],
    ["5. Posicionar", "Aplicação pontual: contacto perpendicular firme, 1 ponto a cada 2–4 cm² de área, sem deslizar."],
    ["6. Registar", "Anote energia por ponto, número de pontos, energia total e resposta do paciente."],
  ],
};

const led = {
  partes: [
    ["Painel / cluster", "Conjunto de díodos vermelhos e/ou infravermelhos para áreas extensas."],
    ["Braço articulado ou suporte", "Mantém o painel estável à distância definida da pele."],
    ["Unidade de controlo", "Seleção de cor, potência total e tempo de irradiação."],
    ["Superfície emissora", "Cobrir com filme transparente quando houver contacto com ferida."],
  ],
  passos: [
    ["1. Ligar", "Ligue o equipamento e confirme quais cores/díodos estarão ativos."],
    ["2. Calibrar", "Defina a densidade de energia (J/cm²) e o tempo calculado para a área a tratar."],
    ["3. Higienizar", "Desinfete a superfície emissora e use barreira protetora em pele não íntegra."],
    ["4. Proteger", "Óculos de proteção e proteção ocular do paciente, sobretudo em face."],
    ["5. Posicionar", "Varredura: painel a 1–2 cm da pele, perpendicular, cobrindo toda a área uniformemente."],
    ["6. Registar", "Anote área irradiada, densidade, energia total e tempo."],
  ],
};

function Block({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="surface-card mt-4 p-4">
      <h3 className="mb-3 text-base font-semibold text-primary">{title}</h3>
      <ul className="space-y-3">
        {rows.map(([k, v]) => (
          <li key={k} className="border-l-2 border-accent pl-3">
            <p className="text-sm font-semibold">{k}</p>
            <p className="text-sm text-muted-foreground">{v}</p>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        className="mt-3 h-11 w-full gap-2 text-primary"
        onClick={() => speak(`${title}. ` + rows.map(([k, v]) => `${k}: ${v}`).join(". "))}
      >
        <Volume2 className="h-4 w-4" /> Ouvir esta secção
      </Button>
    </section>
  );
}

function Guia() {
  return (
    <AppShell title="Guia de uso dos aparelhos" subtitle="Anatomia, calibração, higiene e posicionamento" back="/">
      <Tabs defaultValue="laser">
        <TabsList className="grid h-12 w-full grid-cols-2">
          <TabsTrigger value="laser" className="h-10 text-base">Laser</TabsTrigger>
          <TabsTrigger value="led" className="h-10 text-base">LED</TabsTrigger>
        </TabsList>

        <TabsContent value="laser">
          <Block title="Partes da caneta de laser" rows={laser.partes} />
          <Block title="Passo a passo de utilização" rows={laser.passos} />
        </TabsContent>

        <TabsContent value="led">
          <Block title="Partes do aparelho de LED" rows={led.partes} />
          <Block title="Passo a passo de utilização" rows={led.passos} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
