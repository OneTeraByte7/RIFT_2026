import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Floating orb helper
function Orb({ className, style }) {
  return <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />
}

// Status Badge Component
function StatusBadge({ status }) {
  const isSuccess = status === 'PASSED' || status === 'COMPLETED'
  return (
    <span className={`
      inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider
      ${isSuccess 
        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
        : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
      }
    `}>
      {isSuccess ? '✓' : '✗'} {status}
    </span>
  )
}

// Run Summary Card
function RunSummaryCard({ data }) {
  return (
    <div className="stat-card p-6 sm:p-8 rounded-3xl lg:sticky lg:top-24">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
            <path d="M9 11l3 3L22 4" stroke="#1a6b5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 uppercase">Run Summary</h2>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="text-[10px] sm:text-xs font-bold text-vigor-teal uppercase tracking-widest mb-2 block">Repository</label>
          <p className="text-gray-700 font-mono text-xs sm:text-sm bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 break-all">{data.repo_url}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-[10px] sm:text-xs font-bold text-vigor-teal uppercase tracking-widest mb-2 block">Team</label>
            <p className="text-gray-900 font-semibold text-base sm:text-lg">{data.team_name}</p>
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-bold text-vigor-teal uppercase tracking-widest mb-2 block">Leader</label>
            <p className="text-gray-900 font-semibold text-base sm:text-lg">{data.leader_name}</p>
          </div>
        </div>
        
        <div>
          <label className="text-[10px] sm:text-xs font-bold text-vigor-teal uppercase tracking-widest mb-2 block">Branch</label>
          <p className="text-vigor-teal font-mono text-xs sm:text-sm font-bold bg-vigor-tealPale px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-vigor-teal/20 break-all">{data.branch_name}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t-2 border-gray-200">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-black text-red-600">{data.total_failures || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 uppercase tracking-wide font-semibold">Failures</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-black text-green-600">{data.total_fixes || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 uppercase tracking-wide font-semibold">Fixes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-black text-blue-600">{data.elapsed_seconds || 0}s</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 uppercase tracking-wide font-semibold">Time</p>
          </div>
        </div>
        
        <div className="pt-5 sm:pt-6 border-t-2 border-gray-200">
          <label className="text-[10px] sm:text-xs font-bold text-vigor-teal uppercase tracking-widest mb-3 block">Final Status</label>
          <StatusBadge status={data.final_status || 'RUNNING'} />
        </div>
      </div>
    </div>
  )
}

// Fixes Applied Table
function FixesTable({ fixes }) {
  if (!fixes || fixes.length === 0) {
    return (
      <div className="stat-card p-6 sm:p-8 rounded-3xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 uppercase mb-5 sm:mb-6">Fixes Applied</h2>
        <div className="text-center py-12 sm:py-16">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="sm:w-8 sm:h-8">
              <path d="M12 2v20M2 12h20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm sm:text-base">No fixes applied yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card p-6 sm:p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#1a6b5c" strokeWidth="2"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 uppercase">Fixes Applied</h2>
      </div>
      
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-6 sm:px-0">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-black text-vigor-teal uppercase tracking-widest">File</th>
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-black text-vigor-teal uppercase tracking-widest hidden sm:table-cell">Bug Type</th>
                <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-black text-vigor-teal uppercase tracking-widest">Line</th>
                <th className="text-left py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-black text-vigor-teal uppercase tracking-widest hidden md:table-cell">Commit Message</th>
                <th className="text-center py-3 sm:py-4 px-2 sm:px-4 text-[10px] sm:text-xs font-black text-vigor-teal uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {fixes.map((fix, idx) => {
                const isSuccess = fix.status === 'fixed' || fix.status === 'success'
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-vigor-tealPale/30 transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-4 font-mono text-xs sm:text-sm text-gray-800 font-medium break-all">{fix.file}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                      <span className={`
                        inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide
                        ${fix.bug_type === 'SYNTAX' ? 'bg-red-100 text-red-700' :
                          fix.bug_type === 'LINTING' ? 'bg-yellow-100 text-yellow-700' :
                          fix.bug_type === 'TYPE_ERROR' ? 'bg-purple-100 text-purple-700' :
                          fix.bug_type === 'LOGIC' ? 'bg-blue-100 text-blue-700' :
                          fix.bug_type === 'IMPORT' ? 'bg-orange-100 text-orange-700' :
                          fix.bug_type === 'INDENTATION' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {fix.bug_type}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-center font-mono text-xs sm:text-sm text-gray-800 font-bold">{fix.line}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 font-medium hidden md:table-cell">{fix.commit_message}</td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black text-sm sm:text-base
                        ${isSuccess ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}
                      `}>
                        {isSuccess ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// CI/CD Timeline
function CICDTimeline({ runs, maxIterations = 5 }) {
  if (!runs || runs.length === 0) {
    return (
      <div className="stat-card p-6 sm:p-8 rounded-3xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 uppercase mb-5 sm:mb-6">CI/CD Timeline</h2>
        <div className="text-center py-12 sm:py-16">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="sm:w-8 sm:h-8">
              <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-gray-400 font-semibold text-sm sm:text-base">No CI/CD runs yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card p-6 sm:p-8 rounded-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
              <circle cx="12" cy="12" r="10" stroke="#1a6b5c" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 uppercase">CI/CD Timeline</h2>
        </div>
        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-vigor-tealPale text-vigor-teal text-xs sm:text-sm font-bold uppercase tracking-wide">
          {runs.length}/{maxIterations} Iterations
        </span>
      </div>
      
      <div className="space-y-5 sm:space-y-6">
        {runs.map((run, idx) => {
          const isPassed = run.status === 'PASSED' || run.status === 'SUCCESS'
          return (
            <div key={idx} className="flex items-start gap-3 sm:gap-5">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-sm sm:text-base shadow-lg
                  ${isPassed ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-red-500 text-white shadow-red-500/30'}
                `}>
                  {idx + 1}
                </div>
                {idx < runs.length - 1 && (
                  <div className="w-1 h-12 sm:h-16 bg-gradient-to-b from-gray-300 to-gray-200 my-2 rounded-full" />
                )}
              </div>
              
              {/* Run details */}
              <div className="flex-1 pb-2 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900 uppercase">Run #{idx + 1}</h3>
                    <StatusBadge status={run.status || 'RUNNING'} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-mono font-semibold bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg self-start sm:self-auto">
                    {run.timestamp ? new Date(run.timestamp).toLocaleString() : 'In progress'}
                  </span>
                </div>
                {run.message && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium leading-relaxed break-words">{run.message}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Results Page
export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const runId = searchParams.get('run_id')
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  useEffect(() => {
    if (!runId) {
      setError('No run ID provided')
      setLoading(false)
      return
    }

    fetchRunData()
    const interval = setInterval(fetchRunData, 2000)
    return () => clearInterval(interval)
  }, [runId])

  const fetchRunData = async () => {
    try {
      const response = await fetch(`/api/run/${runId}`)
      if (!response.ok) throw new Error('Failed to fetch run data')
      
      const result = await response.json()
      setData(result)
      setLoading(false)
      setIsInitialLoad(false) // Mark that we've loaded data at least once
    } catch (err) {
      console.error('Error fetching run data:', err)
      setError(err.message)
      setLoading(false)
      setIsInitialLoad(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-mesh-light overflow-hidden noise relative">
        <Navbar theme="light" />
        
        {/* Animated background orbs */}
        <Orb className="blob w-[300px] h-[300px] bg-vigor-tealLight" style={{ top: '-80px', right: '-60px', animationDuration: '8s' }} />
        <Orb className="blob-2 w-[250px] h-[250px] bg-vigor-teal" style={{ bottom: '100px', left: '-80px', animationDuration: '10s' }} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-32 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            {/* Animated loader */}
            <div className="relative inline-flex items-center justify-center mb-8">
              {/* Outer rotating ring */}
              <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-vigor-tealPale animate-spin" 
                   style={{ borderTopColor: '#3bbfa0', animationDuration: '1.5s' }}></div>
              
              {/* Inner pulsing circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-vigor-teal flex items-center justify-center animate-pulse">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="sm:w-10 sm:h-10">
                  <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 uppercase mb-3">
              Loading Results
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
              Fetching healing agent data...
            </p>
            
            {/* Animated dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-2 h-2 rounded-full bg-vigor-teal animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 rounded-full bg-vigor-teal animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-vigor-teal animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh-light overflow-hidden noise relative">
        <Navbar theme="light" />
        
        {/* Animated background orbs */}
        <Orb className="blob w-[300px] h-[300px] bg-red-200 opacity-20" style={{ top: '-80px', right: '-60px', animationDuration: '8s' }} />
        <Orb className="blob-2 w-[250px] h-[250px] bg-red-300 opacity-20" style={{ bottom: '100px', left: '-80px', animationDuration: '10s' }} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-32 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            {/* Error icon with animation */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="sm:w-12 sm:h-12">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 uppercase mb-3">
              Error Loading Results
            </h2>
            <p className="text-red-600 font-semibold text-base sm:text-lg mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-vigor-teal text-white rounded-full font-bold text-sm uppercase tracking-wide hover:bg-vigor-tealLight transition-all duration-300 shadow-glow-teal hover:-translate-y-0.5"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-mesh-light overflow-hidden noise">
      <Navbar theme="light" />
      
      {/* Background orbs */}
      <Orb className="blob w-[400px] h-[400px] bg-vigor-tealLight" style={{ top: '-100px', right: '-80px', animationDuration: '10s' }} />
      <Orb className="blob-2 w-[350px] h-[350px] bg-vigor-teal" style={{ bottom: '100px', left: '-100px', animationDuration: '12s' }} />
      <Orb className="blob w-[250px] h-[250px] bg-vigor-accent" style={{ top: '50%', right: '10%', animationDuration: '8s' }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 sm:py-24">
        {/* Header */}
        <div className={`mb-10 sm:mb-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-vigor-teal hover:text-vigor-tealLight font-bold text-xs sm:text-sm uppercase tracking-wide mb-5 sm:mb-6 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sm:w-4 sm:h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-vigor-teal/10 border border-vigor-teal/20 mb-3 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-vigor-teal animate-pulse-soft" />
            <span className="text-[10px] sm:text-xs font-bold text-vigor-teal tracking-widest uppercase">Live Results</span>
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 uppercase leading-tight mb-2 sm:mb-3">
            Healing Agent
            <br />
            <span className="text-gradient-teal">Results</span>
          </h1>
          <p className="text-gray-600 font-mono text-xs sm:text-sm">Run ID: <span className="font-bold text-vigor-teal break-all">{runId}</span></p>
        </div>

        {/* Loading indicator for running status */}
        {isInitialLoad && !data ? (
          // Show loading animation while waiting for initial data
          <div className={`mb-6 sm:mb-8 stat-card p-6 sm:p-8 rounded-3xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex flex-col items-center justify-center py-8">
              {/* Animated loader */}
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Outer rotating ring */}
                <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-100 animate-spin" 
                     style={{ borderTopColor: '#3b82f6', animationDuration: '1.2s' }}></div>
                
                {/* Middle ring - opposite rotation */}
                <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-blue-200 animate-spin" 
                     style={{ borderBottomColor: '#60a5fa', animationDuration: '2s', animationDirection: 'reverse' }}></div>
                
                {/* Inner pulsing circle */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
                  </svg>
                </div>
              </div>
              
              <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 uppercase mb-2">
                Initializing Agent
              </h3>
              <p className="text-gray-600 text-sm sm:text-base text-center max-w-md">
                Setting up the healing environment and preparing to analyze your repository...
              </p>
              
              {/* Animated progress dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.45s' }}></span>
              </div>
            </div>
          </div>
        ) : data && (data.status === 'RUNNING' || data.status === 'STARTED') ? (
          // Show running status when data is available
          <div className={`mb-6 sm:mb-8 stat-card p-4 sm:p-5 rounded-2xl border-l-4 border-blue-500 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-3 border-blue-600 border-t-transparent flex-shrink-0"></div>
              <p className="text-blue-700 font-bold uppercase tracking-wide text-xs sm:text-sm">Agent is running... Results update automatically</p>
            </div>
          </div>
        ) : null}

        {/* Content Grid */}
        {data && (
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Left column - Summary */}
            <div className="lg:col-span-1">
              <RunSummaryCard data={data} />
            </div>
            
            {/* Right column - Details */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <FixesTable fixes={data.fixes_applied || []} />
              <CICDTimeline runs={data.cicd_runs || []} maxIterations={data.max_iterations || 5} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
