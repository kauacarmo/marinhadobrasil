import { headers } from "next/headers"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DocumentosManager } from "@/components/admin/documentos-manager"
import { listDocumentos } from "@/app/admin/documentos/actions"

export const dynamic = "force-dynamic"

export default async function PortariasPage() {
  const documentos = await listDocumentos("portaria")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  const webhookUrl = host ? `${proto}://${host}/api/webhook/documentos` : "/api/webhook/documentos"

  return (
    <div className="flex flex-col">
      <AdminTopbar titulo="Portarias" descricao="Gestão e publicação de portarias" />
      <div className="p-6">
        <DocumentosManager tipo="portaria" documentos={documentos} webhookUrl={webhookUrl} />
      </div>
    </div>
  )
}
