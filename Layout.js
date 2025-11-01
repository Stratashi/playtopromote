import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Home, Gamepad2 } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // Don't show navigation on Game page when playing
  const isGamePage = currentPageName === 'Game';
  
  return (
    <div className="min-h-screen">
      {!isGamePage && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-purple-500/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    PlayToPromote
                  </h1>
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                <Link to={createPageUrl('Home')}>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPageName === 'Home' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}>
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </button>
                </Link>
                
                <Link to={createPageUrl('Game')}>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPageName === 'Game' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}>
                    <Gamepad2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Play Game</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <div className={!isGamePage ? 'pt-16' : ''}>
        {children}
      </div>
    </div>
  );
}