"use client"

import { useState, useTransition } from "react"
import type { CursoComVagas, CursoInscricao, Instrutor } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Users,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Pencil,
  ImageIcon,
  Clock,
  GraduationCap,
  CheckCircle2,
  Loader2,
  UserCog,
} from "lucide-react"
import {
  criarCurso,
  editarCurso,
  alternarPublicacaoCurso,
  apagarCurso,
  listInscritosCurso,
  criarInstrutor,
  apagarInstrutor,
} from "@/app/admin/cursos/actions"

function fmtData(iso?: string | null) {
  if (!iso) return "A definir"
  const [a, m, d] = iso.split("-")
  if (!a || !m || !d) return iso
  return `${d}/${m}/${a}`
}

export function CursosManager({
  cursos,
  instrutores,
}: {
  cursos: CursoComVagas[]
  instrutores: Instrutor[]
}) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [openNovo, setOpenNovo] = useState(false)
  const [editando, setEditando] = useState<CursoComVagas | null>(null)
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const [openInstrutores, setOpenInstrutores] = useState(false)

  const [inscritos, setInscritos] = useState<CursoInscricao[] | null>(null)
  const [cursoInscritos, setCursoInscritos] = useState<CursoComVagas | null>(null)
  const [carregandoInscritos, setCarregandoInscritos] = useState(false)

  function flash(texto: string) {
    setMsg(texto)
    setTimeout(() => setMsg(null), 3500)
  }

  function submitNovo(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const res = await criarCurso(formData)
      if (res?.error) setErro(res.error)
      else {
        setOpenNovo(false)
        flash("Curso criado.")
      }
    })
  }

  function abrirEditar(c: CursoComVagas) {
    setPreviewImg(c.image_url ?? null)
    setEditando(c)
  }

  function submitEditar(formData: FormData) {
    if (!editando) return
    setErro(null)
    startTransition(async () => {
      const res = await editarCurso(editando.id, formData)
      if (res?.error) setErro(res.error)
      else {
        setEditando(null)
        setPreviewImg(null)
        flash("Curso atualizado.")
      }
    })
  }

  function publicar(id: string, publicado: boolean) {
    startTransition(async () => {
      await alternarPublicacaoCurso(id, publicado)
      flash(publicado ? "Curso publicado na área do candidato." : "Curso despublicado.")
    })
  }

  function apagar(id: string) {
    startTransition(async () => {
      await apagarCurso(id)
      flash("Curso removido.")
    })
  }

  function submitInstrutor(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const res = await criarInstrutor(formData)
      if (res?.error) setErro(res.error)
      else flash("Instrutor cadastrado.")
    })
  }

  function removerInstrutor(id: string) {
    startTransition(async () => {
      await apagarInstrutor(id)
      flash("Instrutor removido.")
    })
  }

  function verInscritos(c: CursoComVagas) {
    setCursoInscritos(c)
    setInscritos(null)
    setCarregandoInscritos(true)
    startTransition(async () => {
      const lista = await listInscritosCurso(c.id)
      setInscritos(lista)
      setCarregandoInscritos(false)
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

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setOpenInstrutores(true)}>
          <UserCog className="size-4" /> Instrutores
          <Badge variant="secondary" className="ml-1">
            {instrutores.length}
          </Badge>
        </Button>
        <Button onClick={() => setOpenNovo(true)}>
          <Plus className="size-4" /> Novo curso
        </Button>
      </div>

      {cursos.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Nenhum curso cadastrado ainda. Crie o primeiro curso da Marinha.
        </Card>
      ) : (
        <div className="grid gap-4">
          {cursos.map((c) => {
            const lotado = c.vagas > 0 && c.inscritos >= c.vagas
            return (
              <Card key={c.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {c.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url || "/placeholder.svg"} alt="" className="size-full object-cover" />
                      ) : (
                        <GraduationCap className="size-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-foreground text-balance">{c.titulo}</h3>
                        <Badge
                          variant="outline"
                          className={
                            c.publicado
                              ? "border-primary/30 bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {c.publicado ? "Publicado" : "Rascunho"}
                        </Badge>
                        {lotado ? (
                          <Badge variant="outline" className="border-destructive/40 text-destructive">
                            Lotado
                          </Badge>
                        ) : null}
                      </div>
                      {c.modalidade || c.carga_horaria ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[c.modalidade, c.carga_horaria].filter(Boolean).join(" • ")}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-4" /> {c.inscritos}
                          {c.vagas > 0 ? `/${c.vagas}` : ""} inscrito(s)
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-4" /> Inscrições até {fmtData(c.inscricoes_fim)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button size="sm" variant="outline" onClick={() => abrirEditar(c)}>
                    <Pencil className="size-4" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => verInscritos(c)}>
                    <Eye className="size-4" /> Ver inscritos ({c.inscritos})
                  </Button>
                  {c.publicado ? (
                    <Button size="sm" variant="outline" onClick={() => publicar(c.id, false)}>
                      <Lock className="size-4" /> Despublicar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => publicar(c.id, true)}>
                      <Unlock className="size-4" /> Publicar
                    </Button>
                  )}
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
            )
          })}
        </div>
      )}

      {/* Novo curso */}
      <Dialog open={openNovo} onOpenChange={setOpenNovo}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <form action={submitNovo}>
            <DialogHeader>
              <DialogTitle className="font-serif">Novo curso</DialogTitle>
              <DialogDescription>Cadastre um curso da Marinha para a área do candidato.</DialogDescription>
            </DialogHeader>
            <CamposCurso previewImg={previewImg} setPreviewImg={setPreviewImg} instrutores={instrutores} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNovo(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Criar curso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar curso */}
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
              <DialogTitle className="font-serif">Editar curso</DialogTitle>
              <DialogDescription>Atualize as informações e a imagem do curso.</DialogDescription>
            </DialogHeader>
            <CamposCurso
              curso={editando}
              previewImg={previewImg}
              setPreviewImg={setPreviewImg}
              instrutores={instrutores}
            />
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

      {/* Inscritos */}
      <Dialog
        open={!!cursoInscritos}
        onOpenChange={(o) => {
          if (!o) {
            setCursoInscritos(null)
            setInscritos(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Inscritos — {cursoInscritos?.titulo}</DialogTitle>
            <DialogDescription>
              {carregandoInscritos
                ? "Carregando inscritos..."
                : `${inscritos?.length ?? 0} candidato(s) inscrito(s).`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {carregandoInscritos ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" /> Carregando...
              </div>
            ) : inscritos && inscritos.length > 0 ? (
              <ul className="divide-y divide-border">
                {inscritos.map((i) => (
                  <li key={i.id} className="flex flex-col gap-1 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{i.nome_personagem || i.nome}</span>
                      <span className="font-mono text-xs text-muted-foreground">ID: {i.id_jogo}</span>
                    </div>
                    {i.observacoes ? (
                      <p className="text-sm text-muted-foreground">{i.observacoes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-muted-foreground">Nenhum inscrito neste curso ainda.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Instrutores */}
      <Dialog open={openInstrutores} onOpenChange={setOpenInstrutores}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Instrutores</DialogTitle>
            <DialogDescription>
              Cadastre os instrutores para vinculá-los aos cursos no campo &quot;Instrutor&quot;.
            </DialogDescription>
          </DialogHeader>

          <form action={submitInstrutor} className="grid gap-3 border-b border-border pb-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="i-patente">Patente / Posto</Label>
                <Input id="i-patente" name="patente" placeholder="ex.: CT (RM2)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="i-especialidade">Especialidade</Label>
                <Input id="i-especialidade" name="especialidade" placeholder="ex.: Navegação" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="i-nome">Nome</Label>
              <Input id="i-nome" name="nome" placeholder="ex.: Silva" required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isPending}>
                <Plus className="size-4" /> {isPending ? "Salvando..." : "Adicionar instrutor"}
              </Button>
            </div>
          </form>

          <div className="py-1">
            {instrutores.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhum instrutor cadastrado ainda.</p>
            ) : (
              <ul className="divide-y divide-border">
                {instrutores.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {[i.patente, i.nome].filter(Boolean).join(" ")}
                      </p>
                      {i.especialidade ? (
                        <p className="text-xs text-muted-foreground">{i.especialidade}</p>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removerInstrutor(i.id)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remover instrutor</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CamposCurso({
  curso,
  previewImg,
  setPreviewImg,
  instrutores,
}: {
  curso?: CursoComVagas | null
  previewImg: string | null
  setPreviewImg: (v: string | null) => void
  instrutores: Instrutor[]
}) {
  const nomeInstrutor = (i: Instrutor) => [i.patente, i.nome].filter(Boolean).join(" ")
  // Mantém o valor atual (pode ser um instrutor antigo, texto livre) como opção selecionável.
  const atual = curso?.instrutor ?? ""
  const existeAtual = instrutores.some((i) => nomeInstrutor(i) === atual)
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Imagem do curso</Label>
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
            <p className="text-xs text-muted-foreground">Envie um arquivo (JPG/PNG) para ilustrar o curso.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-titulo">Título</Label>
        <Input id="c-titulo" name="titulo" defaultValue={curso?.titulo} placeholder="ex.: Curso de Formação de Marinheiros" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-descricao">Descrição</Label>
        <Textarea id="c-descricao" name="descricao" rows={3} defaultValue={curso?.descricao ?? ""} placeholder="Objetivos, conteúdo e público-alvo do curso" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-carga">Carga horária</Label>
          <Input id="c-carga" name="carga_horaria" defaultValue={curso?.carga_horaria ?? ""} placeholder="ex.: 120 horas" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-instrutor">Instrutor</Label>
          <select
            id="c-instrutor"
            name="instrutor"
            defaultValue={atual}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecione um instrutor</option>
            {instrutores.map((i) => (
              <option key={i.id} value={nomeInstrutor(i)}>
                {nomeInstrutor(i)}
                {i.especialidade ? ` — ${i.especialidade}` : ""}
              </option>
            ))}
            {atual && !existeAtual ? <option value={atual}>{atual}</option> : null}
          </select>
          {instrutores.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum instrutor cadastrado. Use o botão &quot;Instrutores&quot; para adicionar.
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-modalidade">Modalidade</Label>
          <Input id="c-modalidade" name="modalidade" defaultValue={curso?.modalidade ?? ""} placeholder="ex.: Presencial / EAD" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-local">Local</Label>
          <Input id="c-local" name="local" defaultValue={curso?.local ?? ""} placeholder="ex.: Base Naval de Santos" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-vagas">Vagas</Label>
          <Input id="c-vagas" name="vagas" type="number" min={0} defaultValue={curso?.vagas ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-inicio">Início inscrições</Label>
          <Input id="c-inicio" name="inscricoes_inicio" type="date" defaultValue={curso?.inscricoes_inicio ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-fim">Fim inscrições</Label>
          <Input id="c-fim" name="inscricoes_fim" type="date" defaultValue={curso?.inscricoes_fim ?? ""} />
        </div>
      </div>
    </div>
  )
}
