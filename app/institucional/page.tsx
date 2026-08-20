import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Anchor, Compass, GraduationCap, ShieldCheck, Waves, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Sobre a Diretoria | Capitania dos Portos de São Paulo",
  description:
    "Conheça a missão, as atribuições e as escolas de formação da Capitania dos Portos de São Paulo.",
}

const atribuicoes = [
  {
    icon: ShieldCheck,
    titulo: "Segurança do tráfego aquaviário",
    texto:
      "Fiscalização e ordenamento do tráfego de embarcações, garantindo a segurança da navegação nas águas jurisdicionais.",
  },
  {
    icon: Waves,
    titulo: "Salvaguarda da vida humana",
    texto:
      "Ações de prevenção de acidentes e coordenação de operações de busca e salvamento nas águas sob responsabilidade.",
  },
  {
    icon: Compass,
    titulo: "Habilitação e registro",
    texto:
      "Emissão de habilitações de aquaviários e amadores, além do registro de embarcações e serviços portuários.",
  },
  {
    icon: GraduationCap,
    titulo: "Formação de pessoal",
    texto:
      "Realização de concursos e processos seletivos para as escolas de formação da carreira naval.",
  },
]

const escolas = [
  { nome: "Colégio Naval", descricao: "Formação de futuros oficiais da Marinha, com ensino médio integrado." },
  { nome: "Escola Naval", descricao: "Formação de oficiais da ativa do Corpo da Armada, Fuzileiros e Intendência." },
  { nome: "Escola de Aprendizes-Marinheiros", descricao: "Ingresso na carreira de praças da Marinha do Brasil." },
  { nome: "Serviço Militar Voluntário", descricao: "Oportunidades temporárias para diversas áreas de formação." },
]

export default function InstitucionalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Sobre a Diretoria"
          descricao="A Capitania dos Portos de São Paulo é um órgão da Marinha do Brasil dedicado à autoridade marítima e à formação de novos profissionais da carreira naval."
          migalhas={[{ label: "Início", href: "/" }, { label: "Institucional" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Anchor className="size-4" /> Nossa missão
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-primary text-balance md:text-3xl">
                Proteger nossas riquezas e cuidar da nossa gente
              </h2>
              <p className="mt-4 leading-relaxed text-foreground text-pretty">
                Contribuir para a segurança do tráfego aquaviário, a salvaguarda da vida humana nas águas e a
                prevenção da poluição hídrica, exercendo a Autoridade Marítima na área de jurisdição e promovendo
                a formação de profissionais comprometidos com os valores navais.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-6">
              {[
                { valor: "1861", label: "Ano de tradição naval" },
                { valor: "13", label: "Formas de ingresso" },
                { valor: "+5 mil", label: "Vagas por ano" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-serif text-2xl font-bold text-primary md:text-3xl">{s.valor}</p>
                  <p className="mt-1 text-xs text-muted-foreground text-pretty">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Principais atribuições</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {atribuicoes.map((a) => {
                const Icon = a.icon
                return (
                  <div key={a.titulo} className="flex gap-4 rounded-lg border border-border bg-card p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary">{a.titulo}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{a.texto}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-primary">Escolas de formação</h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {escolas.map((e) => (
              <div key={e.nome} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-bold text-primary">{e.nome}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{e.descricao}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
