export type StatusConcurso =
  | "Inscrições Abertas"
  | "Provas Abertas"
  | "Em Análise"
  | "Encerrado"
  | "Previsto"

export type Concurso = {
  id: string
  sigla: string
  titulo: string
  descricao: string
  status: StatusConcurso
  vagas: number
  escolaridade: string
  inscricoesInicio: string
  inscricoesFim: string
  taxa: string
  local: string
  remuneracao: string
  cargo?: string
  temaProva?: string
  imagem?: string
  dataProva?: string
}

export const concursos: Concurso[] = [
  {
    id: "epcar-2026",
    sigla: "CAP",
    titulo: "Concurso de Admissão à Escola de Aprendizes-Marinheiros",
    descricao:
      "Processo seletivo destinado à formação de Marinheiros com foco em atividades técnicas e operativas de bordo.",
    status: "Inscrições Abertas",
    vagas: 1320,
    escolaridade: "Ensino Médio Completo",
    inscricoesInicio: "2026-02-10",
    inscricoesFim: "2026-03-25",
    taxa: "R$ 75,00",
    local: "Todo o território nacional",
    remuneracao: "R$ 1.279,00 (durante o curso)",
  },
  {
    id: "fuzileiros-2026",
    sigla: "CFN",
    titulo: "Corpo de Praças de Fuzileiros Navais",
    descricao:
      "Seleção de candidatos para o Corpo de Fuzileiros Navais, com formação em operações anfíbias e defesa naval.",
    status: "Inscrições Abertas",
    vagas: 480,
    escolaridade: "Ensino Médio Completo",
    inscricoesInicio: "2026-01-20",
    inscricoesFim: "2026-02-28",
    taxa: "R$ 75,00",
    local: "Rio de Janeiro - RJ",
    remuneracao: "R$ 1.412,00 (durante o curso)",
  },
  {
    id: "quadro-tecnico-2026",
    sigla: "QT",
    titulo: "Quadro Técnico de Oficiais",
    descricao:
      "Concurso para ingresso no Quadro Técnico, destinado a profissionais de nível superior em diversas áreas.",
    status: "Provas Abertas",
    vagas: 96,
    escolaridade: "Ensino Superior Completo",
    inscricoesInicio: "2025-11-05",
    inscricoesFim: "2025-12-15",
    taxa: "R$ 140,00",
    local: "Todo o território nacional",
    remuneracao: "R$ 9.310,00 (após formação)",
  },
  {
    id: "saude-2026",
    sigla: "CSM",
    titulo: "Corpo de Saúde da Marinha",
    descricao:
      "Processo seletivo para médicos, dentistas e demais profissionais de saúde ingressarem como oficiais.",
    status: "Previsto",
    vagas: 54,
    escolaridade: "Ensino Superior Completo",
    inscricoesInicio: "2026-04-01",
    inscricoesFim: "2026-05-10",
    taxa: "R$ 140,00",
    local: "Todo o território nacional",
    remuneracao: "R$ 9.310,00 (após formação)",
  },
  {
    id: "colegio-naval-2025",
    sigla: "CN",
    titulo: "Concurso de Admissão ao Colégio Naval",
    descricao:
      "Ingresso ao Colégio Naval para jovens que desejam iniciar a carreira de Oficial da Marinha.",
    status: "Encerrado",
    vagas: 210,
    escolaridade: "Ensino Fundamental Completo",
    inscricoesInicio: "2025-03-01",
    inscricoesFim: "2025-04-10",
    taxa: "R$ 90,00",
    local: "Angra dos Reis - RJ",
    remuneracao: "Bolsa de estudos integral",
  },
]

export type Noticia = {
  id: string
  titulo: string
  resumo: string
  data: string
  categoria: string
}

export const noticias: Noticia[] = [
  {
    id: "n1",
    titulo: "Publicado edital do Concurso de Admissão 2026",
    resumo:
      "Estão abertas as inscrições para o Concurso de Admissão à Escola de Aprendizes-Marinheiros com 1.320 vagas.",
    data: "2026-02-10",
    categoria: "Editais",
  },
  {
    id: "n2",
    titulo: "Divulgado cronograma das provas objetivas",
    resumo:
      "A Diretoria de Ensino publicou o calendário oficial das provas para os concursos do primeiro semestre.",
    data: "2026-02-05",
    categoria: "Provas",
  },
  {
    id: "n3",
    titulo: "Resultado final do Corpo de Fuzileiros Navais",
    resumo:
      "Confira a relação dos candidatos aprovados na etapa final do processo seletivo de 2025.",
    data: "2026-01-28",
    categoria: "Resultados",
  },
  {
    id: "n4",
    titulo: "Orientações sobre a inspeção de saúde",
    resumo:
      "Candidatos convocados devem observar os documentos exigidos para a etapa de avaliação médica.",
    data: "2026-01-15",
    categoria: "Comunicados",
  },
]

export function formatarData(iso: string) {
  if (!iso) return ""
  const [ano, mes, dia] = iso.split("-")
  if (!ano || !mes || !dia) return ""
  return `${dia}/${mes}/${ano}`
}

export const statusColors: Record<StatusConcurso, string> = {
  "Inscrições Abertas": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Provas Abertas": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Em Análise": "bg-amber-100 text-amber-800 border-amber-200",
  Encerrado: "bg-red-100 text-red-800 border-red-200",
  Previsto: "bg-sky-100 text-sky-800 border-sky-200",
}
