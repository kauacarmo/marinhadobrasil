"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BarChart3, Search, Trophy, Users, Award, Medal, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { getDesempenhoConcurso, type DesempenhoConcurso } from "@/app/admin/publicacoes/actions"

type ConcursoResumo = { id: string; titulo: string; cargo: string; realizaram: number }
type Filtro = "todos" | "aprovados" | "reprovados"

function formatDataHora(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function ResultadosDesempenho({ concursos }: { concursos: ConcursoResumo[] }) {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState<DesempenhoConcurso | null>(null)
  const [busca, setBusca] = useState("")
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const [carregandoId, setCarregandoId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function abrir(id: string) {
    setCarregandoId(id)
    startTransition(async () => {
      const res = await getDesempenhoConcurso(id)
      setCarregandoId(null)
      if (res) {
        setDados(res)
        setBusca("")
        setFiltro("todos")
        setAberto(true)
      }
    })
  }

  const listaFiltrada = useMemo(() => {
    if (!dados) return []
    return dados.candidatos.filter((c) => {
      const bateBusca =
        !busca ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.numero_inscricao.toLowerCase().includes(busca.toLowerCase())
      const bateFiltro =
        filtro === "todos" || (filtro === "aprovados" ? c.aprovado : !c.aprovado)
      return bateBusca && bateFiltro
    })
  }, [dados, busca, filtro])

  // As 3 melhores notas para o bloco de sugestão
  const melhores = useMemo(() => (dados ? dados.candidatos.slice(0, 3) : []), [dados])

  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-5 py-4">
        <BarChart3 className="size-5 text-primary" />
        <div>
          <h2 className="font-serif text-base font-bold text-foreground">Desempenho por concurso</h2>
          <p className="text-xs text-muted-foreground">
            Veja os candidatos que realizaram a prova, notas e situação sugerida.
          </p>
        </div>
      </header>

      {concursos.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum concurso cadastrado.</p>
      ) : (
        <ul className="divide-y divide-border">
          {concursos.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{c.titulo}</p>
                <p className="text-xs text-muted-foreground">{c.cargo}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" /> {c.realizaram} realizaram
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => abrir(c.id)}
                  disabled={isPending && carregandoId === c.id}
                >
                  {isPending && carregandoId === c.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trophy className="size-4" />
                  )}
                  Ver concurso
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{dados?.contest.titulo}</DialogTitle>
            <DialogDescription>
              {dados?.contest.cargo} • {dados?.contest.vagas} vaga(s) • {dados?.totalRealizaram} candidato(s)
              realizaram a prova • {dados?.aprovados} aprovado(s) sugerido(s)
            </DialogDescription>
          </DialogHeader>

          {dados && dados.totalRealizaram === 0 ? (
            <div className="rounded-md border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum candidato realizou a prova deste concurso ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sugestão das melhores notas */}
              {melhores.length > 0 ? (
                <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Award className="size-4 text-accent" /> Sugestão — melhores notas
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {melhores.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-2 rounded-md bg-card px-3 py-2">
                        <Medal
                          className={
                            i === 0
                              ? "size-5 text-accent"
                              : i === 1
                                ? "size-5 text-muted-foreground"
                                : "size-5 text-primary/60"
                          }
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.acertos}/{c.total} • {c.percentual}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-48">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome ou inscrição"
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
                  {(["todos", "aprovados", "reprovados"] as Filtro[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFiltro(f)}
                      className={
                        "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors " +
                        (filtro === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de candidatos */}
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 text-center">#</th>
                      <th className="px-3 py-2.5">Candidato</th>
                      <th className="px-3 py-2.5">Inscrição</th>
                      <th className="px-3 py-2.5 text-center">Nota</th>
                      <th className="px-3 py-2.5 text-center">Aproveit.</th>
                      <th className="px-3 py-2.5">Finalizada</th>
                      <th className="px-3 py-2.5 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listaFiltrada.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 text-center font-medium text-muted-foreground">{c.posicao}</td>
                        <td className="px-3 py-2.5 font-medium text-foreground">{c.nome}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{c.numero_inscricao}</td>
                        <td className="px-3 py-2.5 text-center text-foreground">
                          {c.acertos}/{c.total}
                        </td>
                        <td className="px-3 py-2.5 text-center font-semibold text-foreground">{c.percentual}%</td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{formatDataHora(c.finalizadaEm)}</td>
                        <td className="px-3 py-2.5 text-right">
                          {c.aprovado ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle2 className="mr-1 size-3.5" /> Aprovado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-destructive/40 text-destructive">
                              <XCircle className="mr-1 size-3.5" /> Reprovado
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {listaFiltrada.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                          Nenhum candidato encontrado para o filtro selecionado.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                A situação é uma sugestão automática: aprovados são os candidatos dentro do número de vagas com
                aproveitamento mínimo de 50%.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
