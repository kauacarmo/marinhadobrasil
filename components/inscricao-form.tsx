"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import type { Contest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { realizarInscricao, proximoNumeroInscricao } from "@/app/inscricao/actions"
import { ClipboardCheck, Copy, Check, FileEdit, ArrowRight, Anchor } from "lucide-react"

type Resultado = {
  codigo: string
  numeroInscricao: string
  nome: string
  concurso: string
}

export function InscricaoForm({ concursos }: { concursos: Contest[] }) {
  const [aberto, setAberto] = useState(false)
  const [contestId, setContestId] = useState<string>(concursos[0]?.id ?? "")
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [numeroPrevisto, setNumeroPrevisto] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  // Busca o próximo número de inscrição quando o formulário é aberto
  useEffect(() => {
    if (!aberto) return
    let ativo = true
    proximoNumeroInscricao().then((n) => {
      if (ativo) setNumeroPrevisto(n)
    })
    return () => {
      ativo = false
    }
  }, [aberto])

  if (concursos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Anchor className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 font-serif text-xl font-bold">Nenhuma inscrição aberta</h2>
        <p className="mt-1 text-muted-foreground">
          No momento não há concursos com inscrições abertas. Acompanhe os editais na página de concursos.
        </p>
        <Button asChild className="mt-4">
          <Link href="/concursos">Ver concursos</Link>
        </Button>
      </div>
    )
  }

  // Tela de confirmação com o código
  if (resultado) {
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15">
          <ClipboardCheck className="size-7 text-accent" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold">Inscrição confirmada!</h2>
        <p className="mt-1 text-muted-foreground">
          {resultado.nome} — {resultado.concurso}
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Número de inscrição</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-foreground">
            {resultado.numeroInscricao}
          </p>
        </div>

        <div className="mx-auto mt-4 max-w-sm rounded-lg border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Seu código de acesso à prova
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-primary">{resultado.codigo}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(resultado.codigo)
              setCopiado(true)
              setTimeout(() => setCopiado(false), 2000)
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copiado ? "Copiado!" : "Copiar código"}
          </button>
        </div>

        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground text-pretty">
          Guarde este código. Quando o concurso estiver <strong>Em Andamento</strong>, use-o na aba
          <strong> Prova</strong> para acessar seu exame.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/prova">Ir para a prova</Link>
          </Button>
          <Button
            onClick={() => {
              setResultado(null)
              setAberto(false)
            }}
          >
            Nova inscrição
          </Button>
        </div>
      </div>
    )
  }

  // Estado inicial: botão para iniciar
  if (!aberto) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <FileEdit className="size-7 text-primary" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold">Pronto para se inscrever?</h2>
        <p className="mx-auto mt-1 max-w-md text-muted-foreground text-pretty">
          Clique no botão abaixo para iniciar sua inscrição. Você informará o ID do jogo, o nome do personagem, seus
          dados pessoais e a data de nascimento. O número de inscrição é gerado automaticamente.
        </p>
        <Button size="lg" className="mt-5" onClick={() => setAberto(true)}>
          Iniciar inscrição <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  function submit(formData: FormData) {
    setErro(null)
    formData.set("contest_id", contestId)
    startTransition(async () => {
      const res = await realizarInscricao(formData)
      if (res?.error) {
        setErro(res.error)
      } else if (res?.success) {
        setResultado({
          codigo: res.codigo!,
          numeroInscricao: res.numeroInscricao!,
          nome: res.nome!,
          concurso: res.concurso!,
        })
      }
    })
  }

  // Formulário
  return (
    <div className="rounded-lg border border-border bg-card p-6 md:p-8">
      <h2 className="font-serif text-xl font-bold">Ficha de inscrição</h2>
      <p className="mt-1 text-sm text-muted-foreground">Preencha os dados abaixo para concluir sua inscrição.</p>

      <form action={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>Concurso</Label>
          <Select value={contestId} onValueChange={setContestId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o concurso">
                {concursos.find((c) => c.id === contestId)?.titulo}
              </SelectValue>
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
          <Label htmlFor="numero_inscricao">Número de inscrição</Label>
          <Input
            id="numero_inscricao"
            value={numeroPrevisto || "Gerando..."}
            readOnly
            aria-readonly="true"
            className="bg-muted/50 font-mono font-semibold text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">Gerado automaticamente. Confirmado ao concluir a inscrição.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="id_jogo">ID do jogo</Label>
            <Input id="id_jogo" name="id_jogo" placeholder="ex.: 42" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome_personagem">Nome do personagem</Label>
            <Input id="nome_personagem" name="nome_personagem" placeholder="ex.: Guerra Mórmon" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="idade">Idade</Label>
            <Input id="idade" name="idade" type="number" min={1} max={129} placeholder="ex.: 25" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de nascimento</Label>
            <Input id="data_nascimento" name="data_nascimento" type="date" />
          </div>
        </div>

        {erro ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {erro}
          </p>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => setAberto(false)}>
            Voltar
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Enviando..." : "Concluir inscrição"}
          </Button>
        </div>
      </form>
    </div>
  )
}
