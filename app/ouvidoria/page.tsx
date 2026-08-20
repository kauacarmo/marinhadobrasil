import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { OuvidoriaForm } from "@/components/ouvidoria-form"
import { MessageSquare, Phone, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Ouvidoria | Marinha do Brasil",
  description: "Canal de comunicação para elogios, dúvidas, reclamações, sugestões e denúncias.",
}

const CANAIS = [
  { icon: Phone, titulo: "Telefone", info: "0800 000 0000" },
  { icon: Mail, titulo: "E-mail", info: "ouvidoria@marinha.exemplo.com" },
  { icon: Clock, titulo: "Atendimento", info: "Seg. a sex., 8h às 17h" },
]

export default function OuvidoriaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <PageHero
        titulo="Ouvidoria"
        descricao="Sua manifestação nos ajuda a melhorar o atendimento e os serviços prestados ao cidadão."
        migalhas={[
          { label: "Início", href: "/" },
          { label: "Ouvidoria" },
        ]}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="form-titulo">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-accent" />
              <h2 id="form-titulo" className="font-serif text-xl font-bold text-foreground">
                Registrar manifestação
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Preencha o formulário abaixo. Ao final, você receberá um número de protocolo para
              acompanhamento.
            </p>
            <div className="mt-6">
              <OuvidoriaForm />
            </div>
          </section>

          <aside className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-foreground">Outros canais</h2>
            {CANAIS.map((c) => (
              <div key={c.titulo} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent/15 text-accent">
                  <c.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.titulo}</p>
                  <p className="text-sm text-muted-foreground">{c.info}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
