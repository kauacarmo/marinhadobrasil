import { AdminTopbar } from "@/components/admin/admin-topbar"
import { NoticiasManager } from "@/components/admin/noticias-manager"
import { listNoticias } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminNoticiasPage() {
  const noticias = await listNoticias()

  return (
    <>
      <AdminTopbar
        titulo="Notícias e Comunicados"
        descricao="Publique no portal do site, no canal Diário Naval ou em ambos."
      />
      <div className="p-6">
        <NoticiasManager noticias={noticias} />
      </div>
    </>
  )
}
