"use client"

import { useState, useTransition } from "react"
import type { AdminUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Pencil, Trash2, ShieldCheck } from "lucide-react"
import { criarUsuario, editarUsuario, apagarUsuario } from "@/app/admin/usuarios/actions"
import { cargosMarinha, todosOsCargos } from "@/lib/cargos-marinha"

const CARGO_PADRAO = "Operador"

export function UsuariosManager({ usuarios }: { usuarios: AdminUser[] }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const [openForm, setOpenForm] = useState(false)
  const [editando, setEditando] = useState<AdminUser | null>(null)

  const [confirmarApagar, setConfirmarApagar] = useState<AdminUser | null>(null)
  const [papel, setPapel] = useState<string>(CARGO_PADRAO)
  const [msg, setMsg] = useState<string | null>(null)

  function abrirNovo() {
    setEditando(null)
    setPapel(CARGO_PADRAO)
    setErro(null)
    setOpenForm(true)
  }

  function abrirEdicao(u: AdminUser) {
    setEditando(u)
    setPapel(todosOsCargos.includes(u.papel) ? u.papel : CARGO_PADRAO)
    setErro(null)
    setOpenForm(true)
  }

  function submitForm(formData: FormData) {
    setErro(null)
    formData.set("papel", papel)
    startTransition(async () => {
      const res = editando ? await editarUsuario(editando.id, formData) : await criarUsuario(formData)
      if (res?.error) {
        setErro(res.error)
      } else {
        setOpenForm(false)
        setMsg(editando ? "Usuário atualizado." : "Usuário criado.")
        setTimeout(() => setMsg(null), 3000)
      }
    })
  }

  function apagar(u: AdminUser) {
    startTransition(async () => {
      await apagarUsuario(u.id)
      setConfirmarApagar(null)
      setMsg("Usuário removido.")
      setTimeout(() => setMsg(null), 3000)
    })
  }

  return (
    <div className="space-y-6">
      {msg ? (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-foreground">
          {msg}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          {usuarios.length} usuário(s) cadastrado(s)
        </div>
        <Button onClick={abrirNovo}>
          <UserPlus className="size-4" /> Novo usuário
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Usuário</th>
              <th className="px-4 py-3 font-semibold">Posto / Cargo</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{u.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.usuario}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.papel === "Administrador" ? "default" : "secondary"}>{u.papel}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className={u.ativo ? "text-emerald-600" : "text-muted-foreground"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => abrirEdicao(u)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setConfirmarApagar(u)}
                      aria-label="Apagar"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Formulário criar/editar */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <form action={submitForm}>
            <DialogHeader>
              <DialogTitle className="font-serif">{editando ? "Editar usuário" : "Novo usuário"}</DialogTitle>
              <DialogDescription>
                {editando ? "Atualize os dados do usuário administrativo." : "Cadastre um novo usuário administrativo."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" name="nome" defaultValue={editando?.nome} placeholder="Nome do usuário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário (login)</Label>
                <Input id="usuario" name="usuario" defaultValue={editando?.usuario} placeholder="ex.: joao.silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha {editando ? "(deixe em branco para manter)" : ""}</Label>
                <Input id="senha" name="senha" type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posto / Cargo</Label>
                  <Select value={papel} onValueChange={(v) => setPapel(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue>{papel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {cargosMarinha.map((g) => (
                        <SelectGroup key={g.grupo}>
                          <SelectLabel>{g.grupo}</SelectLabel>
                          {g.cargos.map((cargo) => (
                            <SelectItem key={cargo} value={cargo}>
                              {cargo}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {editando ? (
                  <div className="flex items-end gap-2 pb-1">
                    <input
                      type="checkbox"
                      id="ativo"
                      name="ativo"
                      defaultChecked={editando.ativo}
                      className="size-4 accent-primary"
                    />
                    <Label htmlFor="ativo" className="cursor-pointer">
                      Usuário ativo
                    </Label>
                  </div>
                ) : null}
              </div>
              {erro ? <p className="text-sm text-destructive">{erro}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar apagar usuário */}
      <AlertDialog open={!!confirmarApagar} onOpenChange={(o) => !o && setConfirmarApagar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente o usuário <strong>{confirmarApagar?.nome}</strong>. Não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => confirmarApagar && apagar(confirmarApagar)}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
