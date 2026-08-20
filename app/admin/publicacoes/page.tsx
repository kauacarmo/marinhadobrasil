import { AdminTopbar } from "@/components/admin/admin-topbar"
import { PublicacoesManager } from "@/components/admin/publicacoes-manager"
import {
  listPublicacoes,
  listConcursosSelect,
  listConcursosComDesempenho,
} from "@/app/admin/publicacoes/actions"
import type { Publicacao } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminPublicacoesPage() {
  const [resultado, edital, cronograma, concursos, desempenho] = await Promise.all([
    listPublicacoes("resultado"),
    listPublicacoes("edital"),
    listPublicacoes("cronograma"),
    listConcursosSelect(),
    listConcursosComDesempenho(),
  ])

  const dados: Record<"resultado" | "edital" | "cronograma", Publicacao[]> = {
    resultado,
    edital,
    cronograma,
  }

  return (
    <div className="flex flex-col">
      <AdminTopbar
        titulo="Resultados, Editais e Cronogramas"
        descricao="Publique e gerencie os itens exibidos na área pública dos candidatos."
      />
      <div className="p-6">
        <PublicacoesManager dados={dados} concursos={concursos} concursosDesempenho={desempenho} />
      </div>
    </div>
  )
}
