import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { ProvaAcesso } from "@/components/prova-acesso"

export const metadata = {
  title: "Prova | Capitania dos Portos de São Paulo",
}

export default function ProvaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Acesso à Prova"
          descricao="Informe o código recebido no ato da inscrição. A prova só fica disponível quando o concurso está Em Andamento e liberada pela administração."
          migalhas={[{ label: "Início", href: "/" }, { label: "Prova" }]}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <ProvaAcesso />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
