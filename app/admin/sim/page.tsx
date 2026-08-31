import { SimManager } from "@/components/admin/sim-manager"
import { listarAgendamentos } from "@/app/sim/actions"

export const dynamic = "force-dynamic"

export default async function AdminSimPage() {
  const registros = await listarAgendamentos()
  return <SimManager registros={registros as never} />
}
