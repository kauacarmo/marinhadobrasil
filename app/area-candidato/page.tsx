import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { CandidatoAuthForm } from "@/components/candidato-auth-form"
import { getCandidatoAtual } from "@/lib/candidato-auth"
import {
  getInscricoesPorIdJogo,
  getConcursosPublicos,
} from "@/lib/concursos-publicos"
import { getCursosParaCandidato } from "@/lib/cursos-candidato"
import { CursosCandidato } from "@/components/area-candidato/cursos-candidato"
import { sair } from "./actions"
import { Gamepad2, LogOut, Calendar, Ticket, FileText, ArrowRight, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Área do Candidato | Capitania dos Portos de São Paulo",
  description:
    "Acesse com seu ID do jogo para acompanhar suas inscrições em concursos e conferir os concursos futuros.",
}

function fmtData(iso?: string | null) {
  if (!iso) return "A definir"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

export default async function AreaCandidatoPage() {
  const candidato = await getCandidatoAtual()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Área do Candidato"
          descricao="Acompanhe suas inscrições e fique por dentro dos próximos concursos da Marinha."
          migalhas={[{ label: "Início", href: "/" }, { label: "Área do Candidato" }]}
        />

        {!candidato ? (
          <section className="mx-auto max-w-6xl px-4 py-12">
            <CandidatoAuthForm />
          </section>
        ) : (
          <PainelCandidato contaId={candidato.id} idJogo={candidato.id_jogo} nome={candidato.nome} />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

async function PainelCandidato({ contaId, idJogo, nome }: { contaId: string; idJogo: string; nome: string }) {
  const [inscricoes, todos, cursos] = await Promise.all([
    getInscricoesPorIdJogo(idJogo),
    getConcursosPublicos(),
    getCursosParaCandidato(contaId),
  ])

  const idsInscritos = new Set(inscricoes.map((i) => i.concurso?.id).filter(Boolean))
  const futuros = todos.filter(
    (c) => c.status !== "Encerrado" && !idsInscritos.has(c.id),
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* Cabeçalho da conta */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Gamepad2 className="size-6" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo(a),</p>
            <h2 className="font-serif text-xl font-bold text-primary">{nome}</h2>
            <p className="text-xs text-muted-foreground">
              ID do jogo: <span className="font-mono text-foreground">{idJogo}</span>
            </p>
          </div>
        </div>
        <form action={sair}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </form>
      </div>

      {/* Minhas inscrições */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Ticket className="size-5 text-primary" />
          <h3 className="font-serif text-2xl font-bold text-primary">Minhas inscrições</h3>
        </div>

        {inscricoes.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              Você ainda não possui inscrições vinculadas a este ID do jogo.
            </p>
            <Link
              href="/inscricao"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Fazer uma inscrição <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {inscricoes.map((i) => (
              <div key={i.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-serif text-lg font-bold text-primary text-balance">
                    {i.concurso?.titulo ?? "Concurso"}
                  </h4>
                  {i.concurso && (
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                      {i.concurso.status}
                    </span>
                  )}
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-4" />
                    Inscrição: <span className="font-mono text-foreground">{i.numero_inscricao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="size-4" />
                    Código da prova: <span className="font-mono text-foreground">{i.codigo_prova}</span>
                  </div>
                  {i.concurso?.dataProva && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-4" />
                      Prova: <span className="text-foreground">{fmtData(i.concurso.dataProva)}</span>
                    </div>
                  )}
                </dl>
                <div className="mt-4 flex gap-3">
                  {i.concurso && (
                    <Link
                      href={`/concursos/${i.concurso.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Ver concurso <ArrowRight className="size-4" />
                    </Link>
                  )}
                  {i.concurso?.status === "Provas Abertas" && (
                    <Link
                      href="/prova"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-foreground hover:underline"
                    >
                      Acessar prova
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Concursos futuros */}
      <div className="mt-12">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="font-serif text-2xl font-bold text-primary">Concursos futuros</h3>
        </div>

        {futuros.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
            Nenhum concurso disponível no momento. Volte em breve.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {futuros.map((c) => (
              <div key={c.id} className="flex flex-col rounded-lg border border-border bg-card p-5">
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {c.status}
                </span>
                <h4 className="mt-3 font-serif text-lg font-bold text-primary text-balance">{c.titulo}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">{c.descricao}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Inscrições até {fmtData(c.inscricoesFim)}
                </div>
                <Link
                  href={`/concursos/${c.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Ver detalhes <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cursos da Marinha */}
      <CursosCandidato cursos={cursos} />
    </section>
  )
}
