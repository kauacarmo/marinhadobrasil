import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { PublicacoesListagem } from "@/components/publicacoes-listagem"
import { getPublicacoesPublicas } from "@/lib/concursos-publicos"

export const metadata: Metadata = {
  title: "Editais | Capitania dos Portos de São Paulo",
  description: "Editais publicados dos concursos e processos seletivos da carreira naval.",
}

export const dynamic = "force-dynamic"

export default async function EditaisPage() {
  const itens = await getPublicacoesPublicas("edital")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Editais"
          descricao="Acesse os editais completos e seus anexos para cada concurso."
          migalhas={[{ label: "Início", href: "/" }, { label: "Editais" }]}
        />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <PublicacoesListagem itens={itens} tipo="edital" />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
