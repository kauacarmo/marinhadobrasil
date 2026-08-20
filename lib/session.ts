import { cookies } from "next/headers"

export type Sessao = {
  id: string
  nome: string
  papel: string
}

export async function getSessao(): Promise<Sessao | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get("cpsp_sessao")?.value
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as Sessao
    if (!s?.nome) return null
    return s
  } catch {
    return null
  }
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}
