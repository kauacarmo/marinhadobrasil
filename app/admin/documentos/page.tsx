import { headers } from "next/headers"
import Link from "next/link"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DocumentosManager } from "@/components/admin/documentos-manager"
import { listDocumentos } from "@/app/admin/documentos/actions"
import { listarAgendamentosSIM } from "@/app/admin/sim/actions"
import { SimAgendamentosAdmin } from "@/components/admin/sim-agendamentos-admin"
import type { TipoDocumento } from "@/lib/types"

export const dynamic = "force-dynamic"

const tipos: TipoDocumento[] = ["portaria", "boletim", "disciplinar"]
const labels: Record<TipoDocumento, string> = { portaria: "Portarias", boletim: "Boletim Interno", disciplinar: "Disciplinar" }

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ tipo?: string; aba?: string }> }) {
  const params = await searchParams
  const abaSim = params.aba === "sim"
  const tipo: TipoDocumento = tipos.includes(params.tipo as TipoDocumento) ? params.tipo as TipoDocumento : "portaria"
  const [documentos, agendamentos] = await Promise.all([listDocumentos(tipo), abaSim ? listarAgendamentosSIM() : Promise.resolve([])])
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  const webhookUrl = host ? `${proto}://${host}/api/webhook/documentos` : "/api/webhook/documentos"

  return <div className="flex flex-col">
    <AdminTopbar titulo="Documentos Oficiais" descricao="Portarias, boletins internos, documentos disciplinares e agendamentos SIM" />
    <div className="flex flex-wrap gap-2 border-b border-border px-6 pt-5">
      {tipos.map((item) => <Link key={item} href={`/admin/documentos?tipo=${item}`} className={`rounded-t-md px-4 py-2 text-sm font-medium ${!abaSim && tipo === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{labels[item]}</Link>)}
      <Link href="/admin/documentos?aba=sim" className={`rounded-t-md px-4 py-2 text-sm font-medium ${abaSim ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Agendamentos SIM</Link>
    </div>
    <div className="p-6">{abaSim ? <SimAgendamentosAdmin agendamentos={agendamentos} /> : <DocumentosManager tipo={tipo} documentos={documentos} webhookUrl={webhookUrl} />}</div>
  </div>
}
