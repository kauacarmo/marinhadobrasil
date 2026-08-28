/**
 * Gera o card visual (PNG) da CIR e da Carteira Náutica de Embarcação.
 *
 * O mesmo card é usado na pré-visualização, no download e no envio por webhook,
 * garantindo que o documento exibido seja idêntico ao entregue.
 */

export type CampoCard = { label: string; valor: string }

export type DadosCard = {
  tipo: "cir" | "carteira_nautica" | "funcional_militar"
  titulo: string
  titular: string
  campos: CampoCard[]
  fotoUrl?: string
  rodape?: string
}

const LARGURA = 1000
const ESCALA = 2

// Paleta do documento: cor institucional + dourado de destaque + neutros.
const COR_CIR = "#1e3a5f"
const COR_NAUTICA = "#0f5132"
const DOURADO = "#c8a95a"
const PAPEL = "#ffffff"
const TEXTO = "#14181f"
const MUTED = "#5b6472"
const BORDA = "#e2e0da"

const FONTE_SERIF = "Georgia, 'Times New Roman', serif"
const FONTE_SANS = "'Helvetica Neue', Arial, sans-serif"

/** Quebra o texto em linhas que caibam na largura informada. */
function quebrarLinhas(ctx: CanvasRenderingContext2D, texto: string, maxLargura: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return [""]
  const linhas: string[] = []
  let atual = palavras[0]
  for (let i = 1; i < palavras.length; i++) {
    const teste = `${atual} ${palavras[i]}`
    if (ctx.measureText(teste).width <= maxLargura) atual = teste
    else {
      linhas.push(atual)
      atual = palavras[i]
    }
  }
  linhas.push(atual)
  return linhas
}

/** Retângulo com cantos arredondados. */
function caminhoArredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Carrega a foto do titular. Retorna null se não for possível usar a imagem. */
function carregarImagem(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    // Necessário para não "contaminar" o canvas ao exportar o PNG.
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function gerarCardDocumento(dados: DadosCard): Promise<Blob> {
  // A Identidade Funcional Militar tem layout próprio (formato horizontal de cédula).
  if (dados.tipo === "funcional_militar") return gerarCardFuncionalMilitar(dados)

  const cor = dados.tipo === "carteira_nautica" ? COR_NAUTICA : COR_CIR
  const campos = dados.campos.filter((c) => c.label.trim() && c.valor.trim())
  const foto = dados.fotoUrl ? await carregarImagem(dados.fotoUrl) : null

  // Canvas de medição para calcular a altura antes de desenhar.
  const medidor = document.createElement("canvas").getContext("2d")
  if (!medidor) throw new Error("Não foi possível gerar o card.")

  const PAD = 48
  const CONTEUDO = LARGURA - PAD * 2
  const FOTO_L = 180
  const FOTO_A = 228
  const COL_X = PAD + FOTO_L + 36
  const COL_LARGURA = LARGURA - COL_X - PAD

  // Título do documento
  medidor.font = `bold 34px ${FONTE_SERIF}`
  const linhasTitulo = quebrarLinhas(medidor, dados.titulo, CONTEUDO)

  // Nome do titular
  medidor.font = `bold 28px ${FONTE_SERIF}`
  const linhasTitular = quebrarLinhas(medidor, dados.titular || "—", COL_LARGURA)

  // Campos: valores longos ocupam a linha inteira; os demais ficam em duas colunas.
  medidor.font = `600 19px ${FONTE_SANS}`
  const larguraMeia = (CONTEUDO - 32) / 2
  type ItemCampo = { label: string; linhas: string[]; largo: boolean }
  const itens: ItemCampo[] = campos.map((c) => {
    const largo = c.valor.length > 58
    const maxL = largo ? CONTEUDO : larguraMeia
    return { label: c.label, linhas: quebrarLinhas(medidor, c.valor, maxL), largo }
  })

  // Altura das linhas de campos (duas colunas por linha, salvo os "largos").
  let alturaCampos = 0
  for (let i = 0; i < itens.length; ) {
    if (itens[i].largo) {
      alturaCampos += 26 + itens[i].linhas.length * 26 + 18
      i += 1
    } else {
      const par = [itens[i], itens[i + 1]].filter(Boolean) as ItemCampo[]
      const maxLinhas = Math.max(...par.map((p) => p.linhas.length))
      alturaCampos += 26 + maxLinhas * 26 + 18
      i += par.length === 2 && !par[1].largo ? 2 : 1
    }
  }

  const yTitulo = 102 + 44
  const yBloco = yTitulo + linhasTitulo.length * 42 + 24
  const alturaTitular = 22 + linhasTitular.length * 34
  const yCampos = yBloco + Math.max(FOTO_A, alturaTitular) + 32
  const altura = Math.max(560, yCampos + alturaCampos + 96)

  // Canvas final
  const canvas = document.createElement("canvas")
  canvas.width = LARGURA * ESCALA
  canvas.height = altura * ESCALA
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Não foi possível gerar o card.")
  ctx.scale(ESCALA, ESCALA)
  ctx.textBaseline = "alphabetic"

  // Fundo
  ctx.fillStyle = PAPEL
  ctx.fillRect(0, 0, LARGURA, altura)

  // Cabeçalho institucional
  ctx.fillStyle = cor
  ctx.fillRect(0, 0, LARGURA, 96)
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold 26px ${FONTE_SERIF}`
  ctx.fillText("MARINHA DO BRASIL", PAD, 44)
  ctx.font = `13px ${FONTE_SANS}`
  ctx.globalAlpha = 0.8
  ctx.fillText("CAPITANIA DOS PORTOS DE SÃO PAULO", PAD, 70)
  ctx.globalAlpha = 1

  // Sigla do documento à direita do cabeçalho
  const sigla = dados.tipo === "carteira_nautica" ? "CARTEIRA NÁUTICA" : "CIR"
  ctx.font = `bold 15px ${FONTE_SANS}`
  ctx.textAlign = "right"
  ctx.globalAlpha = 0.9
  ctx.fillText(sigla, LARGURA - PAD, 58)
  ctx.globalAlpha = 1
  ctx.textAlign = "left"

  // Filete dourado
  ctx.fillStyle = DOURADO
  ctx.fillRect(0, 96, LARGURA, 6)

  // Título do documento
  ctx.fillStyle = cor
  ctx.font = `bold 34px ${FONTE_SERIF}`
  linhasTitulo.forEach((l, i) => ctx.fillText(l, PAD, yTitulo + i * 42))

  // Foto do titular
  caminhoArredondado(ctx, PAD, yBloco, FOTO_L, FOTO_A, 8)
  ctx.save()
  ctx.clip()
  if (foto) {
    // Preenche a moldura preservando a proporção (efeito "cover").
    const escala = Math.max(FOTO_L / foto.width, FOTO_A / foto.height)
    const lw = foto.width * escala
    const lh = foto.height * escala
    ctx.drawImage(foto, PAD + (FOTO_L - lw) / 2, yBloco + (FOTO_A - lh) / 2, lw, lh)
  } else {
    ctx.fillStyle = "#f1efe9"
    ctx.fillRect(PAD, yBloco, FOTO_L, FOTO_A)
    ctx.fillStyle = MUTED
    ctx.font = `13px ${FONTE_SANS}`
    ctx.textAlign = "center"
    ctx.fillText("SEM FOTO", PAD + FOTO_L / 2, yBloco + FOTO_A / 2)
    ctx.textAlign = "left"
  }
  ctx.restore()
  caminhoArredondado(ctx, PAD, yBloco, FOTO_L, FOTO_A, 8)
  ctx.strokeStyle = BORDA
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Nome do titular
  ctx.fillStyle = MUTED
  ctx.font = `bold 12px ${FONTE_SANS}`
  ctx.fillText("TITULAR", COL_X, yBloco + 14)
  ctx.fillStyle = TEXTO
  ctx.font = `bold 28px ${FONTE_SERIF}`
  linhasTitular.forEach((l, i) => ctx.fillText(l, COL_X, yBloco + 50 + i * 34))

  // Campos do documento
  let y = yCampos
  function desenharCampo(item: ItemCampo, x: number) {
    ctx!.fillStyle = MUTED
    ctx!.font = `bold 12px ${FONTE_SANS}`
    ctx!.fillText(item.label.toUpperCase(), x, y)
    ctx!.fillStyle = TEXTO
    ctx!.font = `600 19px ${FONTE_SANS}`
    item.linhas.forEach((l, i) => ctx!.fillText(l, x, y + 26 + i * 26))
  }

  for (let i = 0; i < itens.length; ) {
    if (itens[i].largo) {
      desenharCampo(itens[i], PAD)
      y += 26 + itens[i].linhas.length * 26 + 18
      i += 1
      continue
    }
    const segundo = itens[i + 1] && !itens[i + 1].largo ? itens[i + 1] : null
    desenharCampo(itens[i], PAD)
    if (segundo) desenharCampo(segundo, PAD + larguraMeia + 32)
    const maxLinhas = Math.max(itens[i].linhas.length, segundo?.linhas.length ?? 0)
    y += 26 + maxLinhas * 26 + 18
    i += segundo ? 2 : 1
  }

  // Rodapé com assinatura e data de emissão
  const yRodape = altura - 60
  ctx.strokeStyle = BORDA
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, yRodape)
  ctx.lineTo(LARGURA - PAD, yRodape)
  ctx.stroke()

  ctx.fillStyle = MUTED
  ctx.font = `13px ${FONTE_SANS}`
  const rodape = (dados.rodape || "").trim() || "Documento emitido pela Capitania dos Portos"
  ctx.fillText(rodape, PAD, yRodape + 26)
  ctx.textAlign = "right"
  ctx.fillText(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, LARGURA - PAD, yRodape + 26)
  ctx.textAlign = "left"

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Não foi possível gerar o card."))), "image/png")
  })
}

// ------------------------- Identidade Funcional Militar -------------------------

/** Busca o valor de um campo por rótulo, ignorando acentos e caixa. */
function acharCampo(campos: CampoCard[], ...candidatos: string[]): string {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  const alvos = candidatos.map(norm)
  const achado = campos.find((c) => alvos.includes(norm(c.label)))
  return achado ? achado.valor.trim() : ""
}

/** Estrela de cinco pontas (usada no brasão da República). */
function estrela(ctx: CanvasRenderingContext2D, cx: number, cy: number, raio: number, cor: string) {
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const angI = ang + Math.PI / 5
    const rx = cx + Math.cos(ang) * raio
    const ry = cy + Math.sin(ang) * raio
    const ix = cx + Math.cos(angI) * (raio * 0.42)
    const iy = cy + Math.sin(angI) * (raio * 0.42)
    if (i === 0) ctx.moveTo(rx, ry)
    else ctx.lineTo(rx, ry)
    ctx.lineTo(ix, iy)
  }
  ctx.closePath()
  ctx.fillStyle = cor
  ctx.fill()
  ctx.restore()
}

/** Brasão simplificado da República (medalhão circular com estrela). */
function desenharBrasao(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = "#1f6b3a"
  ctx.fill()
  ctx.lineWidth = r * 0.16
  ctx.strokeStyle = DOURADO
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2)
  ctx.fillStyle = "#0b3d91"
  ctx.fill()
  estrela(ctx, cx, cy, r * 0.5, "#f2c14e")
  ctx.restore()
}

/** Emblema naval simplificado (âncora dourada em medalhão). */
function desenharAncora(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = DOURADO
  ctx.lineWidth = r * 0.12
  ctx.stroke()

  ctx.strokeStyle = DOURADO
  ctx.lineWidth = Math.max(2, r * 0.1)
  ctx.lineCap = "round"
  const topo = cy - r * 0.62
  const base = cy + r * 0.62
  // Haste
  ctx.beginPath()
  ctx.moveTo(cx, topo + r * 0.16)
  ctx.lineTo(cx, base)
  ctx.stroke()
  // Argola
  ctx.beginPath()
  ctx.arc(cx, topo + r * 0.1, r * 0.12, 0, Math.PI * 2)
  ctx.stroke()
  // Braço horizontal
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.34, topo + r * 0.42)
  ctx.lineTo(cx + r * 0.34, topo + r * 0.42)
  ctx.stroke()
  // Patas curvas
  ctx.beginPath()
  ctx.arc(cx, base - r * 0.42, r * 0.52, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
  ctx.restore()
}

/** Chip dourado (como nos documentos com chip). */
function desenharChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  caminhoArredondado(ctx, x, y, w, h, 8)
  ctx.fillStyle = "#d4b160"
  ctx.fill()
  ctx.strokeStyle = "#a9862f"
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.strokeStyle = "#a9862f"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y + h / 2)
  ctx.lineTo(x + w, y + h / 2)
  ctx.moveTo(x + w * 0.34, y)
  ctx.lineTo(x + w * 0.34, y + h)
  ctx.moveTo(x + w * 0.66, y)
  ctx.lineTo(x + w * 0.66, y + h)
  ctx.stroke()
}

async function gerarCardFuncionalMilitar(dados: DadosCard): Promise<Blob> {
  const L = 1000
  const A = 630
  const foto = dados.fotoUrl ? await carregarImagem(dados.fotoUrl) : null

  const canvas = document.createElement("canvas")
  canvas.width = L * ESCALA
  canvas.height = A * ESCALA
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Não foi possível gerar o card.")
  ctx.scale(ESCALA, ESCALA)
  ctx.textBaseline = "alphabetic"

  // Fundo com leve textura guilloché (linhas diagonais tênues).
  ctx.fillStyle = "#e9f1ef"
  ctx.fillRect(0, 0, L, A)
  ctx.save()
  ctx.strokeStyle = "rgba(15,81,50,0.06)"
  ctx.lineWidth = 1
  for (let i = -A; i < L; i += 14) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + A, A)
    ctx.stroke()
  }
  ctx.restore()

  // Moldura
  ctx.strokeStyle = "#c8d6cf"
  ctx.lineWidth = 2
  ctx.strokeRect(6, 6, L - 12, A - 12)

  const PAD = 40
  const NAVY = "#0b3d91"
  const rotulo = "#3d6b57"

  // Cabeçalho
  desenharBrasao(ctx, PAD + 60, 96, 58)
  desenharAncora(ctx, L - PAD - 52, 92, 44)

  ctx.textAlign = "center"
  ctx.fillStyle = NAVY
  ctx.font = `bold 30px ${FONTE_SERIF}`
  ctx.fillText("REPÚBLICA FEDERATIVA DO BRASIL", L / 2, 70)
  ctx.font = `600 19px ${FONTE_SANS}`
  ctx.fillText("MINISTÉRIO DA DEFESA", L / 2, 98)
  ctx.font = `bold 21px ${FONTE_SERIF}`
  ctx.fillText("MARINHA DO BRASIL", L / 2, 126)
  ctx.textAlign = "left"

  // Filete dourado sob o cabeçalho
  ctx.fillStyle = DOURADO
  ctx.fillRect(PAD, 150, L - PAD * 2, 3)

  // Helper para desenhar um campo (rótulo pequeno + valor).
  function campo(label: string, valor: string, x: number, y: number, tamValor = 24, largura = 360) {
    ctx!.fillStyle = rotulo
    ctx!.font = `bold 13px ${FONTE_SANS}`
    ctx!.fillText(label, x, y)
    ctx!.fillStyle = TEXTO
    ctx!.font = `600 ${tamValor}px ${FONTE_SANS}`
    const linhas = quebrarLinhas(ctx!, valor || "—", largura)
    ctx!.fillText(linhas[0], x, y + tamValor + 8)
  }

  // Foto do titular à direita
  const fx = L - PAD - 180
  const fy = 186
  const fw = 180
  const fh = 226
  caminhoArredondado(ctx, fx, fy, fw, fh, 8)
  ctx.save()
  ctx.clip()
  if (foto) {
    const escala = Math.max(fw / foto.width, fh / foto.height)
    const lw = foto.width * escala
    const lh = foto.height * escala
    ctx.drawImage(foto, fx + (fw - lw) / 2, fy + (fh - lh) / 2, lw, lh)
  } else {
    ctx.fillStyle = "#dbe6e1"
    ctx.fillRect(fx, fy, fw, fh)
    ctx.fillStyle = MUTED
    ctx.font = `13px ${FONTE_SANS}`
    ctx.textAlign = "center"
    ctx.fillText("SEM FOTO", fx + fw / 2, fy + fh / 2)
    ctx.textAlign = "left"
  }
  ctx.restore()
  caminhoArredondado(ctx, fx, fy, fw, fh, 8)
  ctx.strokeStyle = "#b9c9c2"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Coluna de dados (à esquerda da foto)
  const colDir = fx - 40
  campo("NOME", dados.titular, PAD, 200, 26, colDir - PAD)
  campo("NR REGISTRO", acharCampo(dados.campos, "Nº de registro", "NR Registro", "Numero de registro"), PAD, 268, 24, colDir - PAD)

  // Chip + seta e POSTO/GRAD/CAT
  desenharChip(ctx, PAD, 300, 96, 74)
  ctx.fillStyle = NAVY
  ctx.beginPath()
  ctx.moveTo(PAD + 112, 320)
  ctx.lineTo(PAD + 148, 337)
  ctx.lineTo(PAD + 112, 354)
  ctx.closePath()
  ctx.fill()
  campo("POSTO / GRAD / CAT", acharCampo(dados.campos, "Posto / Graduação / Categoria", "Posto Grad Cat", "Posto"), PAD + 172, 320, 24, colDir - (PAD + 172))

  // DATA NASCIMENTO
  campo("DATA NASCIMENTO", acharCampo(dados.campos, "Data de nascimento", "Data nascimento"), PAD, 410, 22, 300)

  // Linha inferior: NIP, CPF, RIC
  const yBase = 480
  campo("NIP", acharCampo(dados.campos, "NIP"), PAD, yBase, 22, 220)
  campo("CPF", acharCampo(dados.campos, "CPF"), PAD + 300, yBase, 22, 220)
  campo("RIC", acharCampo(dados.campos, "RIC"), PAD + 600, yBase, 22, 240)

  // Assinatura
  const ySig = A - 70
  ctx.strokeStyle = "#9fb3aa"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, ySig)
  ctx.lineTo(PAD + 360, ySig)
  ctx.stroke()
  ctx.fillStyle = rotulo
  ctx.font = `12px ${FONTE_SANS}`
  ctx.fillText("ASSINATURA DO TITULAR", PAD, ySig + 20)

  // Rodapé / data de emissão
  ctx.textAlign = "right"
  ctx.fillStyle = MUTED
  ctx.font = `12px ${FONTE_SANS}`
  const rod = (dados.rodape || "").trim() || "Documento emitido pela Marinha do Brasil"
  ctx.fillText(`${rod} — ${new Date().toLocaleDateString("pt-BR")}`, L - PAD, ySig + 20)
  ctx.textAlign = "left"

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Não foi possível gerar o card."))), "image/png")
  })
}

/** Nome de arquivo amigável para o download do card. */
export function nomeArquivoCard(tipo: DadosCard["tipo"], titular: string): string {
  const base =
    tipo === "carteira_nautica" ? "carteira-nautica" : tipo === "funcional_militar" ? "identidade-funcional" : "cir"
  const nome = titular
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base}${nome ? `-${nome}` : ""}.png`
}
