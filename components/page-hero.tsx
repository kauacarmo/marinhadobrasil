import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function PageHero({
  titulo,
  descricao,
  migalhas,
}: {
  titulo: string
  descricao?: string
  migalhas: { label: string; href?: string }[]
}) {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <nav aria-label="Trilha de navegação" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-primary-foreground/70">
            {migalhas.map((m, i) => (
              <li key={m.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="size-3.5" />}
                {m.href ? (
                  <Link href={m.href} className="hover:text-accent">
                    {m.label}
                  </Link>
                ) : (
                  <span className="text-primary-foreground">{m.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="font-serif text-3xl font-bold text-balance md:text-4xl">{titulo}</h1>
        {descricao && (
          <p className="mt-2 max-w-2xl leading-relaxed text-primary-foreground/80">{descricao}</p>
        )}
      </div>
    </section>
  )
}
