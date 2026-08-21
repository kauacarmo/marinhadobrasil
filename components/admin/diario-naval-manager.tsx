"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Radio, ImageIcon, Loader2, X, AtSign, Send, TriangleAlert, CheckCircle2, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { publicarDiarioNaval } from "@/app/admin/diario-naval/actions"

const MAX_IMAGENS = 5

export function DiarioNavalManager({ temWebhook }: { temWebhook: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [titulo, setTitulo] = useState<string>("")
  const [resumo, setResumo] = useState<string>("")
  const [mencao, setMencao] = useState<string>("")
  const [rodape, setRodape] = useState<string>("")
  const [imagens, setImagens] = useState<string[]>([])
  const [enviandoImg, setEnviandoImg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 4000)
  }

  function limpar() {
    formRef.current?.reset()
    setTitulo("")
    setResumo("")
    setMencao("")
    setRodape("")
    setImagens([])
  }

  async function enviarImagens(files: FileList) {
    setErro(null)
    const espacoLivre = MAX_IMAGENS - imagens.length
    if (espacoLivre <= 0) {
      setErro(`Você pode anexar no máximo ${MAX_IMAGENS} imagens.`)
      return
    }
    const selecionadas = Array.from(files).slice(0, espacoLivre)
    setEnviandoImg(true)
    try {
      for (const file of selecionadas) {
        const fd = new FormData()
        fd.set("file", file)
        const res = await fetch("/api/noticias/upload", { method: "POST", body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Falha ao enviar a imagem.")
        setImagens((prev) => (prev.length < MAX_IMAGENS ? [...prev, json.url] : prev))
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.")
    } finally {
      setEnviandoImg(false)
    }
  }

  function removerImagem(url: string) {
    setImagens((prev) => prev.filter((u) => u !== url))
  }

  function submitForm(formData: FormData) {
    setErro(null)
    formData.set("imagens", JSON.stringify(imagens))
    startTransition(async () => {
      const res = await publicarDiarioNaval(formData)
      if (res?.error) setErro(res.error)
      else {
        limpar()
        flash("Publicação enviada ao canal Diário Naval.")
      }
    })
  }

  const podeAnexarMais = imagens.length < MAX_IMAGENS

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="space-y-5">
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
              A publicação é enviada como embed ao canal Diário Naval via webhook e não aparece no portal do site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={submitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Título da publicação"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumo">Descrição</Label>
                <Textarea
                  id="resumo"
                  name="resumo"
                  placeholder="Conteúdo da publicação"
                  rows={4}
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                />
              </div>

              {/* Anexar imagens (galeria de até 5) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Imagens</Label>
                  <span className="text-xs text-muted-foreground">
                    {imagens.length}/{MAX_IMAGENS}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) enviarImagens(e.target.files)
                    e.target.value = ""
                  }}
                />

                {imagens.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imagens.map((url) => (
                      <div key={url} className="relative overflow-hidden rounded-md border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url || "/placeholder.svg"} alt="Pré-visualização" className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removerImagem(url)}
                          className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
                          aria-label="Remover imagem"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {podeAnexarMais ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={enviandoImg}
                        className="flex h-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                      >
                        {enviandoImg ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        {enviandoImg ? "Enviando" : "Adicionar"}
                      </button>
                    ) : null}
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
                        Clique para anexar imagens (até {MAX_IMAGENS})
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
                  <Input
                    id="mencao"
                    name="mencao"
                    placeholder="ex.: @everyone, Diretoria de Portos"
                    className="pl-9"
                    value={mencao}
                    onChange={(e) => setMencao(e.target.value)}
                  />
                </div>
              </div>

              {/* Rodapé */}
              <div className="space-y-2">
                <Label htmlFor="rodape">Rodapé</Label>
                <Textarea
                  id="rodape"
                  name="rodape"
                  placeholder="Texto de rodapé, fonte ou assinatura"
                  rows={2}
                  value={rodape}
                  onChange={(e) => setRodape(e.target.value)}
                />
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

      {/* Visualizador do embed */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="size-4" />
          Pré-visualização do embed
        </div>
        <EmbedPreview titulo={titulo} resumo={resumo} mencao={mencao} rodape={rodape} imagens={imagens} />
      </div>
    </div>
  )
}

function EmbedPreview({
  titulo,
  resumo,
  mencao,
  rodape,
  imagens,
}: {
  titulo: string
  resumo: string
  mencao: string
  rodape: string
  imagens: string[]
}) {
  const temConteudo = titulo.trim() || resumo.trim() || imagens.length > 0 || rodape.trim()
  // O Discord exibe até 4 imagens na grade da galeria.
  const galeria = imagens.slice(0, 4)

  return (
    // Fundo escuro fixo para simular o cliente do Discord, independente do tema do painel.
    <div className="rounded-lg border border-border bg-[#313338] p-4 text-[#dbdee1]">
      <div className="flex gap-3">
        <div className="size-10 shrink-0 rounded-full bg-[#5865f2]" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Diário Naval</span>
            <span className="rounded bg-[#5865f2] px-1 text-[10px] font-semibold uppercase text-white">App</span>
            <span className="text-xs text-[#949ba4]">agora</span>
          </div>

          {mencao.trim() ? (
            <p className="mt-1 inline-block rounded bg-[#3f4248] px-1 text-sm font-medium text-[#c9cdfb]">
              {mencao.trim()}
            </p>
          ) : null}

          {/* Cartão do embed com a barra colorida à esquerda (cor naval 0x1e3a5f) */}
          <div className="mt-2 overflow-hidden rounded-[4px] border-l-4 border-[#1e3a5f] bg-[#2b2d31]">
            <div className="space-y-2 p-3">
              {titulo.trim() ? (
                <p className="font-semibold leading-snug text-white">{titulo.trim()}</p>
              ) : (
                <p className="font-semibold leading-snug text-[#6d7178]">Título da publicação</p>
              )}

              {resumo.trim() ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#dbdee1]">{resumo.trim()}</p>
              ) : (
                <p className="text-sm leading-relaxed text-[#6d7178]">A descrição aparecerá aqui.</p>
              )}

              {galeria.length === 1 ? (
                <div className="overflow-hidden rounded-[4px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={galeria[0] || "/placeholder.svg"} alt="Imagem do embed" className="w-full object-cover" />
                </div>
              ) : galeria.length > 1 ? (
                <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-[4px]">
                  {galeria.map((url, i) => (
                    <div
                      key={url}
                      className={galeria.length === 3 && i === 0 ? "col-span-2" : undefined}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url || "/placeholder.svg"} alt={`Imagem ${i + 1} do embed`} className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}

              {rodape.trim() ? (
                <div className="flex items-center gap-1 pt-1 text-xs text-[#949ba4]">{rodape.trim()}</div>
              ) : null}
            </div>
          </div>

          {!temConteudo ? (
            <p className="mt-2 text-xs text-[#6d7178]">Preencha o formulário para ver como a mensagem ficará no canal.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
