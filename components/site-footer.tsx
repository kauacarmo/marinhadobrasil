import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import { Brasao } from "@/components/brasao"

const colunas = [
  {
    titulo: "Concursos",
    links: [
      { label: "Concursos abertos", href: "/concursos" },
      { label: "Editais publicados", href: "/editais" },
      { label: "Resultados", href: "/resultados" },
      { label: "Cronogramas", href: "/cronogramas" },
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
    titulo: "Serviços",
    links: [
      { label: "Área do candidato", href: "/area-candidato" },
      { label: "Sistema de Identificação da Marinha (SIM)", href: "/sim" },
      { label: "Acessibilidade", href: "/acessibilidade" },
      { label: "Mapa do site", href: "/mapa-do-site" },
      { label: "Ouvidoria", href: "/ouvidoria" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Brasao className="size-11" />
            <span className="font-serif text-lg font-bold">CPSP</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Capitania dos Portos de São Paulo — órgão da Marinha do Brasil responsável pela
            segurança do tráfego aquaviário e pela salvaguarda da vida humana nas águas.
          </p>
        </div>

        {colunas.map((coluna) => (
          <div key={coluna.titulo}>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wide text-accent">
              {coluna.titulo}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {coluna.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/80 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-primary-foreground/70 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <Phone className="size-4 text-accent" /> 0800 000 0000
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="size-4 text-accent" /> cpsp.secom@marinha.exemplo.br
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> Av. Mário de Andrade, s/n — Santos/SP
            </span>
          </div>
          <p>© {new Date().getFullYear()} Capitania dos Portos de São Paulo</p>
        </div>
      </div>
    </footer>
  )
}
