import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Game from './pages/Game'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Layout currentPageName="Home"><Home /></Layout>} />
        <Route path="/game" element={<Layout currentPageName="Game"><Game /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
