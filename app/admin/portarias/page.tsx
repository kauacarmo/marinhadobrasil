import { redirect } from "next/navigation"

export default function PortariasPage() {
  redirect("/admin/documentos?tipo=portaria")
}
