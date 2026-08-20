"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, FileText, CalendarDays, Trophy, CheckCircle2, ExternalLink } from "lucide-react"
import {
  criarPublicacao,
  apagarPublicacao,
} from "@/app/admin/publicacoes/actions"
import { PUBLICACAO_LABEL_SINGULAR, type Publicacao, type TipoPublicacao } from "@/lib/types"

const TABS: { tipo: TipoPublicacao; label: string; icon: typeof FileText }[] = [
  { tipo: "resultado", label: "Resultados", icon: Trophy },
  { tipo: "edital", label: "Editais", icon: FileText },
  { tipo: "cronograma", label: "Cronogramas", icon: CalendarDays },
]

function formatData(iso: string | null) {
  if (!iso) return "—"
  const [ano, mes, dia] = iso.split("-")
  if (!ano || !mes || !dia) return "—"
  return `${dia}/${mes}/${ano}`
}

export function PublicacoesManager({
  dados,
  concursos,
}: {
  dados: Record<TipoPublicacao, Publicacao[]>
  concursos: { id: string; titulo: string }[]
}) {
  const [aba, setAba] = useState<TipoPublicacao>("resultado")
  const [open, setOpen] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const lista = dados[aba]

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 3000)
  }

  function submit(formData: FormData) {
    setErro(null)
    formData.set("tipo", aba)
    startTransition(async () => {
      const res = await criarPublicacao(formData)
      if (res?.error) setErro(res.error)
      else {
        setOpen(false)
        flash(`${PUBLICACAO_LABEL_SINGULAR[aba]} publicado(a).`)
      }
    })
  }

  function remover(id: string) {
    startTransition(async () => {
      const res = await apagarPublicacao(id)
      if (res?.error) setErro(res.error)
      else flash("Item removido.")
    })
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-foreground">
          <CheckCircle2 className="size-4 text-accent" />
          {msg}
        </div>
      )}
      {erro && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {erro}
        </div>
      )}

      {/* Abas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {TABS.map((t) => {
            const Icon = t.icon
            const ativo = aba === t.tipo
            return (
              <button
                key={t.tipo}
                type="button"
                onClick={() => setAba(t.tipo)}
                className={
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors " +
                  (ativo
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="size-4" />
                {t.label}
                <span
                  className={
                    "rounded-full px-1.5 text-xs " +
                    (ativo ? "bg-primary-foreground/20" : "bg-muted")
                  }
                >
                  {dados[t.tipo].length}
                </span>
              </button>
            )
          })}
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Novo {PUBLICACAO_LABEL_SINGULAR[aba].toLowerCase()}
        </Button>
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum item publicado nesta aba ainda. Clique em &quot;Novo&quot; para adicionar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Concurso</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Arquivo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.titulo}</p>
                    {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.concurso_titulo ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatData(p.data_evento)}</td>
                  <td className="px-4 py-3">
                    {p.pdf_url ? (
                      <a
                        href={p.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" /> Abrir
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => remover(p.id)} disabled={isPending}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Novo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <form action={submit}>
            <DialogHeader>
              <DialogTitle className="font-serif">
                Novo {PUBLICACAO_LABEL_SINGULAR[aba].toLowerCase()}
              </DialogTitle>
              <DialogDescription>
                Publique um {PUBLICACAO_LABEL_SINGULAR[aba].toLowerCase()} que ficará visível na área pública.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="p-titulo">Título</Label>
                <Input id="p-titulo" name="titulo" placeholder="ex.: Resultado da prova objetiva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-concurso">Concurso relacionado (opcional)</Label>
                <Select name="contest_id">
                  <SelectTrigger id="p-concurso">
                    <SelectValue placeholder="Selecione um concurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {concursos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-data">
                  {aba === "cronograma" ? "Data do evento" : "Data de publicação"}
                </Label>
                <Input id="p-data" name="data_evento" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-pdf">Link do PDF / documento (opcional)</Label>
                <Input id="p-pdf" name="pdf_url" type="url" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-descricao">Descrição (opcional)</Label>
                <Textarea id="p-descricao" name="descricao" rows={3} placeholder="Detalhes ou observações" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Publicando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
