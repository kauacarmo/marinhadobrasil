"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { Search, Plus, Trash2, Eye, FileText, Webhook, Copy, Check, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Documento, TipoDocumento } from "@/lib/types"
import { DOCUMENTO_LABEL_SINGULAR } from "@/lib/types"
import { criarDocumento, apagarDocumento } from "@/app/admin/documentos/actions"

function formatDataHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  })
}

function formatDataExtenso(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  })
}

export function DocumentosManager({
  tipo,
  documentos,
  webhookUrl,
}: {
  tipo: TipoDocumento
  documentos: Documento[]
  webhookUrl: string
}) {
  const [isPending, startTransition] = useTransition()
  const [busca, setBusca] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const [novo, setNovo] = useState(false)
  const [vendo, setVendo] = useState<Documento | null>(null)
  const [selecionado, setSelecionado] = useState<Documento | null>(documentos[0] ?? null)
  const [confirmar, setConfirmar] = useState<Documento | null>(null)
  const [openWebhook, setOpenWebhook] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const singular = DOCUMENTO_LABEL_SINGULAR[tipo]

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return documentos
    return documentos.filter(
      (d) => d.titulo.toLowerCase().includes(q) || (d.numero ?? "").toLowerCase().includes(q),
    )
  }, [busca, documentos])

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 3000)
  }

  function submitNovo(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const res = await criarDocumento(tipo, formData)
      if (res?.error) setErro(res.error)
      else {
        setNovo(false)
        flash("Documento publicado.")
      }
    })
  }

  function apagar(d: Documento) {
    startTransition(async () => {
      await apagarDocumento(d.id, tipo)
      setConfirmar(null)
      flash("Documento removido.")
    })
  }

  function copiarUrl() {
    navigator.clipboard.writeText(webhookUrl)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
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
            placeholder="Buscar por título ou número..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOpenWebhook(true)}>
            <Webhook className="size-4" /> Webhook
          </Button>
          <Button onClick={() => setNovo(true)}>
            <Plus className="size-4" /> Novo documento
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Número</th>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Formato</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Recebido em</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((d) => (
              <tr key={d.id} onClick={() => setSelecionado(d)} className={cn("cursor-pointer hover:bg-muted/30", selecionado?.id === d.id && "bg-muted/50")}>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.numero ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{d.titulo}</td>
                <td className="px-4 py-3">
                  <Badge variant={d.pdf_url ? "default" : "secondary"}>{d.pdf_url ? "PDF" : "Texto"}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{d.origem}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDataHora(d.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setVendo(d)} aria-label="Visualizar">
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfirmar(d)}
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
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-2 size-8 opacity-40" />
                  {documentos.length === 0
                    ? "Nenhum documento recebido. Envie via webhook ou cadastre manualmente."
                    : "Nenhum resultado para a busca."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <aside className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Preview oficial</p>
          <h2 className="mt-1 font-serif text-lg font-semibold">{selecionado?.titulo ?? "Selecione um documento"}</h2>
        </div>
        {selecionado ? (
          <article className="m-4 min-h-[34rem] bg-background px-6 py-7 text-foreground shadow-inner ring-1 ring-border/60">
            <header className="flex flex-col items-center border-b border-foreground/80 pb-4 text-center">
              <Image src="/marinha-ultrawide.png" alt="Marinha do Brasil" width={1600} height={430} className="h-auto w-48 max-w-full" />
              <p className="mt-3 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Centro de Comunicação Social da Marinha</p>
              <p className="mt-2 text-[10px] font-bold uppercase">{singular}</p>
            </header>
            <div className="mt-5 flex justify-end text-[10px] leading-relaxed text-muted-foreground">Brasília — DF<br />{formatDataExtenso(selecionado.created_at)}</div>
            <div className="mt-5">
              {selecionado.numero ? <p className="text-center text-xs font-semibold uppercase">{singular} nº {selecionado.numero}</p> : null}
              <h3 className="mt-2 text-center font-serif text-base font-bold">{selecionado.titulo}</h3>
              {selecionado.conteudo ? <p className="mt-5 whitespace-pre-wrap text-justify text-xs leading-6">{selecionado.conteudo}</p> : null}
              {selecionado.pdf_url ? <a href={selecionado.pdf_url} target="_blank" rel="noreferrer" className="mt-5 block text-xs font-semibold text-primary underline">Abrir PDF do documento</a> : null}
            </div>
            <footer className="mt-12 border-t border-foreground/80 pt-3 text-center text-[9px] text-muted-foreground">Marinha do Brasil · Protegendo nossas riquezas, cuidando da nossa gente<br />www.marinha.mil.br</footer>
          </article>
        ) : <p className="p-6 text-sm text-muted-foreground">Clique em um documento para visualizar o modelo.</p>}
      </aside>
      </div>

      {/* Novo documento */}
      <Dialog open={novo} onOpenChange={setNovo}>
        <DialogContent className="max-w-lg">
          <form action={submitNovo}>
            <DialogHeader>
              <DialogTitle className="font-serif">Novo {singular}</DialogTitle>
              <DialogDescription>Cadastre um documento em texto ou informe o link de um PDF.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" name="numero" placeholder="123/2026" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" placeholder={`${singular} nº 123/2026`} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteudo">Texto do documento</Label>
                <Textarea id="conteudo" name="conteudo" rows={7} placeholder="Digite o conteúdo integral do documento..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf_url">Link do PDF (opcional)</Label>
                <Input id="pdf_url" name="pdf_url" type="url" placeholder="https://..." />
              </div>
              {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNovo(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Publicando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visualizador do documento (layout oficial com logo) */}
      <Dialog open={!!vendo} onOpenChange={(o) => !o && setVendo(null)}>
        <DialogContent className="max-w-3xl gap-0 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{vendo?.titulo}</DialogTitle>
          </DialogHeader>
          {vendo ? (
            <div className="max-h-[85vh] overflow-y-auto">
              <article id="doc-print" className="bg-white px-10 py-10 text-slate-900">
                {/* Cabeçalho: logo padrão centralizado */}
                <header className="flex flex-col items-center border-b-2 border-slate-800 pb-6 text-center">
                  <Image
                    src="/marinha-ultrawide.png"
                    alt="Marinha do Brasil"
                    width={1600}
                    height={430}
                    className="h-auto w-80 max-w-full"
                    priority
                  />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Capitania dos Portos de São Paulo — Comando do 8º Distrito Naval
                  </p>
                </header>

                {/* Título e metadados */}
                <div className="mt-8 text-center">
                  {vendo.numero ? (
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {singular} nº {vendo.numero}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-balance font-serif text-2xl font-bold text-slate-900">{vendo.titulo}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Publicado em {formatDataExtenso(vendo.created_at)}
                  </p>
                </div>

                {/* Conteúdo */}
                <div className="mt-8">
                  {vendo.conteudo ? (
                    <div className="whitespace-pre-wrap text-pretty text-[15px] leading-relaxed text-slate-800">
                      {vendo.conteudo}
                    </div>
                  ) : null}

                  {vendo.pdf_url ? (
                    <div className="mt-6">
                      <object data={vendo.pdf_url} type="application/pdf" className="h-[60vh] w-full rounded border border-slate-300">
                        <p className="p-4 text-sm text-slate-600">
                          Não foi possível exibir o PDF.{" "}
                          <a href={vendo.pdf_url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
                            Abrir em nova aba
                          </a>
                        </p>
                      </object>
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          ) : null}
          <DialogFooter className="border-t border-border bg-card px-6 py-3">
            {vendo?.pdf_url ? (
              <Button
                variant="outline"
                render={
                  <a href={vendo.pdf_url} target="_blank" rel="noreferrer">
                    <Eye className="size-4" /> Abrir PDF
                  </a>
                }
              />
            ) : null}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Imprimir
            </Button>
            <Button onClick={() => setVendo(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!confirmar} onOpenChange={(o) => !o && setConfirmar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente <strong>{confirmar?.titulo}</strong>. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => confirmar && apagar(confirmar)}
              disabled={isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Instruções do webhook */}
      <Dialog open={openWebhook} onOpenChange={setOpenWebhook}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Recebimento via Webhook</DialogTitle>
            <DialogDescription>
              Envie documentos automaticamente por uma requisição HTTP POST.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Endpoint (POST)</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">{webhookUrl}</code>
                <Button size="icon" variant="outline" onClick={copiarUrl} aria-label="Copiar">
                  {copiado ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Exemplo de corpo (JSON)</Label>
              <pre className="overflow-x-auto rounded-md bg-foreground/95 p-3 text-xs leading-relaxed text-background">
{`{
  "tipo": "${tipo}",
  "numero": "123/2026",
  "titulo": "${singular} nº 123/2026",
  "conteudo": "Texto integral...",
  "pdf_url": "https://.../arquivo.pdf"
}`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Envie <strong>conteudo</strong> (texto) e/ou <strong>pdf_url</strong> (link do PDF). Para proteger o
              endpoint, defina a variável <code className="rounded bg-muted px-1">DOCUMENTOS_WEBHOOK_SECRET</code> e
              envie o cabeçalho <code className="rounded bg-muted px-1">x-webhook-secret</code>.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenWebhook(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
