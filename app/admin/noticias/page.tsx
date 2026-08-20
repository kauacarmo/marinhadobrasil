import { Plus, Pencil } from "lucide-react"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { noticias, formatarData } from "@/lib/data"

export default function AdminNoticiasPage() {
  return (
    <>
      <AdminTopbar
        titulo="Notícias e Comunicados"
        descricao="Gerencie as publicações exibidas no portal institucional."
      />

      <div className="space-y-5 p-6">
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4" />
            Nova publicação
          </Button>
        </div>

        <div className="space-y-3">
          {noticias.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{n.categoria}</Badge>
                    <span className="text-xs text-muted-foreground">{formatarData(n.data)}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground text-balance">
                    {n.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground text-pretty">{n.resumo}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
