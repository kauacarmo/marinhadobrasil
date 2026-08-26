import type { Questao } from "@/lib/types"

// Gerador de prova usado quando a geração por IA está indisponível.
// As questões são derivadas do TÍTULO e da DESCRIÇÃO do concurso:
//  1) questões contextuais montadas com os dados reais do certame;
//  2) bancos temáticos escolhidos por aderência ao título/descrição.

export type ContextoProva = {
  titulo: string
  cargo?: string | null
  descricao?: string | null
  tema?: string | null
  vagas?: number | null
  escolaridade?: string | null
  local?: string | null
}

function normalizar(texto: string): string {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const PALAVRAS_PARADA = new Set([
  "de", "da", "do", "das", "dos", "para", "com", "em", "no", "na", "nos", "nas", "o", "a", "os", "as",
  "um", "uma", "que", "por", "ao", "aos", "sobre", "entre", "seu", "sua", "pelo", "pela", "como",
  "concurso", "publico", "processo", "seletivo", "edital", "vagas", "vaga", "marinha", "brasil",
])

function termosRelevantes(texto: string): string[] {
  const vistos = new Set<string>()
  const saida: string[] = []
  for (const bruto of (texto || "").split(/[^\p{L}\p{N}]+/u)) {
    const t = bruto.trim()
    if (t.length < 4) continue
    const n = normalizar(t)
    if (PALAVRAS_PARADA.has(n) || vistos.has(n)) continue
    vistos.add(n)
    saida.push(t)
  }
  return saida
}

// Monta as alternativas descartando distratores que coincidam com a resposta correta.
function alternativasCom(correta: string, distratores: string[]): string[] | null {
  const alvo = normalizar(correta)
  const validos = distratores.filter((d) => normalizar(d) !== alvo)
  if (!correta.trim() || validos.length < 3) return null
  return [correta, ...validos.slice(0, 3)]
}

// ---------------------------------------------------------------------------
// Questões montadas a partir dos dados reais do concurso (título e descrição)
// ---------------------------------------------------------------------------
function questoesContextuais(ctx: ContextoProva): Questao[] {
  const titulo = (ctx.titulo || "").trim()
  const cargo = (ctx.cargo || "").trim()
  const descricao = (ctx.descricao || "").trim()
  const tema = (ctx.tema || "").trim()
  const escolaridade = (ctx.escolaridade || "").trim()
  const local = (ctx.local || "").trim()
  const rotulo = titulo || "deste certame"
  const out: Questao[] = []

  const adicionar = (enunciado: string, correta: string, distratores: string[]) => {
    const alternativas = alternativasCom(correta, distratores)
    if (alternativas) out.push({ enunciado, alternativas, correta: 0 })
  }

  if (cargo) {
    adicionar(`O concurso “${rotulo}” destina-se ao provimento de vagas para qual cargo?`, cargo, [
      "Auditor Fiscal da Receita Federal",
      "Agente de Trânsito Municipal",
      "Professor da Educação Básica",
      "Fiscal de Posturas Urbanas",
    ])
  }

  if (descricao) {
    const primeira = descricao.split(/(?<=[.!?])\s+/)[0]?.trim() || descricao
    if (primeira.length > 12) {
      adicionar(
        `De acordo com a descrição oficial do concurso “${rotulo}”, qual afirmativa está correta?`,
        primeira.length > 190 ? `${primeira.slice(0, 187)}...` : primeira,
        [
          "O certame não prevê qualquer etapa de prova objetiva de conhecimentos.",
          "A participação é restrita a militares já reformados ou aposentados.",
          "As vagas destinam-se exclusivamente a atividades desempenhadas no exterior.",
        ],
      )
    }
  }

  if (tema) {
    adicionar(`O conteúdo programático previsto para a prova do concurso “${rotulo}” contempla:`, tema, [
      "Direito Tributário Internacional e Comércio Exterior",
      "Zootecnia e Manejo de Pastagens",
      "História da Arte Contemporânea",
    ])
  }

  if (typeof ctx.vagas === "number" && ctx.vagas > 0) {
    const v = ctx.vagas
    adicionar(`Conforme o edital do concurso “${rotulo}”, o número de vagas oferecidas é:`, `${v} vaga(s)`, [
      `${v + 3} vaga(s)`,
      `${v + 7} vaga(s)`,
      `${v + 15} vaga(s)`,
    ])
  }

  if (escolaridade) {
    adicionar(`A escolaridade mínima exigida para concorrer ao concurso “${rotulo}” é:`, escolaridade, [
      "Pós-doutorado concluído na área naval",
      "Alfabetização, sem exigência de conclusão de série",
      "Curso técnico em agropecuária",
    ])
  }

  if (local) {
    adicionar(`O local indicado no edital do concurso “${rotulo}” é:`, local, [
      "Brasília — Distrito Federal",
      "Manaus — Amazonas",
      "Porto Alegre — Rio Grande do Sul",
    ])
  }

  // Questões apoiadas nos termos extraídos do título e da descrição.
  const termos = termosRelevantes(`${titulo} ${descricao}`)
  if (termos[0]) {
    adicionar(`Qual dos termos a seguir integra o objeto do concurso “${rotulo}”?`, termos[0], [
      "Radiodifusão comunitária",
      "Pecuária leiteira",
      "Urbanismo rodoviário",
    ])
  }
  if (termos[1]) {
    adicionar(
      `No contexto do concurso “${rotulo}”, o termo “${termos[1]}” está diretamente associado a:`,
      "Às atribuições e ao conteúdo previstos neste certame",
      [
        "À concessão de aposentadoria por invalidez permanente",
        "Ao licenciamento ambiental de obras rodoviárias",
        "À arrecadação de tributos municipais",
      ],
    )
  }

  return out
}

// ---------------------------------------------------------------------------
// Bancos temáticos — escolhidos por aderência ao título/descrição do concurso
// ---------------------------------------------------------------------------
type Topico = { chaves: string[]; questoes: Questao[] }

const TOPICOS: Topico[] = [
  {
    chaves: ["legisla", "maritim", "navega", "seguranca", "lesta", "normam", "aquaviari", "capitania", "trafego"],
    questoes: [
      {
        enunciado:
          "De acordo com a Lei de Segurança do Tráfego Aquaviário (LESTA), qual autoridade é responsável por elaborar as normas para o tráfego aquaviário em águas sob jurisdição nacional?",
        alternativas: ["A Autoridade Marítima", "A Polícia Federal", "O Ministério dos Transportes", "A ANTAQ isoladamente"],
        correta: 0,
      },
      {
        enunciado: "O documento que habilita o aquaviário ao exercício de suas funções a bordo é denominado:",
        alternativas: ["Caderneta de Inscrição e Registro (CIR)", "Carteira de Trabalho", "Passaporte Náutico", "Título de Eleitor Marítimo"],
        correta: 0,
      },
      {
        enunciado: "Compete às Capitanias dos Portos, entre outras atribuições:",
        alternativas: [
          "Fiscalizar o cumprimento da legislação de segurança do tráfego aquaviário",
          "Julgar crimes ambientais ocorridos em terra",
          "Emitir licenças de pesca industrial em alto-mar",
          "Administrar comercialmente os portos organizados",
        ],
        correta: 0,
      },
      {
        enunciado: "A embarcação que navega sem a devida inscrição na Capitania dos Portos está sujeita a:",
        alternativas: ["Apreensão e sanções administrativas", "Apenas advertência verbal", "Isenção, desde que seja de recreio", "Nenhuma penalidade"],
        correta: 0,
      },
      {
        enunciado: "As Normas da Autoridade Marítima (NORMAM) têm como finalidade principal:",
        alternativas: [
          "Regulamentar procedimentos de segurança e ordenamento do tráfego aquaviário",
          "Definir tarifas portuárias",
          "Estabelecer o câmbio para importação de embarcações",
          "Regular o transporte rodoviário de cargas",
        ],
        correta: 0,
      },
      {
        enunciado: "A investigação de acidentes e fatos da navegação é atribuição, em âmbito administrativo, do:",
        alternativas: ["Tribunal Marítimo", "Tribunal de Contas da União", "Conselho Nacional de Justiça", "Superior Tribunal Militar"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["sinaliza", "nautic", "balizamento", "meteoro", "farol", "boia", "carta", "hidrograf"],
    questoes: [
      {
        enunciado: "No sistema de balizamento marítimo IALA (Região B), a boia lateral de cor vermelha indica:",
        alternativas: [
          "O bordo de boreste (direito) ao entrar no porto",
          "O bordo de bombordo (esquerdo) ao entrar no porto",
          "Perigo isolado",
          "Águas seguras",
        ],
        correta: 0,
      },
      {
        enunciado: "Uma marca de perigo isolado é caracterizada por:",
        alternativas: [
          "Cor preta com faixa(s) horizontal(is) vermelha(s) e duas esferas negras no topo",
          "Cor amarela com cruz no topo",
          "Cor verde com cone no topo",
          "Listras verticais vermelhas e brancas",
        ],
        correta: 0,
      },
      {
        enunciado: "A sinalização náutica cardinal “Norte” indica que as águas seguras estão localizadas:",
        alternativas: ["Ao norte da marca", "Ao sul da marca", "A leste da marca", "A oeste da marca"],
        correta: 0,
      },
      {
        enunciado: "O farol é um sinal de auxílio à navegação classificado como:",
        alternativas: ["Sinal luminoso fixo de grande alcance", "Sinal sonoro exclusivo", "Boia flutuante cardinal", "Sinal de manobra"],
        correta: 0,
      },
      {
        enunciado: "As marcas de águas seguras (canal navegável) apresentam a coloração:",
        alternativas: ["Listras verticais vermelhas e brancas", "Totalmente preta", "Amarela com X no topo", "Verde e vermelha alternadas"],
        correta: 0,
      },
      {
        enunciado: "Na carta náutica, a profundidade indicada em determinado ponto é chamada de:",
        alternativas: ["Sondagem", "Azimute", "Declinação", "Rumo verdadeiro"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["administra", "gestao", "auxiliar", "escriturari", "atendimento", "protocolo", "arquivo"],
    questoes: [
      {
        enunciado: "Entre os princípios da Administração Pública previstos no art. 37 da Constituição Federal NÃO se inclui:",
        alternativas: ["Lucratividade", "Legalidade", "Impessoalidade", "Publicidade"],
        correta: 0,
      },
      {
        enunciado: "O ato administrativo que se presume verdadeiro e legítimo até prova em contrário goza do atributo da:",
        alternativas: ["Presunção de legitimidade", "Discricionariedade absoluta", "Irrevogabilidade", "Onerosidade"],
        correta: 0,
      },
      {
        enunciado: "O documento oficial utilizado para comunicação formal entre órgãos públicos é o:",
        alternativas: ["Ofício", "Bilhete", "Recado", "Anúncio"],
        correta: 0,
      },
      {
        enunciado: "A anulação de um ato administrativo ilegal produz efeitos, como regra:",
        alternativas: ["Retroativos (ex tunc)", "Somente futuros (ex nunc)", "Apenas após dez anos", "Nenhum efeito jurídico"],
        correta: 0,
      },
      {
        enunciado: "No serviço público, o dever de dar transparência aos atos praticados decorre do princípio da:",
        alternativas: ["Publicidade", "Autotutela", "Especialidade", "Continuidade"],
        correta: 0,
      },
      {
        enunciado: "A guarda e a organização de documentos que ainda podem ser consultados com frequência corresponde ao arquivo:",
        alternativas: ["Corrente", "Permanente", "Intermediário morto", "Descartável"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["portugues", "redacao", "interpretacao", "lingua", "gramatica"],
    questoes: [
      {
        enunciado: "Assinale a alternativa em que a concordância verbal está correta:",
        alternativas: ["Faz dois anos que ele partiu", "Fazem dois anos que ele partiu", "Houveram muitos candidatos", "Existe muitos problemas"],
        correta: 0,
      },
      {
        enunciado: "Na frase “Os militares chegaram cedo”, o termo destacado “Os militares” exerce a função de:",
        alternativas: ["Sujeito", "Objeto direto", "Adjunto adverbial", "Predicativo do objeto"],
        correta: 0,
      },
      {
        enunciado: "A palavra “embarcação” é classificada morfologicamente como:",
        alternativas: ["Substantivo", "Adjetivo", "Advérbio", "Conjunção"],
        correta: 0,
      },
      {
        enunciado: "Em “Estudou muito, portanto foi aprovado”, a conjunção destacada expressa ideia de:",
        alternativas: ["Conclusão", "Oposição", "Condição", "Finalidade"],
        correta: 0,
      },
      {
        enunciado: "Assinale a alternativa corretamente acentuada:",
        alternativas: ["Náutico", "Nautico", "Nautíco", "Náutíco"],
        correta: 0,
      },
      {
        enunciado: "A crase está empregada corretamente em:",
        alternativas: ["Refiro-me à embarcação avariada", "Refiro-me à navio avariado", "Vou à pé até o cais", "Entreguei o ofício à ele"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["matematic", "raciocinio", "logic", "calculo", "estatistic"],
    questoes: [
      {
        enunciado: "Uma embarcação percorre 120 km em 3 horas, mantendo velocidade constante. Sua velocidade média é de:",
        alternativas: ["40 km/h", "30 km/h", "60 km/h", "45 km/h"],
        correta: 0,
      },
      {
        enunciado: "Em um grupo de 40 candidatos, 25% foram aprovados. O número de aprovados é:",
        alternativas: ["10", "8", "12", "15"],
        correta: 0,
      },
      {
        enunciado: "O valor de 15% de R$ 2.000,00 corresponde a:",
        alternativas: ["R$ 300,00", "R$ 200,00", "R$ 150,00", "R$ 350,00"],
        correta: 0,
      },
      {
        enunciado: "Se todos os fuzileiros são militares e alguns militares são mergulhadores, conclui-se necessariamente que:",
        alternativas: [
          "Todos os fuzileiros são militares",
          "Todos os militares são fuzileiros",
          "Todos os mergulhadores são fuzileiros",
          "Nenhum fuzileiro é mergulhador",
        ],
        correta: 0,
      },
      {
        enunciado: "A média aritmética entre 6, 8 e 10 é:",
        alternativas: ["8", "7", "9", "24"],
        correta: 0,
      },
      {
        enunciado: "Um trajeto de 5 km equivale, aproximadamente, a quantas milhas náuticas (1 milha ≈ 1,852 km)?",
        alternativas: ["2,7 milhas náuticas", "5,0 milhas náuticas", "9,3 milhas náuticas", "1,2 milha náutica"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["informatic", "computa", "digital", "sistema", "dados", "tecnologia"],
    questoes: [
      {
        enunciado: "No editor de texto, o atalho de teclado usualmente utilizado para salvar um documento é:",
        alternativas: ["Ctrl + S", "Ctrl + P", "Ctrl + Z", "Ctrl + X"],
        correta: 0,
      },
      {
        enunciado: "Em uma planilha eletrônica, a função que soma um intervalo de células é:",
        alternativas: ["SOMA", "MÉDIA", "SE", "PROCV"],
        correta: 0,
      },
      {
        enunciado: "O componente responsável pelo processamento das instruções em um computador é a:",
        alternativas: ["CPU", "Fonte de alimentação", "Impressora", "Memória externa USB"],
        correta: 0,
      },
      {
        enunciado: "A prática de proteger informações contra acesso não autorizado é chamada de:",
        alternativas: ["Segurança da informação", "Compactação de arquivos", "Formatação lógica", "Indexação de discos"],
        correta: 0,
      },
      {
        enunciado: "O protocolo utilizado para navegação segura em páginas web é o:",
        alternativas: ["HTTPS", "FTP", "SMTP", "POP3"],
        correta: 0,
      },
      {
        enunciado: "Um backup tem como finalidade principal:",
        alternativas: ["Permitir a recuperação de dados em caso de perda", "Acelerar o processador", "Aumentar o brilho da tela", "Instalar drivers de rede"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["fuzileiro", "militar", "praca", "soldado", "combate", "anfibi", "operacional", "patrulha", "hierarquia"],
    questoes: [
      {
        enunciado: "Os pilares fundamentais das instituições militares, previstos constitucionalmente, são:",
        alternativas: ["Hierarquia e disciplina", "Autonomia e livre iniciativa", "Paridade e isonomia", "Publicidade e eficiência"],
        correta: 0,
      },
      {
        enunciado: "O Corpo de Fuzileiros Navais é a força da Marinha do Brasil especializada em:",
        alternativas: ["Operações anfíbias", "Controle do espaço aéreo nacional", "Patrulhamento de rodovias federais", "Fiscalização tributária aduaneira"],
        correta: 0,
      },
      {
        enunciado: "Na Marinha do Brasil, o círculo hierárquico que antecede o de Oficiais é o de:",
        alternativas: ["Praças", "Servidores civis", "Conscritos estrangeiros", "Estagiários administrativos"],
        correta: 0,
      },
      {
        enunciado: "A continência é uma manifestação de:",
        alternativas: ["Respeito e cortesia militar", "Sanção disciplinar", "Promoção por merecimento", "Licença para tratamento de saúde"],
        correta: 0,
      },
      {
        enunciado: "O documento que disciplina as transgressões e sanções aplicáveis aos militares da Marinha é o:",
        alternativas: ["Regulamento Disciplinar para a Marinha (RDM)", "Código de Defesa do Consumidor", "Estatuto da Cidade", "Regimento Interno das Capitanias"],
        correta: 0,
      },
      {
        enunciado: "A patrulha naval tem como objetivo principal:",
        alternativas: [
          "Fiscalizar e garantir a segurança nas águas jurisdicionais brasileiras",
          "Realizar o transporte comercial de cargas",
          "Administrar terminais aeroportuários",
          "Executar obras de saneamento urbano",
        ],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["saude", "enfermag", "medic", "odontolog", "farmac", "primeiros socorros", "biolog"],
    questoes: [
      {
        enunciado: "Em um atendimento de primeiros socorros a vítima inconsciente, a primeira conduta é:",
        alternativas: ["Verificar a responsividade e chamar ajuda", "Oferecer água imediatamente", "Aplicar medicação analgésica", "Transportar sozinho a vítima"],
        correta: 0,
      },
      {
        enunciado: "A lavagem das mãos, em ambiente de saúde, tem como principal finalidade:",
        alternativas: ["Prevenir infecções cruzadas", "Reduzir o consumo de energia", "Substituir o uso de luvas estéreis", "Acelerar a cicatrização de feridas"],
        correta: 0,
      },
      {
        enunciado: "A parada cardiorrespiratória exige, prioritariamente:",
        alternativas: ["Início imediato das compressões torácicas", "Aplicação de compressas frias", "Administração de soro caseiro", "Elevação dos membros inferiores"],
        correta: 0,
      },
      {
        enunciado: "Os sinais vitais avaliados rotineiramente incluem:",
        alternativas: [
          "Pressão arterial, pulso, respiração e temperatura",
          "Peso, altura e cor dos olhos",
          "Acuidade visual e auditiva apenas",
          "Somente a temperatura corporal",
        ],
        correta: 0,
      },
      {
        enunciado: "O afogamento em ambiente aquático caracteriza-se, essencialmente, por:",
        alternativas: ["Insuficiência respiratória por submersão", "Fratura exposta de membros", "Hipertensão arterial crônica", "Reação alérgica alimentar"],
        correta: 0,
      },
      {
        enunciado: "O uso de equipamentos de proteção individual (EPI) na assistência à saúde é:",
        alternativas: ["Obrigatório conforme o risco da atividade", "Facultativo em qualquer situação", "Restrito a médicos", "Proibido em ambientes embarcados"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["tecnic", "engenhar", "mecanic", "eletric", "manutenc", "maquinas", "motor", "eletron"],
    questoes: [
      {
        enunciado: "A manutenção realizada para evitar falhas antes que elas ocorram é classificada como:",
        alternativas: ["Preventiva", "Corretiva emergencial", "Preditiva por quebra", "Improvisada"],
        correta: 0,
      },
      {
        enunciado: "A unidade de medida da corrente elétrica no Sistema Internacional é o:",
        alternativas: ["Ampère", "Volt", "Watt", "Ohm"],
        correta: 0,
      },
      {
        enunciado: "Em um motor de combustão interna a diesel, a ignição da mistura ocorre por:",
        alternativas: ["Compressão do ar aquecido", "Centelha da vela de ignição", "Injeção de água pressurizada", "Descarga eletrostática externa"],
        correta: 0,
      },
      {
        enunciado: "A Lei de Ohm relaciona corretamente as grandezas:",
        alternativas: ["Tensão, corrente e resistência", "Massa, volume e densidade", "Força, área e tempo", "Potência, brilho e cor"],
        correta: 0,
      },
      {
        enunciado: "O instrumento utilizado para medir a pressão de um fluido em uma tubulação é o:",
        alternativas: ["Manômetro", "Anemômetro", "Paquímetro", "Termômetro clínico"],
        correta: 0,
      },
      {
        enunciado: "O aterramento elétrico de uma instalação tem como função principal:",
        alternativas: ["Proteger pessoas e equipamentos contra choques e sobretensões", "Aumentar a potência do circuito", "Reduzir o custo do consumo", "Elevar a tensão da rede"],
        correta: 0,
      },
    ],
  },
  {
    chaves: ["historia", "atualidades", "geografia", "cidadania", "constituicao", "sociedade"],
    questoes: [
      {
        enunciado: "A Marinha do Brasil é uma das Forças Armadas e tem como uma de suas atribuições constitucionais:",
        alternativas: [
          "A defesa da Pátria e a garantia dos poderes constitucionais",
          "A arrecadação de impostos federais",
          "A administração do sistema penitenciário",
          "A fiscalização do trânsito rodoviário",
        ],
        correta: 0,
      },
      {
        enunciado: "A salvaguarda da vida humana no mar é atribuição diretamente relacionada a qual órgão?",
        alternativas: ["Autoridade Marítima (Marinha do Brasil)", "Corpo de Bombeiros estadual", "Defesa Civil municipal", "Polícia Rodoviária Federal"],
        correta: 0,
      },
      {
        enunciado: "O termo “aquaviário” refere-se ao profissional que:",
        alternativas: [
          "Exerce atividade a bordo de embarcações ou em apoio a elas",
          "Trabalha exclusivamente em terra firme",
          "Pilota aeronaves militares",
          "Opera trens de carga",
        ],
        correta: 0,
      },
      {
        enunciado: "A sigla CPSP, no contexto deste portal, refere-se a:",
        alternativas: [
          "Capitania dos Portos de São Paulo",
          "Comando Portuário de Santos e Praias",
          "Centro de Pesquisa em Sinalização Pública",
          "Conselho Público de Segurança Portuária",
        ],
        correta: 0,
      },
      {
        enunciado: "A jurisdição de uma Capitania dos Portos abrange principalmente:",
        alternativas: [
          "As águas e a orla marítima/fluvial de sua área de responsabilidade",
          "O espaço aéreo nacional",
          "As rodovias federais do estado",
          "As fronteiras terrestres do país",
        ],
        correta: 0,
      },
      {
        enunciado: "A Amazônia Azul corresponde a:",
        alternativas: [
          "A vasta área marítima sob jurisdição brasileira",
          "Uma reserva florestal no norte do país",
          "Um programa de irrigação do semiárido",
          "Uma rota aérea internacional",
        ],
        correta: 0,
      },
    ],
  },
]

// Embaralha as alternativas de forma determinística, para que a resposta correta
// não fique sempre na primeira letra.
function embaralharAlternativas(q: Questao, semente: number): Questao {
  let s = (semente % 2147483647) + 1
  const proximo = () => {
    s = (s * 48271) % 2147483647
    return s / 2147483647
  }
  const indices = q.alternativas.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(proximo() * (i + 1))
    const tmp = indices[i]
    indices[i] = indices[j]
    indices[j] = tmp
  }
  return {
    enunciado: q.enunciado,
    alternativas: indices.map((i) => q.alternativas[i]),
    correta: indices.indexOf(q.correta),
  }
}

function semelhanteDe(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 2147483647
  return h
}

export function gerarProvaFallback(contexto: ContextoProva | string, quantidade = 30): Questao[] {
  // Compatível com a chamada antiga, que passava apenas o tema.
  const ctx: ContextoProva = typeof contexto === "string" ? { titulo: "", tema: contexto } : contexto

  const titulo = (ctx.titulo || "").trim()
  const descricao = (ctx.descricao || "").trim()
  const cargo = (ctx.cargo || "").trim()
  const tema = (ctx.tema || "").trim()

  // O título e a descrição pesam mais na escolha dos temas do que o campo de tema.
  const alvo = normalizar(`${titulo} ${titulo} ${descricao} ${descricao} ${cargo} ${tema}`)

  const ordenados = TOPICOS.map((t) => {
    let pontos = 0
    for (const chave of t.chaves) if (alvo.includes(chave)) pontos++
    return { t, pontos }
  })
    .sort((a, b) => b.pontos - a.pontos)
    .map((x) => x.t)

  // Questões do próprio concurso primeiro, depois os temas mais aderentes.
  const combinado: Questao[] = [...questoesContextuais(ctx), ...ordenados.flatMap((t) => t.questoes)]

  // Remove enunciados repetidos e limita à quantidade pedida.
  const vistos = new Set<string>()
  const prova: Questao[] = []
  const semente = semelhanteDe(normalizar(`${titulo}${cargo}`) || "prova")
  for (const q of combinado) {
    if (prova.length >= quantidade) break
    const chave = normalizar(q.enunciado).replace(/\s+/g, " ").trim()
    if (!chave || vistos.has(chave)) continue
    vistos.add(chave)
    prova.push(embaralharAlternativas(q, semente + prova.length * 7919))
  }

  return prova
}
