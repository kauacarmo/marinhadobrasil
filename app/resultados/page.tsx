import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { PublicacoesListagem } from "@/components/publicacoes-listagem"
import { getPublicacoesPublicas } from "@/lib/concursos-publicos"

export const metadata: Metadata = {
  title: "Resultados | Capitania dos Portos de São Paulo",
  description: "Resultados de provas e etapas dos concursos e processos seletivos.",
}

export const dynamic = "force-dynamic"

export default async function ResultadosPage() {
  const itens = await getPublicacoesPublicas("resultado")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Resultados"
          descricao="Confira os resultados das provas e etapas dos processos seletivos."
          migalhas={[{ label: "Início", href: "/" }, { label: "Resultados" }]}
        />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <PublicacoesListagem itens={itens} tipo="resultado" />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
