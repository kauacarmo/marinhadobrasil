"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  Ship,
  BookMarked,
  IdCard,
  Loader2,
  AtSign,
  Send,
  TriangleAlert,
  CheckCircle2,
  Eye,
  Plus,
  Anchor,
  Download,
  UserRound,
  Camera,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DOC_AQUAVIARIO_LABEL, type TipoDocAquaviario } from "@/lib/types"
import { emitirDocumentoAquaviario } from "@/app/admin/aquaviarios/actions"
import { gerarCardDocumento, nomeArquivoCard, type DadosCard } from "@/lib/gerar-card-documento"

type Campo = {
  key: string
  label: string
  tipo: "text" | "select" | "textarea"
  options?: string[]
  placeholder?: string
}

const CAMPOS: Record<TipoDocAquaviario, Campo[]> = {
  cir: [
    { key: "categoria", label: "Categoria", tipo: "select", options: ["Marítimo", "Fluviário", "Pescador", "Prático", "Motorista Fluvial", "Auxiliar de Convés"] },
    { key: "nivel", label: "Nível", tipo: "select", options: ["Iniciante", "Certificado", "Especial", "Superior"] },
    { key: "numero", label: "Nº de inscrição", tipo: "text", placeholder: "ex.: 1234567890" },
    { key: "funcao", label: "Função a bordo", tipo: "text", placeholder: "ex.: Marinheiro de Convés" },
    { key: "validade", label: "Validade", tipo: "text", placeholder: "ex.: 12/2030" },
    { key: "observacoes", label: "Observações", tipo: "textarea", placeholder: "Informações adicionais (opcional)" },
  ],
  carteira_nautica: [
    { key: "embarcacao", label: "Nome da embarcação", tipo: "text", placeholder: "ex.: Netuno II" },
    { key: "tipo_embarcacao", label: "Tipo de embarcação", tipo: "select", options: ["Lancha", "Jet Ski", "Veleiro", "Barco de Pesca", "Iate", "Bote Inflável"] },
    { key: "categoria", label: "Categoria de habilitação", tipo: "select", options: ["Arrais-Amador", "Mestre-Amador", "Capitão-Amador", "Motonauta", "Veleiro"] },
    { key: "inscricao", label: "Inscrição da embarcação", tipo: "text", placeholder: "ex.: 1234567890-8" },
    { key: "numero", label: "Nº da carteira", tipo: "text", placeholder: "ex.: CN-000000" },
    { key: "validade", label: "Validade", tipo: "text", placeholder: "ex.: 12/2030" },
  ],
  funcional_militar: [
    { key: "nr_registro", label: "Nº de registro", tipo: "text", placeholder: "ex.: 000000000-0" },
    { key: "posto", label: "Posto / Graduação / Categoria", tipo: "text", placeholder: "ex.: Primeiro-Tenente" },
    { key: "data_nascimento", label: "Data de nascimento", tipo: "text", placeholder: "ex.: 01/01/1990" },
    { key: "nip", label: "NIP", tipo: "text", placeholder: "ex.: 00.0000.00" },
    { key: "cpf", label: "CPF", tipo: "text", placeholder: "ex.: 000.000.000-00" },
    { key: "ric", label: "RIC", tipo: "text", placeholder: "ex.: 0000000000" },
  ],
}

const TIPOS: { valor: TipoDocAquaviario; label: string; icon: typeof Ship }[] = [
  { valor: "cir", label: "CIR", icon: BookMarked },
  { valor: "carteira_nautica", label: "Carteira Náutica", icon: Ship },
  { valor: "funcional_militar", label: "Funcional Militar", icon: IdCard },
]

export function AquaviariosManager({
  webhooks,
}: {
  webhooks: { cir: number; carteira_nautica: number; funcional_militar: number }
}) {
  const [tipo, setTipo] = useState<TipoDocAquaviario>("cir")
  const [titular, setTitular] = useState("")
  const [valores, setValores] = useState<Record<string, string>>({})
  const [fotoUrl, setFotoUrl] = useState("")
  const [mencao, setMencao] = useState("")
  const [mencaoPessoa, setMencaoPessoa] = useState("")
  const [rodape, setRodape] = useState("")
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [cardPreview, setCardPreview] = useState("")
  const [gerandoCard, setGerandoCard] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Captura de foto pela câmera ("em game": aponta a webcam para a tela do jogo).
  const [cameraAberta, setCameraAberta] = useState(false)
  const [cameraErro, setCameraErro] = useState<string | null>(null)
  const [capturando, setCapturando] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const temWebhook = webhooks[tipo] > 0
  const campos = CAMPOS[tipo]

  const camposPreenchidos = useMemo(
    () => campos.map((c) => ({ label: c.label, valor: (valores[c.key] || "").trim() })).filter((c) => c.valor),
    [campos, valores],
  )

  const dadosCard = useMemo<DadosCard>(
    () => ({
      tipo,
      titulo: DOC_AQUAVIARIO_LABEL[tipo],
      titular: titular.trim(),
      campos: camposPreenchidos,
      fotoUrl: fotoUrl || undefined,
      rodape,
    }),
    [tipo, titular, camposPreenchidos, fotoUrl, rodape],
  )

  const podeGerar = Boolean(titular.trim()) && camposPreenchidos.length > 0

  // Regenera o card sempre que os dados mudam, com um pequeno atraso para não
  // redesenhar a cada tecla. A prévia é exatamente o PNG baixado e enviado.
  useEffect(() => {
    if (!podeGerar) {
      setCardPreview("")
      return
    }
    let cancelado = false
    let urlCriada = ""
    setGerandoCard(true)
    const timer = setTimeout(async () => {
      try {
        const blob = await gerarCardDocumento(dadosCard)
        if (cancelado) return
        urlCriada = URL.createObjectURL(blob)
        setCardPreview((anterior) => {
          if (anterior) URL.revokeObjectURL(anterior)
          return urlCriada
        })
      } catch {
        if (!cancelado) setCardPreview("")
      } finally {
        if (!cancelado) setGerandoCard(false)
      }
    }, 350)

    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [dadosCard, podeGerar])

  function trocarTipo(t: TipoDocAquaviario) {
    if (t === tipo) return
    setTipo(t)
    setValores({})
    setFotoUrl("")
    setErro(null)
  }

  function flash(t: string) {
    setMsg(t)
    setTimeout(() => setMsg(null), 4000)
  }

  async function enviarFoto(file: File) {
    setErro(null)
    setEnviandoFoto(true)
    try {
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/noticias/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Falha ao enviar a foto.")
      setFotoUrl(json.url)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar a foto.")
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function abrirCamera() {
    setCameraErro(null)
    setCameraAberta(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      setCameraErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
    }
  }

  function fecharCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraAberta(false)
  }

  async function capturarFoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    setCapturando(true)
    try {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Falha ao capturar a imagem.")
      ctx.drawImage(video, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      fecharCamera()
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.png`, { type: "image/png" })
        await enviarFoto(file)
      }
    } catch {
      setCameraErro("Falha ao capturar a foto. Tente novamente.")
    } finally {
      setCapturando(false)
    }
  }

  // Encerra a câmera se o componente for desmontado com ela aberta.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function baixarCard() {
    setErro(null)
    try {
      const blob = await gerarCardDocumento(dadosCard)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = nomeArquivoCard(tipo, titular)
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro("Não foi possível gerar o card para download.")
    }
  }

  function emitir() {
    setErro(null)
    startTransition(async () => {
      let cardUrl = ""
      try {
        // Hospeda o card para que o Discord possa exibi-lo no embed.
        const blob = await gerarCardDocumento(dadosCard)
        const fd = new FormData()
        fd.set("file", new File([blob], nomeArquivoCard(tipo, titular), { type: "image/png" }))
        const res = await fetch("/api/noticias/upload", { method: "POST", body: fd })
        const json = await res.json()
        if (res.ok) cardUrl = json.url
      } catch {
        // Sem o card, o documento ainda é enviado com os campos no embed.
        cardUrl = ""
      }

      const fd = new FormData()
      fd.set("tipo", tipo)
      fd.set("titular", titular)
      fd.set("campos", JSON.stringify(camposPreenchidos))
      fd.set("foto_url", fotoUrl)
      fd.set("card_url", cardUrl)
      fd.set("mencao", mencao)
      fd.set("mencao_pessoa", mencaoPessoa)
      fd.set("rodape", rodape)

      const res = await emitirDocumentoAquaviario(fd)
      if (res?.error) setErro(res.error)
      else {
        setTitular("")
        setValores({})
        setFotoUrl("")
        setMencao("")
        setMencaoPessoa("")
        setRodape("")
        flash(`${DOC_AQUAVIARIO_LABEL[tipo]} emitida e enviada por webhook.`)
      }
    })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="space-y-5">
        {/* Seletor de documento */}
        <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
          {TIPOS.map((t) => {
            const ativo = tipo === t.valor
            const Icon = t.icon
            return (
              <button
                key={t.valor}
                type="button"
                onClick={() => trocarTipo(t.valor)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  ativo ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="size-4" /> {t.label}
              </button>
            )
          })}
        </div>

        {!temWebhook ? (
          <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-foreground">
              Nenhum webhook ativo para <strong>{DOC_AQUAVIARIO_LABEL[tipo]}</strong>. Configure um em{" "}
              <Link href="/admin/configuracoes" className="font-medium text-primary underline underline-offset-2">
                Configurações › Webhooks
              </Link>{" "}
              para emitir.
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
              <Anchor className="size-5 text-primary" />
              Emitir {DOC_AQUAVIARIO_LABEL[tipo]}
            </CardTitle>
            <CardDescription>
              Preencha os dados para gerar o card do documento. Ao emitir, o card é enviado ao canal via webhook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="titular">Nome do titular</Label>
              <Input
                id="titular"
                placeholder="ex.: João da Silva"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {campos.map((c) => (
                <div key={c.key} className={cn("space-y-2", c.tipo === "textarea" && "sm:col-span-2")}>
                  <Label htmlFor={c.key}>{c.label}</Label>
                  {c.tipo === "select" ? (
                    <select
                      id={c.key}
                      value={valores[c.key] || ""}
                      onChange={(e) => setValores((v) => ({ ...v, [c.key]: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Selecione</option>
                      {c.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : c.tipo === "textarea" ? (
                    <Textarea
                      id={c.key}
                      rows={2}
                      placeholder={c.placeholder}
                      value={valores[c.key] || ""}
                      onChange={(e) => setValores((v) => ({ ...v, [c.key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={c.key}
                      placeholder={c.placeholder}
                      value={valores[c.key] || ""}
                      onChange={(e) => setValores((v) => ({ ...v, [c.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Foto do titular */}
            <div className="space-y-2">
              <Label>Foto do titular</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) enviarFoto(e.target.files[0])
                  e.target.value = ""
                }}
              />
              {fotoUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl || "/placeholder.svg"}
                    alt="Foto do titular"
                    className="size-20 rounded-md border border-border object-cover"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      Trocar foto
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={abrirCamera}>
                      <Camera className="size-4" /> Tirar foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={enviandoFoto}
                    className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                  >
                    {enviandoFoto ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Enviando foto...
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" /> Anexar foto
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={abrirCamera}
                    disabled={enviandoFoto}
                    className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                  >
                    <Camera className="size-4" /> Tirar foto em game
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mencao_pessoa">Mencionar o titular</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="mencao_pessoa"
                    placeholder="ID do Discord ou @usuario"
                    className="pl-9"
                    value={mencaoPessoa}
                    onChange={(e) => setMencaoPessoa(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cole o ID do usuário para notificá-lo diretamente na mensagem.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mencao">Menção geral</Label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="mencao"
                    placeholder="ex.: @everyone"
                    className="pl-9"
                    value={mencao}
                    onChange={(e) => setMencao(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rodape">Rodapé</Label>
              <Input
                id="rodape"
                placeholder="Assinatura ou observação"
                value={rodape}
                onChange={(e) => setRodape(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {erro ? <p className="mr-auto text-sm text-destructive">{erro}</p> : null}
              <Button type="button" variant="outline" onClick={baixarCard} disabled={!podeGerar || isPending}>
                <Download className="size-4" /> Baixar card
              </Button>
              <Button
                type="button"
                onClick={emitir}
                disabled={isPending || enviandoFoto || !temWebhook || !podeGerar}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Emitindo...
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Emitir e enviar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card do documento: mesma imagem baixada e enviada por webhook */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="size-4" />
          Card do documento
          {gerandoCard ? <Loader2 className="size-3.5 animate-spin" /> : null}
        </div>
        {cardPreview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardPreview || "/placeholder.svg"}
              alt={`Card do documento ${DOC_AQUAVIARIO_LABEL[tipo]} de ${titular || "titular"}`}
              className="w-full rounded-lg border border-border shadow-sm"
            />
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={baixarCard}>
              <Download className="size-4" /> Baixar PNG
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
            Informe o titular e ao menos um campo para gerar o card.
          </div>
        )}
      </div>

      {/* Modal de captura pela câmera */}
      {cameraAberta ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tirar foto pela câmera"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="flex items-center gap-2 font-serif text-base font-semibold">
                <Camera className="size-4 text-primary" /> Tirar foto em game
              </h2>
              <button
                type="button"
                onClick={fecharCamera}
                className="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              {cameraErro ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {cameraErro}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Aponte a câmera para a tela do jogo e enquadre o personagem. Clique em capturar para usar a imagem.
                </p>
              )}
              <div className="overflow-hidden rounded-md border border-border bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} playsInline muted className="aspect-video w-full object-cover" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={fecharCamera}>
                  Cancelar
                </Button>
                <Button type="button" onClick={capturarFoto} disabled={capturando || Boolean(cameraErro)}>
                  {capturando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Capturando...
                    </>
                  ) : (
                    <>
                      <Camera className="size-4" /> Capturar foto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
