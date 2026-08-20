export type ContestStatus = "fechado" | "inscricoes_abertas" | "em_andamento" | "previsto"

export type Contest = {
  id: string
  titulo: string
  orgao: string
  cargo: string
  vagas: number
  descricao: string | null
  tema_prova: string
  status: ContestStatus
  status_previsto: ContestStatus | null
  status_previsto_data: string | null
  image_url: string | null
  local: string | null
  escolaridade: string | null
  taxa: string | null
  remuneracao: string | null
  inscricoes_inicio: string | null
  inscricoes_fim: string | null
  data_prova: string | null
  created_at: string
}

export type AdminUser = {
  id: string
  nome: string
  usuario: string
  senha: string
  papel: string
  ativo: boolean
  created_at: string
}

export type Registration = {
  id: string
  contest_id: string
  numero_inscricao: string
  nome: string
  id_jogo: string | null
  nome_personagem: string | null
  idade: number
  data_nascimento: string
  codigo_prova: string
  acertos: number | null
  total_questoes: number | null
  respostas: number[] | null
  prova_finalizada_em: string | null
  created_at: string
}

export type Questao = {
  enunciado: string
  alternativas: string[]
  correta: number
}

export type Exam = {
  id: string
  contest_id: string
  titulo: string
  questoes: Questao[]
  liberada: boolean
  duracao_minutos: number
  created_at: string
}

export const STATUS_LABEL: Record<ContestStatus, string> = {
  fechado: "Fechado",
  inscricoes_abertas: "Inscrições Abertas",
  em_andamento: "Em Andamento",
  previsto: "Previsto",
}

export type TipoDocumento = "portaria" | "boletim" | "disciplinar"

export type Documento = {
  id: string
  tipo: TipoDocumento
  numero: string | null
  titulo: string
  conteudo: string | null
  pdf_url: string | null
  origem: string
  created_at: string
}

export const DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  portaria: "Portarias",
  boletim: "Boletim Interno",
  disciplinar: "Disciplinar",
}

export const DOCUMENTO_LABEL_SINGULAR: Record<TipoDocumento, string> = {
  portaria: "Portaria",
  boletim: "Boletim Interno",
  disciplinar: "Documento Disciplinar",
}

export type TipoPublicacao = "resultado" | "edital" | "cronograma"

export type Publicacao = {
  id: string
  tipo: TipoPublicacao
  contest_id: string | null
  titulo: string
  descricao: string | null
  pdf_url: string | null
  data_evento: string | null
  created_at: string
  concurso_titulo?: string | null
}

export const PUBLICACAO_LABEL: Record<TipoPublicacao, string> = {
  resultado: "Resultados",
  edital: "Editais",
  cronograma: "Cronogramas",
}

export const PUBLICACAO_LABEL_SINGULAR: Record<TipoPublicacao, string> = {
  resultado: "Resultado",
  edital: "Edital",
  cronograma: "Cronograma",
}

export type AbaWebhook =
  | "concursos"
  | "publicacoes"
  | "noticias"
  | "diario_naval"
  | "candidatos"
  | "assinantes"
  | "ouvidoria"

export type DestinoNoticia = "portal" | "diario_naval" | "ambos"

export type Noticia = {
  id: string
  titulo: string
  resumo: string
  categoria: string
  data: string
  destino: DestinoNoticia
  imagem_url: string | null
  rodape: string | null
  mencao: string | null
  created_at: string
}

export const CATEGORIAS_NOTICIA = ["Editais", "Provas", "Resultados", "Comunicados", "Institucional"] as const

export type Webhook = {
  id: string
  aba: AbaWebhook
  nome: string | null
  url: string
  ativo: boolean
  created_at: string
}

export const WEBHOOK_ABAS: { valor: AbaWebhook; label: string; descricao: string }[] = [
  { valor: "concursos", label: "Concursos", descricao: "Disparado ao criar, atualizar ou remover um concurso." },
  { valor: "publicacoes", label: "Resultados e Editais", descricao: "Disparado ao publicar um resultado, edital ou cronograma." },
  { valor: "noticias", label: "Notícias", descricao: "Disparado ao publicar uma notícia no portal do site." },
  { valor: "diario_naval", label: "Notícias — Diário Naval", descricao: "Disparado ao publicar uma notícia no canal Diário Naval." },
  { valor: "candidatos", label: "Candidatos", descricao: "Disparado a cada nova inscrição de candidato." },
  { valor: "assinantes", label: "Assinantes", descricao: "Disparado quando um cidadão se cadastra para receber notícias." },
  { valor: "ouvidoria", label: "Ouvidoria", descricao: "Disparado a cada nova manifestação registrada na Ouvidoria." },
]
