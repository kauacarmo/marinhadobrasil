"use client"

import { useMemo, useState, useTransition } from "react"
import { Search, Pencil, Trash2, Eraser, Users, Award, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { CandidatoComConcurso } from "@/app/admin/candidatos/actions"
import { editarCandidato, apagarCandidato, limparTodos } from "@/app/admin/candidatos/actions"

function formatData(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function CandidatosManager({ candidatos }: { candidatos: CandidatoComConcurso[] }) {
  const [isPending, startTransition] = useTransition()
  const [busca, setBusca] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const [editando, setEditando] = useState<CandidatoComConcurso | null>(null)
  const [verNota, setVerNota] = useState<CandidatoComConcurso | null>(null)
  const [confirmarApagar, setConfirmarApagar] = useState<CandidatoComConcurso | null>(null)
  const [openLimpar, setOpenLimpar] = useState(false)

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return candidatos
    return candidatos.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.numero_inscricao.toLowerCase().includes(q) ||
        (c.id_jogo ?? "").toLowerCase().includes(q) ||
        (c.nome_personagem ?? "").toLowerCase().includes(q) ||
        c.concurso_titulo.toLowerCase().includes(q),
    )
  }, [busca, candidatos])

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 3000)
  }

  function submitEdicao(formData: FormData) {
    if (!editando) return
    setErro(null)
    startTransition(async () => {
      const res = await editarCandidato(editando.id, formData)
      if (res?.error) setErro(res.error)
      else {
        setEditando(null)
        flash("Candidato atualizado.")
      }
    })
  }

  function apagar(c: CandidatoComConcurso) {
    startTransition(async () => {
      await apagarCandidato(c.id)
      setConfirmarApagar(null)
      flash("Candidato removido.")
    })
  }

  function limpar() {
    startTransition(async () => {
      await limparTodos()
      setOpenLimpar(false)
      flash("Todos os candidatos foram removidos.")
    })
  }

  return (
    <div className="space-y-5">
      {msg ? (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-foreground">
          {msg}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, personagem, ID do jogo, inscrição ou concurso..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4 text-primary" />
            {candidatos.length} candidato(s)
          </span>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setOpenLimpar(true)}
            disabled={candidatos.length === 0}
          >
            <Eraser className="size-4" /> Limpar todos
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Inscrição</th>
              <th className="px-4 py-3 font-semibold">ID do jogo</th>
              <th className="px-4 py-3 font-semibold">Personagem</th>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Concurso</th>
              <th className="px-4 py-3 font-semibold">Idade</th>
              <th className="px-4 py-3 font-semibold">Nascimento</th>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.numero_inscricao}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id_jogo || "—"}</td>
                <td className="px-4 py-3 text-foreground">{c.nome_personagem || "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.concurso_titulo}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.idade}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatData(c.data_nascimento)}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="font-mono">
                    {c.codigo_prova}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setVerNota(c)}
                      aria-label="Ver nota"
                      className="text-primary hover:text-primary"
                    >
                      <Award className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditando(c)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfirmarApagar(c)}
                      aria-label="Excluir"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  {candidatos.length === 0 ? "Nenhum candidato inscrito." : "Nenhum resultado para a busca."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Editar candidato */}
      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          <form action={submitEdicao}>
            <DialogHeader>
              <DialogTitle className="font-serif">Editar candidato</DialogTitle>
              <DialogDescription>
                Inscrição {editando?.numero_inscricao} — {editando?.concurso_titulo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_jogo">ID do jogo</Label>
                  <Input id="id_jogo" name="id_jogo" defaultValue={editando?.id_jogo ?? ""} placeholder="ex.: 42" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_personagem">Nome do personagem</Label>
                  <Input
                    id="nome_personagem"
                    name="nome_personagem"
                    defaultValue={editando?.nome_personagem ?? ""}
                    placeholder="ex.: Guerra Mórmon"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do candidato</Label>
                <Input id="nome" name="nome" defaultValue={editando?.nome} placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input id="idade" name="idade" type="number" defaultValue={editando?.idade} min={1} max={129} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de nascimento</Label>
                  <Input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    defaultValue={editando?.data_nascimento?.split("T")[0]}
                  />
                </div>
              </div>
              {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ver nota do candidato */}
      <Dialog open={!!verNota} onOpenChange={(o) => !o && setVerNota(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Nota da prova</DialogTitle>
            <DialogDescription>
              {verNota?.nome_personagem || verNota?.nome} — {verNota?.concurso_titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {verNota && verNota.prova_finalizada_em && verNota.total_questoes ? (
              <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15">
                  <Award className="size-6 text-accent" />
                </div>
                <p className="mt-4 font-serif text-4xl font-bold text-primary">
                  {verNota.acertos}
                  <span className="text-xl text-muted-foreground">/{verNota.total_questoes}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round(((verNota.acertos ?? 0) / verNota.total_questoes) * 100)}% de aproveitamento
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Prova finalizada em {formatData(verNota.prova_finalizada_em)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                <Clock3 className="size-6" />
                <p className="text-sm">Este candidato ainda não realizou a prova.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerNota(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar excluir candidato */}
      <AlertDialog open={!!confirmarApagar} onOpenChange={(o) => !o && setConfirmarApagar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir candidato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente a inscrição de <strong>{confirmarApagar?.nome}</strong>. Não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => confirmarApagar && apagar(confirmarApagar)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Limpar todos */}
      <AlertDialog open={openLimpar} onOpenChange={setOpenLimpar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todos os candidatos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>todas</strong> as inscrições de todos os concursos. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={limpar}
              disabled={isPending}
            >
              {isPending ? "Removendo..." : "Limpar todos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
