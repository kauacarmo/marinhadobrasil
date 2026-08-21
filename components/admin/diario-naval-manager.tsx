"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  Radio,
  ImageIcon,
  Loader2,
  X,
  AtSign,
  Send,
  TriangleAlert,
  CheckCircle2,
  Eye,
  Plus,
  Type,
  ArrowUp,
  ArrowDown,
  Trash2,
  Newspaper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { publicarDiarioNaval } from "@/app/admin/diario-naval/actions"

const MAX_BLOCOS = 9
const MAX_NOTICIAS = 10

type Bloco =
  | { id: string; tipo: "texto"; texto: string }
  | { id: string; tipo: "imagem"; url: string; enviando?: boolean }

type Noticia = {
  id: string
  titulo: string
  mencao: string
  rodape: string
  blocos: Bloco[]
}

function novoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function noticiaVazia(): Noticia {
  return {
    id: novoId(),
    titulo: "",
    mencao: "",
    rodape: "",
    blocos: [{ id: novoId(), tipo: "texto", texto: "" }],
  }
}

export function DiarioNavalManager({ temWebhook }: { temWebhook: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [noticias, setNoticias] = useState<Noticia[]>([noticiaVazia()])

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 4000)
  }

  // ---- Operações imutáveis sobre notícias e blocos ----
  function patchNoticia(id: string, patch: Partial<Noticia>) {
    setNoticias((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }

  function addNoticia() {
    setNoticias((prev) => (prev.length >= MAX_NOTICIAS ? prev : [...prev, noticiaVazia()]))
  }

  function removeNoticia(id: string) {
    setNoticias((prev) => (prev.length <= 1 ? prev : prev.filter((n) => n.id !== id)))
  }

  function setBlocos(noticiaId: string, fn: (blocos: Bloco[]) => Bloco[]) {
    setNoticias((prev) => prev.map((n) => (n.id === noticiaId ? { ...n, blocos: fn(n.blocos) } : n)))
  }

  function addBloco(noticiaId: string, tipo: "texto" | "imagem") {
    setBlocos(noticiaId, (blocos) => {
      if (blocos.length >= MAX_BLOCOS) return blocos
      const novo: Bloco =
        tipo === "texto"
          ? { id: novoId(), tipo: "texto", texto: "" }
          : { id: novoId(), tipo: "imagem", url: "" }
      return [...blocos, novo]
    })
  }

  function removeBloco(noticiaId: string, blocoId: string) {
    setBlocos(noticiaId, (blocos) => (blocos.length <= 1 ? blocos : blocos.filter((b) => b.id !== blocoId)))
  }

  function moverBloco(noticiaId: string, blocoId: string, dir: -1 | 1) {
    setBlocos(noticiaId, (blocos) => {
      const i = blocos.findIndex((b) => b.id === blocoId)
      const j = i + dir
      if (i < 0 || j < 0 || j >= blocos.length) return blocos
      const copia = [...blocos]
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return copia
    })
  }

  function patchBloco(noticiaId: string, blocoId: string, patch: Partial<Bloco>) {
    setBlocos(noticiaId, (blocos) =>
      blocos.map((b) => (b.id === blocoId ? ({ ...b, ...patch } as Bloco) : b)),
    )
  }

  async function enviarImagem(noticiaId: string, blocoId: string, file: File) {
    setErro(null)
    patchBloco(noticiaId, blocoId, { enviando: true } as Partial<Bloco>)
    try {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/noticias/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Falha ao enviar a imagem.")
      patchBloco(noticiaId, blocoId, { url: json.url, enviando: false } as Partial<Bloco>)
    } catch (e) {
      patchBloco(noticiaId, blocoId, { enviando: false } as Partial<Bloco>)
      setErro(e instanceof Error ? e.message : "Falha ao enviar a imagem.")
    }
  }

  function publicar() {
    setErro(null)
    // Serializa apenas o necessário para a action.
    const payload = noticias.map((n) => ({
      titulo: n.titulo,
      mencao: n.mencao,
      rodape: n.rodape,
      blocos: n.blocos.map((b) =>
        b.tipo === "imagem" ? { tipo: "imagem", url: b.url } : { tipo: "texto", texto: b.texto },
      ),
    }))
    const fd = new FormData()
    fd.set("noticias", JSON.stringify(payload))
    startTransition(async () => {
      const res = await publicarDiarioNaval(fd)
      if (res?.error) setErro(res.error)
      else {
        setNoticias([noticiaVazia()])
        flash(
          res?.total && res.total > 1
            ? `${res.total} notícias enviadas ao canal Diário Naval.`
            : "Notícia enviada ao canal Diário Naval.",
        )
      }
    })
  }

  const algumEnviando = noticias.some((n) => n.blocos.some((b) => b.tipo === "imagem" && b.enviando))

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
              Monte cada matéria com blocos na ordem que quiser (texto, imagem, texto, imagem…). Você pode montar
              várias notícias — cada uma vira uma mensagem separada no canal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {noticias.map((n, idx) => (
              <NoticiaEditor
                key={n.id}
                noticia={n}
                indice={idx}
                total={noticias.length}
                onPatch={(patch) => patchNoticia(n.id, patch)}
                onRemove={() => removeNoticia(n.id)}
                onAddBloco={(tipo) => addBloco(n.id, tipo)}
                onRemoveBloco={(blocoId) => removeBloco(n.id, blocoId)}
                onMoverBloco={(blocoId, dir) => moverBloco(n.id, blocoId, dir)}
                onPatchBloco={(blocoId, patch) => patchBloco(n.id, blocoId, patch)}
                onEnviarImagem={(blocoId, file) => enviarImagem(n.id, blocoId, file)}
              />
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addNoticia}
                disabled={noticias.length >= MAX_NOTICIAS}
              >
                <Newspaper className="size-4" /> Adicionar notícia
              </Button>

              {erro ? <p className="order-last w-full text-sm text-destructive sm:order-none sm:w-auto">{erro}</p> : null}

              <Button type="button" onClick={publicar} disabled={isPending || algumEnviando}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Publicar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizador */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="size-4" />
          Pré-visualização no canal
        </div>
        <div className="space-y-3">
          {noticias.map((n) => (
            <NoticiaPreview key={n.id} noticia={n} />
          ))}
        </div>
      </div>
    </div>
  )
}

function NoticiaEditor({
  noticia,
  indice,
  total,
  onPatch,
  onRemove,
  onAddBloco,
  onRemoveBloco,
  onMoverBloco,
  onPatchBloco,
  onEnviarImagem,
}: {
  noticia: Noticia
  indice: number
  total: number
  onPatch: (patch: Partial<Noticia>) => void
  onRemove: () => void
  onAddBloco: (tipo: "texto" | "imagem") => void
  onRemoveBloco: (blocoId: string) => void
  onMoverBloco: (blocoId: string, dir: -1 | 1) => void
  onPatchBloco: (blocoId: string, patch: Partial<Bloco>) => void
  onEnviarImagem: (blocoId: string, file: File) => void
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Newspaper className="size-3.5" /> Notícia {indice + 1}
        </span>
        {total > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-4" /> Remover
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Manchete</Label>
        <Input
          placeholder="ex.: Marinha anuncia processo seletivo para Fuzileiros Navais"
          value={noticia.titulo}
          onChange={(e) => onPatch({ titulo: e.target.value })}
        />
      </div>

      {/* Blocos alternados */}
      <div className="space-y-3">
        <Label>Conteúdo da matéria</Label>
        {noticia.blocos.map((b, i) => (
          <BlocoEditor
            key={b.id}
            bloco={b}
            primeiro={i === 0}
            ultimo={i === noticia.blocos.length - 1}
            onMover={(dir) => onMoverBloco(b.id, dir)}
            onRemover={() => onRemoveBloco(b.id)}
            onPatch={(patch) => onPatchBloco(b.id, patch)}
            onEnviarImagem={(file) => onEnviarImagem(b.id, file)}
          />
        ))}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onAddBloco("texto")}
            disabled={noticia.blocos.length >= MAX_BLOCOS}
          >
            <Type className="size-4" /> Texto
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onAddBloco("imagem")}
            disabled={noticia.blocos.length >= MAX_BLOCOS}
          >
            <ImageIcon className="size-4" /> Imagem
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            {noticia.blocos.length}/{MAX_BLOCOS} blocos
          </span>
        </div>
      </div>

      {/* Ajustes opcionais */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Mencionar</Label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ex.: @everyone"
              className="pl-9"
              value={noticia.mencao}
              onChange={(e) => onPatch({ mencao: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Rodapé</Label>
          <Input
            placeholder="Fonte ou assinatura"
            value={noticia.rodape}
            onChange={(e) => onPatch({ rodape: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function BlocoEditor({
  bloco,
  primeiro,
  ultimo,
  onMover,
  onRemover,
  onPatch,
  onEnviarImagem,
}: {
  bloco: Bloco
  primeiro: boolean
  ultimo: boolean
  onMover: (dir: -1 | 1) => void
  onRemover: () => void
  onPatch: (patch: Partial<Bloco>) => void
  onEnviarImagem: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {bloco.tipo === "texto" ? <Type className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          {bloco.tipo === "texto" ? "Texto" : "Imagem"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMover(-1)}
            disabled={primeiro}
            className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
            aria-label="Mover para cima"
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMover(1)}
            disabled={ultimo}
            className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemover}
            className="inline-flex size-7 items-center justify-center rounded text-destructive hover:bg-destructive/10"
            aria-label="Remover bloco"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {bloco.tipo === "texto" ? (
        <Textarea
          rows={3}
          placeholder="Escreva o parágrafo da matéria..."
          value={bloco.texto}
          onChange={(e) => onPatch({ texto: e.target.value } as Partial<Bloco>)}
        />
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onEnviarImagem(e.target.files[0])
              e.target.value = ""
            }}
          />
          {bloco.url ? (
            <div className="relative overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bloco.url || "/placeholder.svg"} alt="Imagem da matéria" className="max-h-56 w-full object-cover" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow hover:bg-background"
              >
                Trocar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={bloco.enviando}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
            >
              {bloco.enviando ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Enviando imagem...
                </>
              ) : (
                <>
                  <Plus className="size-5" /> Anexar imagem
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function NoticiaPreview({ noticia }: { noticia: Noticia }) {
  const { titulo, mencao, rodape, blocos } = noticia
  const temConteudo = titulo.trim() || blocos.some((b) => (b.tipo === "texto" ? b.texto.trim() : b.url))

  return (
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

          {/* Matéria no formato de portal (barra naval à esquerda) */}
          <div className="mt-2 overflow-hidden rounded-[4px] border-l-4 border-[#1e3a5f] bg-[#2b2d31]">
            <div className="space-y-2 p-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#1e3a5f] text-[8px] font-bold text-white">
                  MB
                </span>
                <span className="text-xs font-semibold text-[#dbdee1]">Diário Naval — Marinha do Brasil</span>
              </div>

              {titulo.trim() ? (
                <p className="text-base font-bold leading-snug text-[#00a8fc]">{titulo.trim()}</p>
              ) : (
                <p className="text-base font-bold leading-snug text-[#6d7178]">Manchete da matéria</p>
              )}

              {temConteudo ? (
                blocos.map((b) =>
                  b.tipo === "texto" ? (
                    b.texto.trim() ? (
                      <p key={b.id} className="whitespace-pre-line text-sm leading-relaxed text-[#dbdee1]">
                        {b.texto.trim()}
                      </p>
                    ) : null
                  ) : b.url ? (
                    <div key={b.id} className="overflow-hidden rounded-[4px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.url || "/placeholder.svg"} alt="Imagem da matéria" className="w-full object-cover" />
                    </div>
                  ) : null,
                )
              ) : (
                <p className="text-sm leading-relaxed text-[#6d7178]">
                  Monte a matéria com blocos de texto e imagem para ver a prévia.
                </p>
              )}

              <div className="flex items-center gap-1 pt-1 text-xs text-[#949ba4]">
                {(rodape.trim() || "Diário Naval • Marinha do Brasil") + " • hoje"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
