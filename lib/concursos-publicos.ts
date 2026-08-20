import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Contest, Publicacao, TipoPublicacao } from "@/lib/types"
import type { Concurso, StatusConcurso } from "@/lib/data"

function mapStatus(s: Contest["status"]): StatusConcurso {
  if (s === "inscricoes_abertas") return "Inscrições Abertas"
  if (s === "em_andamento") return "Provas Abertas"
  return "Encerrado"
}

function gerarSigla(cargo: string, titulo: string): string {
  const base = (cargo || titulo).trim()
  const palavras = base.split(/\s+/).filter((p) => p.length > 2)
  const letras = palavras.map((p) => p[0]).join("").toUpperCase()
  return (letras || base.slice(0, 3)).slice(0, 4) || "MB"
}

const IMAGENS = [
  "/concursos/naval-formatura.png",
  "/concursos/naval-fuzileiro.png",
  "/concursos/naval-oficiais.png",
  "/concursos/naval-navio.png",
]

function escolherImagem(id: string): string {
  let soma = 0
  for (const ch of id) soma += ch.charCodeAt(0)
  return IMAGENS[soma % IMAGENS.length]
}

export function contestToConcurso(c: Contest): Concurso {
  return {
    id: c.id,
    sigla: gerarSigla(c.cargo, c.titulo),
    titulo: c.titulo,
    descricao: c.descricao ?? "",
    status: mapStatus(c.status),
    vagas: c.vagas,
    escolaridade: c.escolaridade || "Conforme edital",
    inscricoesInicio: c.inscricoes_inicio ?? "",
    inscricoesFim: c.inscricoes_fim ?? "",
    taxa: c.taxa || "Conforme edital",
    local: c.local || c.orgao || "Conforme edital",
    remuneracao: c.remuneracao || "Conforme edital",
    cargo: c.cargo || undefined,
    temaProva: c.tema_prova || undefined,
    imagem: c.image_url || escolherImagem(c.id),
    dataProva: c.data_prova ?? undefined,
  }
}

export async function getConcursosPublicos(): Promise<Concurso[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: false })
  return ((data ?? []) as Contest[]).map(contestToConcurso)
}

export async function getConcursoPublico(id: string): Promise<Concurso | null> {
  const supabase = createAdminClient()
  const { data } = await supabase.from("contests").select("*").eq("id", id).single()
  if (!data) return null
  return contestToConcurso(data as Contest)
}

export type InscricaoCandidato = {
  id: string
  numero_inscricao: string
  nome: string
  nome_personagem: string | null
  codigo_prova: string
  created_at: string
  concurso: Concurso | null
}

export async function getInscricoesPorIdJogo(idJogo: string): Promise<InscricaoCandidato[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("registrations")
    .select("*, contests(*)")
    .eq("id_jogo", idJogo)
    .order("created_at", { ascending: false })

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    numero_inscricao: row.numero_inscricao,
    nome: row.nome,
    nome_personagem: row.nome_personagem ?? null,
    codigo_prova: row.codigo_prova,
    created_at: row.created_at,
    concurso: row.contests ? contestToConcurso(row.contests as Contest) : null,
  }))
}

export async function getPublicacoesPublicas(tipo: TipoPublicacao): Promise<Publicacao[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("publicacoes")
    .select("*, contests(titulo)")
    .eq("tipo", tipo)
    .order("data_evento", { ascending: tipo === "cronograma", nullsFirst: false })
    .order("created_at", { ascending: false })

  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    tipo: row.tipo,
    contest_id: row.contest_id,
    titulo: row.titulo,
    descricao: row.descricao,
    pdf_url: row.pdf_url,
    data_evento: row.data_evento,
    created_at: row.created_at,
    concurso_titulo: row.contests?.titulo ?? null,
  }))
}
