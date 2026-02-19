import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from './StatCard'

const stats = [
  { value: 92, suffix: '%', label: 'improved pipeline reliability' },
  { value: 87, suffix: '%', label: 'of success relies on healing' },
  { value: 56, suffix: '%', label: 'higher deployment success' },
]

// Floating orb element
function Orb({ className, style }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={style}
    />
  )
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  return (
    <section className="relative min-h-screen bg-mesh-light overflow-hidden noise">
      {/* Background ambient orbs — mimic the green gradient blobs in Image 2 */}
      <Orb
        className="blob w-[300px] h-[250px] sm:w-[400px] sm:h-[350px] md:w-[500px] md:h-[400px] bg-vigor-tealLight"
        style={{ top: '-80px', right: '-60px', animationDuration: '9s' }}
      />
      <Orb
        className="blob-2 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] bg-vigor-teal"
        style={{ bottom: '120px', left: '-80px', animationDuration: '11s' }}
      />
      <Orb
        className="blob w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] bg-vigor-accent"
        style={{ top: '40%', right: '15%', animationDuration: '7s' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20">
        {/* Eyebrow tag */}
        <div
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-vigor-teal/10 border border-vigor-teal/20 mb-8
            transition-all duration-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <span className="w-2 h-2 rounded-full bg-vigor-teal animate-pulse-soft" />
          <span className="text-xs font-semibold text-vigor-teal tracking-widest uppercase">
            AI-Powered CI/CD Healing
          </span>
        </div>

        {/* Main headline — matches Image 2 bold uppercase style */}
        <div
          className={`
            max-w-4xl transition-all duration-700 delay-100
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}
        >
          <h1 className="font-display text-[2.5rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[5rem] font-black leading-[1.1] tracking-tight text-gray-900 uppercase mb-3">
            THE AGENT THAT
            <br />
            <span className="text-gray-900">HEALS BEFORE</span>
            <br />
            <span className="text-gray-900">YOU NOTICE</span>
          </h1>

          {/* Teal subheadline — exactly like Image 2 */}
          <p className="font-display text-[1.1rem] sm:text-[1.3rem] md:text-[1.6rem] lg:text-[2rem] font-bold uppercase text-gradient-teal mt-4 leading-tight">
            Mysterious and confident,
            <br className="hidden sm:block" />
            positions it as proactive magic.
          </p>
        </div>

        {/* Body text */}
        <p
          className={`
            mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-gray-600 font-light leading-relaxed
            transition-all duration-700 delay-200
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}
        >
          Vigor healing agent is an AI-powered tool that watches your continuous integration
          and continuous delivery (CI/CD) pipelines in real time.
        </p>

        {/* CTA Buttons — styled like Image 2 */}
        <div
          className={`
            mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4
            transition-all duration-700 delay-300
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}
        >
          {/* Primary CTA — teal pill with arrow icon */}
          <Link
            to="/details"
            className="
              group flex items-center justify-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full
              bg-vigor-teal text-white font-semibold text-sm
              shadow-glow-teal hover:bg-vigor-tealLight
              transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
            "
          >
            Book Your Free Session
            <span className="
              w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center
              group-hover:bg-white/30 group-hover:rotate-45
              transition-all duration-300
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>

          {/* Secondary CTA */}
          <button className="btn-outline px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-semibold text-sm text-center">
            See Our Services
          </button>
        </div>

        {/* Stat cards row — exactly like Image 2 bottom section */}
        <div
          className={`
            mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5
            transition-all duration-700 delay-500
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* Bottom fade for scroll hint */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
    </section>
  )
}