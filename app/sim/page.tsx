import type { Metadata } from "next"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SimAgendamentoForm } from "@/components/sim-agendamento-form"
import { SimAcompanhamento } from "@/components/sim-acompanhamento"

export const metadata: Metadata = { title: "Serviço de Identificação da Marinha (SIM) | Marinha do Brasil", description: "Solicite seu agendamento no Serviço de Identificação da Marinha." }

export default function SimPage() {
  return <div className="flex min-h-screen flex-col bg-background"><SiteHeader /><main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-8 px-4 py-10 sm:py-14"><header className="flex flex-col items-center text-center"><Image src="/sim-brasao.png" alt="Brasão da Marinha do Brasil" width={150} height={180} className="object-contain" /><h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Serviço de Identificação da Marinha</h1><p className="mt-2 text-sm font-semibold uppercase tracking-widest text-accent">SIM</p></header><section className="w-full"><div className="flex items-center gap-3"><span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-semibold uppercase tracking-widest text-accent">Atendimento</p><h2 className="font-serif text-3xl font-bold text-foreground">Agende seu atendimento</h2></div></div><p className="mt-4 leading-relaxed text-muted-foreground">Preencha os dados abaixo para solicitar um horário no Serviço de Identificação da Marinha. A confirmação será realizada pela equipe responsável.</p><div className="mt-8"><SimAgendamentoForm /></div></section><div className="w-full"><SimAcompanhamento /></div></main><SiteFooter /></div>
}
