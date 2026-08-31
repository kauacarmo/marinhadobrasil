import { redirect } from "next/navigation"

export default function AdminSimPage() {
  redirect("/admin/documentos?aba=sim")
}

