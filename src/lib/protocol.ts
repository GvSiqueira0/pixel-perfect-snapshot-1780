import type { Assessment, Modality, Protocol } from "./types";

/**
 * Simulador de conduta baseado em parâmetros usuais da literatura de
 * fotobiomodulação (WALT dosage recommendations, Hamblin 2018).
 * Uso educativo — não substitui julgamento clínico.
 */
export function generateProtocol(a: Assessment, modalidade: Modality): Protocol {
  const dor = a.dor;
  const cronico = a.estagio === "cronico";
  const profundo = a.tecido === "profundo";
  const area = Math.max(1, Number(a.areaCm2) || 10);

  if (modalidade === "laser") {
    const comprimentoOnda = profundo ? "808 nm (infravermelho, 700–900 nm)" : "660 nm (vermelho, 620–700 nm)";
    const cor = profundo ? "Infravermelho" : "Vermelho";
    const potenciaMw = profundo ? 100 : 100;
    // Energia por ponto: 2–8 J conforme profundidade, cronicidade e intensidade da dor
    let energiaPorPonto = profundo ? 4 : 2;
    if (cronico) energiaPorPonto += 2;
    if (dor >= 7) energiaPorPonto += 1;
    energiaPorPonto = Math.min(8, energiaPorPonto);

    const pontos = Math.max(1, Math.round(area / 4));
    const tempoPorPontoSeg = Math.round((energiaPorPonto / (potenciaMw / 1000)) * 10) / 10;
    const energiaTotal = Math.round(energiaPorPonto * pontos * 10) / 10;

    return {
      modalidade,
      comprimentoOnda,
      cor,
      energiaPorPonto,
      energiaTotal,
      pontos,
      potenciaMw,
      tempoPorPontoSeg,
      tempoTotalSeg: Math.round(tempoPorPontoSeg * pontos),
      sessoes: cronico ? "8 a 12 sessões" : "4 a 6 sessões",
      frequencia: cronico ? "2 a 3x por semana" : "3x por semana (dias alternados)",
      tecnica: "Pontual, contato perpendicular firme sobre a pele, ponteira higienizada a cada ponto",
      resumo:
        `Aplicação de laser ${cor.toLowerCase()} ${comprimentoOnda} em ${pontos} ponto(s) sobre ${a.areaCorpo || "a área-alvo"}, ` +
        `${energiaPorPonto} J por ponto (${energiaTotal} J totais), ${tempoPorPontoSeg}s por ponto. ` +
        `Reavaliar dor (EVA atual ${dor}/10) e função a cada 3 sessões.`,
      justificativa:
        `${profundo ? "O infravermelho (700–900 nm) apresenta maior penetração tecidual, sendo indicado para tecidos profundos como músculo, tendão profundo e articulação." : "O vermelho (620–700 nm) é absorvido em camadas superficiais, indicado para pele, cicatrizes e tecidos superficiais."} ` +
        `A fotobiomodulação atua na citocromo c oxidase mitocondrial, aumentando síntese de ATP, modulando espécies reativas de oxigénio e reduzindo mediadores inflamatórios (PGE2, TNF-α), com efeito analgésico e reparador. ` +
        `${cronico ? "Quadros crónicos respondem melhor a doses acumuladas mais altas por ponto." : "Quadros agudos respondem a doses mais baixas, priorizando controlo inflamatório."}`,
      referencias: [
        "WALT — World Association for Photobiomodulation Therapy: Dosage Recommendations (780–860 nm / 904 nm)",
        "Hamblin MR. Mechanisms and applications of the anti-inflammatory effects of photobiomodulation. AIMS Biophys. 2017",
        "Chow RT et al. Efficacy of low-level laser therapy in the management of neck pain. Lancet. 2009",
      ],
    };
  }

  // LED
  const cor = profundo ? "Infravermelho" : "Vermelho";
  const comprimentoOnda = profundo ? "850 nm (infravermelho)" : "630–660 nm (vermelho)";
  const potenciaMw = 200;
  const densidade = cronico ? 6 : 4; // J/cm²
  const energiaTotal = Math.round(densidade * area * 10) / 10;
  const tempoTotalSeg = Math.round(energiaTotal / (potenciaMw / 1000));

  return {
    modalidade,
    comprimentoOnda,
    cor,
    energiaPorPonto: densidade,
    energiaTotal,
    pontos: 1,
    potenciaMw,
    tempoPorPontoSeg: tempoTotalSeg,
    tempoTotalSeg,
    sessoes: cronico ? "10 a 12 sessões" : "5 a 8 sessões",
    frequencia: cronico ? "2 a 3x por semana" : "3x por semana",
    tecnica: "Varredura/cluster com o painel a 1–2 cm da pele, cobrindo toda a área irradiada",
    resumo:
      `Irradiação com LED ${cor.toLowerCase()} ${comprimentoOnda} sobre ${a.areaCorpo || "a área-alvo"} (${area} cm²), ` +
      `densidade de ${densidade} J/cm², energia total ${energiaTotal} J, tempo aproximado de ${Math.round(tempoTotalSeg / 60)} min ${tempoTotalSeg % 60}s.`,
    justificativa:
      `O LED apresenta emissão não colimada e de banda mais larga, adequado para áreas extensas e tratamento por varredura. ` +
      `${profundo ? "O comprimento de onda infravermelho favorece a chegada de energia a tecidos mais profundos." : "O vermelho é adequado para reparo tegumentar, cicatrizes e lesões superficiais."} ` +
      `Doses entre 4 e 10 J/cm² estão associadas a efeito bioestimulante; doses excessivas podem gerar bioinibição (lei de Arndt-Schultz).`,
    referencias: [
      "Hamblin MR. Photobiomodulation or low-level laser therapy. J Biophotonics. 2016",
      "Anders JJ et al. Low-level light/laser therapy versus photobiomodulation therapy. Photomed Laser Surg. 2015",
      "Avci P et al. Low-level laser (light) therapy in skin. Semin Cutan Med Surg. 2013",
    ],
  };
}

export function protocolToSpeech(p: Protocol): string {
  if (p.modalidade === "laser") {
    return `Conduta com laser. Comprimento de onda ${p.comprimentoOnda}. Potência ${p.potenciaMw} miliwatts. ${p.energiaPorPonto} joules por ponto, em ${p.pontos} pontos, totalizando ${p.energiaTotal} joules. Tempo de ${p.tempoPorPontoSeg} segundos por ponto. Técnica: ${p.tecnica}. ${p.sessoes}, ${p.frequencia}.`;
  }
  return `Conduta com LED. ${p.cor}, ${p.comprimentoOnda}. Densidade de ${p.energiaPorPonto} joules por centímetro quadrado, energia total de ${p.energiaTotal} joules. Tempo total de irradiação ${p.tempoTotalSeg} segundos. Técnica: ${p.tecnica}. ${p.sessoes}, ${p.frequencia}.`;
}
