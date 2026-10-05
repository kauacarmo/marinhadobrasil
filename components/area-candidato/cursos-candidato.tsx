"use client"

import { useActionState, useEffect, useState } from "react"
import type { CursoCandidato } from "@/lib/cursos-candidato"
import { inscreverEmCurso } from "@/app/area-candidato/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GraduationCap,
  Clock,
  Users,
  MapPin,
  UserRound,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

function fmtData(iso?: string | null) {
  if (!iso) return "A definir"
  const [a, m, d] = iso.split("-")
  if (!a || !m || !d) return iso
  return `${d}/${m}/${a}`
}

export function CursosCandidato({ cursos }: { cursos: CursoCandidato[] }) {
  const [aberto, setAberto] = useState<CursoCandidato | null>(null)

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-primary" />
        <h3 className="font-serif text-2xl font-bold text-primary">Cursos da Marinha</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Inscreva-se nos cursos de formação e aperfeiçoamento oferecidos pela Marinha.
      </p>

      {cursos.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
          Nenhum curso disponível no momento. Volte em breve.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {cursos.map((c) => (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative flex h-36 items-center justify-center overflow-hidden bg-muted">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url || "/placeholder.svg"} alt="" className="size-full object-cover" />
                ) : (
                  <GraduationCap className="size-10 text-muted-foreground" />
                )}
                {c.inscrito ? (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    <CheckCircle2 className="size-3" /> Inscrito
                  </span>
                ) : c.lotado ? (
                  <span className="absolute right-2 top-2 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
                    Lotado
                  </span>
                ) : c.encerrado ? (
                  <span className="absolute right-2 top-2 rounded-full bg-muted-foreground/80 px-2.5 py-0.5 text-xs font-semibold text-background">
                    Encerrado
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-serif text-lg font-bold text-primary text-balance">{c.titulo}</h4>
                {c.descricao ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">{c.descricao}</p>
                ) : null}

                <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {c.carga_horaria ? (
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" /> {c.carga_horaria}
                    </div>
                  ) : null}
                  {c.modalidade ? (
                    <div className="flex items-center gap-2">
                      <UserRound className="size-4" /> {c.modalidade}
                    </div>
                  ) : null}
                  {c.local ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" /> {c.local}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    {c.vagas > 0 ? `${c.inscritos}/${c.vagas} vagas` : `${c.inscritos} inscrito(s)`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" /> Inscrições até {fmtData(c.inscricoes_fim)}
                  </div>
                </dl>

                <div className="mt-4 pt-1">
                  {c.inscrito ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <CheckCircle2 className="size-4" /> Inscrição confirmada
                    </span>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={!c.abertoParaInscricao}
                      onClick={() => setAberto(c)}
                    >
                      {c.lotado ? "Vagas esgotadas" : c.encerrado ? "Inscrições encerradas" : "Inscrever-se"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogInscricao curso={aberto} onClose={() => setAberto(null)} />
    </div>
  )
}

function DialogInscricao({ curso, onClose }: { curso: CursoCandidato | null; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(inscreverEmCurso, null as null | { error?: string; success?: boolean })

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(onClose, 1200)
      return () => clearTimeout(t)
    }
  }, [state, onClose])

  return (
    <Dialog open={!!curso} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form action={formAction}>
          <input type="hidden" name="curso_id" value={curso?.id ?? ""} />
          <DialogHeader>
            <DialogTitle className="font-serif">Inscrição no curso</DialogTitle>
            <DialogDescription>{curso?.titulo}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {state?.success ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                <CheckCircle2 className="size-4" /> Inscrição realizada com sucesso!
              </div>
            ) : (
              <>
                {state?.error ? (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                    <AlertCircle className="size-4" /> {state.error}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="nome_personagem">Nome do personagem</Label>
                  <Input id="nome_personagem" name="nome_personagem" placeholder="Como você é conhecido no jogo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    rows={3}
                    placeholder="Alguma informação adicional para a organização do curso"
                  />
                </div>
              </>
            )}
          </div>

          {!state?.success ? (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Enviando..." : "Confirmar inscrição"}
              </Button>
            </DialogFooter>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}
