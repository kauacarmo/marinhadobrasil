import type { Metadata } from "next"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SimAgendamentoForm } from "@/components/sim-agendamento-form"

export const metadata: Metadata = { title: "Serviço de Identificação da Marinha (SIM) | Marinha do Brasil", description: "Solicite seu agendamento no Serviço de Identificação da Marinha." }

export default function SimPage() {
  return <div className="flex min-h-screen flex-col bg-background"><SiteHeader /><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14"><div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start"><aside className="rounded-2xl border border-border bg-card p-6 text-center"><Image src="/sim-brasao.png" alt="Brasão da Marinha do Brasil" width={150} height={180} className="mx-auto object-contain" /><h1 className="mt-5 font-serif text-2xl font-bold text-foreground">Serviço de Identificação da Marinha</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">SIM</p></aside><section><div className="flex items-center gap-3"><span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-semibold uppercase tracking-widest text-accent">Atendimento</p><h2 className="font-serif text-3xl font-bold text-foreground">Agende seu atendimento</h2></div></div><p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">Preencha os dados abaixo para solicitar um horário no Serviço de Identificação da Marinha. A confirmação será realizada pela equipe responsável.</p><div className="mt-8"><SimAgendamentoForm /></div></section></div></main><SiteFooter /></div>
}
