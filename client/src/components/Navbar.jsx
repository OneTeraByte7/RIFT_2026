import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ theme = 'dark' }) {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isDark = theme === 'dark'

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4
      transition-all duration-500
      ${scrolled
        ? isDark
          ? 'bg-vigor-bgDark/90 backdrop-blur-md border-b border-white/5'
          : 'bg-white/80 backdrop-blur-md border-b border-vigor-teal/10 shadow-sm'
        : 'bg-transparent'
      }
    `}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className={`
            w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center
            ${isDark ? 'bg-white/15' : 'bg-vigor-teal/15'}
            group-hover:scale-110 transition-transform duration-300
          `}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="sm:w-[14px] sm:h-[14px]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill={isDark ? '#fff' : '#1a6b5c'} />
            </svg>
          </div>
          <span className={`
            font-display text-lg sm:text-xl font-bold tracking-tight
            ${isDark ? 'text-white' : 'text-vigor-teal'}
          `}>
            vigor
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {['Services', 'How It Works', 'Pricing', 'Docs'].map(item => (
            <a
              key={item}
              href="#"
              className={`
                text-xs sm:text-sm font-medium transition-colors duration-200
                ${isDark
                  ? 'text-white/60 hover:text-white'
                  : 'text-vigor-teal/70 hover:text-vigor-teal'
                }
              `}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/details"
          className={`
            px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold
            transition-all duration-300
            ${isDark
              ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40'
              : 'bg-vigor-teal text-white hover:bg-vigor-tealLight shadow-glow-teal hover:shadow-lg'
            }
          `}
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}