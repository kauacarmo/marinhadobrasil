import { getSessao, iniciais } from "@/lib/session"

export async function AdminTopbar({
  titulo,
  descricao,
}: {
  titulo: string
  descricao: string
}) {
  const sessao = await getSessao()
  const nome = sessao?.nome ?? "Visitante"
  const cargo = sessao?.papel ?? "Não autenticado"

  return (
    <header className="border-b border-border bg-card px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground text-balance">
            {titulo}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{descricao}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">{nome}</p>
            <p className="text-xs text-muted-foreground">{cargo}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif text-sm font-bold text-primary-foreground">
            {iniciais(nome)}
          </div>
        </div>
      </div>
    </header>
  )
}
