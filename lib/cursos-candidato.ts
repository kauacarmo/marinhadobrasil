import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Curso, CursoComVagas } from "@/lib/types"

export type CursoCandidato = CursoComVagas & {
  inscrito: boolean
  lotado: boolean
  encerrado: boolean
  abertoParaInscricao: boolean
}

function estaEncerrado(fim: string | null): boolean {
  if (!fim) return false
  const hoje = new Date().toISOString().slice(0, 10)
  return fim < hoje
}

export async function getCursosParaCandidato(contaId: string | null): Promise<CursoCandidato[]> {
  const supabase = createAdminClient()

  const { data: cursos } = await supabase
    .from("cursos")
    .select("*")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
  if (!cursos || cursos.length === 0) return []

  const { data: inscricoes } = await supabase.from("curso_inscricoes").select("curso_id, candidato_conta_id")

  const contagem = new Map<string, number>()
  const meus = new Set<string>()
  for (const i of inscricoes ?? []) {
    contagem.set(i.curso_id, (contagem.get(i.curso_id) ?? 0) + 1)
    if (contaId && i.candidato_conta_id === contaId) meus.add(i.curso_id)
  }

  return (cursos as Curso[]).map((c) => {
    const inscritos = contagem.get(c.id) ?? 0
    const lotado = c.vagas > 0 && inscritos >= c.vagas
    const encerrado = estaEncerrado(c.inscricoes_fim)
    const inscrito = meus.has(c.id)
    return {
      ...c,
      inscritos,
      inscrito,
      lotado,
      encerrado,
      abertoParaInscricao: !lotado && !encerrado && !inscrito,
    }
  })
}
