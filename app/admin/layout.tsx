import type React from "react"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  let papel = ""
  try {
    const sessao = cookieStore.get("cpsp_sessao")?.value
    if (sessao) papel = JSON.parse(sessao).papel ?? ""
  } catch {
    papel = ""
  }

  return (
    <div className="flex min-h-dvh bg-muted/40">
      <div className="sticky top-0 hidden h-dvh self-start md:block">
        <AdminSidebar papel={papel} />
      </div>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
