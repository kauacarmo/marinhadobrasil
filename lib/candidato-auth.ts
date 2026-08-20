import "server-only"
import { cookies } from "next/headers"
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"

const COOKIE = "candidato_sessao"
const SEGREDO = process.env.SUPABASE_JWT_SECRET || "cpsp-candidato-fallback-secret"

export type CandidatoConta = {
  id: string
  id_jogo: string
  nome: string
}

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex")
  const derivada = scryptSync(senha, salt, 64).toString("hex")
  return `${salt}:${derivada}`
}

export function verificarSenha(senha: string, hash: string): boolean {
  const [salt, chave] = hash.split(":")
  if (!salt || !chave) return false
  const derivada = scryptSync(senha, salt, 64)
  const original = Buffer.from(chave, "hex")
  return original.length === derivada.length && timingSafeEqual(original, derivada)
}

function assinar(valor: string): string {
  const assinatura = createHmac("sha256", SEGREDO).update(valor).digest("hex")
  return `${valor}.${assinatura}`
}

function verificarToken(token: string): string | null {
  const idx = token.lastIndexOf(".")
  if (idx < 0) return null
  const valor = token.slice(0, idx)
  const assinatura = token.slice(idx + 1)
  const esperada = createHmac("sha256", SEGREDO).update(valor).digest("hex")
  const a = Buffer.from(assinatura)
  const b = Buffer.from(esperada)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return valor
}

export async function criarSessaoCandidato(contaId: string) {
  const jar = await cookies()
  jar.set(COOKIE, assinar(contaId), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function encerrarSessaoCandidato() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function getCandidatoAtual(): Promise<CandidatoConta | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  const contaId = verificarToken(token)
  if (!contaId) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("candidatos_conta")
    .select("id, id_jogo, nome")
    .eq("id", contaId)
    .single()
  return (data as CandidatoConta) ?? null
}
