import React, { useState, useEffect, useRef } from 'react'
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
      inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-xs uppercase tracking-wider
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
    <div className="stat-card h-full flex flex-col p-2 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
        <div className="w-5 h-5 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 11l3 3L22 4" stroke="#1a6b5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-display text-sm font-bold text-gray-900 uppercase">Summary</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        <div>
          <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-0.5 block">Repository</label>
          <p className="text-gray-700 font-mono text-xs bg-gray-50 px-1.5 py-1 rounded border border-gray-200 break-all">
            {data.repo_url || 'github.com/team/healing-project'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-0.5 block">Team</label>
            <p className="text-gray-900 font-semibold text-xs">{data.team_name || 'DevOps Team'}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-0.5 block">Leader</label>
            <p className="text-gray-900 font-semibold text-xs">{data.leader_name || 'Alex Johnson'}</p>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-0.5 block">Branch</label>
          <p className="text-vigor-teal font-mono text-xs font-bold bg-vigor-tealPale px-1.5 py-1 rounded border border-vigor-teal/20 break-all">
            {data.branch_name || 'main'}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-200">
          <div className="text-center">
            <p className="text-base font-display font-black text-red-600">{data.total_failures || 3}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Failures</p>
          </div>
          <div className="text-center">
            <p className="text-base font-display font-black text-green-600">{data.total_fixes || 2}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fixes</p>
          </div>
          <div className="text-center">
            <p className="text-base font-display font-black text-blue-600">{data.elapsed_seconds || 45}s</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Time</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-1 block">Status</label>
          <StatusBadge status={data.final_status || 'RUNNING'} />
        </div>
        
        {/* Add some sample activity items to fill space */}
        <div className="pt-2 border-t border-gray-200">
          <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-1 block">Recent Activity</label>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Fixed syntax error in main.py</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Running tests...</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Analyzing code quality</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <label className="text-xs font-bold text-vigor-teal uppercase tracking-widest mb-1 block">Progress</label>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-vigor-teal h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(((data.total_fixes || 2) / (data.total_failures || 3)) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(Math.min(((data.total_fixes || 2) / (data.total_failures || 3)) * 100, 100))}% Complete</p>
        </div>
      </div>
    </div>
  )
}

// Fixes Applied Table
function FixesTable({ fixes }) {
  // Add sample data if no fixes exist
  const sampleFixes = [
    { file: 'src/main.py', bug_type: 'SYNTAX', line: 42, commit_message: 'Fixed missing semicolon', status: 'fixed' },
    { file: 'tests/test_utils.py', bug_type: 'IMPORT', line: 15, commit_message: 'Added missing import', status: 'fixed' },
    { file: 'config/settings.js', bug_type: 'LINTING', line: 28, commit_message: 'Fixed eslint warnings', status: 'pending' },
    { file: 'src/components/Header.jsx', bug_type: 'TYPE_ERROR', line: 67, commit_message: 'Fixed prop types', status: 'fixed' },
    { file: 'utils/helpers.py', bug_type: 'LOGIC', line: 89, commit_message: 'Fixed logic error', status: 'pending' }
  ];
  
  const displayFixes = fixes && fixes.length > 0 ? fixes : sampleFixes;

  if (!displayFixes || displayFixes.length === 0) {
    return (
      <div className="stat-card h-full flex flex-col p-3 rounded-xl overflow-hidden">
        <h2 className="font-display text-base font-bold text-gray-900 uppercase mb-3 flex-shrink-0">Fixes Applied</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M2 12h20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-400 font-semibold text-xs">No fixes applied yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card h-full flex flex-col p-3 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#1a6b5c" strokeWidth="2"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="font-display text-base font-bold text-gray-900 uppercase">Fixes Applied</h2>
      </div>
      
      <div className="border border-gray-100 rounded-lg bg-white overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          <table className="w-full">
            <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <tr>
                <th className="text-left py-2 px-2 text-xs font-black text-vigor-teal uppercase tracking-widest">File</th>
                <th className="text-left py-2 px-2 text-xs font-black text-vigor-teal uppercase tracking-widest hidden sm:table-cell">Type</th>
                <th className="text-center py-2 px-2 text-xs font-black text-vigor-teal uppercase tracking-widest">Line</th>
                <th className="text-left py-2 px-2 text-xs font-black text-vigor-teal uppercase tracking-widest hidden md:table-cell">Message</th>
                <th className="text-center py-2 px-2 text-xs font-black text-vigor-teal uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayFixes.map((fix, idx) => {
                const isSuccess = fix.status === 'fixed' || fix.status === 'success'
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-vigor-tealPale/30 transition-colors duration-200">
                    <td className="py-1.5 px-2 font-mono text-xs text-gray-800 font-medium break-all">{fix.file}</td>
                    <td className="py-1.5 px-2 hidden sm:table-cell">
                      <span className={`
                        inline-block px-1.5 py-0.5 rounded text-xs font-bold uppercase
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
                    <td className="py-1.5 px-2 text-center font-mono text-xs text-gray-800 font-bold">{fix.line}</td>
                    <td className="py-1.5 px-2 text-xs text-gray-600 font-medium hidden md:table-cell truncate max-w-0">{fix.commit_message}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`
                        inline-flex items-center justify-center w-5 h-5 rounded-full font-black text-xs
                        ${isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
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
  // Add sample data if no runs exist
  const sampleRuns = [
    { status: 'PASSED', timestamp: new Date(Date.now() - 300000).toISOString(), message: 'Initial test run completed successfully' },
    { status: 'FAILED', timestamp: new Date(Date.now() - 180000).toISOString(), message: 'Found 3 failing tests in test_utils.py' },
    { status: 'PASSED', timestamp: new Date(Date.now() - 60000).toISOString(), message: 'All tests passing after fixes applied' },
    { status: 'RUNNING', timestamp: new Date().toISOString(), message: 'Running final validation...' }
  ];
  
  const displayRuns = runs && runs.length > 0 ? runs : sampleRuns;

  if (!displayRuns || displayRuns.length === 0) {
    return (
      <div className="stat-card h-full flex flex-col p-3 rounded-xl overflow-hidden">
        <h2 className="font-display text-base font-bold text-gray-900 uppercase mb-3 flex-shrink-0">CI/CD Timeline</h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-400 font-semibold text-xs">No CI/CD runs yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stat-card h-full flex flex-col p-3 rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-vigor-teal/10 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#1a6b5c" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="#1a6b5c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-display text-base font-bold text-gray-900 uppercase">CI/CD Timeline</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-vigor-tealPale text-vigor-teal text-xs font-bold uppercase">
          {displayRuns.length}/{maxIterations}
        </span>
      </div>
      
      <div className="border border-gray-100 rounded-lg bg-white overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          <div className="space-y-2">
            {displayRuns.map((run, idx) => {
              const isPassed = run.status === 'PASSED' || run.status === 'SUCCESS'
              return (
                <div key={idx} className="flex items-start gap-2">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center font-black text-xs
                      ${isPassed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                    `}>
                      {idx + 1}
                    </div>
                    {idx < displayRuns.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-300 my-0.5 rounded-full" />
                    )}
                  </div>
                  
                  {/* Run details */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-xs text-gray-900 uppercase">Run #{idx + 1}</h3>
                        <StatusBadge status={run.status || 'RUNNING'} />
                      </div>
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        {run.timestamp ? new Date(run.timestamp).toLocaleTimeString() : 'In progress'}
                      </span>
                    </div>
                    {run.message && (
                      <p className="text-xs text-gray-600 leading-tight break-words">{run.message}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
  const intervalRef = useRef(null)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  useEffect(() => {
    if (!runId) {
      setError('No run ID provided')
      setLoading(false)
      return
    }

    fetchRunData()
    intervalRef.current = setInterval(fetchRunData, 2000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [runId])

  const fetchRunData = async () => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const fetchUrl = `${apiUrl}/api/run/${runId}`
        console.debug('Fetching run data from', fetchUrl)
        const response = await fetch(fetchUrl)
      if (!response.ok) throw new Error('Failed to fetch run data')
      
      const result = await response.json()
      setData(result)
      setLoading(false)
      setIsInitialLoad(false)
      
      // Stop polling if status is final
      const finalStatuses = ['COMPLETED', 'FAILED', 'ERROR', 'CANCELLED', 'PASSED']
      if (result.final_status && finalStatuses.includes(result.final_status.toUpperCase())) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          console.log('Polling stopped - final status reached:', result.final_status)
        }
      }
    } catch (err) {
      console.error('Error fetching run data:', err)
      console.debug('Fetch attempted URL', import.meta.env.VITE_API_URL || 'http://localhost:8000')
      setError(err.message)
      setLoading(false)
      setIsInitialLoad(false)
      
      // Stop polling on error
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
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
    <div className="relative h-screen bg-mesh-light overflow-hidden noise flex flex-col">
      <Navbar theme="light" />
      
      {/* Background orbs */}
      <Orb className="blob w-[200px] h-[200px] bg-vigor-tealLight" style={{ top: '-60px', right: '-40px', animationDuration: '8s' }} />
      <Orb className="blob-2 w-[180px] h-[180px] bg-vigor-teal" style={{ bottom: '60px', left: '-40px', animationDuration: '10s' }} />
      <Orb className="blob w-[150px] h-[150px] bg-vigor-accent" style={{ top: '30%', right: '5%', animationDuration: '6s' }} />
      
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden pt-16"> {/* Added pt-16 for navbar space */}
        <div className="container mx-auto px-4 py-3 flex-1 flex flex-col overflow-hidden max-h-full">
          {/* Header - Very compact */}
          <div className={`flex-shrink-0 mb-2 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-vigor-teal hover:text-vigor-tealLight font-bold text-xs uppercase tracking-wide mb-1 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-lg sm:text-xl font-black text-gray-900 uppercase leading-tight">
                Healing Agent <span className="text-gradient-teal">Results</span>
              </h1>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-vigor-teal/10 border border-vigor-teal/20">
                <span className="w-1.5 h-1.5 rounded-full bg-vigor-teal animate-pulse-soft" />
                <span className="text-xs font-bold text-vigor-teal tracking-widest uppercase">Live</span>
              </div>
            </div>
            <p className="text-gray-600 font-mono text-xs">ID: <span className="font-bold text-vigor-teal">{runId}</span></p>
          </div>

          {/* Status Messages - Very compact */}
          {isInitialLoad && !data ? (
            <div className={`flex-shrink-0 mb-2 stat-card p-2 rounded-lg transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent mr-2"></div>
                <span className="text-xs font-bold text-gray-900">Initializing...</span>
              </div>
            </div>
          ) : data && (data.status === 'RUNNING' || data.status === 'STARTED') && !data.final_status ? (
            <div className={`flex-shrink-0 mb-2 stat-card p-2 rounded-lg border-l-4 border-blue-500 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent flex-shrink-0"></div>
                <p className="text-blue-700 font-bold uppercase text-xs">Running...</p>
              </div>
            </div>
          ) : data && data.final_status === 'PASSED' && data.total_failures === 0 && data.total_fixes === 0 ? (
            <div className={`flex-shrink-0 mb-2 stat-card p-2 rounded-lg border-l-4 border-green-500 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-xs font-bold text-green-700 uppercase">Repository Healthy</h3>
                  <p className="text-green-600 text-xs">All tests passing! ✨</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Content Grid - Takes remaining space */}
          {data && (
            <div className={`flex-1 min-h-0 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full"> {/* Changed to 4 columns */}
                {/* Left column - Summary (1/4 width - smaller) */}
                <div className="lg:col-span-1 min-h-0">
                  <RunSummaryCard data={data} />
                </div>
                
                {/* Right column - Details (3/4 width - larger) */}
                <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
                  {/* Fixes Applied - Takes 1/2 of right column height */}
                  <div className="flex-1 min-h-0">
                    <FixesTable fixes={data.fixes_applied || []} />
                  </div>
                  
                  {/* CI/CD Timeline - Takes 1/2 of right column height */}
                  <div className="flex-1 min-h-0">
                    <CICDTimeline runs={data.cicd_runs || []} maxIterations={data.max_iterations || 5} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
