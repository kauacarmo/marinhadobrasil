import { headers } from "next/headers"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DocumentosManager } from "@/components/admin/documentos-manager"
import { listDocumentos } from "@/app/admin/documentos/actions"

export const dynamic = "force-dynamic"

export default async function DisciplinarPage() {
  const documentos = await listDocumentos("disciplinar")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  const webhookUrl = host ? `${proto}://${host}/api/webhook/documentos` : "/api/webhook/documentos"

  return (
    <div className="flex flex-col">
      <AdminTopbar titulo="Disciplinar" descricao="Gestão de documentos disciplinares" />
      <div className="p-6">
        <DocumentosManager tipo="disciplinar" documentos={documentos} webhookUrl={webhookUrl} />
      </div>
    </div>
  )
}
