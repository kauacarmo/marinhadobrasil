import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Badge } from "@/components/ui/badge"
import { noticias as noticiasEstaticas, formatarData } from "@/lib/data"
import { listNoticias } from "@/app/admin/noticias/actions"

export const metadata = {
  title: "Notícias | Capitania dos Portos de São Paulo",
  description: "Comunicados, editais e novidades dos concursos da Marinha do Brasil.",
}

export const dynamic = "force-dynamic"

export default async function NoticiasPage() {
  const publicadas = await listNoticias()
  // Somente as notícias destinadas ao portal do site
  const doPortal = publicadas
    .filter((n) => n.destino === "portal" || n.destino === "ambos")
    .map((n) => ({ id: n.id, titulo: n.titulo, resumo: n.resumo, data: n.data.split("T")[0], categoria: n.categoria }))

  // Usa as publicações do portal; se não houver nenhuma, exibe o conteúdo de exemplo
  const noticias = doPortal.length > 0 ? doPortal : noticiasEstaticas
  const [destaque, ...demais] = noticias

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Notícias e Comunicados"
          descricao="Acompanhe as publicações oficiais sobre editais, provas, resultados e a vida da instituição."
          migalhas={[{ label: "Início", href: "/" }, { label: "Notícias" }]}
        />

        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Destaque */}
          {destaque && (
            <article className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="grid md:grid-cols-2">
                <div className="flex flex-col justify-center gap-3 bg-primary p-8 text-primary-foreground">
                  <Badge className="w-fit bg-accent text-accent-foreground hover:bg-accent">
                    {destaque.categoria}
                  </Badge>
                  <h2 className="font-serif text-2xl font-bold leading-snug text-balance">
                    {destaque.titulo}
                  </h2>
                  <p className="leading-relaxed text-primary-foreground/80">{destaque.resumo}</p>
                  <span className="text-sm text-primary-foreground/60">
                    {formatarData(destaque.data)}
                  </span>
                </div>
                <div className="flex items-center justify-center bg-secondary p-8">
                  <p className="text-center font-serif text-lg text-primary/70 text-pretty">
                    Publicação oficial da Diretoria de Ensino da Marinha do Brasil
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* Demais notícias */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {demais.map((noticia) => (
              <article
                key={noticia.id}
                className="flex flex-col rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{noticia.categoria}</Badge>
                  <span className="text-xs text-muted-foreground">{formatarData(noticia.data)}</span>
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-primary text-pretty">
                  {noticia.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {noticia.resumo}
                </p>
              </article>
            ))}
          </div>

          {/* CTA cadastro do cidadão */}
          <section className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-border bg-secondary/60 p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Mail className="size-6" />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-primary">
                  Receba as notícias por e-mail
                </h2>
                <p className="mt-1 max-w-xl leading-relaxed text-muted-foreground">
                  Cadastre-se e seja o primeiro a saber sobre novos editais, cronogramas e
                  resultados dos concursos da Marinha do Brasil.
                </p>
              </div>
            </div>
            <Link
              href="/cadastro"
              className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-accent px-5 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Cadastrar
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
