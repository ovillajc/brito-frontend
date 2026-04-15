import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  theme?: 'light' | 'dark'
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

export const BrandLogo = ({ theme = 'dark', className = '', href = '/', size = 'md' }: BrandLogoProps) => {
  const isDarkTheme = theme === 'dark'

  const sizeStyles = {
    sm: {
      imageContainer: 'w-10 h-10',
      title: 'text-sm',
      subtitle: 'text-[9px]',
    },
    md: {
      imageContainer: 'w-12 h-12',
      title: 'text-base',
      subtitle: 'text-[10px]',
    },
    lg: {
      imageContainer: 'w-16 h-16',
      title: 'text-xl',
      subtitle: 'text-xs',
    },
  }[size]

  return (
    <Link href={href} className={`flex items-center gap-3 group ${className}`} id="nav-logo">
      <div className={`relative ${sizeStyles.imageContainer} rounded-full bg-white flex items-center justify-center shadow-md p-1 group-hover:scale-105 transition-transform shrink-0`}>
        <Image
          src="/assets/images/logo.png"
          alt="Logo Transportes Brito"
          fill
          className="object-contain p-1"
          sizes={size === 'lg' ? '64px' : size === 'md' ? '48px' : '40px'}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`${sizeStyles.title} font-black tracking-tight uppercase transition-colors ${
            isDarkTheme ? 'text-stone-900' : 'text-white'
          }`}
        >
          Transportes <span className="text-[#e07020]">Brito</span>
        </span>
        <span
          className={`${sizeStyles.subtitle} font-medium tracking-widest uppercase transition-colors ${
            isDarkTheme ? 'text-stone-500' : 'text-white/70'
          }`}
        >
          Barita de la Chontalpa
        </span>
      </div>
    </Link>
  )
}
