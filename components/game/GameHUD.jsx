import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart, Zap, Target, Users, Waves, Crown, TrendingUp } from 'lucide-react';

export default function GameHUD({ health, score, portalReady, players = [], waveNumber = 1, activePowerups = [], currentBoss = null, difficultyMultiplier = 1.0 }) {
  return (
    <>
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <Card className="bg-slate-900/80 backdrop-blur-md border-cyan-500/50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Heart className={`w-6 h-6 ${health > 30 ? 'text-red-500' : 'text-red-700 animate-pulse'}`} />
            <div>
              <div className="text-xs text-slate-400 font-semibold">HEALTH</div>
              <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all duration-300 ${
                    health > 60 ? 'bg-green-500' : health > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-xs text-slate-400 font-semibold">SCORE</div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {score}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Waves className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-xs text-slate-400 font-semibold">WAVE</div>
              <div className="text-xl font-bold text-yellow-400">
                {waveNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className={`w-5 h-5 ${difficultyMultiplier > 1.2 ? 'text-red-400' : difficultyMultiplier < 0.8 ? 'text-green-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs text-slate-400 font-semibold">DIFFICULTY</div>
              <div className={`text-sm font-bold ${difficultyMultiplier > 1.2 ? 'text-red-400' : difficultyMultiplier < 0.8 ? 'text-green-400' : 'text-slate-300'}`}>
                {(difficultyMultiplier * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </Card>
        
        <Card className={`bg-slate-900/80 backdrop-blur-md border-purple-500/50 p-4 transition-all duration-300 ${
          portalReady ? 'border-purple-400 shadow-lg shadow-purple-500/50' : 'opacity-50'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${portalReady ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs text-slate-400 font-semibold">PORTAL</div>
              <div className={`text-sm font-bold ${portalReady ? 'text-purple-400' : 'text-slate-500'}`}>
                {portalReady ? 'READY' : 'CHARGING'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Boss Health Bar */}
      {currentBoss && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none w-96">
          <Card className="bg-slate-900/90 backdrop-blur-md border-red-500/70 p-4 shadow-lg shadow-red-500/50">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
              <div className="text-sm font-bold text-yellow-400">{currentBoss.type}</div>
              <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border-2 border-red-500/50">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                style={{ width: `${(currentBoss.health / currentBoss.maxHealth) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1 text-center">
              {Math.ceil(currentBoss.health)} / {Math.ceil(currentBoss.maxHealth)} HP
            </div>
          </Card>
        </div>
      )}

      {/* Active Power-ups Display */}
      {activePowerups.length > 0 && !currentBoss && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <Card className="bg-slate-900/80 backdrop-blur-md border-purple-500/50 p-3">
            <div className="text-xs text-slate-400 font-semibold mb-2 text-center">ACTIVE POWER-UPS</div>
            <div className="flex gap-2">
              {activePowerups.map((powerup, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-1 px-2 py-1 rounded"
                  style={{ backgroundColor: powerup.color + '40' }}
                >
                  <span className="text-lg">{powerup.icon}</span>
                  <div className="text-xs font-bold" style={{ color: powerup.color }}>
                    {Math.ceil(powerup.timeLeft / 60)}s
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {players.length > 0 && (
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <Card className="bg-slate-900/80 backdrop-blur-md border-cyan-500/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <div className="text-xs text-slate-400 font-semibold">LEADERBOARD</div>
            </div>
            <div className="space-y-1">
              {players
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center gap-2 text-xs">
                    <span className={`font-bold ${index === 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      #{index + 1}
                    </span>
                    <span className="text-white truncate max-w-[100px]">{player.player_name}</span>
                    <span className="text-cyan-400 ml-auto">{player.score}</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}