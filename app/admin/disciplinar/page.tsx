import { redirect } from "next/navigation"

export default function DisciplinarPage() {
  redirect("/admin/documentos?tipo=disciplinar")
}
