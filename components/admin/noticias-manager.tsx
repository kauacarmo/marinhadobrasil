"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Globe, Radio, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIAS_NOTICIA, type DestinoNoticia, type Noticia } from "@/lib/types"
import { criarNoticia, editarNoticia, apagarNoticia } from "@/app/admin/noticias/actions"

function formatarData(iso: string) {
  const [y, m, d] = (iso || "").split("T")[0].split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

const DESTINOS: { valor: DestinoNoticia; titulo: string; descricao: string; icon: typeof Globe }[] = [
  { valor: "portal", titulo: "Portal do site", descricao: "Publica na página de Notícias.", icon: Globe },
  { valor: "diario_naval", titulo: "Canal Diário Naval", descricao: "Envia ao canal via webhook.", icon: Radio },
  { valor: "ambos", titulo: "Ambos", descricao: "Portal do site e Diário Naval.", icon: Send },
]

export function NoticiasManager({ noticias }: { noticias: Noticia[] }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [openForm, setOpenForm] = useState(false)
  const [editando, setEditando] = useState<Noticia | null>(null)
  const [confirmarApagar, setConfirmarApagar] = useState<Noticia | null>(null)

  const [categoria, setCategoria] = useState<string>("Comunicados")
  const [destino, setDestino] = useState<DestinoNoticia>("portal")

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 3000)
  }

  function abrirNovo() {
    setEditando(null)
    setCategoria("Comunicados")
    setDestino("portal")
    setErro(null)
    setOpenForm(true)
  }

  function abrirEdicao(n: Noticia) {
    setEditando(n)
    setCategoria(n.categoria)
    setDestino(n.destino)
    setErro(null)
    setOpenForm(true)
  }

  function submitForm(formData: FormData) {
    setErro(null)
    formData.set("categoria", categoria)
    formData.set("destino", destino)
    startTransition(async () => {
      const res = editando ? await editarNoticia(editando.id, formData) : await criarNoticia(formData)
      if (res?.error) setErro(res.error)
      else {
        setOpenForm(false)
        flash(editando ? "Publicação atualizada." : "Publicação enviada.")
      }
    })
  }

  function apagar(n: Noticia) {
    startTransition(async () => {
      await apagarNoticia(n.id)
      setConfirmarApagar(null)
      flash("Publicação removida.")
    })
  }

  return (
    <div className="space-y-5">
      {msg ? (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-foreground">
          {msg}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="h-4 w-4" />
          Nova publicação
        </Button>
      </div>

      <div className="space-y-3">
        {noticias.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{n.categoria}</Badge>
                  <span className="text-xs text-muted-foreground">{formatarData(n.data)}</span>
                  <Badge variant="outline" className="gap-1">
                    {n.destino === "diario_naval" ? "Diário Naval" : n.destino === "ambos" ? "Portal + Diário Naval" : "Portal"}
                  </Badge>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground text-balance">{n.titulo}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{n.resumo}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => abrirEdicao(n)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmarApagar(n)}
                  aria-label="Excluir"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {noticias.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Nenhuma publicação no portal ainda. Clique em &quot;Nova publicação&quot; para começar.
          </div>
        ) : null}
      </div>

      {/* Formulário criar/editar */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <form action={submitForm}>
            <DialogHeader>
              <DialogTitle className="font-serif">{editando ? "Editar publicação" : "Nova publicação"}</DialogTitle>
              <DialogDescription>
                {editando
                  ? "Atualize os dados desta notícia."
                  : "Preencha os dados e escolha onde a notícia será publicada."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" name="titulo" defaultValue={editando?.titulo} placeholder="Título da notícia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo</Label>
                <Textarea id="resumo" name="resumo" defaultValue={editando?.resumo} placeholder="Breve descrição" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue>{categoria}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_NOTICIA.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    defaultValue={(editando?.data || new Date().toISOString()).split("T")[0]}
                  />
                </div>
              </div>

              {!editando ? (
                <div className="space-y-2">
                  <Label>Onde publicar?</Label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {DESTINOS.map((d) => {
                      const Icon = d.icon
                      const ativo = destino === d.valor
                      return (
                        <button
                          type="button"
                          key={d.valor}
                          onClick={() => setDestino(d.valor)}
                          className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors ${
                            ativo ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                          }`}
                          aria-pressed={ativo}
                        >
                          <span className="flex items-center gap-2 font-medium text-foreground">
                            <Icon className={`size-4 ${ativo ? "text-primary" : "text-muted-foreground"}`} />
                            {d.titulo}
                          </span>
                          <span className="text-xs text-muted-foreground">{d.descricao}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : editando ? "Salvar" : "Publicar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar excluir */}
      <AlertDialog open={!!confirmarApagar} onOpenChange={(o) => !o && setConfirmarApagar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir publicação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente <strong>{confirmarApagar?.titulo}</strong> do portal. Não pode ser
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
    </div>
  )
}
