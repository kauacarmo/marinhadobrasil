/**
 * Gera o card visual (PNG) da CIR e da Carteira Náutica de Embarcação.
 *
 * O mesmo card é usado na pré-visualização, no download e no envio por webhook,
 * garantindo que o documento exibido seja idêntico ao entregue.
 */

export type CampoCard = { label: string; valor: string }

export type DadosCard = {
  tipo: "cir" | "carteira_nautica"
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

/** Nome de arquivo amigável para o download do card. */
export function nomeArquivoCard(tipo: DadosCard["tipo"], titular: string): string {
  const base = tipo === "carteira_nautica" ? "carteira-nautica" : "cir"
  const nome = titular
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${base}${nome ? `-${nome}` : ""}.png`
}
