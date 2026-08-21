import { IdCard, BookMarked, FileCheck2, Anchor, ShieldCheck, ClipboardList } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"

export const metadata = {
  title: "Aquaviários | Capitania dos Portos de São Paulo",
  description:
    "Informações sobre a emissão da Caderneta de Inscrição e Registro (CIR) e da Carteira de Identidade Militar para aquaviários e militares da Marinha do Brasil.",
}

const servicos = [
  {
    icon: BookMarked,
    titulo: "Caderneta de Inscrição e Registro (CIR)",
    descricao:
      "Documento profissional obrigatório do aquaviário. Habilita o tripulante a exercer atividades a bordo conforme sua categoria e nível de formação.",
    itens: [
      "Identificação do aquaviário e categoria (Marítimo, Fluviário, Pescador, Prático)",
      "Nível de formação e função a bordo",
      "Número de inscrição e validade do registro",
    ],
  },
  {
    icon: IdCard,
    titulo: "Carteira de Identidade Militar",
    descricao:
      "Documento oficial de identificação do militar da Marinha do Brasil, comprovando posto/graduação e vínculo com a instituição.",
    itens: [
      "Identificação do militar, posto ou graduação",
      "Força, unidade de vinculação e RG militar",
      "Número do documento e validade",
    ],
  },
]

const passos = [
  { icon: ClipboardList, titulo: "Reúna os documentos", descricao: "Separe identificação pessoal, comprovantes e a documentação exigida para a categoria." },
  { icon: Anchor, titulo: "Compareça à Capitania", descricao: "Dirija-se à Capitania dos Portos para abertura do processo e conferência dos dados." },
  { icon: FileCheck2, titulo: "Emissão do documento", descricao: "Após a análise, o documento é emitido e registrado oficialmente pela administração naval." },
]

export default function AquaviariosPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Aquaviários"
          descricao="Saiba como funciona a emissão da Caderneta de Inscrição e Registro (CIR) e da Carteira de Identidade Militar pela Capitania dos Portos."
          migalhas={[{ label: "Início", href: "/" }, { label: "Aquaviários" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-sm bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="size-4" /> Serviços ao Aquaviário
            </span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-primary text-balance">
              Documentos profissionais e militares emitidos pela Marinha
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              A Capitania dos Portos é responsável pela inscrição, registro e identificação dos aquaviários e
              militares. Conheça abaixo os documentos disponíveis e o processo de emissão.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {servicos.map((s) => (
              <article key={s.titulo} className="rounded-lg border border-border bg-card p-6">
                <span className="inline-flex size-12 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <s.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-primary text-balance">{s.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.descricao}</p>
                <ul className="mt-4 space-y-2">
                  {s.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <FileCheck2 className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Como emitir</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
              A emissão é realizada exclusivamente pela administração da Capitania dos Portos. Siga as etapas
              abaixo para dar entrada no seu documento.
            </p>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {passos.map((p, i) => (
                <li key={p.titulo} className="relative rounded-lg border border-border bg-card p-6">
                  <span className="absolute -top-3 left-6 inline-flex size-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span className="inline-flex size-10 items-center justify-center rounded-sm bg-secondary text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-3 font-serif text-base font-bold text-primary">{p.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
