import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { ConcursosListagem } from "@/components/concursos-listagem"
import { getConcursosPublicos } from "@/lib/concursos-publicos"

export const metadata: Metadata = {
  title: "Concursos | Capitania dos Portos de São Paulo",
  description: "Lista de concursos e processos seletivos da carreira naval.",
}

export const dynamic = "force-dynamic"

export default async function ConcursosPage() {
  const concursos = await getConcursosPublicos()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Concursos e Processos Seletivos"
          descricao="Consulte todos os concursos, filtre por situação e acesse os editais completos."
          migalhas={[{ label: "Início", href: "/" }, { label: "Concursos" }]}
        />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <ConcursosListagem concursos={concursos} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
