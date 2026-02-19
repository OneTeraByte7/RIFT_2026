import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-vigor-bgDark text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-white">vigor</span>
          <span className="text-white/20">·</span>
          <span className="text-sm">The Agent That Heals</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          {['Privacy', 'Terms', 'Docs', 'GitHub'].map(item => (
            <a key={item} href="#" className="hover:text-white transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>

        <p className="text-xs text-white/30">
          © 2026 Vigor. Built for RIFT Hackathon.
        </p>
      </div>
    </footer>
  )
}