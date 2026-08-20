"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { ConcursoCard } from "@/components/concurso-card"
import { Input } from "@/components/ui/input"
import { type Concurso, type StatusConcurso } from "@/lib/data"
import { cn } from "@/lib/utils"

const filtros: (StatusConcurso | "Todos")[] = [
  "Todos",
  "Inscrições Abertas",
  "Provas Abertas",
  "Em Análise",
  "Previsto",
  "Encerrado",
]

export function ConcursosListagem({ concursos }: { concursos: Concurso[] }) {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos")
  const [busca, setBusca] = useState("")

  const resultado = useMemo(() => {
    return concursos.filter((c) => {
      const porStatus = filtro === "Todos" || c.status === filtro
      const porBusca =
        busca.trim() === "" ||
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        c.sigla.toLowerCase().includes(busca.toLowerCase())
      return porStatus && porBusca
    })
  }, [concursos, filtro, busca])

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filtro === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar concurso..."
            className="pl-9"
            aria-label="Buscar concurso"
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {resultado.length} {resultado.length === 1 ? "concurso encontrado" : "concursos encontrados"}
      </p>

      {resultado.length > 0 ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {resultado.map((c) => (
            <ConcursoCard key={c.id} concurso={c} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Nenhum concurso encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  )
}
