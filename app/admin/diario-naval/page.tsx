import { redirect } from "next/navigation"

export default function AdminDiarioNavalPage() {
  redirect("/admin/noticias?aba=diario")
}
