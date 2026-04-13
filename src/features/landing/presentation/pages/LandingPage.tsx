import React from 'react'
import { Navbar } from '../components/organisms/Navbar'
import { HeroSection } from '../components/organisms/HeroSection'
import { AboutSection } from '../components/organisms/AboutSection'
import { ServicesGrid } from '../components/organisms/ServicesGrid'
import { ProcessSection } from '../components/organisms/ProcessSection'
import { SafetySection } from '../components/organisms/SafetySection'
import { ClientsSection } from '../components/organisms/ClientsSection'
import { OrgChartSection } from '../components/organisms/OrgChartSection'
import { ContactFormSection } from '../components/organisms/ContactFormSection'
import { Footer } from '../components/organisms/Footer'

/**
 * Página principal de Transportes Brito / Barita de la Chontalpa.
 * Orquesta todas las secciones del módulo landing en el orden correcto.
 *
 * Secciones:
 * 1. Hero       — Imagen real de flota, CTAs principales
 * 2. About      — Quiénes somos, misión, visión, valores, historia
 * 3. Services   — Transporte a Granel + Barita de la Chontalpa
 * 4. Process    — Cadena de valor: extracción → entrega
 * 5. Safety     — SSMA y certificaciones EMMA
 * 6. Clients    — 6 clientes destacados + ticker
 * 7. OrgChart   — Estructura organizacional completa
 * 8. Contact    — Formulario + datos de contacto reales
 * 9. Footer     — Branding, legal, redes
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#1a5c3a]/20 selection:text-[#1a5c3a]">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesGrid />
        <ProcessSection />
        <SafetySection />
        <ClientsSection />
        <OrgChartSection />
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  )
}
