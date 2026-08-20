"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { AdminUser } from "@/lib/types"

export async function listUsuarios(): Promise<AdminUser[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return data as AdminUser[]
}

export async function criarUsuario(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim()
  const usuario = String(formData.get("usuario") || "").trim().toLowerCase()
  const senha = String(formData.get("senha") || "").trim()
  const papel = String(formData.get("papel") || "Operador")

  if (!nome || !usuario || !senha) {
    return { error: "Preencha nome, usuário e senha." }
  }
  if (senha.length < 4) {
    return { error: "A senha deve ter ao menos 4 caracteres." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("admin_users").insert({ nome, usuario, senha, papel })
  if (error) {
    if (error.code === "23505") return { error: "Já existe um usuário com esse login." }
    return { error: error.message }
  }
  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function editarUsuario(id: string, formData: FormData) {
  const nome = String(formData.get("nome") || "").trim()
  const usuario = String(formData.get("usuario") || "").trim().toLowerCase()
  const senha = String(formData.get("senha") || "").trim()
  const papel = String(formData.get("papel") || "Operador")
  const ativo = formData.get("ativo") === "on"

  if (!nome || !usuario) {
    return { error: "Preencha nome e usuário." }
  }

  const update: Record<string, unknown> = { nome, usuario, papel, ativo }
  if (senha) {
    if (senha.length < 4) return { error: "A senha deve ter ao menos 4 caracteres." }
    update.senha = senha
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("admin_users").update(update).eq("id", id)
  if (error) {
    if (error.code === "23505") return { error: "Já existe um usuário com esse login." }
    return { error: error.message }
  }
  revalidatePath("/admin/usuarios")
  return { success: true }
}

export async function apagarUsuario(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("admin_users").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/usuarios")
  return { success: true }
}
