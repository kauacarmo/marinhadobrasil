import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHero } from "@/components/page-hero"
import { ContatoForm } from "@/components/contato-form"

export const metadata = {
  title: "Contato | Capitania dos Portos de São Paulo",
  description: "Fale com a Capitania dos Portos de São Paulo: telefones, e-mail, endereço e canais de atendimento.",
}

const canais = [
  { icon: Phone, titulo: "Telefone", valor: "0800 000 0000", detalhe: "Atendimento gratuito" },
  { icon: Mail, titulo: "E-mail", valor: "cpsp.secom@marinha.exemplo.br", detalhe: "Resposta em até 48h úteis" },
  { icon: MapPin, titulo: "Endereço", valor: "Av. Mário de Andrade, s/n — Santos/SP", detalhe: "CEP 11010-000" },
  { icon: Clock, titulo: "Horário", valor: "Segunda a sexta, 8h às 17h", detalhe: "Exceto feriados" },
]

const faq = [
  {
    pergunta: "Como acompanho o andamento do meu concurso?",
    resposta:
      "Acesse a página de Concursos para ver o status, e a página de Cronogramas para as datas de cada etapa.",
  },
  {
    pergunta: "Onde encontro os editais e resultados?",
    resposta:
      "Os documentos oficiais ficam nas páginas de Editais e Resultados, atualizadas pela Diretoria de Ensino.",
  },
  {
    pergunta: "Como recebo avisos por e-mail?",
    resposta:
      "Faça o Cadastro do Cidadão para receber notícias, editais e resultados diretamente na sua caixa de entrada.",
  },
]

export default function ContatoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          titulo="Fale Conosco"
          descricao="Tire dúvidas, envie sugestões ou registre uma manifestação junto à Capitania dos Portos de São Paulo."
          migalhas={[{ label: "Início", href: "/" }, { label: "Contato" }]}
        />

        <div className="mx-auto max-w-6xl px-4 py-12">
          {/* Canais */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {canais.map((c) => (
              <div key={c.titulo} className="rounded-lg border border-border bg-card p-5">
                <span className="inline-flex size-11 items-center justify-center rounded-sm bg-secondary text-primary">
                  <c.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-serif text-base font-bold text-primary">{c.titulo}</h2>
                <p className="mt-1 text-sm font-medium text-foreground text-pretty">{c.valor}</p>
                <p className="text-xs text-muted-foreground">{c.detalhe}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {/* Formulário */}
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-primary">Envie sua mensagem</h2>
              </div>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Preencha o formulário e nossa equipe retornará pelo e-mail informado.
              </p>
              <div className="mt-6">
                <ContatoForm />
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary">Perguntas frequentes</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                Talvez sua dúvida já tenha resposta abaixo.
              </p>
              <dl className="mt-6 space-y-4">
                {faq.map((item) => (
                  <div key={item.pergunta} className="rounded-lg border border-border bg-card p-5">
                    <dt className="font-serif text-base font-bold text-primary">{item.pergunta}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.resposta}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
