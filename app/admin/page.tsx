import { FileText, Users, ClipboardList, PlayCircle } from "lucide-react"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { GraficoVagas } from "@/components/admin/grafico-vagas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createAdminClient } from "@/lib/supabase/admin"
import { STATUS_LABEL, type Contest, type ContestStatus } from "@/lib/types"

const statusBadge: Record<ContestStatus, string> = {
  fechado: "bg-red-100 text-red-800 border-red-200",
  inscricoes_abertas: "bg-emerald-100 text-emerald-800 border-emerald-200",
  em_andamento: "bg-indigo-100 text-indigo-800 border-indigo-200",
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const [{ data: contestsData }, { count: totalInscritos }, { count: provasLiberadas }] =
    await Promise.all([
      supabase.from("contests").select("*").order("created_at", { ascending: false }),
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("exams").select("*", { count: "exact", head: true }).eq("liberada", true),
    ])

  const contests = (contestsData ?? []) as Contest[]

  const totalVagas = contests.reduce((acc, c) => acc + (c.vagas ?? 0), 0)
  const inscricoesAbertas = contests.filter((c) => c.status === "inscricoes_abertas").length
  const emAndamento = contests.filter((c) => c.status === "em_andamento").length

  // Inscritos por concurso (para o gráfico)
  const { data: regsData } = await supabase.from("registrations").select("contest_id")
  const inscritosPorConcurso = new Map<string, number>()
  for (const r of regsData ?? []) {
    inscritosPorConcurso.set(r.contest_id, (inscritosPorConcurso.get(r.contest_id) ?? 0) + 1)
  }

  const dadosGrafico = contests.map((c) => ({
    nome: c.cargo,
    vagas: c.vagas ?? 0,
    inscritos: inscritosPorConcurso.get(c.id) ?? 0,
  }))

  const stats = [
    {
      label: "Inscrições abertas",
      valor: String(inscricoesAbertas),
      icon: FileText,
      hint: `de ${contests.length} concurso(s) cadastrado(s)`,
    },
    {
      label: "Total de vagas",
      valor: totalVagas.toLocaleString("pt-BR"),
      icon: ClipboardList,
      hint: "somadas em todos os concursos",
    },
    {
      label: "Candidatos inscritos",
      valor: (totalInscritos ?? 0).toLocaleString("pt-BR"),
      icon: Users,
      hint: "inscrições registradas no sistema",
    },
    {
      label: "Provas em andamento",
      valor: String(emAndamento),
      icon: PlayCircle,
      hint: `${provasLiberadas ?? 0} prova(s) liberada(s)`,
    },
  ]

  return (
    <>
      <AdminTopbar
        titulo="Painel de Controle"
        descricao="Visão geral dos processos seletivos com dados atualizados do sistema."
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 font-serif text-3xl font-bold text-foreground">{stat.valor}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Vagas x Inscritos por concurso</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosGrafico.length > 0 ? (
                <GraficoVagas data={dadosGrafico} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum concurso cadastrado ainda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Concursos recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contests.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum concurso cadastrado.</p>
              )}
              {contests.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium leading-snug text-foreground">{c.cargo}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.vagas} vaga(s) • {inscritosPorConcurso.get(c.id) ?? 0} inscrito(s)
                    </p>
                  </div>
                  <Badge variant="outline" className={statusBadge[c.status]}>
                    {STATUS_LABEL[c.status]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
