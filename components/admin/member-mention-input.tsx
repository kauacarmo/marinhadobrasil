"use client"

import { useMemo, useState } from "react"
import { UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { AdminUser } from "@/lib/types"

type Props = { value: string; onChange: (value: string) => void; users: Pick<AdminUser, "id" | "nome" | "usuario">[]; placeholder?: string }

export function MemberMentionInput({ value, onChange, users, placeholder = "Digite @ para procurar um membro" }: Props) {
  const [foco, setFoco] = useState(false)
  const termo = value.match(/@([^@\s]*)$/)?.[1]?.toLowerCase() ?? ""
  const sugestoes = useMemo(() => users.filter((user) => user.nome.toLowerCase().includes(termo) || user.usuario.toLowerCase().includes(termo)).slice(0, 6), [users, termo])
  const aberto = foco && value.includes("@") && sugestoes.length > 0

  return <div className="relative">
    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input value={value} onChange={(event) => onChange(event.target.value)} onFocus={() => setFoco(true)} onBlur={() => setTimeout(() => setFoco(false), 150)} placeholder={placeholder} className="pl-9" aria-autocomplete="list" />
    {aberto ? <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg" role="listbox">
      {sugestoes.map((user) => <button key={user.id} type="button" role="option" className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-accent" onMouseDown={(event) => event.preventDefault()} onClick={() => onChange(value.replace(/@[^@\s]*$/, `@${user.nome} `))}><span>{user.nome}</span><span className="text-xs text-muted-foreground">@{user.usuario}</span></button>)}
    </div> : null}
  </div>
}
