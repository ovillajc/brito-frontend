'use client'

import  { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { BrandLogo } from '@/src/core/presentation/components/ui/brand-logo'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

const NAV_LINKS = [
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#seguridad', label: 'Seguridad' },
  { href: '#clientes', label: 'Clientes' },
  { href: '#contacto', label: 'Contacto' },
]

/**
 * Navbar principal de Transportes Brito.
 * Incluye menú responsive, branding real y efectos de scroll.
 */
export const Navbar = () => {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-400 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-stone-200 py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <BrandLogo theme={isScrolled ? 'dark' : 'light'} />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#e07020] ${
                  isScrolled ? 'text-stone-600' : 'text-white/90'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* <Button
              id="nav-cta"
              variant="orange"
              size="sm"
              className="rounded-full px-5 shadow-md"
              onClick={() => {
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Solicitar Cotización
            </Button> */}
            <Button
              variant="green"
              size="sm"
              className="rounded-full px-5 shadow-md"
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
            >
              Acceder
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            id="nav-mobile-toggle"
            className={`lg:hidden transition-colors ${isScrolled ? 'text-stone-800' : 'text-white'}`}
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-[68px] inset-x-0 z-40 bg-white border-b border-stone-200 shadow-xl lg:hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-base font-medium text-stone-700 hover:text-[#1a5c3a] py-2 border-b border-stone-100 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-2">
                <Button
                  variant="green"
                  className="rounded-full w-full"
                  onClick={() => {
                    setIsMobileOpen(false)
                    router.push(isAuthenticated ? '/dashboard' : '/login')
                  }}
                >
                  Acceder
                </Button>
                <Button
                  variant="orange"
                  className="rounded-full w-full"
                  onClick={() => {
                    setIsMobileOpen(false)
                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Solicitar Cotización
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
