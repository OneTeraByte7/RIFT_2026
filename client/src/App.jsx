import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DetailsPage from './pages/DetailsPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/details" element={<DetailsPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}