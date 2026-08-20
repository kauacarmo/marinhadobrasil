"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function autenticar(usuario: string, senha: string) {
  const login = usuario.trim().toLowerCase()
  const pass = senha.trim()

  if (!login || !pass) {
    return { error: "Informe usuário e senha." }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, nome, usuario, senha, papel, ativo")
    .eq("usuario", login)
    .maybeSingle()

  if (error) {
    return { error: "Falha ao validar credenciais. Tente novamente." }
  }
  if (!data || data.senha !== pass) {
    return { error: "Usuário ou senha inválidos. Verifique suas credenciais." }
  }
  if (!data.ativo) {
    return { error: "Este usuário está inativo. Contate a Administração do Sistema." }
  }

  const cookieStore = await cookies()
  cookieStore.set(
    "cpsp_sessao",
    JSON.stringify({ id: data.id, nome: data.nome, papel: data.papel }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    },
  )

  return { success: true, nome: data.nome }
}

export async function sair() {
  const cookieStore = await cookies()
  cookieStore.delete("cpsp_sessao")
}
