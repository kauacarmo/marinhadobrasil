import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SimPublic } from "@/components/sim/sim-public"

export const metadata = { title: "SIM — Sistema de Identificação da Marinha" }

export default function SimPage() {
  return <><SiteHeader /><main><SimPublic /></main><SiteFooter /></>
}
