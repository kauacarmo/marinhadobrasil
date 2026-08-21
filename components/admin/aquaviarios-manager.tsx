"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  IdCard,
  BookMarked,
  Loader2,
  AtSign,
  Send,
  TriangleAlert,
  CheckCircle2,
  Eye,
  ImageIcon,
  Plus,
  Anchor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DOC_AQUAVIARIO_LABEL, type TipoDocAquaviario } from "@/lib/types"
import { emitirDocumentoAquaviario } from "@/app/admin/aquaviarios/actions"

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
  carteira_militar: [
    { key: "posto", label: "Posto / Graduação", tipo: "text", placeholder: "ex.: Capitão-Tenente (CT)" },
    { key: "forca", label: "Força", tipo: "text", placeholder: "Marinha do Brasil" },
    { key: "unidade", label: "Unidade / OM", tipo: "text", placeholder: "ex.: Capitania dos Portos de SP" },
    { key: "rg_militar", label: "RG Militar", tipo: "text", placeholder: "ex.: 00.000.000-0" },
    { key: "numero", label: "Nº do documento", tipo: "text", placeholder: "ex.: CIM-000000" },
    { key: "validade", label: "Validade", tipo: "text", placeholder: "ex.: 12/2030" },
  ],
}

const TIPOS: { valor: TipoDocAquaviario; label: string; icon: typeof IdCard }[] = [
  { valor: "cir", label: "CIR", icon: BookMarked },
  { valor: "carteira_militar", label: "Carteira Militar", icon: IdCard },
]

export function AquaviariosManager({
  webhooks,
}: {
  webhooks: { cir: number; carteira_militar: number }
}) {
  const [tipo, setTipo] = useState<TipoDocAquaviario>("cir")
  const [titular, setTitular] = useState("")
  const [valores, setValores] = useState<Record<string, string>>({})
  const [fotoUrl, setFotoUrl] = useState("")
  const [mencao, setMencao] = useState("")
  const [rodape, setRodape] = useState("")
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const temWebhook = webhooks[tipo] > 0
  const campos = CAMPOS[tipo]

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

  function emitir() {
    setErro(null)
    const camposPayload = campos
      .map((c) => ({ label: c.label, valor: (valores[c.key] || "").trim() }))
      .filter((c) => c.valor)

    const fd = new FormData()
    fd.set("tipo", tipo)
    fd.set("titular", titular)
    fd.set("campos", JSON.stringify(camposPayload))
    fd.set("foto_url", fotoUrl)
    fd.set("mencao", mencao)
    fd.set("rodape", rodape)

    startTransition(async () => {
      const res = await emitirDocumentoAquaviario(fd)
      if (res?.error) setErro(res.error)
      else {
        setTitular("")
        setValores({})
        setFotoUrl("")
        setMencao("")
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
              Preencha os dados do documento. Ao emitir, ele é enviado ao canal correspondente via webhook.
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
                  <img src={fotoUrl || "/placeholder.svg"} alt="Foto do titular" className="size-20 rounded-md border border-border object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    Trocar foto
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={enviandoFoto}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                >
                  {enviandoFoto ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Enviando foto...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" /> Anexar foto (opcional)
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mencao">Mencionar</Label>
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
              <div className="space-y-2">
                <Label htmlFor="rodape">Rodapé</Label>
                <Input
                  id="rodape"
                  placeholder="Assinatura ou observação"
                  value={rodape}
                  onChange={(e) => setRodape(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {erro ? <p className="mr-auto text-sm text-destructive">{erro}</p> : null}
              <Button type="button" onClick={emitir} disabled={isPending || enviandoFoto || !temWebhook}>
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

      {/* Pré-visualização do documento */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Eye className="size-4" />
          Pré-visualização
        </div>
        <DocumentoPreview
          tipo={tipo}
          titular={titular}
          valores={valores}
          campos={campos}
          fotoUrl={fotoUrl}
          rodape={rodape}
        />
      </div>
    </div>
  )
}

function DocumentoPreview({
  tipo,
  titular,
  valores,
  campos,
  fotoUrl,
  rodape,
}: {
  tipo: TipoDocAquaviario
  titular: string
  valores: Record<string, string>
  campos: Campo[]
  fotoUrl: string
  rodape: string
}) {
  const preenchidos = campos.filter((c) => (valores[c.key] || "").trim())
  const corBarra = tipo === "carteira_militar" ? "bg-[#0f5132]" : "bg-[#1e3a5f]"

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className={cn("flex items-center gap-2 px-4 py-2.5 text-primary-foreground", corBarra)}>
        <Anchor className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Marinha do Brasil</span>
      </div>
      <div className="p-4">
        <p className="font-serif text-sm font-bold text-primary text-balance">{DOC_AQUAVIARIO_LABEL[tipo]}</p>
        <div className="mt-3 flex gap-3">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl || "/placeholder.svg"} alt="Foto do titular" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase text-muted-foreground">Titular</p>
            <p className="truncate font-semibold text-foreground">{titular.trim() || "—"}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {preenchidos.length > 0 ? (
            preenchidos.map((c) => (
              <div key={c.key} className={cn(c.tipo === "textarea" && "col-span-2")}>
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">{c.label}</dt>
                <dd className="text-sm text-foreground">{valores[c.key]}</dd>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-sm text-muted-foreground">Preencha os campos para ver a prévia.</p>
          )}
        </dl>

        <div className="mt-4 border-t border-border pt-2 text-[11px] text-muted-foreground">
          {rodape.trim() || "Documento emitido pela Capitania dos Portos"}
        </div>
      </div>
    </div>
  )
}
