import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Linkedin } from 'lucide-react'

/**
 * Footer de Transportes Brito con datos reales:
 * RFC, domicilio fiscal, canales de contacto y subempresa Barita de la Chontalpa.
 */
export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0f0d] text-stone-400 pt-20 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand column */}
          <div className="col-span-1 space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5">
                  <Image
                    src="/assets/images/logo.png"
                    alt="Logo Transportes Brito"
                    fill
                    className="object-contain p-0.5"
                    sizes="40px"
                  />
                </div>
                <span className="text-white font-black uppercase tracking-tight text-base">
                  Transportes <span className="text-[#e07020]">Brito</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-500">
                Especialistas en transporte de carga a granel en tolvas presurizadas. Líderes en logística industrial del sureste de México desde 1998.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Subempresa</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#e07020] rounded-md flex items-center justify-center">
                  <span className="text-white font-black text-xs">BC</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">Barita de la Chontalpa</p>
                  <p className="text-stone-500 text-[10px]">Barichon SA de CV</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Navegación</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '#nosotros', label: 'Quiénes Somos' },
                { href: '#servicios', label: 'Servicios' },
                { href: '#proceso', label: 'Proceso Productivo' },
                { href: '#seguridad', label: 'Seguridad SSPA' },
                { href: '#clientes', label: 'Clientes' },
                { href: '#organigrama', label: 'Organigrama' },
                { href: '#contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Contacto Directo</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Gerencia</p>
                <a href="tel:9171281337" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#e07020]" />
                  joseaaron_88@hotmail.com
                </a>
              </li>
              <li>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Logística y Tráfico</p>
                <a href="tel:9361103979" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-[#e07020]" />
                  936-110-3979
                </a>
              </li>
              <li>
                <a href="mailto:logistica.trafico@tbrito.com.mx" className="flex items-center gap-2 hover:text-white transition-colors break-all">
                  <Mail className="w-4 h-4 text-[#e07020] flex-shrink-0" />
                  logistica.trafico@tbrito.com.mx
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e07020] mt-0.5 flex-shrink-0" />
                <span className="text-xs leading-relaxed">
                  Ctra. Coatzacoalcos-Cárdenas Km 113.700<br />
                  Arroyo Hondo, Huimanguillo, Tab.<br />
                  C.P. 86400
                </span>
              </li>
            </ul>
          </div>

          {/* Legal + Social */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Legal</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Razón Social</p>
                <p className="text-white text-xs mt-0.5">José Aarón Brito Frías</p>
              </li>
              {/* <li>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">RFC</p>
                <p className="text-white text-xs mt-0.5">BIFA 880916IP8</p>
              </li> */}
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">Aviso de Privacidad</Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
              </li>
            </ul>

            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1a5c3a] hover:border-[#1a5c3a] transition-all text-stone-500 hover:text-white"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1a5c3a] hover:border-[#1a5c3a] transition-all text-stone-500 hover:text-white"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600">
          <p>© {year} Transportes Brito · Barita de la Chontalpa. Todos los derechos reservados.</p>
          <p>Huimanguillo, Tabasco, México</p>
        </div>
      </div>
    </footer>
  )
}
