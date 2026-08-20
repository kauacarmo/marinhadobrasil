import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh bg-muted/40">
      <div className="sticky top-0 hidden md:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
