"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Search, ShieldCheck } from "lucide-react"
import { Brasao } from "@/components/brasao"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/concursos", label: "Concursos" },
  { href: "/noticias", label: "Notícias" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/contato", label: "Contato" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Faixa superior governamental */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <span className="hidden sm:inline">Marinha do Brasil • Comando do 8º Distrito Naval</span>
          <div className="flex items-center gap-4">
            <Link href="/acessibilidade" className="hover:text-accent">
              Acessibilidade
            </Link>
            <Link href="/mapa-do-site" className="hover:text-accent">
              Mapa do Site
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-sm bg-accent px-2 py-0.5 font-semibold text-accent-foreground hover:opacity-90"
            >
              <ShieldCheck className="size-3.5" />
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Brasao className="size-12" />
            <span className="leading-tight">
              <span className="block font-serif text-lg font-bold text-primary sm:text-xl">
                CPSP
              </span>
              <span className="block text-xs text-muted-foreground sm:text-sm">
                Capitania dos Portos de São Paulo
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const ativo = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary hover:text-primary",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <button
              className="ml-1 inline-flex size-9 items-center justify-center rounded-sm text-foreground hover:bg-secondary"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </button>
          </nav>

          <button
            className="inline-flex size-10 items-center justify-center rounded-sm border border-border lg:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
          >
            {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Menu mobile */}
        {aberto && (
          <nav
            className="border-t border-border bg-card lg:hidden"
            aria-label="Navegação principal móvel"
          >
            <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setAberto(false)}
                  className={cn(
                    "rounded-sm px-3 py-2.5 text-sm font-medium",
                    pathname === link.href
                      ? "bg-secondary text-primary"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
