import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo precisa ser uma imagem." }, { status: 400 })
    }

    // Store público: a URL retornada é acessível diretamente (uso em <img>)
    const blob = await put(`noticias/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Erro no upload de imagem da notícia:", error)
    return NextResponse.json({ error: "Falha ao enviar a imagem." }, { status: 500 })
  }
}
