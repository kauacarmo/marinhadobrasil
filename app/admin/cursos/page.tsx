import { AdminTopbar } from "@/components/admin/admin-topbar"
import { CursosManager } from "@/components/admin/cursos-manager"
import { getSessao } from "@/lib/session"
import { ehAlmirantado } from "@/lib/cargos-marinha"
import { listCursos, listInstrutores } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminCursosPage() {
  const [cursos, instrutores, sessao] = await Promise.all([listCursos(), listInstrutores(), getSessao()])
  const podeGerenciarInstrutores = ehAlmirantado(sessao?.papel)

  return (
    <>
      <AdminTopbar
        titulo="Cursos da Marinha"
        descricao="Cadastre cursos e acompanhe as inscrições dos candidatos."
      />
      <div className="p-6">
        <CursosManager
          cursos={cursos}
          instrutores={instrutores}
          podeGerenciarInstrutores={podeGerenciarInstrutores}
        />
      </div>
    </>
  )
}
