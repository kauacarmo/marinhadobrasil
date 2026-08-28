import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AbaWebhook } from "@/lib/types"

/**
 * Monta uma mensagem legível a partir do evento e dos dados.
 * Usada para canais como Discord e Slack, que exibem texto simples.
 */
export function montarMensagem(evento: string, dados: unknown): string {
  if (evento === "teste") {
    return "O sistema está fazendo testes neste canal..."
  }

  if (dados && typeof dados === "object") {
    const d = dados as Record<string, unknown>

    // Documento de Aquaviário (CIR / Carteira Náutica) em texto simples.
    if (typeof d.documento === "string" && Array.isArray(d.campos)) {
      const linhas: string[] = []
      if (typeof d.mencao === "string" && d.mencao.trim()) linhas.push(d.mencao.trim())
      if (typeof d.titulo === "string" && d.titulo.trim()) linhas.push(`📄 **${d.titulo.trim()}**`)
      if (typeof d.titular === "string" && d.titular.trim()) linhas.push(`Titular: ${d.titular.trim()}`)
      for (const c of d.campos as Array<Record<string, unknown>>) {
        const label = typeof c?.label === "string" ? c.label.trim() : ""
        const valor = typeof c?.valor === "string" ? c.valor.trim() : ""
        if (label && valor) linhas.push(`${label}: ${valor}`)
      }
      if (typeof d.card_url === "string" && d.card_url.trim()) linhas.push(d.card_url.trim())
      else if (typeof d.foto_url === "string" && d.foto_url.trim()) linhas.push(d.foto_url.trim())
      if (typeof d.rodape === "string" && d.rodape.trim()) linhas.push(`_${d.rodape.trim()}_`)
      return linhas.join("\n")
    }

    // Diário Naval no formato de matéria (blocos alternados de texto e imagem).
    if (Array.isArray(d.blocos)) {
      const linhas: string[] = []
      if (typeof d.mencao === "string" && d.mencao.trim()) linhas.push(d.mencao.trim())
      if (typeof d.titulo === "string" && d.titulo.trim()) linhas.push(`📰 **${d.titulo.trim()}**`)
      for (const b of d.blocos as Array<Record<string, unknown>>) {
        if (b?.tipo === "texto" && typeof b.texto === "string" && b.texto.trim()) linhas.push(b.texto.trim())
        else if (b?.tipo === "imagem" && typeof b.url === "string" && b.url.trim()) linhas.push(b.url.trim())
      }
      if (typeof d.rodape === "string" && d.rodape.trim()) linhas.push(`_${d.rodape.trim()}_`)
      return linhas.join("\n")
    }

    if (typeof d.titulo === "string" && d.titulo.trim()) {
      const linhas: string[] = []
      if (typeof d.mencao === "string" && d.mencao.trim()) linhas.push(String(d.mencao).trim())
      linhas.push(`📰 **${String(d.titulo).trim()}**`)
      if (typeof d.categoria === "string" && d.categoria.trim()) linhas.push(`Categoria: ${String(d.categoria).trim()}`)
      if (typeof d.resumo === "string" && d.resumo.trim()) linhas.push(String(d.resumo).trim())
      if (typeof d.imagem_url === "string" && d.imagem_url.trim()) linhas.push(String(d.imagem_url).trim())
      if (typeof d.rodape === "string" && d.rodape.trim()) linhas.push(`_${String(d.rodape).trim()}_`)
      return linhas.join("\n")
    }
  }

  return `Novo evento: ${evento}`
}

/**
 * Monta o corpo do POST de acordo com o destino.
 * - Discord: usa { content } (e embed com imagem quando houver).
 * - Slack: usa { text }.
 * - Genérico: envia o payload completo e também content/text para máxima compatibilidade.
 */
export function montarCorpoWebhook(url: string, aba: AbaWebhook, evento: string, dados: unknown): string {
  const mensagem = montarMensagem(evento, dados)
  const enviado_em = new Date().toISOString()
  const limpa = url.trim()

  const ehDiscord = /discord(app)?\.com\/api\/webhooks/i.test(limpa)
  const ehSlack = /hooks\.slack\.com/i.test(limpa)

  // Endpoints de compatibilidade do Discord exigem o formato do provedor de origem.
  // Ex.: .../webhooks/ID/TOKEN/slack espera { text }, não { content }.
  const ehDiscordSlack = ehDiscord && /\/slack\b/i.test(limpa)
  const ehDiscordGithub = ehDiscord && /\/github\b/i.test(limpa)

  if (ehSlack || ehDiscordSlack) {
    return JSON.stringify({ text: mensagem })
  }

  if (ehDiscord && !ehDiscordGithub) {
    const d = (dados && typeof dados === "object" ? dados : {}) as Record<string, unknown>
    const titulo = typeof d.titulo === "string" ? d.titulo.trim() : ""
    const resumo = typeof d.resumo === "string" ? d.resumo.trim() : ""
    const categoria = typeof d.categoria === "string" ? d.categoria.trim() : ""
    const rodape = typeof d.rodape === "string" ? d.rodape.trim() : ""
    const mencao = typeof d.mencao === "string" ? d.mencao.trim() : ""

    // ---- Aquaviários: documento oficial (CIR / Carteira Náutica) ----
    if (typeof d.documento === "string" && Array.isArray(d.campos) && evento !== "teste") {
      const urlPortal = "https://www.marinha.mil.br/"
      const ehFuncional = d.documento === "funcional_militar"
      const cor = d.documento === "carteira_nautica" ? 0x0f5132 : ehFuncional ? 0x0b3d91 : 0x1e3a5f
      const orgao = ehFuncional ? "Ministério da Defesa" : "Capitania dos Portos"
      const titular = typeof d.titular === "string" ? d.titular.trim() : ""
      const foto = typeof d.foto_url === "string" && /^https?:\/\//i.test(d.foto_url.trim()) ? d.foto_url.trim() : ""

      const fields = (d.campos as Array<Record<string, unknown>>)
        .map((c) => ({
          name: typeof c?.label === "string" ? c.label.trim() : "",
          value: typeof c?.valor === "string" ? c.valor.trim() : "",
          inline: true,
        }))
        .filter((f) => f.name && f.value)
        .slice(0, 24)

      const embed: Record<string, unknown> = {
        author: { name: `Marinha do Brasil — ${orgao}`, url: urlPortal },
        title: titulo || "Documento oficial",
        url: urlPortal,
        color: cor,
        fields,
        footer: { text: rodape || `Documento emitido pela ${orgao}` },
        timestamp: new Date().toISOString(),
      }
      if (titular) embed.description = `**Titular:** ${titular}`
      if (foto) embed.thumbnail = { url: foto }

      // O card do documento entra como imagem principal do embed.
      const card = typeof d.card_url === "string" && /^https?:\/\//i.test(d.card_url.trim()) ? d.card_url.trim() : ""
      if (card) embed.image = { url: card }

      return JSON.stringify({ content: mencao || undefined, embeds: [embed] })
    }
    // ---- fim Aquaviários ----

    // ---- Diário Naval: matéria com blocos alternados (texto/imagem) ----
    if (Array.isArray(d.blocos) && evento !== "teste") {
      const urlPortal = "https://www.marinha.mil.br/"
      const cor = 0x1e3a5f

      // Normaliza e valida os blocos, preservando a ordem definida no editor.
      const blocos = (d.blocos as Array<Record<string, unknown>>)
        .map((b) =>
          b?.tipo === "imagem"
            ? { tipo: "imagem" as const, url: typeof b.url === "string" ? b.url.trim() : "" }
            : { tipo: "texto" as const, texto: typeof b.texto === "string" ? b.texto.trim() : "" },
        )
        .filter((b) => (b.tipo === "imagem" ? /^https?:\/\//i.test(b.url) : b.texto.length > 0))

      const embeds: Record<string, unknown>[] = []
      // Cabeçalho do veículo + manchete. Se o 1º bloco for texto, ele entra como lide da matéria.
      const header: Record<string, unknown> = {
        author: { name: "Diário Naval — Marinha do Brasil", url: urlPortal },
        title: titulo || "Diário Naval",
        url: urlPortal,
        color: cor,
      }
      let inicio = 0
      if (blocos[0]?.tipo === "texto") {
        header.description = (blocos[0] as { texto: string }).texto
        inicio = 1
      }
      embeds.push(header)

      for (let i = inicio; i < blocos.length; i++) {
        const b = blocos[i]
        if (b.tipo === "texto") embeds.push({ description: b.texto, color: cor })
        else embeds.push({ image: { url: b.url }, color: cor })
      }

      // Discord aceita no máximo 10 embeds por mensagem.
      const finais = embeds.slice(0, 10)
      // Rodapé/data ficam no último embed, como a assinatura da matéria.
      const ultimo = finais[finais.length - 1]
      finais[finais.length - 1] = {
        ...ultimo,
        footer: { text: rodape || "Diário Naval • Marinha do Brasil" },
        timestamp: new Date().toISOString(),
      }

      return JSON.stringify({ content: mencao || undefined, embeds: finais })
    }
    // ---- fim Diário Naval ----

    // Coleta as imagens: aceita uma lista (galeria) ou a imagem única (compatibilidade).
    const listaImagens = Array.isArray(d.imagens) ? (d.imagens as unknown[]) : []
    const imagens = [
      ...listaImagens.map((x) => (typeof x === "string" ? x.trim() : "")),
      typeof d.imagem_url === "string" ? d.imagem_url.trim() : "",
    ]
      .filter((u) => /^https?:\/\//i.test(u))
      // Remove duplicatas e limita à galeria de 4 imagens exibida pelo Discord.
      .filter((u, i, arr) => arr.indexOf(u) === i)
      .slice(0, 4)

    // Disparo de teste ou publicação sem título: mensagem simples de texto.
    if (evento === "teste" || !titulo) {
      return JSON.stringify({ content: mensagem })
    }

    // Formato de PORTAL DE NOTÍCIAS (não um aviso seco):
    // cabeçalho do veículo (author) → manchete clicável (title) → matéria (description)
    // → foto principal (image) → rodapé com edição/data (footer + timestamp).
    const urlPortal = "https://www.marinha.mil.br/"
    const embedPrincipal: Record<string, unknown> = {
      author: { name: "Diário Naval — Marinha do Brasil", url: urlPortal },
      title: titulo,
      url: urlPortal,
      color: 0x1e3a5f,
      footer: { text: rodape || "Diário Naval • Marinha do Brasil" },
      timestamp: new Date().toISOString(),
    }
    if (resumo) embedPrincipal.description = resumo

    let embeds: Record<string, unknown>[]
    if (imagens.length <= 1) {
      if (imagens[0]) embedPrincipal.image = { url: imagens[0] }
      embeds = [embedPrincipal]
    } else {
      // Galeria: vários embeds com a MESMA url fazem o Discord agrupar as imagens em grade.
      embedPrincipal.image = { url: imagens[0] }
      const extras = imagens.slice(1).map((u) => ({ url: urlPortal, image: { url: u } }))
      embeds = [embedPrincipal, ...extras]
    }

    // A menção fica no content para que o Discord notifique de fato os membros.
    return JSON.stringify({ content: mencao || undefined, embeds })
  }

  return JSON.stringify({ aba, evento, dados, mensagem, content: mensagem, text: mensagem, enviado_em })
}

/**
 * Dispara os webhooks ativos de uma aba, enviando um POST com o evento e os dados.
 * Falhas de entrega são registradas no log, mas nunca interrompem a operação principal.
 */
export async function dispararWebhooks(aba: AbaWebhook, evento: string, dados: unknown) {
  try {
    const supabase = createAdminClient()
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("id, url")
      .eq("aba", aba)
      .eq("ativo", true)

    if (!webhooks || webhooks.length === 0) return

    await Promise.allSettled(
      webhooks.map((w) =>
        fetch(w.url.trim(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Aba": aba,
            "X-Webhook-Evento": evento,
          },
          body: montarCorpoWebhook(w.url, aba, evento, dados),
        })
          .then((res) => {
            if (!res.ok) console.log("[v0] Webhook respondeu com status", res.status, w.url)
          })
          .catch((err) => {
            console.log("[v0] Falha ao entregar webhook:", w.url, String(err))
          }),
      ),
    )
  } catch (err) {
    console.log("[v0] Erro no disparo de webhooks:", String(err))
  }
}
