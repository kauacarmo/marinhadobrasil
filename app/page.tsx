import Link from "next/link"
import Image from "next/image"
import {
  FileText,
  ClipboardList,
  Award,
  HelpCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ConcursoCard } from "@/components/concurso-card"
import { noticias, formatarData } from "@/lib/data"
import { getConcursosPublicos } from "@/lib/concursos-publicos"

export const dynamic = "force-dynamic"

const acessos = [
  {
    icon: FileText,
    titulo: "Editais",
    descricao: "Consulte os editais publicados e suas retificações.",
    href: "/concursos",
  },
  {
    icon: ClipboardList,
    titulo: "Inscrições",
    descricao: "Acesse o sistema de inscrições dos concursos abertos.",
    href: "/concursos",
  },
  {
    icon: Award,
    titulo: "Resultados",
    descricao: "Verifique gabaritos, notas e listas de aprovados.",
    href: "/noticias",
  },
  {
    icon: HelpCircle,
    titulo: "Dúvidas",
    descricao: "Perguntas frequentes e canais de atendimento.",
    href: "/contato",
  },
]

export default async function HomePage() {
  const concursos = await getConcursosPublicos()
  const destaque = concursos.filter((c) => c.status === "Inscrições Abertas").slice(0, 3)
  const emDestaque = destaque.length > 0 ? destaque : concursos.slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
          <Image
            src="/banner-navio.png"
            alt="Navio da Marinha navegando em mar aberto ao entardecer"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/25" />
          <div className="relative mx-auto grid max-w-5xl gap-8 px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
                Concursos 2026
              </span>
              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-balance md:text-5xl">
                Construa sua carreira a serviço do Brasil
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
                Acompanhe editais, inscrições e resultados dos concursos e processos seletivos da
                carreira naval em um só lugar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/concursos"
                  className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Ver concursos abertos
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/institucional"
                  className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 px-5 py-3 font-semibold transition-colors hover:bg-primary-foreground/10"
                >
                  Conheça a instituição
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Acesso rápido */}
        <section className="mx-auto max-w-6xl px-4 pt-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {acessos.map((acesso) => (
              <Link
                key={acesso.titulo}
                href={acesso.href}
                className="group rounded-md border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-sm bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <acesso.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-serif text-lg font-bold text-primary">{acesso.titulo}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {acesso.descricao}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Concursos em destaque */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary md:text-3xl">
                Concursos em destaque
              </h2>
              <p className="mt-1 text-muted-foreground">
                Oportunidades com inscrições abertas neste momento.
              </p>
            </div>
            <Link
              href="/concursos"
              className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-accent-foreground sm:inline-flex"
            >
              Ver todos
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {emDestaque.map((concurso) => (
              <ConcursoCard key={concurso.id} concurso={concurso} />
            ))}
          </div>
        </section>

        {/* Notícias */}
        <section className="bg-secondary/60">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl font-bold text-primary md:text-3xl">
                Últimas notícias
              </h2>
              <Link
                href="/noticias"
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-accent-foreground sm:inline-flex"
              >
                Todas as notícias
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {noticias.map((noticia) => (
                <article
                  key={noticia.id}
                  className="flex gap-4 rounded-md border border-border bg-card p-5"
                >
                  <div className="flex flex-col items-center justify-center rounded-sm bg-primary px-3 py-2 text-center text-primary-foreground">
                    <span className="text-xs uppercase text-accent">
                      {formatarData(noticia.data).slice(3, 5)}/{formatarData(noticia.data).slice(6)}
                    </span>
                    <span className="font-serif text-xl font-bold">
                      {formatarData(noticia.data).slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                      {noticia.categoria}
                    </span>
                    <h3 className="mt-1 font-serif text-base font-bold leading-snug text-primary text-pretty">
                      {noticia.titulo}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {noticia.resumo}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
