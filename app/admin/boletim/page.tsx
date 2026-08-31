import { redirect } from "next/navigation"

export default function BoletimPage() {
  redirect("/admin/documentos?tipo=boletim")
}
