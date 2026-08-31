"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { sair } from "@/app/login/actions"
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  Newspaper,
  Radio,
  ScrollText,
  BookText,
  Gavel,
  ClipboardList,
  Anchor,
  IdCard,
  Settings,
  CalendarClock,
  LogOut,
} from "lucide-react"
import { Brasao } from "@/components/brasao"
import { cn } from "@/lib/utils"
import { cargosRestritos } from "@/lib/cargos-marinha"

const navItems = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/concursos", label: "Concursos", icon: FileText },
  { href: "/admin/cursos", label: "Cursos", icon: GraduationCap },
  { href: "/admin/publicacoes", label: "Resultados e Editais", icon: ClipboardList },
  { href: "/admin/candidatos", label: "Candidatos", icon: Users },
  { href: "/admin/aquaviarios", label: "Documentos", icon: Anchor },
  { href: "/admin/aquaviarios/identidade-funcional", label: "Funcionais", icon: IdCard },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { href: "/admin/documentos", label: "Documentos Oficiais", icon: ScrollText },
  { href: "/admin/juridico", label: "Jurídico", icon: Gavel },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

// Guias visíveis para cargos com acesso restrito (ex.: Publicitário)
const guiasRestritas = ["/admin", "/admin/noticias"]

export function AdminSidebar({ papel = "" }: { papel?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const restrito = cargosRestritos.includes(papel)
  const itens = restrito ? navItems.filter((i) => guiasRestritas.includes(i.href)) : navItems

  async function handleSair() {
    await sair()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex h-dvh w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <Brasao className="h-9 w-9" />
        <div className="leading-tight">
          <p className="font-serif text-sm font-bold">CPSP</p>
          <p className="text-xs text-sidebar-foreground/70">Área Administrativa</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {itens.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : item.href === "/admin/aquaviarios" ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><Icon className="h-4.5 w-4.5" />{item.label}</Link>
        })}

      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleSair}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sair do painel
        </button>
      </div>
    </aside>
  )
}
