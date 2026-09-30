import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const ITEMS = [
  {
    id: "oculos",
    label: "Óculos de proteção adequados",
    hint: "Paciente e terapeuta com óculos específicos para o comprimento de onda utilizado.",
  },
  {
    id: "contra",
    label: "Contraindicações verificadas",
    hint: "Neoplasias ativas, gravidez sobre abdómen/lombar, fotossensibilidade, uso de fotossensibilizantes.",
  },
  {
    id: "area",
    label: "Inspeção visual e integridade da área",
    hint: "Pele íntegra, sem infeção ativa não controlada, sem tatuagens escuras no ponto de aplicação.",
  },
  {
    id: "ponteira",
    label: "Ponteira íntegra e higienizada",
    hint: "Limpeza com álcool 70% ou conforme fabricante, sem fissuras na lente.",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function SafetyChecklist({ open, onOpenChange, onConfirm }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const all = ITEMS.every((i) => checked[i.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            Checklist de segurança obrigatório
          </DialogTitle>
          <DialogDescription>
            Confirme todos os itens antes de calcular qualquer conduta de fotobiomodulação.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40">
                <Checkbox
                  checked={!!checked[item.id]}
                  onCheckedChange={(v) =>
                    setChecked((c) => ({ ...c, [item.id]: v === true }))
                  }
                  className="mt-0.5 h-6 w-6"
                />
                <span>
                  <span className="block text-base font-medium">{item.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{item.hint}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <Button
          size="lg"
          disabled={!all}
          className="h-14 w-full text-base"
          onClick={() => {
            setChecked({});
            onConfirm();
          }}
        >
          {all ? "Confirmar e continuar" : "Confirme todos os itens"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
