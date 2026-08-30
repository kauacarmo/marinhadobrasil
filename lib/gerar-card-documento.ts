/**
 * Gera o card visual (PNG) da CIR e da Carteira Náutica de Embarcação.
 *
 * O mesmo card é usado na pré-visualização, no download e no envio por webhook,
 * garantindo que o documento exibido seja idêntico ao entregue.
 */

export type CampoCard = { label: string; valor: string }

export type DadosCard = {
  tipo: "cir" | "carteira_nautica" | "carteira_aerea" | "funcional_militar"
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
const COR_AEREA = "#174ea6"
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

  const cor = dados.tipo === "carteira_aerea" ? COR_AEREA : dados.tipo === "carteira_nautica" ? COR_NAUTICA : COR_CIR
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

// Modelo oficial da Identidade Funcional Militar (criado pelo usuário).
// O card é gerado usando ESTA imagem como fundo — sem redesenhar nada —,
// sobrepondo apenas os dados e a foto sobre os campos já impressos no modelo.
const TEMPLATE_FUNCIONAL = "/documentos/identidade-funcional-militar.png"

async function gerarCardFuncionalMilitar(dados: DadosCard): Promise<Blob> {
  const [template, foto] = await Promise.all([
    carregarImagem(TEMPLATE_FUNCIONAL),
    dados.fotoUrl ? carregarImagem(dados.fotoUrl) : Promise.resolve(null),
  ])

  // Usa as dimensões nativas do modelo para que as posições fiquem exatas.
  const L = template?.width ?? 992
  const A = template?.height ?? 654

  const canvas = document.createElement("canvas")
  canvas.width = L * ESCALA
  canvas.height = A * ESCALA
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Não foi possível gerar o card.")
  ctx.scale(ESCALA, ESCALA)
  ctx.textBaseline = "alphabetic"

  // Fundo = o modelo exato enviado pelo usuário.
  if (template) ctx.drawImage(template, 0, 0, L, A)
  else {
    ctx.fillStyle = "#cfe3d8"
    ctx.fillRect(0, 0, L, A)
  }

  const NAVY = "#12305f"

  // Foto do militar dentro do retângulo cinza do modelo (efeito "cover").
  const fx = L * 0.773
  const fy = A * 0.323
  const fw = L * 0.207
  const fh = A * 0.404
  if (foto) {
    ctx.save()
    caminhoArredondado(ctx, fx, fy, fw, fh, 16)
    ctx.clip()
    const escala = Math.max(fw / foto.width, fh / foto.height)
    const lw = foto.width * escala
    const lh = foto.height * escala
    ctx.drawImage(foto, fx + (fw - lw) / 2, fy + (fh - lh) / 2, lw, lh)
    ctx.restore()
  }

  // Escreve o valor de um campo sobre o modelo, na posição do rótulo impresso.
  function valor(
    texto: string,
    x: number,
    y: number,
    tam: number,
    opts?: { center?: boolean; max?: number },
  ) {
    const t = (texto || "").trim()
    if (!t) return
    ctx!.fillStyle = NAVY
    ctx!.font = `600 ${tam}px ${FONTE_SANS}`
    ctx!.textAlign = opts?.center ? "center" : "left"
    const linhas = quebrarLinhas(ctx!, t, opts?.max ?? L * 0.4)
    ctx!.fillText(linhas[0], x, y)
    ctx!.textAlign = "left"
  }

  const campos = dados.campos
  // NOME (abaixo do título impresso)
  valor(dados.titular, L * 0.17, A * 0.235, A * 0.032, { max: L * 0.48 })
  // Assinatura manuscrita derivada do nome completo.
  const assinatura = dados.titular.trim()
  if (assinatura) {
    ctx!.save()
    ctx!.fillStyle = NAVY
    ctx!.globalAlpha = 0.85
    ctx!.font = `italic ${Math.max(18, A * 0.036)}px ${FONTE_SERIF}`
    ctx!.textAlign = "center"
    ctx!.fillText(assinatura, L * 0.5, A * 0.91)
    ctx!.restore()
    ctx!.textAlign = "left"
  }
  // NR REGISTRO (abaixo do rótulo, no topo direito)
  valor(acharCampo(campos, "Nº de registro", "NR Registro", "Numero de registro"), L * 0.915, A * 0.255, A * 0.03, { center: true, max: L * 0.2 })
  // POST / GRAD CAT: o valor fica logo abaixo do título impresso.
  valor(acharCampo(campos, "Posto / Graduação / Categoria", "Posto Grad Cat", "Posto", "Graduação"), L * 0.23, A * 0.495, A * 0.032, { max: L * 0.42 })
  // DATA DE NASCIMENTO (abaixo do rótulo)
  valor(acharCampo(campos, "Data de nascimento", "Data nascimento"), L * 0.035, A * 0.605, A * 0.032, { max: L * 0.2 })
  // Linha inferior: NIP, CPF, RIC (abaixo de cada rótulo)
  valor(acharCampo(campos, "NIP"), L * 0.047, A * 0.72, A * 0.03, { max: L * 0.16 })
  valor(acharCampo(campos, "CPF"), L * 0.232, A * 0.72, A * 0.03, { max: L * 0.18 })
  valor(acharCampo(campos, "RIC"), L * 0.435, A * 0.72, A * 0.03, { max: L * 0.2 })

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
