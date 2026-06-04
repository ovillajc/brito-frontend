import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  theme?: 'light' | 'dark'
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export const BrandLogo = ({ theme = 'dark', className = '', href = '/', size = 'md', showText = true }: BrandLogoProps) => {
  const isDarkTheme = theme === 'dark'

  const titleClass = isDarkTheme
    ? 'text-stone-900 dark:text-white'
    : 'text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]'

  const subtitleClass = isDarkTheme
    ? 'text-stone-500 dark:text-zinc-400'
    : 'text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]'

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
      {showText && (
        <div className="flex flex-col leading-none min-w-0">
          <span
            className={`${sizeStyles.title} font-black tracking-tight uppercase transition-colors truncate ${titleClass}`}
          >
            Transportes <span className="text-[#e07020]">Brito</span>
          </span>
          <span
            className={`${sizeStyles.subtitle} font-medium tracking-widest uppercase transition-colors truncate ${subtitleClass}`}
          >
            Barita de la Chontalpa
          </span>
        </div>
      )}
    </Link>
  )
}
