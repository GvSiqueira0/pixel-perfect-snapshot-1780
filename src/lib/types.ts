export type Modality = "laser" | "led";
export type TissueDepth = "superficial" | "profundo";
export type PainStage = "agudo" | "cronico";

export interface Assessment {
  nome: string;
  idade: string;
  sexo: string;
  diagnosticoClinico: string;
  diagnosticoFisio: string;
  queixaPrincipal: string;
  tabagismo: string;
  medicacao: string;
  alergias: string;
  apresentacaoFuncional: string;
  palpacao: string;
  pa: string;
  fc: string;
  spo2: string;
  dor: number;
  estagio: PainStage;
  areaCorpo: string;
  tecido: TissueDepth;
  areaCm2: string;
}

export interface Protocol {
  modalidade: Modality;
  comprimentoOnda: string;
  cor: string;
  energiaPorPonto: number;
  energiaTotal: number;
  pontos: number;
  potenciaMw: number;
  tempoPorPontoSeg: number;
  tempoTotalSeg: number;
  sessoes: string;
  frequencia: string;
  tecnica: string;
  resumo: string;
  justificativa: string;
  referencias: string[];
}

export interface SessionRecord {
  id: string;
  data: string;
  assessment: Assessment;
  protocol: Protocol;
  evolucao: string;
}

export interface Patient {
  id: string;
  nome: string;
  idade: string;
  sexo: string;
  sessoes: SessionRecord[];
}

export const emptyAssessment: Assessment = {
  nome: "",
  idade: "",
  sexo: "",
  diagnosticoClinico: "",
  diagnosticoFisio: "",
  queixaPrincipal: "",
  tabagismo: "nao",
  medicacao: "",
  alergias: "",
  apresentacaoFuncional: "",
  palpacao: "",
  pa: "",
  fc: "",
  spo2: "",
  dor: 5,
  estagio: "agudo",
  areaCorpo: "",
  tecido: "superficial",
  areaCm2: "10",
};
