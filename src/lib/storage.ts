import type { Patient, SessionRecord } from "./types";

const KEY = "fotobio.pacientes.v1";

const seed: Patient[] = [
  {
    id: "p1",
    nome: "Maria Oliveira",
    idade: "62",
    sexo: "Feminino",
    sessoes: [
      {
        id: "s1",
        data: "2026-09-18T14:00:00.000Z",
        evolucao: "Reduziu dor de 8 para 5 na EVA. Melhora da amplitude de elevação do ombro.",
        assessment: {
          nome: "Maria Oliveira",
          idade: "62",
          sexo: "Feminino",
          diagnosticoClinico: "Tendinopatia do supraespinhal à direita",
          diagnosticoFisio: "Dor e limitação funcional de ombro direito",
          queixaPrincipal: "Dor ao elevar o braço há 4 meses",
          tabagismo: "nao",
          medicacao: "Losartana 50mg",
          alergias: "Nega",
          apresentacaoFuncional: "Arco doloroso entre 70 e 110 graus",
          palpacao: "Dor à palpação do tubérculo maior, sem edema",
          pa: "130/80",
          fc: "76",
          spo2: "98",
          dor: 8,
          estagio: "cronico",
          areaCorpo: "Ombro direito",
          tecido: "profundo",
          areaCm2: "12",
        },
        protocol: {
          modalidade: "laser",
          comprimentoOnda: "808 nm (infravermelho, 700–900 nm)",
          cor: "Infravermelho",
          energiaPorPonto: 7,
          energiaTotal: 21,
          pontos: 3,
          potenciaMw: 100,
          tempoPorPontoSeg: 70,
          tempoTotalSeg: 210,
          sessoes: "8 a 12 sessões",
          frequencia: "2 a 3x por semana",
          tecnica: "Pontual, contato perpendicular firme sobre a pele",
          resumo: "Laser infravermelho 808 nm, 3 pontos peritendíneos, 7 J por ponto.",
          justificativa: "Tecido profundo e quadro crónico exigem maior penetração e dose acumulada.",
          referencias: ["WALT Dosage Recommendations"],
        },
      },
    ],
  },
  {
    id: "p2",
    nome: "João Santos",
    idade: "34",
    sexo: "Masculino",
    sessoes: [
      {
        id: "s2",
        data: "2026-09-25T10:30:00.000Z",
        evolucao: "Ferida com bom tecido de granulação, redução do exsudato.",
        assessment: {
          nome: "João Santos",
          idade: "34",
          sexo: "Masculino",
          diagnosticoClinico: "Úlcera venosa em perna esquerda",
          diagnosticoFisio: "Retardo de cicatrização tegumentar",
          queixaPrincipal: "Ferida que não fecha há 2 meses",
          tabagismo: "sim",
          medicacao: "Nenhuma",
          alergias: "Nega",
          apresentacaoFuncional: "Marcha preservada, dor leve local",
          palpacao: "Bordas irregulares, sem sinais flogísticos",
          pa: "120/75",
          fc: "70",
          spo2: "99",
          dor: 3,
          estagio: "cronico",
          areaCorpo: "Perna esquerda (face medial)",
          tecido: "superficial",
          areaCm2: "20",
        },
        protocol: {
          modalidade: "led",
          comprimentoOnda: "630–660 nm (vermelho)",
          cor: "Vermelho",
          energiaPorPonto: 6,
          energiaTotal: 120,
          pontos: 1,
          potenciaMw: 200,
          tempoPorPontoSeg: 600,
          tempoTotalSeg: 600,
          sessoes: "10 a 12 sessões",
          frequencia: "2 a 3x por semana",
          tecnica: "Varredura com cluster a 1–2 cm da pele",
          resumo: "LED vermelho, 6 J/cm² sobre 20 cm², 120 J totais.",
          justificativa: "Vermelho favorece reparo tegumentar superficial.",
          referencias: ["Avci P et al. Semin Cutan Med Surg. 2013"],
        },
      },
    ],
  },
];

export function loadPatients(): Patient[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Patient[];
  } catch {
    return seed;
  }
}

function save(list: Patient[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function addSession(session: SessionRecord): Patient[] {
  const list = loadPatients();
  const nome = session.assessment.nome.trim() || "Paciente sem nome";
  const existing = list.find((p) => p.nome.toLowerCase() === nome.toLowerCase());
  if (existing) {
    existing.sessoes = [session, ...existing.sessoes];
  } else {
    list.unshift({
      id: crypto.randomUUID(),
      nome,
      idade: session.assessment.idade,
      sexo: session.assessment.sexo,
      sessoes: [session],
    });
  }
  save(list);
  return list;
}

export function updateEvolucao(patientId: string, sessionId: string, texto: string): Patient[] {
  const list = loadPatients();
  const p = list.find((x) => x.id === patientId);
  const s = p?.sessoes.find((x) => x.id === sessionId);
  if (s) s.evolucao = texto;
  save(list);
  return list;
}

export function removePatient(patientId: string): Patient[] {
  const list = loadPatients().filter((p) => p.id !== patientId);
  save(list);
  return list;
}
