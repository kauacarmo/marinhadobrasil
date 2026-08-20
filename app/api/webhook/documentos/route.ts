import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

const TIPOS_VALIDOS = ["portaria", "boletim", "disciplinar"] as const
type TipoDoc = (typeof TIPOS_VALIDOS)[number]

// Aliases aceitos para o campo "tipo"
const ALIAS_TIPO: Record<string, TipoDoc> = {
  portaria: "portaria",
  portarias: "portaria",
  boletim: "boletim",
  "boletim-interno": "boletim",
  boletim_interno: "boletim",
  bono: "boletim",
  disciplinar: "disciplinar",
  disciplina: "disciplinar",
}

function normalizarTipo(valor: string | null): TipoDoc | null {
  if (!valor) return null
  return ALIAS_TIPO[valor.trim().toLowerCase()] ?? null
}

function autorizado(req: Request, url: URL): boolean {
  const secret = process.env.DOCUMENTOS_WEBHOOK_SECRET
  // Se não houver segredo configurado, o webhook fica aberto (modo demonstração).
  if (!secret) return true
  const header = req.headers.get("x-webhook-secret") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  const query = url.searchParams.get("token")
  return header === secret || query === secret
}

export async function POST(req: Request) {
  const url = new URL(req.url)

  if (!autorizado(req, url)) {
    return NextResponse.json({ error: "Não autorizado. Token inválido." }, { status: 401 })
  }

  const contentType = req.headers.get("content-type") || ""
  let tipo: TipoDoc | null = null
  let titulo = ""
  let numero: string | null = null
  let conteudo: string | null = null
  let pdfUrl: string | null = null

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json()
      tipo = normalizarTipo(body.tipo ?? url.searchParams.get("tipo"))
      titulo = String(body.titulo ?? "").trim()
      numero = body.numero ? String(body.numero).trim() : null
      conteudo = body.conteudo ? String(body.conteudo) : body.texto ? String(body.texto) : null
      pdfUrl = body.pdf_url ? String(body.pdf_url).trim() : body.pdfUrl ? String(body.pdfUrl).trim() : null
    } else {
      // text/plain ou form: tipo e título vêm por query string; corpo é o conteúdo
      tipo = normalizarTipo(url.searchParams.get("tipo"))
      titulo = String(url.searchParams.get("titulo") ?? "").trim()
      numero = url.searchParams.get("numero")
      pdfUrl = url.searchParams.get("pdf_url")
      const texto = await req.text()
      conteudo = texto || null
    }
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  if (!tipo) {
    return NextResponse.json(
      { error: "Campo 'tipo' inválido. Use: portaria, boletim ou disciplinar." },
      { status: 400 },
    )
  }
  if (!titulo) {
    return NextResponse.json({ error: "Campo 'titulo' é obrigatório." }, { status: 400 })
  }
  if (!conteudo && !pdfUrl) {
    return NextResponse.json(
      { error: "Envie ao menos 'conteudo' (texto) ou 'pdf_url' (link do PDF)." },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("documents")
    .insert({ tipo, titulo, numero, conteudo, pdf_url: pdfUrl, origem: "webhook" })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id, tipo }, { status: 201 })
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhook/documentos",
    metodo: "POST",
    tipos: TIPOS_VALIDOS,
    exemplo_json: {
      tipo: "portaria",
      numero: "123/2026",
      titulo: "Portaria nº 123/2026",
      conteudo: "Texto integral do documento...",
      pdf_url: "https://exemplo.com/documento.pdf (opcional)",
    },
  })
}
