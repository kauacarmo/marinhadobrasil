import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Anchor, Ship, Award, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Fundação | Capitania dos Portos de São Paulo",
  description:
    "A história da fundação da Marinha do Brasil no GTA RP, idealizada por Guerra Mórmon.",
}

const marcos = [
  {
    icon: Ship,
    titulo: "A primeira do cenário",
    texto:
      "A primeira Marinha do Brasil do GTA RP com veículos, fardas e base próprias — e não apenas uma farda de exército rebatizada.",
  },
  {
    icon: Award,
    titulo: "3 anos de serviço real",
    texto:
      "Guerra Mórmon serviu 3 anos na Marinha do Brasil na vida real, trazendo autenticidade e respeito à representação da força no RP.",
  },
  {
    icon: Heart,
    titulo: "Um presente de amigos leais",
    texto:
      "Nascida no aniversário de Guerra, entregue de presente por seus amigos leais para realizar um sonho antigo.",
  },
]

export default function FundacaoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Fundação"
          descricao="A origem da Marinha do Brasil no GTA RP — um sonho transformado em realidade por amizade e dedicação."
          migalhas={[{ label: "Início", href: "/" }, { label: "Institucional", href: "/institucional" }, { label: "Fundação" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
            <figure className="mx-auto w-full max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fundacao/guerra-mormon.png"
                alt="Retrato de Guerra Mórmon, fundador da Marinha do Brasil no GTA RP"
                className="w-full rounded-xl object-cover shadow-lg ring-1 ring-border"
              />
              <figcaption className="mt-3 text-center">
                <span className="block font-serif text-lg font-bold text-primary">Guerra Mórmon</span>
                <span className="block text-sm text-muted-foreground">Fundador</span>
              </figcaption>
            </figure>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Anchor className="size-4" /> Nossa origem
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold text-primary text-balance md:text-3xl">
                Um sonho ancorado na amizade
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-foreground text-pretty">
                <p>
                  No aniversário de Guerra Mórmon, seus amigos leais entregam de presente a sua
                  sonhada Marinha do Brasil no GTA RP — a primeira do cenário com veículos, fardas e
                  base próprias, e não apenas farda de exército rebatizada.
                </p>
                <p>
                  Guerra havia servido 3 anos na Marinha do Brasil na vida real e sempre sonhou em
                  ver essa força representada no RP. Esse presente transformou anos de dedicação e
                  saudade em um legado vivo, hoje mantido por toda a tripulação.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Marcos da fundação</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {marcos.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.titulo} className="rounded-lg border border-border bg-card p-5">
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-serif text-lg font-bold text-primary">{m.titulo}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{m.texto}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
