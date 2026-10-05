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
        descricao="Publique notícias e comunicados no portal do site."
      />
      <div className="p-6">
        <NoticiasManager noticias={noticias} />
      </div>
    </>
  )
}
