"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Radio, ImageIcon, Loader2, X, AtSign, Send, TriangleAlert, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIAS_NOTICIA } from "@/lib/types"
import { publicarDiarioNaval } from "@/app/admin/diario-naval/actions"

export function DiarioNavalManager({ temWebhook }: { temWebhook: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [categoria, setCategoria] = useState<string>("Comunicados")
  const [imagemUrl, setImagemUrl] = useState<string>("")
  const [enviandoImg, setEnviandoImg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 4000)
  }

  async function enviarImagem(file: File) {
    setErro(null)
    setEnviandoImg(true)
    try {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/noticias/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Falha ao enviar a imagem.")
      setImagemUrl(json.url)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.")
    } finally {
      setEnviandoImg(false)
    }
  }

  function submitForm(formData: FormData) {
    setErro(null)
    formData.set("categoria", categoria)
    formData.set("imagem_url", imagemUrl)
    startTransition(async () => {
      const res = await publicarDiarioNaval(formData)
      if (res?.error) setErro(res.error)
      else {
        formRef.current?.reset()
        setCategoria("Comunicados")
        setImagemUrl("")
        flash("Publicação enviada ao canal Diário Naval.")
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {!temWebhook ? (
        <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-foreground">
            Nenhum webhook ativo do Diário Naval está configurado. Configure um em{" "}
            <Link href="/admin/configuracoes" className="font-medium text-primary underline underline-offset-2">
              Configurações › Webhooks
            </Link>{" "}
            para que as publicações cheguem ao canal.
          </p>
        </div>
      ) : null}

      {msg ? (
        <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-foreground">
          <CheckCircle2 className="size-4 text-accent-foreground" />
          {msg}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Radio className="size-5 text-primary" />
            Publicar no Diário Naval
          </CardTitle>
          <CardDescription>
            Esta publicação é enviada exclusivamente ao canal Diário Naval via webhook e não aparece no portal do site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={submitForm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" placeholder="Título da publicação" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumo">Descrição</Label>
              <Textarea id="resumo" name="resumo" placeholder="Conteúdo da publicação" rows={4} />
            </div>

            {/* Anexar imagem */}
            <div className="space-y-2">
              <Label>Imagem</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) enviarImagem(f)
                }}
              />
              {imagemUrl ? (
                <div className="relative overflow-hidden rounded-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagemUrl || "/placeholder.svg"} alt="Pré-visualização" className="h-40 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagemUrl("")}
                    className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
                    aria-label="Remover imagem"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviandoImg}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                >
                  {enviandoImg ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Enviando imagem...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-5" />
                      Clique para anexar uma imagem
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mencionar */}
            <div className="space-y-2">
              <Label htmlFor="mencao">Mencionar</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="mencao" name="mencao" placeholder="ex.: @everyone, Diretoria de Portos" className="pl-9" />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v ?? "")}>
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

            {/* Rodapé */}
            <div className="space-y-2">
              <Label htmlFor="rodape">Rodapé</Label>
              <Textarea id="rodape" name="rodape" placeholder="Texto de rodapé, fonte ou assinatura" rows={2} />
            </div>

            {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending || enviandoImg}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Publicar no Diário Naval
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
