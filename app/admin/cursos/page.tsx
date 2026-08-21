import { AdminTopbar } from "@/components/admin/admin-topbar"
import { CursosManager } from "@/components/admin/cursos-manager"
import { listCursos } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminCursosPage() {
  const cursos = await listCursos()

  return (
    <>
      <AdminTopbar
        titulo="Cursos da Marinha"
        descricao="Cadastre cursos e acompanhe as inscrições dos candidatos."
      />
      <div className="p-6">
        <CursosManager cursos={cursos} />
      </div>
    </>
  )
}
