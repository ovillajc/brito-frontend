import React from 'react'
import Link from 'next/link'
import { Facebook, Linkedin, Mail, Twitter } from 'lucide-react'

/**
 * Footer de la Landing Page.
 * Información legal, enlaces rápidos y redes sociales en un esquema de color claro.
 */
export const Footer = () => {
  return (
    <footer className="bg-zinc-50 text-zinc-900 py-20 border-t border-zinc-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-600">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 uppercase">
                Sociedad <span className="text-orange-600">Brito</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Líderes en logística integral y suministro industrial en el sureste de México. Solidez y confianza en cada operación.
            </p>
          </div>

          <div>
            <h4 className="text-zinc-900 font-bold mb-6">Navegación</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#servicios" className="hover:text-green-700 transition-colors">Servicios</Link></li>
              <li><Link href="#contacto" className="hover:text-green-700 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-900 font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacidad" className="hover:text-green-700 transition-colors">Aviso de Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-green-700 transition-colors">Términos y Condiciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-900 font-bold mb-6">Redes Sociales</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-green-700 hover:text-white transition-all text-zinc-600">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-green-700 hover:text-white transition-all text-zinc-600">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-green-700 hover:text-white transition-all text-zinc-600">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Sociedad Brito. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>contacto@sociedadbrito.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
