import { FileDown, CalendarDays, FileText, Trophy } from "lucide-react"
import type { Publicacao, TipoPublicacao } from "@/lib/types"

function formatData(iso: string | null) {
  if (!iso) return null
  const [ano, mes, dia] = iso.split("-")
  if (!ano || !mes || !dia) return null
  return `${dia}/${mes}/${ano}`
}

const ICONE: Record<TipoPublicacao, typeof FileText> = {
  resultado: Trophy,
  edital: FileText,
  cronograma: CalendarDays,
}

const VAZIO: Record<TipoPublicacao, string> = {
  resultado: "Nenhum resultado publicado no momento. Acompanhe esta página para atualizações.",
  edital: "Nenhum edital disponível no momento. Novos editais serão publicados aqui.",
  cronograma: "Nenhum cronograma divulgado no momento.",
}

export function PublicacoesListagem({
  itens,
  tipo,
}: {
  itens: Publicacao[]
  tipo: TipoPublicacao
}) {
  if (itens.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground text-pretty">{VAZIO[tipo]}</p>
      </div>
    )
  }

  if (tipo === "cronograma") {
    return (
      <ol className="relative space-y-6 border-l-2 border-border pl-6">
        {itens.map((item) => {
          const data = formatData(item.data_evento)
          return (
            <li key={item.id} className="relative">
              <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                <CalendarDays className="size-3 text-primary-foreground" />
              </span>
              <div className="rounded-lg border border-border bg-card p-5">
                {data && (
                  <p className="mb-1 text-sm font-bold text-accent-foreground">
                    <span className="rounded bg-accent px-2 py-0.5">{data}</span>
                  </p>
                )}
                <h3 className="font-serif text-lg font-bold text-primary text-balance">{item.titulo}</h3>
                {item.concurso_titulo && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.concurso_titulo}</p>
                )}
                {item.descricao && <p className="mt-2 text-sm text-foreground text-pretty">{item.descricao}</p>}
                {item.pdf_url && (
                  <a
                    href={item.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileDown className="size-4" /> Baixar documento
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  const Icone = ICONE[tipo]
  return (
    <ul className="space-y-4">
      {itens.map((item) => {
        const data = formatData(item.data_evento)
        return (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icone className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-primary text-balance">{item.titulo}</h3>
                {item.concurso_titulo && (
                  <p className="text-sm text-muted-foreground">{item.concurso_titulo}</p>
                )}
                {item.descricao && <p className="mt-1 text-sm text-foreground text-pretty">{item.descricao}</p>}
                {data && <p className="mt-1 text-xs text-muted-foreground">Publicado em {data}</p>}
              </div>
            </div>
            {item.pdf_url && (
              <a
                href={item.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <FileDown className="size-4" /> Baixar
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}
