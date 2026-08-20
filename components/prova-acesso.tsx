"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { KeyRound, Lock, Loader2, Award, ArrowRight, Clock } from "lucide-react"
import { acessarProva, enviarRespostas, type QuestaoPublica } from "@/app/prova/actions"

type ProvaAtiva = {
  candidato: string
  concurso: string
  examId: string
  codigo: string
  duracaoMinutos: number
  questoes: QuestaoPublica[]
}

type Resultado = {
  acertos: number
  total: number
  gabarito: { correta: number; marcada: number; certo: boolean }[]
}

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function ProvaAcesso() {
  const [codigo, setCodigo] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [prova, setProva] = useState<ProvaAtiva | null>(null)
  const [respostas, setRespostas] = useState<number[]>([])
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [restante, setRestante] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  // Refs para o envio automático quando o tempo esgotar (evita closures antigas)
  const enviarRef = useRef<(forcado?: boolean) => void>(() => {})

  function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    startTransition(async () => {
      const res = await acessarProva(codigo)
      if (!res.ok) {
        setErro(res.error)
      } else {
        setProva({
          candidato: res.candidato,
          concurso: res.concurso,
          examId: res.examId,
          codigo: res.codigo,
          duracaoMinutos: res.duracaoMinutos,
          questoes: res.questoes,
        })
        setRespostas(new Array(res.questoes.length).fill(-1))
        setRestante(res.duracaoMinutos * 60)
      }
    })
  }

  function marcar(qi: number, alt: number) {
    setRespostas((prev) => {
      const novo = [...prev]
      novo[qi] = alt
      return novo
    })
  }

  function enviar(forcado = false) {
    if (!prova) return
    setErro(null)
    if (!forcado && respostas.some((r) => r === -1)) {
      setErro("Responda todas as questões antes de enviar.")
      return
    }
    startTransition(async () => {
      const res = await enviarRespostas(prova.examId, respostas, prova.codigo)
      if (res?.error) setErro(res.error)
      else setResultado({ acertos: res.acertos!, total: res.total!, gabarito: res.gabarito! })
    })
  }

  // Mantém a ref de envio sempre atualizada com as respostas mais recentes
  enviarRef.current = enviar

  // Cronômetro: conta regressivamente e envia automaticamente ao zerar
  useEffect(() => {
    if (prova === null || resultado !== null || restante === null) return
    if (restante <= 0) {
      enviarRef.current(true)
      return
    }
    const timer = setTimeout(() => setRestante((r) => (r === null ? r : r - 1)), 1000)
    return () => clearTimeout(timer)
  }, [prova, resultado, restante])

  // RESULTADO
  if (resultado && prova) {
    const percentual = Math.round((resultado.acertos / resultado.total) * 100)
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15">
          <Award className="size-7 text-accent" />
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold">Prova concluída</h2>
        <p className="mt-1 text-muted-foreground">{prova.candidato}</p>
        <p className="mt-6 font-serif text-5xl font-bold text-primary">
          {resultado.acertos}
          <span className="text-2xl text-muted-foreground">/{resultado.total}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{percentual}% de aproveitamento</p>

        <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
          {resultado.gabarito.map((g, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                g.certo ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              <span>Questão {i + 1}</span>
              <span className="font-medium">{g.certo ? "Correta" : "Incorreta"}</span>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // PROVA EM ANDAMENTO
  if (prova) {
    const respondidas = respostas.filter((r) => r !== -1).length
    const tempoCritico = restante !== null && restante <= 60
    return (
      <div className="space-y-5">
        {/* Cabeçalho fixo com candidato e cronômetro */}
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidato</p>
            <p className="font-serif text-lg font-bold leading-tight">{prova.candidato}</p>
            <p className="text-sm text-muted-foreground">{prova.concurso}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondidas</p>
              <p className="font-mono text-sm font-bold text-foreground">
                {respondidas}/{prova.questoes.length}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-lg font-bold tabular-nums ${
                tempoCritico
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-primary/30 bg-primary/5 text-primary"
              }`}
              aria-live="polite"
            >
              <Clock className="size-5" />
              {restante !== null ? formatarTempo(restante) : "--:--"}
            </div>
          </div>
        </div>

        {prova.questoes.map((q, qi) => (
          <Card key={qi} className="p-5">
            <p className="font-medium text-foreground">
              {qi + 1}. {q.enunciado}
            </p>
            <div className="mt-3 space-y-2">
              {q.alternativas.map((alt, ai) => {
                const selecionada = respostas[qi] === ai
                return (
                  <button
                    key={ai}
                    type="button"
                    onClick={() => marcar(qi, ai)}
                    className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                      selecionada
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        selecionada ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {String.fromCharCode(65 + ai)}
                    </span>
                    {alt}
                  </button>
                )
              })}
            </div>
          </Card>
        ))}

        {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

        <Button size="lg" className="w-full" onClick={() => enviar(false)} disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Enviar respostas
        </Button>
      </div>
    )
  }

  // ENTRADA DE CÓDIGO
  return (
    <Card className="p-8">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
        <KeyRound className="size-7 text-primary" />
      </div>
      <h2 className="mt-4 text-center font-serif text-2xl font-bold">Acessar prova</h2>
      <p className="mx-auto mt-1 max-w-md text-center text-muted-foreground text-pretty">
        Digite o código de acesso que você recebeu ao concluir a inscrição.
      </p>

      <form onSubmit={entrar} className="mx-auto mt-6 max-w-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código de acesso</Label>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            className="text-center font-mono text-lg tracking-widest"
            autoComplete="off"
          />
        </div>
        {erro ? (
          <p className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <Lock className="size-4 shrink-0" /> {erro}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Acessar prova <ArrowRight className="size-4" />
        </Button>
      </form>
    </Card>
  )
}
