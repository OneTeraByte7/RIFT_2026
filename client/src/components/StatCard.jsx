import React, { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 2000, startOnVisible = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnVisible) { setStarted(true); return }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnVisible])

  useEffect(() => {
    if (!started) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setCount(Math.round(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

export default function StatCard({ value, suffix = '%', label, delay = 0 }) {
  const numericValue = parseInt(value)
  const { count, ref } = useCountUp(numericValue, 2000)

  return (
    <div
      ref={ref}
      className="stat-card rounded-2xl p-7 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle teal accent top-left */}
      <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-vigor-tealLight to-transparent rounded-tr-full opacity-60 group-hover:h-20 transition-all duration-500" />

      {/* Number */}
      <div className="relative">
        <span className="font-display text-5xl font-bold text-gradient-teal leading-none">
          {count}{suffix}
        </span>
      </div>

      {/* Label */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 font-medium leading-snug">{label}</p>

        {/* Decorative dot */}
        <div className="mt-3 w-8 h-1.5 bg-vigor-tealPale rounded-full group-hover:w-12 transition-all duration-500" />
      </div>
    </div>
  )
}