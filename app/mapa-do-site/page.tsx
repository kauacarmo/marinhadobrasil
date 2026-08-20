import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Mapa do Site | Capitania dos Portos de São Paulo",
  description: "Índice completo de todas as páginas e serviços disponíveis no portal.",
}

const secoes = [
  {
    titulo: "Concursos",
    links: [
      { label: "Concursos abertos", href: "/concursos" },
      { label: "Editais publicados", href: "/editais" },
      { label: "Resultados", href: "/resultados" },
      { label: "Cronogramas", href: "/cronogramas" },
      { label: "Fazer inscrição", href: "/inscricao" },
      { label: "Acessar prova", href: "/prova" },
    ],
  },
  {
    titulo: "Institucional",
    links: [
      { label: "Fundação", href: "/fundacao" },
      { label: "Sobre a Diretoria", href: "/institucional" },
      { label: "Escolas de formação", href: "/escolas-de-formacao" },
      { label: "Carreira naval", href: "/carreira-naval" },
      { label: "Perguntas frequentes", href: "/perguntas-frequentes" },
    ],
  },
  {
    titulo: "Serviços ao cidadão",
    links: [
      { label: "Área do candidato", href: "/area-candidato" },
      { label: "Cadastro para notícias", href: "/cadastro" },
      { label: "Notícias", href: "/noticias" },
      { label: "Ouvidoria", href: "/ouvidoria" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    titulo: "Utilidades",
    links: [
      { label: "Página inicial", href: "/" },
      { label: "Acessibilidade", href: "/acessibilidade" },
      { label: "Mapa do site", href: "/mapa-do-site" },
      { label: "Área administrativa", href: "/login" },
    ],
  },
]

export default function MapaDoSitePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Mapa do Site"
          descricao="Encontre rapidamente qualquer página ou serviço do portal da Capitania dos Portos de São Paulo."
          migalhas={[{ label: "Início", href: "/" }, { label: "Mapa do Site" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {secoes.map((s) => (
              <nav key={s.titulo} aria-label={s.titulo}>
                <h2 className="font-serif text-sm font-bold uppercase tracking-wide text-accent-foreground">
                  {s.titulo}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {s.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center gap-1 text-sm text-foreground transition-colors hover:text-primary"
                      >
                        <ChevronRight className="size-3.5 text-accent" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
