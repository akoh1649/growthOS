import { Header } from "@/components/layout/Header"
import { Hero } from "@/components/layout/Hero"
import { AgentsSection } from "@/components/agents/AgentGrid"
import { FeaturesSection } from "@/components/layout/FeaturesSection"
import { PricingSection } from "@/components/layout/PricingSection"
import { CTASection } from "@/components/layout/CTASection"
import { Footer } from "@/components/layout/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AgentsSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
