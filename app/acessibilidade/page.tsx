import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { Keyboard, Eye, Type, Contrast, Volume2, MousePointer2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Acessibilidade | Capitania dos Portos de São Paulo",
  description:
    "Recursos de acessibilidade e compromisso do portal com a navegação inclusiva para todos os cidadãos.",
}

const recursos = [
  { icon: Keyboard, titulo: "Navegação por teclado", texto: "Todo o portal pode ser navegado com a tecla Tab e acionado com Enter ou Espaço." },
  { icon: Contrast, titulo: "Alto contraste", texto: "Cores escolhidas para garantir contraste adequado entre texto e fundo (WCAG AA)." },
  { icon: Type, titulo: "Texto redimensionável", texto: "Use Ctrl + (mais) ou Ctrl - (menos) para ajustar o tamanho do texto sem perda de conteúdo." },
  { icon: Eye, titulo: "Leitores de tela", texto: "Estrutura semântica com marcos, títulos e textos alternativos para tecnologias assistivas." },
  { icon: Volume2, titulo: "Conteúdo descritivo", texto: "Imagens informativas possuem descrição textual e ícones acompanham rótulos." },
  { icon: MousePointer2, titulo: "Áreas de clique amplas", texto: "Botões e links dimensionados para facilitar o toque e o clique." },
]

const atalhos = [
  { tecla: "Tab", acao: "Avança para o próximo elemento interativo" },
  { tecla: "Shift + Tab", acao: "Volta ao elemento anterior" },
  { tecla: "Enter / Espaço", acao: "Aciona links e botões" },
  { tecla: "Ctrl + / Ctrl -", acao: "Aumenta ou reduz o zoom da página" },
]

export default function AcessibilidadePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <PageHero
          titulo="Acessibilidade"
          descricao="Trabalhamos para que o portal seja acessível a todas as pessoas, independentemente de suas necessidades."
          migalhas={[{ label: "Início", href: "/" }, { label: "Acessibilidade" }]}
        />

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="font-serif text-2xl font-bold text-primary">Recursos disponíveis</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.titulo} className="rounded-lg border border-border bg-card p-5">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold text-primary">{r.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{r.texto}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-primary">Atalhos de teclado</h2>
            <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {atalhos.map((a) => (
                <li key={a.tecla} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <kbd className="rounded-sm border border-border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                    {a.tecla}
                  </kbd>
                  <span className="text-right text-muted-foreground">{a.acao}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground text-pretty">
              Encontrou alguma barreira de acessibilidade? Entre em contato com a nossa Ouvidoria para que
              possamos corrigir e melhorar continuamente a experiência.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
