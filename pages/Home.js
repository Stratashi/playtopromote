import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Sparkles, Trophy, Users, Zap, Target, Crown } from 'lucide-react';

export default function Home() {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/4936276f9_BackgroundPixelart.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/30 bg-slate-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    PlayToPromote
                  </h1>
                  <p className="text-sm text-slate-400">Win Games, Promote Your Brand</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-6 py-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-purple-300 font-semibold">Compete & Get Discovered</span>
              </div>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Multiplayer Games</span>
              <br />
              Promote Your Brand
            </h2>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Win multiplayer battles and get your promotional link seen by all players. 
              The ultimate gaming platform for content creators, streamers, and businesses.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg px-6 py-4 border border-cyan-500/30">
                <Users className="w-8 h-8 text-cyan-400" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">Multiplayer</div>
                  <div className="text-sm text-slate-400">Compete with others</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg px-6 py-4 border border-purple-500/30">
                <Target className="w-8 h-8 text-purple-400" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">Get Promoted</div>
                  <div className="text-sm text-slate-400">Winners get exposure</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg px-6 py-4 border border-yellow-500/30">
                <Crown className="w-8 h-8 text-yellow-400" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">100% Free</div>
                  <div className="text-sm text-slate-400">No hidden costs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">Available Games</h3>
            <p className="text-slate-400 text-lg">Choose your battlefield and start promoting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Jeff the Robot Wizard Game Card */}
            <Card className="bg-slate-800/90 backdrop-blur-xl border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 via-cyan-600 to-purple-800 opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/e20ead410_idle.png"
                    alt="Jeff the Robot Wizard"
                    className="w-32 h-32 object-contain animate-bounce"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  Jeff the Robot Wizard
                </CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Multiplayer Portal Battle
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  Battle enemies, collect power-ups, and survive waves of attacks. Winner's promotional link gets shared with all players!
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                    Multiplayer
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-500/30">
                    Action
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30">
                    Arcade
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">2-10 Players</span>
                  </div>
                  <Link to={createPageUrl('Game')}>
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold">
                      <Zap className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Cards */}
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                <div className="text-center space-y-2">
                  <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
                  <div className="text-2xl font-bold text-slate-400">Coming Soon</div>
                  <div className="text-sm text-slate-500">New game in development</div>
                </div>
              </div>
              
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-900" />
              <CardHeader>
                <CardTitle className="text-slate-500">Mystery Game #2</CardTitle>
                <CardDescription className="text-slate-600">TBA</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Stay tuned for more exciting multiplayer experiences!</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                <div className="text-center space-y-2">
                  <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
                  <div className="text-2xl font-bold text-slate-400">Coming Soon</div>
                  <div className="text-sm text-slate-500">New game in development</div>
                </div>
              </div>
              
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-900" />
              <CardHeader>
                <CardTitle className="text-slate-500">Mystery Game #3</CardTitle>
                <CardDescription className="text-slate-600">TBA</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">More games coming your way!</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-white text-center mb-12">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h4 className="text-xl font-bold text-white">Join a Game</h4>
                <p className="text-slate-400">
                  Enter your name and promotional link (social media, website, etc.)
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h4 className="text-xl font-bold text-white">Play & Compete</h4>
                <p className="text-slate-400">
                  Battle other players and show off your skills to win the match
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h4 className="text-xl font-bold text-white">Get Promoted</h4>
                <p className="text-slate-400">
                  Winners get their link prominently displayed to all players!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/30 bg-slate-900/80 backdrop-blur-xl mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-slate-400">© 2025 PlayToPromote.com - All rights reserved</span>
              </div>
              
              <div className="flex gap-6 text-slate-400">
                <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}