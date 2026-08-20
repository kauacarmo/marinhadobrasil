import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { InscricaoForm } from "@/components/inscricao-form"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Contest } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Inscrição | Capitania dos Portos de São Paulo",
}

export default async function InscricaoPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("contests")
    .select("*")
    .eq("status", "inscricoes_abertas")
    .order("created_at", { ascending: true })

  const abertos = (data ?? []) as Contest[]

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Inscrição em Concursos"
          descricao="Realize sua inscrição nos concursos com inscrições abertas. Ao concluir, você receberá um código de acesso à prova."
          migalhas={[{ label: "Início", href: "/" }, { label: "Inscrição" }]}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <InscricaoForm concursos={abertos} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
