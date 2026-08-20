"use client"

import { useState, useTransition } from "react"
import type { Contest, ContestStatus, Exam } from "@/lib/types"
import { STATUS_LABEL } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Sparkles,
  FileText,
  Users,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Loader2,
  CheckCircle2,
  Pencil,
  ImageIcon,
  Mail,
} from "lucide-react"
import {
  criarContest,
  atualizarContest,
  atualizarStatus,
  apagarContest,
  gerarProva,
  getExam,
  alternarLiberacao,
  notificarAssinantes,
} from "@/app/admin/concursos/actions"

type ContestRow = Contest & { inscritos: number; temProva: boolean }

const statusBadge: Record<ContestStatus, string> = {
  fechado: "bg-muted text-muted-foreground",
  inscricoes_abertas: "bg-accent/20 text-accent-foreground border-accent/40",
  em_andamento: "bg-primary/15 text-primary border-primary/30",
}

export function ConcursosManager({ contests }: { contests: ContestRow[] }) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [openNovo, setOpenNovo] = useState(false)
  const [gerando, setGerando] = useState<string | null>(null)

  const [examView, setExamView] = useState<Exam | null>(null)
  const [openExam, setOpenExam] = useState(false)

  const [editando, setEditando] = useState<ContestRow | null>(null)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [notificando, setNotificando] = useState<string | null>(null)

  function flash(texto: string) {
    setMsg(texto)
    setTimeout(() => setMsg(null), 3500)
  }

  function mudarStatus(id: string, status: ContestStatus) {
    startTransition(async () => {
      await atualizarStatus(id, status)
      flash("Situação atualizada.")
    })
  }

  function gerar(id: string) {
    setGerando(id)
    setErro(null)
    startTransition(async () => {
      const res = await gerarProva(id)
      setGerando(null)
      if (res?.error) setErro(res.error)
      else if (res?.origem === "banco")
        flash(`Prova gerada do banco de questões (${res?.quantidade} questões). IA indisponível — usado modelo de exemplo.`)
      else flash(`Prova gerada por IA (${res?.quantidade} questões).`)
    })
  }

  function verProva(id: string) {
    startTransition(async () => {
      const exam = await getExam(id)
      if (exam) {
        setExamView(exam)
        setOpenExam(true)
      } else {
        setErro("Nenhuma prova gerada para este concurso ainda.")
      }
    })
  }

  function liberar(id: string, liberada: boolean) {
    startTransition(async () => {
      await alternarLiberacao(id, liberada)
      flash(liberada ? "Prova liberada aos candidatos." : "Prova bloqueada.")
    })
  }

  function apagar(id: string) {
    startTransition(async () => {
      await apagarContest(id)
      flash("Concurso removido.")
    })
  }

  function notificar(id: string) {
    setNotificando(id)
    setErro(null)
    startTransition(async () => {
      const res = await notificarAssinantes(id)
      setNotificando(null)
      if (res?.error) setErro(res.error)
      else flash(res?.message || "Assinantes notificados por e-mail.")
    })
  }

  function submitNovo(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const res = await criarContest(formData)
      if (res?.error) setErro(res.error)
      else {
        setOpenNovo(false)
        flash("Concurso criado.")
      }
    })
  }

  function abrirEditar(c: ContestRow) {
    setPreviewImg(c.image_url ?? null)
    setEditando(c)
  }

  function submitEditar(formData: FormData) {
    if (!editando) return
    setErro(null)
    startTransition(async () => {
      const res = await atualizarContest(editando.id, formData)
      if (res?.error) setErro(res.error)
      else {
        setEditando(null)
        setPreviewImg(null)
        flash("Concurso atualizado.")
      }
    })
  }

  return (
    <div className="space-y-5">
      {msg ? (
        <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-foreground">
          <CheckCircle2 className="size-4 text-accent" /> {msg}
        </div>
      ) : null}
      {erro ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {erro}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={() => setOpenNovo(true)}>
          <Plus className="size-4" /> Novo concurso
        </Button>
      </div>

      <div className="grid gap-4">
        {contests.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-foreground text-balance">{c.titulo}</h3>
                  <Badge variant="outline" className={statusBadge[c.status]}>
                    {STATUS_LABEL[c.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.cargo} • {c.vagas} vaga(s)
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" /> {c.inscritos} inscrito(s)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-4" />
                    {c.temProva ? "Prova gerada" : "Sem prova"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="w-52">
                  <Label className="sr-only">Situação</Label>
                  <Select value={c.status} onValueChange={(v) => mudarStatus(c.id, v as ContestStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="inscricoes_abertas">Inscrições Abertas</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" onClick={() => abrirEditar(c)}>
                <Pencil className="size-4" /> Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => notificar(c.id)}
                disabled={isPending && notificando === c.id}
              >
                {notificando === c.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                Notificar assinantes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => gerar(c.id)}
                disabled={isPending && gerando === c.id}
              >
                {gerando === c.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {c.temProva ? "Regerar prova (IA)" : "Gerar prova (IA)"}
              </Button>

              {c.temProva ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => verProva(c.id)}>
                    <Eye className="size-4" /> Ver prova
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => liberar(c.id, true)}>
                    <Unlock className="size-4" /> Liberar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => liberar(c.id, false)}>
                    <Lock className="size-4" /> Bloquear
                  </Button>
                </>
              ) : null}

              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => apagar(c.id)}
              >
                <Trash2 className="size-4" /> Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Novo concurso */}
      <Dialog open={openNovo} onOpenChange={setOpenNovo}>
        <DialogContent>
          <form action={submitNovo}>
            <DialogHeader>
              <DialogTitle className="font-serif">Novo concurso</DialogTitle>
              <DialogDescription>Cadastre um novo processo seletivo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" name="titulo" placeholder="ex.: Processo Seletivo — Agente Portuário 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" placeholder="ex.: Agente Portuário" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vagas">Vagas</Label>
                  <Input id="vagas" name="vagas" type="number" min={0} placeholder="ex.: 40" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tema_prova">Tema / conteúdo da prova</Label>
                <Input
                  id="tema_prova"
                  name="tema_prova"
                  placeholder="ex.: Legislação marítima, segurança da navegação e português"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" name="descricao" placeholder="Breve descrição do concurso" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNovo(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Criar concurso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar concurso */}
      <Dialog
        open={!!editando}
        onOpenChange={(o) => {
          if (!o) {
            setEditando(null)
            setPreviewImg(null)
          }
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <form action={submitEditar}>
            <DialogHeader>
              <DialogTitle className="font-serif">Editar concurso</DialogTitle>
              <DialogDescription>Atualize a imagem e as informações do concurso.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Imagem */}
              <div className="space-y-2">
                <Label>Imagem do concurso</Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {previewImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewImg || "/placeholder.svg"} alt="Pré-visualização" className="size-full object-cover" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      name="imagem"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setPreviewImg(URL.createObjectURL(f))
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Envie um arquivo (JPG/PNG). A imagem aparece na lateral do card público.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="e-titulo">Título</Label>
                <Input id="e-titulo" name="titulo" defaultValue={editando?.titulo} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-cargo">Cargo</Label>
                  <Input id="e-cargo" name="cargo" defaultValue={editando?.cargo} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-vagas">Vagas</Label>
                  <Input id="e-vagas" name="vagas" type="number" min={0} defaultValue={editando?.vagas} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-escolaridade">Escolaridade</Label>
                  <Input id="e-escolaridade" name="escolaridade" defaultValue={editando?.escolaridade ?? ""} placeholder="ex.: Ensino Médio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-local">Local</Label>
                  <Input id="e-local" name="local" defaultValue={editando?.local ?? ""} placeholder="ex.: São Paulo/SP" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-taxa">Taxa de inscrição</Label>
                  <Input id="e-taxa" name="taxa" defaultValue={editando?.taxa ?? ""} placeholder="ex.: R$ 90,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-remuneracao">Remuneração</Label>
                  <Input id="e-remuneracao" name="remuneracao" defaultValue={editando?.remuneracao ?? ""} placeholder="ex.: R$ 3.200,00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-inicio">Início inscrições</Label>
                  <Input id="e-inicio" name="inscricoes_inicio" type="date" defaultValue={editando?.inscricoes_inicio ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-fim">Fim inscrições</Label>
                  <Input id="e-fim" name="inscricoes_fim" type="date" defaultValue={editando?.inscricoes_fim ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-prova">Data da prova</Label>
                  <Input id="e-prova" name="data_prova" type="date" defaultValue={editando?.data_prova ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-tema">Tema / conteúdo da prova</Label>
                <Input id="e-tema" name="tema_prova" defaultValue={editando?.tema_prova ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-descricao">Descrição</Label>
                <Textarea id="e-descricao" name="descricao" rows={3} defaultValue={editando?.descricao ?? ""} />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditando(null)
                  setPreviewImg(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visualizar prova */}
      <Dialog open={openExam} onOpenChange={setOpenExam}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{examView?.titulo}</DialogTitle>
            <DialogDescription>
              Gabarito destacado em verde. {examView?.liberada ? "Prova liberada." : "Prova bloqueada."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {examView?.questoes.map((q, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <p className="font-medium text-foreground">
                  {i + 1}. {q.enunciado}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {q.alternativas.map((alt, j) => (
                    <li
                      key={j}
                      className={
                        j === q.correta
                          ? "rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-700"
                          : "px-2 py-1 text-muted-foreground"
                      }
                    >
                      {String.fromCharCode(65 + j)}) {alt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
