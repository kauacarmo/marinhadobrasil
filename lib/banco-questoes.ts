import type { Questao } from "@/lib/types"

// Banco de questões de exemplo usado como fallback quando a geração por IA falha.
// Organizado por palavras-chave de tema; cada questão tem 4 alternativas e o índice correto.

const QUESTOES_LEGISLACAO: Questao[] = [
  {
    enunciado:
      "De acordo com a Lei de Segurança do Tráfego Aquaviário (LESTA), qual autoridade é responsável por elaborar as normas para o tráfego aquaviário em águas sob jurisdição nacional?",
    alternativas: [
      "A Autoridade Marítima",
      "A Polícia Federal",
      "O Ministério dos Transportes",
      "A Agência Nacional de Transportes Aquaviários isoladamente",
    ],
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
      "Julgar crimes ambientais em terra",
      "Emitir licenças de pesca industrial em alto-mar",
      "Administrar os portos organizados comercialmente",
    ],
    correta: 0,
  },
  {
    enunciado: "A embarcação que navega sem a devida inscrição na Capitania dos Portos está sujeita a:",
    alternativas: [
      "Apreensão e sanções administrativas",
      "Apenas advertência verbal",
      "Isenção, desde que seja de recreio",
      "Nenhuma penalidade",
    ],
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
]

const QUESTOES_SINALIZACAO: Questao[] = [
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
    enunciado: "A sinalização náutica cardinal 'Norte' indica que águas seguras estão localizadas:",
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
    alternativas: [
      "Listras verticais vermelhas e brancas",
      "Totalmente preta",
      "Amarela com X no topo",
      "Verde e vermelha alternadas",
    ],
    correta: 0,
  },
]

const QUESTOES_ADMINISTRATIVO: Questao[] = [
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
    enunciado: "No editor de texto, o atalho de teclado usualmente utilizado para salvar um documento é:",
    alternativas: ["Ctrl + S", "Ctrl + P", "Ctrl + Z", "Ctrl + X"],
    correta: 0,
  },
  {
    enunciado: "A concordância verbal correta está em:",
    alternativas: [
      "Fazem dois anos que ele partiu — incorreta; o correto é 'Faz dois anos'",
      "Houveram muitos candidatos",
      "Existe muitos problemas",
      "Vão haver reuniões",
    ],
    correta: 0,
  },
  {
    enunciado: "O documento oficial utilizado para comunicação entre órgãos públicos, de caráter formal, é o:",
    alternativas: ["Ofício", "Bilhete", "Recado", "Anúncio"],
    correta: 0,
  },
]

const QUESTOES_GERAIS: Questao[] = [
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
    enunciado: "A salvaguarda da vida humana no mar é uma atribuição diretamente relacionada a qual órgão?",
    alternativas: ["Autoridade Marítima (Marinha do Brasil)", "Corpo de Bombeiros estadual", "Defesa Civil municipal", "Polícia Rodoviária Federal"],
    correta: 0,
  },
  {
    enunciado: "O termo 'aquaviário' refere-se ao profissional que:",
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
]

export function gerarProvaFallback(tema: string, quantidade = 30): Questao[] {
  const t = (tema || "").toLowerCase()

  // Ordena os bancos por relevância ao tema; começa pelo mais aderente.
  let ordenados: Questao[][]
  if (t.includes("sinaliza") || t.includes("náutic") || t.includes("nautic") || t.includes("meteoro")) {
    ordenados = [QUESTOES_SINALIZACAO, QUESTOES_LEGISLACAO, QUESTOES_GERAIS, QUESTOES_ADMINISTRATIVO]
  } else if (
    t.includes("administra") ||
    t.includes("informát") ||
    t.includes("informat") ||
    t.includes("português") ||
    t.includes("portugues")
  ) {
    ordenados = [QUESTOES_ADMINISTRATIVO, QUESTOES_GERAIS, QUESTOES_LEGISLACAO, QUESTOES_SINALIZACAO]
  } else if (
    t.includes("legisla") ||
    t.includes("marítim") ||
    t.includes("maritim") ||
    t.includes("navega") ||
    t.includes("segurança")
  ) {
    ordenados = [QUESTOES_LEGISLACAO, QUESTOES_SINALIZACAO, QUESTOES_GERAIS, QUESTOES_ADMINISTRATIVO]
  } else {
    ordenados = [QUESTOES_GERAIS, QUESTOES_LEGISLACAO, QUESTOES_SINALIZACAO, QUESTOES_ADMINISTRATIVO]
  }

  const combinado = ordenados.flat()
  // Cicla o banco combinado até atingir a quantidade desejada (ex.: 30 questões).
  const prova: Questao[] = []
  for (let i = 0; i < quantidade; i++) {
    prova.push(combinado[i % combinado.length])
  }
  return prova
}
