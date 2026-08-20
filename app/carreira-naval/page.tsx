import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Anchor, TrendingUp, Wallet, HeartPulse, Plane, ShieldCheck, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Carreira Naval | Capitania dos Portos de São Paulo",
  description:
    "Entenda a estrutura de carreira, os postos e graduações e os benefícios de servir na Marinha do Brasil.",
}

const beneficios = [
  { icon: Wallet, titulo: "Remuneração e estabilidade", texto: "Vencimentos compatíveis, estabilidade e plano de carreira estruturado." },
  { icon: HeartPulse, titulo: "Assistência à saúde", texto: "Sistema de saúde da Marinha para o militar e seus dependentes." },
  { icon: Plane, titulo: "Oportunidades", texto: "Cursos de especialização, aperfeiçoamento e missões no Brasil e no exterior." },
  { icon: ShieldCheck, titulo: "Propósito", texto: "Servir à Pátria contribuindo para a defesa e a soberania nacional." },
]

const pracas = ["Marinheiro / Soldado", "Cabo", "3º Sargento", "2º Sargento", "1º Sargento", "Suboficial"]
const oficiais = ["Guarda-Marinha", "2º Tenente", "1º Tenente", "Capitão-Tenente", "Capitão de Corveta", "Capitão de Mar e Guerra", "Almirantado"]

export default function CarreiraNavalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Carreira Naval"
          descricao="Da formação ao almirantado: conheça os caminhos de crescimento profissional na Marinha do Brasil."
          migalhas={[{ label: "Início", href: "/" }, { label: "Carreira Naval" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-primary">Postos e graduações</h2>
          </div>
          <p className="mt-2 max-w-3xl leading-relaxed text-foreground text-pretty">
            A carreira militar-naval é dividida em dois grandes círculos. As praças ingressam pelas escolas de
            aprendizes e podem progredir por promoções; os oficiais são formados pela Escola Naval e demais
            escolas de formação de oficiais.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Anchor className="size-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-primary">Praças</h3>
              </div>
              <ol className="mt-4 space-y-2">
                {pracas.map((p, i) => (
                  <li key={p} className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-accent" />
                <h3 className="font-serif text-lg font-bold text-primary">Oficiais</h3>
              </div>
              <ol className="mt-4 space-y-2">
                {oficiais.map((o, i) => (
                  <li key={o} className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {o}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Benefícios da carreira</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {beneficios.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.titulo} className="flex gap-4 rounded-lg border border-border bg-card p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary">{b.titulo}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground text-pretty">{b.texto}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold">Pronto para embarcar nessa carreira?</h2>
              <p className="mt-1 text-primary-foreground/80">Confira os concursos abertos e faça sua inscrição.</p>
            </div>
            <Link
              href="/concursos"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-foreground hover:opacity-90"
            >
              Ver concursos <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
