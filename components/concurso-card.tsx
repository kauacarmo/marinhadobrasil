import Link from "next/link"
import { Users, MapPin, Award, BookOpen, CalendarClock, Eye, Download } from "lucide-react"
import { type Concurso, formatarData } from "@/lib/data"
import { cn } from "@/lib/utils"

function LinhaInfo({
  icon: Icon,
  children,
}: {
  icon: typeof Users
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 text-foreground">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <dd className="leading-snug">{children}</dd>
    </div>
  )
}

export function ConcursoCard({ concurso }: { concurso: Concurso }) {
  const ativo = concurso.status !== "Encerrado"

  return (
    <article className="flex overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative w-[45%] shrink-0 self-stretch bg-primary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={concurso.imagem || "/concursos/naval-formatura.png"}
          alt={`Ilustração do concurso ${concurso.titulo}`}
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div className="flex w-[55%] flex-1 flex-col p-5">
        <span
          className={cn(
            "mb-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide",
            ativo ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {concurso.status}
        </span>

        <h3 className="font-serif text-xl font-bold leading-snug text-primary text-balance">
          {concurso.titulo}
        </h3>

        <dl className="mt-4 flex-1 space-y-2.5 text-sm">
          <LinhaInfo icon={Users}>
            <span className="sr-only">Vagas: </span>
            <strong className="font-semibold">{concurso.vagas}</strong> vagas
          </LinhaInfo>
          {concurso.dataProva && (
            <LinhaInfo icon={CalendarClock}>Data da prova: {formatarData(concurso.dataProva)}</LinhaInfo>
          )}
          {concurso.local && (
            <LinhaInfo icon={MapPin}>
              <span className="sr-only">Local: </span>
              {concurso.local}
            </LinhaInfo>
          )}
          {concurso.cargo && <LinhaInfo icon={Award}>Cargo após formado: {concurso.cargo}</LinhaInfo>}
          {concurso.temaProva && (
            <LinhaInfo icon={BookOpen}>Tema da prova: {concurso.temaProva}</LinhaInfo>
          )}
        </dl>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/concursos/${concurso.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/40 bg-card px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            <Eye className="size-4" aria-hidden="true" />
            Ver Detalhes
          </Link>
          <Link
            href={`/concursos/${concurso.id}#edital`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="size-4" aria-hidden="true" />
            Edital
          </Link>
        </div>
      </div>
    </article>
  )
}
