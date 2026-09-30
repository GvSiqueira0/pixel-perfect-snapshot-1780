import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { createRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface Props {
  onResult: (text: string) => void;
  label?: string;
  className?: string;
}

export function MicButton({ onResult, label = "Ditar por voz", className }: Props) {
  const [listening, setListening] = useState(false);

  const start = () => {
    const rec = createRecognition();
    if (!rec) {
      toast.error("Ditado por voz indisponível neste navegador", {
        description: "Use o Chrome ou Safari mais recente para ditar as respostas.",
      });
      return;
    }
    rec.onresult = (e) => {
      const text = e.results[e.resultIndex]?.[0]?.transcript ?? "";
      if (text) onResult(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast.error("Não consegui ouvir. Tente novamente.");
    };
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      onClick={start}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-all active:scale-95",
        listening && "brand-gradient animate-pulse border-transparent text-primary-foreground",
        className,
      )}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
