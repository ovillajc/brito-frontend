'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/src/core/presentation/components/ui/button'

/**
 * Navbar principal con navegación suave y branding.
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-3">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-zinc-900 uppercase">
            Sociedad <span className="text-orange-600">Brito</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#servicios" className="text-sm font-medium text-zinc-600 hover:text-green-700 transition-colors">Servicios</Link>
          <Link href="#contacto" className="text-sm font-medium text-zinc-600 hover:text-green-700 transition-colors">Contacto</Link>
          <Button variant="orange" size="sm" className="rounded-full">
            Cotizar Ahora
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
