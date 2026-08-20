import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { GraduationCap, MapPin, Clock, Anchor } from "lucide-react"

export const metadata: Metadata = {
  title: "Escolas de Formação | Capitania dos Portos de São Paulo",
  description:
    "Conheça as escolas de formação da Marinha do Brasil: Colégio Naval, Escola Naval, Escolas de Aprendizes-Marinheiros e mais.",
}

const escolas = [
  {
    nome: "Colégio Naval",
    local: "Angra dos Reis — RJ",
    duracao: "3 anos",
    escolaridade: "Ensino Fundamental completo",
    descricao:
      "Prepara jovens para o ingresso na Escola Naval, oferecendo ensino médio de excelência aliado à formação militar-naval.",
  },
  {
    nome: "Escola Naval",
    local: "Rio de Janeiro — RJ",
    duracao: "4 anos",
    escolaridade: "Ensino Médio completo",
    descricao:
      "Forma os oficiais da ativa do Corpo da Armada, Corpo de Fuzileiros Navais e Corpo de Intendentes da Marinha.",
  },
  {
    nome: "Escola de Aprendizes-Marinheiros",
    local: "Diversos estados",
    duracao: "1 ano",
    escolaridade: "Ensino Médio completo",
    descricao:
      "Porta de entrada na carreira de praça, formando Marinheiros para atividades técnicas e operativas de bordo.",
  },
  {
    nome: "Centro de Instrução Almirante Wandenkolk",
    local: "Rio de Janeiro — RJ",
    duracao: "Variável",
    escolaridade: "Ensino Médio / Superior",
    descricao:
      "Responsável pela formação de oficiais e praças do Serviço Militar Voluntário e por cursos de especialização.",
  },
]

const etapas = [
  { titulo: "Inscrição", texto: "Realize a inscrição no concurso desejado dentro do prazo do edital." },
  { titulo: "Provas", texto: "Prova escrita objetiva de conhecimentos, conforme o conteúdo programático." },
  { titulo: "Eventos complementares", texto: "Verificação de dados biográficos, inspeção de saúde e teste de aptidão física." },
  { titulo: "Matrícula", texto: "Classificados dentro das vagas são matriculados na escola de formação." },
]

export default function EscolasDeFormacaoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Escolas de Formação"
          descricao="A Marinha do Brasil oferece diferentes caminhos de ingresso e formação para quem deseja seguir a carreira naval."
          migalhas={[{ label: "Início", href: "/" }, { label: "Escolas de Formação" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-5 md:grid-cols-2">
            {escolas.map((e) => (
              <article key={e.nome} className="flex flex-col rounded-lg border border-border bg-card p-6">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </span>
                <h2 className="mt-4 font-serif text-xl font-bold text-primary text-balance">{e.nome}</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground text-pretty">{e.descricao}</p>
                <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-accent" /> {e.local}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-accent" /> Duração: {e.duracao}
                  </div>
                  <div className="flex items-center gap-2">
                    <Anchor className="size-4 text-accent" /> {e.escolaridade}
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Etapas do processo seletivo</h2>
            <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {etapas.map((et, i) => (
                <li key={et.titulo} className="rounded-lg border border-border bg-card p-5">
                  <span className="font-serif text-3xl font-bold text-accent">{i + 1}</span>
                  <h3 className="mt-2 font-serif text-lg font-bold text-primary">{et.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{et.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
