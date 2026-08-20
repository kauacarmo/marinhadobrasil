import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { PublicacoesListagem } from "@/components/publicacoes-listagem"
import { getPublicacoesPublicas } from "@/lib/concursos-publicos"

export const metadata: Metadata = {
  title: "Cronogramas | Capitania dos Portos de São Paulo",
  description: "Cronogramas e datas importantes dos concursos e processos seletivos.",
}

export const dynamic = "force-dynamic"

export default async function CronogramasPage() {
  const itens = await getPublicacoesPublicas("cronograma")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Cronogramas"
          descricao="Acompanhe as datas de inscrição, provas, resultados e demais etapas."
          migalhas={[{ label: "Início", href: "/" }, { label: "Cronogramas" }]}
        />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <PublicacoesListagem itens={itens} tipo="cronograma" />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
