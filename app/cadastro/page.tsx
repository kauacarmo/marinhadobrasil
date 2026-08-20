import { Bell, Newspaper, CalendarClock, Award } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { CadastroCidadaoForm } from "@/components/cadastro-cidadao-form"

export const metadata = {
  title: "Cadastro do Cidadão | Capitania dos Portos de São Paulo",
  description: "Cadastre-se para receber por e-mail as notícias, editais e resultados dos concursos da Marinha do Brasil.",
}

const beneficios = [
  { icon: Newspaper, titulo: "Notícias em primeira mão", descricao: "Receba comunicados e novidades assim que forem publicados." },
  { icon: Bell, titulo: "Alertas de editais", descricao: "Seja avisado quando novos concursos abrirem inscrições." },
  { icon: CalendarClock, titulo: "Cronogramas", descricao: "Acompanhe datas de provas e etapas de cada seleção." },
  { icon: Award, titulo: "Resultados", descricao: "Fique sabendo dos gabaritos e listas de aprovados." },
]

export default function CadastroPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Cadastro do Cidadão"
          descricao="Cadastre seu e-mail e receba as notícias, editais, cronogramas e resultados dos concursos da Marinha do Brasil diretamente na sua caixa de entrada."
          migalhas={[{ label: "Início", href: "/" }, { label: "Cadastro do Cidadão" }]}
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">Fique por dentro de tudo</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Ao se cadastrar, você passa a receber por e-mail as principais informações sobre a
              carreira naval e os processos seletivos da instituição.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {beneficios.map((b) => (
                <li key={b.titulo} className="rounded-md border border-border bg-card p-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-sm bg-secondary text-primary">
                    <b.icon className="size-5" />
                  </span>
                  <h3 className="mt-3 font-serif text-base font-bold text-primary">{b.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.descricao}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <CadastroCidadaoForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
