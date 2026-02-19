import React from 'react'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Auto-Detect Failures',
    desc: 'Instantly identifies broken builds, syntax errors, type mismatches, and import issues across your entire codebase.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Surgical Code Fixes',
    desc: 'Uses state-of-the-art LLM models to generate minimal, targeted fixes — touching only what needs to change.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Continuous Monitoring',
    desc: 'Watches your CI/CD pipeline in real time, automatically retrying with improved fixes until all tests pass.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <line x1="6" y1="3" x2="6" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M18 9a9 9 0 01-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Safe Branch Isolation',
    desc: 'All fixes committed to a dedicated branch — never touching main — with full audit trail and [AI-AGENT] tagging.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'Multi-Agent Architecture',
    desc: 'Powered by LangGraph — six specialized agents collaborating: Analyzer, Test Runner, Fixer, Git, CI/CD Monitor, and Orchestrator.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Live Dashboard',
    desc: 'React dashboard with real-time SSE streaming, animated score breakdowns, fix tables, and CI/CD timeline.'
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative bg-white py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #d4ebe5 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-vigor-tealPale text-vigor-teal text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4">
            Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight px-4">
            Everything your pipeline<br />
            <span className="text-gradient-teal">needs to self-heal</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed px-4">
            From detection to push — Vigor handles the entire remediation loop so your team can focus on shipping features.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-vigor-tealPale
                         bg-white hover:bg-vigor-tealPale/20
                         transition-all duration-400 hover:-translate-y-1 hover:shadow-card cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-vigor-tealPale flex items-center justify-center
                              text-vigor-teal mb-3 sm:mb-4
                              group-hover:bg-vigor-teal group-hover:text-white
                              transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{f.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}