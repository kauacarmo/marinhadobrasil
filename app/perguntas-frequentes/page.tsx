import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { ChevronDown, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Perguntas Frequentes | Capitania dos Portos de São Paulo",
  description: "Tire suas dúvidas sobre inscrições, provas, resultados e a Área do Candidato.",
}

const grupos = [
  {
    grupo: "Inscrições",
    itens: [
      {
        p: "Como faço para me inscrever em um concurso?",
        r: "Acesse a página Concursos, escolha o certame desejado e clique em inscrever-se. Você informará o ID do jogo, o nome do personagem e seus dados pessoais.",
      },
      {
        p: "Posso me inscrever em mais de um concurso?",
        r: "Sim, desde que os períodos de inscrição e as datas de prova não sejam conflitantes.",
      },
      {
        p: "Como acompanho minhas inscrições?",
        r: "Na Área do Candidato, faça login com o seu ID do jogo e senha para ver todas as suas inscrições e os concursos futuros.",
      },
    ],
  },
  {
    grupo: "Provas",
    itens: [
      {
        p: "Quantas questões tem a prova e qual o tempo de duração?",
        r: "As provas objetivas possuem 30 questões de múltipla escolha e duração de 60 minutos, com envio automático ao término do tempo.",
      },
      {
        p: "Como acesso a minha prova?",
        r: "Quando as provas estiverem liberadas, acesse a página Prova e informe o seu código de prova, disponível na Área do Candidato.",
      },
    ],
  },
  {
    grupo: "Resultados e documentos",
    itens: [
      {
        p: "Onde consulto os resultados?",
        r: "Os resultados são publicados na página Resultados assim que homologados pela banca.",
      },
      {
        p: "Onde encontro os editais e cronogramas?",
        r: "Editais e cronogramas ficam disponíveis nas páginas Editais e Cronogramas, sempre vinculados ao concurso correspondente.",
      },
    ],
  },
]

export default function PerguntasFrequentesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Perguntas Frequentes"
          descricao="Respostas rápidas para as principais dúvidas sobre concursos, provas e a Área do Candidato."
          migalhas={[{ label: "Início", href: "/" }, { label: "Perguntas Frequentes" }]}
        />

        <section className="mx-auto max-w-3xl px-4 py-12">
          {grupos.map((g) => (
            <div key={g.grupo} className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                <h2 className="font-serif text-xl font-bold text-primary">{g.grupo}</h2>
              </div>
              <div className="space-y-3">
                {g.itens.map((item) => (
                  <details
                    key={item.p}
                    className="group rounded-lg border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-foreground">
                      {item.p}
                      <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{item.r}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-foreground">Não encontrou o que procurava?</p>
            <Link
              href="/ouvidoria"
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Fale com a Ouvidoria
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
