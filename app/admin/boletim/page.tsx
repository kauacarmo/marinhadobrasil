import { headers } from "next/headers"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DocumentosManager } from "@/components/admin/documentos-manager"
import { listDocumentos } from "@/app/admin/documentos/actions"

export const dynamic = "force-dynamic"

export default async function BoletimPage() {
  const documentos = await listDocumentos("boletim")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? ""
  const proto = h.get("x-forwarded-proto") ?? "https"
  const webhookUrl = host ? `${proto}://${host}/api/webhook/documentos` : "/api/webhook/documentos"

  return (
    <div className="flex flex-col">
      <AdminTopbar titulo="Boletim Interno" descricao="Gestão e publicação de boletins internos" />
      <div className="p-6">
        <DocumentosManager tipo="boletim" documentos={documentos} webhookUrl={webhookUrl} />
      </div>
    </div>
  )
}
