"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gamepad2, User, Lock, LoaderCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { criarConta, entrar } from "@/app/area-candidato/actions"

type Aba = "entrar" | "criar"

export function CandidatoAuthForm() {
  const router = useRouter()
  const [aba, setAba] = useState<Aba>("entrar")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    const fd = new FormData(e.currentTarget)
    const res = aba === "entrar" ? await entrar(null, fd) : await criarConta(null, fd)
    if (res?.success) {
      router.refresh()
    } else {
      setErro(res?.error || "Não foi possível concluir.")
      setCarregando(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["entrar", "criar"] as Aba[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setAba(a)
              setErro("")
            }}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              aba === a ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {a === "entrar" ? "Entrar" : "Criar acesso"}
          </button>
        ))}
      </div>

      <form onSubmit={handle} className="flex flex-col gap-4">
        {erro && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="id_jogo">ID do jogo</Label>
          <div className="relative">
            <Gamepad2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="id_jogo" name="id_jogo" placeholder="ex.: 42" className="pl-9" required />
          </div>
        </div>

        {aba === "criar" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="nome" name="nome" placeholder="Seu nome" className="pl-9" required />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="senha">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="senha"
              name="senha"
              type="password"
              placeholder="Sua senha"
              className="pl-9"
              required
              autoComplete={aba === "entrar" ? "current-password" : "new-password"}
            />
          </div>
        </div>

        {aba === "criar" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmar"
                name="confirmar"
                type="password"
                placeholder="Repita a senha"
                className="pl-9"
                required
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={carregando} className="mt-1 w-full">
          {carregando ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              {aba === "entrar" ? "Entrando..." : "Criando..."}
            </>
          ) : aba === "entrar" ? (
            "Entrar"
          ) : (
            "Criar acesso"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Use o mesmo <strong className="text-foreground">ID do jogo</strong> informado nas suas inscrições para
        visualizar seus concursos.
      </p>
    </div>
  )
}
