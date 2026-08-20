import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Users,
  GraduationCap,
  CalendarClock,
  Wallet,
  MapPin,
  BadgeDollarSign,
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Card } from "@/components/ui/card"
import { formatarData, statusColors } from "@/lib/data"
import { getConcursoPublico } from "@/lib/concursos-publicos"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const concurso = await getConcursoPublico(id)
  return {
    title: concurso ? `${concurso.titulo} | Concursos Navais` : "Concurso não encontrado",
  }
}

const etapas = [
  "Inscrição e pagamento da taxa",
  "Prova escrita objetiva",
  "Avaliação psicológica",
  "Inspeção de saúde",
  "Teste de aptidão física",
  "Matrícula e início do curso",
]

export default async function ConcursoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const concurso = await getConcursoPublico(id)
  if (!concurso) notFound()

  const periodoInscricoes =
    concurso.inscricoesInicio && concurso.inscricoesFim
      ? `${formatarData(concurso.inscricoesInicio)} a ${formatarData(concurso.inscricoesFim)}`
      : "Conforme edital"

  const info = [
    { icon: Users, label: "Vagas", valor: String(concurso.vagas) },
    { icon: GraduationCap, label: "Escolaridade", valor: concurso.escolaridade },
    { icon: MapPin, label: "Local", valor: concurso.local },
    { icon: BadgeDollarSign, label: "Taxa de inscrição", valor: concurso.taxa },
    { icon: Wallet, label: "Remuneração", valor: concurso.remuneracao },
    {
      icon: CalendarClock,
      label: "Inscrições",
      valor: periodoInscricoes,
    },
    ...(concurso.dataProva
      ? [{ icon: CalendarClock, label: "Data da prova", valor: formatarData(concurso.dataProva) }]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo={concurso.titulo}
          migalhas={[
            { label: "Início", href: "/" },
            { label: "Concursos", href: "/concursos" },
            { label: concurso.sigla },
          ]}
        />

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-semibold",
                  statusColors[concurso.status],
                )}
              >
                {concurso.status}
              </span>
              <span className="text-sm text-muted-foreground">
                Edital nº {concurso.sigla}/{concurso.inscricoesFim.slice(0, 4) || new Date().getFullYear()}
              </span>
            </div>

            <h2 className="mt-6 font-serif text-xl font-bold text-primary">Sobre o concurso</h2>
            <p className="mt-2 leading-relaxed text-foreground">{concurso.descricao}</p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              O certame será regido pelo edital e seus anexos, disponíveis para download nesta
              página. Recomenda-se a leitura integral do documento antes de efetuar a inscrição, com
              atenção especial aos requisitos, cronograma e conteúdo programático.
            </p>

            <h2 className="mt-8 font-serif text-xl font-bold text-primary">Etapas do processo</h2>
            <ol className="mt-4 space-y-3">
              {etapas.map((etapa, i) => (
                <li key={etapa} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{etapa}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-8 font-serif text-xl font-bold text-primary">Requisitos básicos</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Ser brasileiro nato",
                "Estar em dia com as obrigações eleitorais",
                "Possuir a escolaridade exigida na data da matrícula",
                "Atender aos requisitos de idade previstos no edital",
              ].map((req) => (
                <li key={req} className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna lateral */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-28 gap-0 p-0">
              <div className="border-b border-border bg-secondary px-5 py-4">
                <h2 className="font-serif text-lg font-bold text-primary">Informações</h2>
              </div>
              <dl className="divide-y divide-border">
                {info.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 px-5 py-3.5">
                    <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="font-medium text-foreground">{item.valor}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-2 p-5">
                {concurso.status === "Inscrições Abertas" ? (
                  <Link
                    href="/inscricao"
                    className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Inscreva-se
                    <ArrowRight className="size-4" />
                  </Link>
                ) : concurso.status === "Provas Abertas" ? (
                  <Link
                    href="/prova"
                    className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Realizar a prova
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span className="rounded-sm bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    Inscrições indisponíveis
                  </span>
                )}
                <button className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 font-semibold text-primary transition-colors hover:bg-secondary">
                  <Download className="size-4" />
                  Baixar edital
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
