import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Floating orb helper
function Orb({ className, style }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />
}

// Individual input field with animated label
function FloatingInput({ label, type = 'text', value, onChange, placeholder, icon }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative group">
      <div className={`
        flex items-center gap-3 px-5 py-4 rounded-2xl
        glass-input border
        ${focused
          ? 'border-vigor-tealLight shadow-[0_0_0_3px_rgba(59,191,160,0.2),0_4px_24px_rgba(0,0,0,0.08)]'
          : 'border-transparent shadow-input'
        }
        transition-all duration-300
      `}>
        {icon && (
          <span className={`transition-colors duration-300 flex-shrink-0 ${focused ? 'text-vigor-teal' : 'text-gray-300'}`}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="
            flex-1 bg-transparent outline-none
            text-gray-800 text-sm font-medium
            placeholder:text-gray-400 placeholder:font-normal
          "
        />
        {value && (
          <span className="text-vigor-tealLight flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>

      {/* Animated underline */}
      <div className={`
        absolute bottom-0 left-4 right-4 h-px
        bg-gradient-to-r from-vigor-teal to-vigor-tealLight
        transition-all duration-500
        ${focused ? 'opacity-60 scale-x-100' : 'opacity-0 scale-x-0'}
        origin-left
      `} />
    </div>
  )
}

export default function DetailsPage() {
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({ repoUrl: '', teamName: '', leaderName: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const isComplete = form.repoUrl && form.teamName && form.leaderName

  const handleSubmit = async () => {
    if (!isComplete) return
    setSubmitting(true)
    
    try {
      // Call the backend API to trigger the healing agent
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: form.repoUrl,
          team_name: form.teamName,
          leader_name: form.leaderName
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start agent')
      }
      
      const data = await response.json()
      console.log('Agent started:', data)
      
      setSubmitting(false)
      setSubmitted(true)
      
      // Redirect to results page with run_id
      setTimeout(() => {
        navigate(`/results?run_id=${data.run_id}`)
      }, 800)
    } catch (error) {
      console.error('Error starting agent:', error)
      setSubmitting(false)
      alert('Failed to start healing agent. Please check if the backend is running on port 8000.')
    }
  }

  const icons = {
    repo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    team: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    leader: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0d4a3e' }}>
      <Navbar theme="dark" />

      {/* Background blobs — exactly like Image 1 */}
      <Orb
        className="blob w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle, rgba(59,191,160,0.5) 0%, rgba(26,107,92,0.2) 60%, transparent 100%)',
          bottom: '-100px', left: '-120px', animationDuration: '10s',
          filter: 'blur(60px)', opacity: 0.6
        }}
      />
      <Orb
        className="blob-2 w-[400px] h-[400px]"
        style={{
          background: 'radial-gradient(circle, rgba(45,158,135,0.4) 0%, transparent 70%)',
          bottom: '100px', right: '-80px', animationDuration: '8s',
          filter: 'blur(50px)', opacity: 0.5
        }}
      />
      <Orb
        className="blob w-[250px] h-[250px]"
        style={{
          background: 'rgba(59,191,160,0.15)',
          top: '20%', right: '20%',
          filter: 'blur(40px)', opacity: 0.4
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center sm:justify-start px-4 sm:px-8 md:px-12 lg:px-20 pt-20 pb-10">
        <div className="w-full max-w-md mx-auto sm:mx-0">

          {/* Page title */}
          <div className={`
            mb-8 sm:mb-10 transition-all duration-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}>
            <p className="text-vigor-tealLight text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-2 sm:mb-3 font-mono">
              01 — Configuration
            </p>
            <h1 className="font-display text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Details
            </h1>
            <p className="text-white/40 text-xs sm:text-sm mt-2 font-light">
              Enter your repository details to launch the healing agent.
            </p>
          </div>

          {/* Form fields */}
          <div className={`
            space-y-4 transition-all duration-700 delay-150
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}>
            <FloatingInput
              label="Repository URL"
              type="url"
              value={form.repoUrl}
              onChange={e => setForm(f => ({ ...f, repoUrl: e.target.value }))}
              placeholder="https://github.com/owner/repo"
              icon={icons.repo}
            />
            <FloatingInput
              label="Team Name"
              value={form.teamName}
              onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
              placeholder="e.g. RIFT ORGANISERS"
              icon={icons.team}
            />
            <FloatingInput
              label="Team Leader Name"
              value={form.leaderName}
              onChange={e => setForm(f => ({ ...f, leaderName: e.target.value }))}
              placeholder="e.g. Saiyam Kumar"
              icon={icons.leader}
            />
          </div>

          {/* Branch name preview */}
          {form.teamName && form.leaderName && (
            <div className={`
              mt-5 px-4 py-3 rounded-xl
              bg-white/5 border border-white/10
              transition-all duration-500
            `}>
              <p className="text-white/40 text-xs font-mono mb-1">Branch will be created as:</p>
              <p className="text-vigor-tealLight text-sm font-mono font-semibold break-all">
                {form.teamName.toUpperCase().replace(/\s+/g,'_').replace(/[^A-Z0-9_]/g,'')}
                _
                {form.leaderName.toUpperCase().replace(/\s+/g,'_').replace(/[^A-Z0-9_]/g,'')}
                _AI_Fix
              </p>
            </div>
          )}

          {/* Submit button */}
          <div className={`
            mt-6 sm:mt-8 transition-all duration-700 delay-300
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}>
            <button
              onClick={handleSubmit}
              disabled={!isComplete || submitting}
              className={`
                group relative w-full px-8 sm:px-10 py-3 sm:py-4 rounded-full
                font-semibold text-sm tracking-wide
                transition-all duration-400
                overflow-hidden
                ${submitted
                  ? 'bg-vigor-tealLight text-white cursor-default'
                  : isComplete
                  ? 'bg-white text-vigor-teal hover:bg-vigor-tealPale hover:-translate-y-0.5 hover:shadow-glow-teal cursor-pointer'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
                }
              `}
            >
              {/* Shimmer effect on hover */}
              {isComplete && !submitted && (
                <span className="
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/20 to-transparent
                  group-hover:translate-x-full
                  transition-transform duration-700
                " />
              )}

              <span className="relative flex items-center justify-center gap-2">
                {submitted ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Launched!
                  </>
                ) : submitting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Launching Agent...
                  </>
                ) : (
                  <>
                    Submit
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Step indicator */}
          <div className="mt-8 sm:mt-10 md:mt-12 flex items-center gap-2">
            {[1, 2, 3].map(step => (
              <div key={step} className={`
                h-1 rounded-full transition-all duration-500
                ${step === 1 ? 'w-6 sm:w-8 bg-vigor-tealLight' : 'w-3 sm:w-4 bg-white/15'}
              `} />
            ))}
            <span className="text-white/25 text-[10px] sm:text-xs ml-2 font-mono">Step 1 of 3</span>
          </div>
        </div>
      </div>
    </div>
  )
}