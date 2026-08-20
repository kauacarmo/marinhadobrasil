import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Acesso Restrito | Capitania dos Portos de São Paulo",
  description: "Área administrativa da Capitania dos Portos de São Paulo — acesso restrito a servidores autorizados.",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Image
            src="/marinha-ultrawide.png"
            alt="Marinha do Brasil — Protegendo nossas riquezas, cuidando da nossa gente"
            width={1600}
            height={430}
            className="h-auto w-full"
            priority
          />
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
            Voltar ao portal público
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Marinha do Brasil • Comando do 8º Distrito Naval
        </p>
      </div>
    </main>
  )
}
