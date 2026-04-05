import React from 'react'
import { Navbar } from '../components/organisms/Navbar'
import { HeroSection } from '../components/organisms/HeroSection'
import { ServicesGrid } from '../components/organisms/ServicesGrid'
import { ContactFormSection } from '../components/organisms/ContactFormSection'
import { Footer } from '../components/organisms/Footer'

/**
 * Página principal de la Landing Page de Sociedad Brito.
 * Orquesta todos los organismos de la feature landing.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesGrid />
        {/* Aquí podrían ir más secciones como Testimonios o Galería */}
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  )
}
