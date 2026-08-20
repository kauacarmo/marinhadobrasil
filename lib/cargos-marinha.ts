// Postos e graduações da Marinha do Brasil, agrupados por círculo hierárquico.

export const cargosMarinha: { grupo: string; cargos: string[] }[] = [
  {
    grupo: "Órgãos de Direção",
    cargos: ["Estado-Maior da Armada"],
  },
  {
    grupo: "Oficiais-Generais",
    cargos: ["Almirante", "Almirante de Esquadra", "Vice-Almirante", "Contra-Almirante"],
  },
  {
    grupo: "Oficiais Superiores",
    cargos: ["Capitão de Mar e Guerra", "Capitão de Fragata", "Capitão de Corveta"],
  },
  {
    grupo: "Oficiais Intermediários e Subalternos",
    cargos: [
      "Capitão-Tenente",
      "Primeiro-Tenente",
      "Segundo-Tenente",
      "Guarda-Marinha",
      "Aspirante",
    ],
  },
  {
    grupo: "Praças",
    cargos: [
      "Suboficial",
      "Primeiro-Sargento",
      "Segundo-Sargento",
      "Terceiro-Sargento",
      "Cabo",
      "Marinheiro",
      "Grumete",
    ],
  },
  {
    grupo: "Comunicação Social",
    cargos: ["Publicitário"],
  },
  {
    grupo: "Administrativo",
    cargos: ["Administrador", "Operador"],
  },
]

// Cargos com acesso restrito no painel (veem apenas a área de Notícias).
export const cargosRestritos: string[] = ["Publicitário"]

// Lista achatada, útil para validação e selects simples.
export const todosOsCargos: string[] = cargosMarinha.flatMap((g) => g.cargos)
