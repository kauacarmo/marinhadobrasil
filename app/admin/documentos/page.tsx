import { headers } from "next/headers"
import Link from "next/link"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DocumentosManager } from "@/components/admin/documentos-manager"
import { listDocumentos } from "@/app/admin/documentos/actions"
import type { TipoDocumento } from "@/lib/types"

export const dynamic = "force-dynamic"

const tipos: TipoDocumento[] = ["portaria", "boletim", "disciplinar"]
const labels: Record<TipoDocumento, string> = { portaria: "Portarias", boletim: "Boletim Interno", disciplinar: "Disciplinar" }

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const params = await searchParams
  const tipo: TipoDocumento = tipos.includes(params.tipo as TipoDocumento) ? params.tipo as TipoDocumento : "portaria"
  const documentos = await listDocumentos(tipo)
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  const webhookUrl = host ? `${proto}://${host}/api/webhook/documentos` : "/api/webhook/documentos"

  return <div className="flex flex-col">
    <AdminTopbar titulo="Documentos Oficiais" descricao="Portarias, boletins internos e documentos disciplinares" />
    <div className="flex flex-wrap gap-2 border-b border-border px-6 pt-5">
      {tipos.map((item) => <Link key={item} href={`/admin/documentos?tipo=${item}`} className={`rounded-t-md px-4 py-2 text-sm font-medium ${tipo === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{labels[item]}</Link>)}
    </div>
    <div className="p-6"><DocumentosManager tipo={tipo} documentos={documentos} webhookUrl={webhookUrl} /></div>
  </div>
}
