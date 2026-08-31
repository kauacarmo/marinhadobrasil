import Link from "next/link"
import { Newspaper, Radio } from "lucide-react"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { NoticiasManager } from "@/components/admin/noticias-manager"
import { DiarioNavalManager } from "@/components/admin/diario-naval-manager"
import { contarWebhooksDiarioNaval } from "@/app/admin/diario-naval/actions"
import { listNoticias } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminNoticiasPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const noticias = await listNoticias()
  const aba = (await searchParams).aba === "diario" ? "diario" : "noticias"
  const temWebhook = await contarWebhooksDiarioNaval()

  return (
    <>
      <AdminTopbar
        titulo="Notícias e Comunicados"
        descricao="Publique notícias e comunicados no portal do site."
      />
      <div className="p-6">
        <div className="mb-6 flex gap-2 border-b border-border pb-3">
          <Link href="/admin/noticias" className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${aba === "noticias" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Newspaper className="size-4" /> Notícias</Link>
          <Link href="/admin/noticias?aba=diario" className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${aba === "diario" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><Radio className="size-4" /> Diário Naval</Link>
        </div>
        {aba === "diario" ? <DiarioNavalManager temWebhook={temWebhook > 0} /> : <NoticiasManager noticias={noticias} />}
      </div>
    </>
  )
}
