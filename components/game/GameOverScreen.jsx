import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, ExternalLink, Crown } from 'lucide-react';

export default function GameOverScreen({ score, winnerName, winnerLink, isWinner, onRestart }) {
  return (
    <Card className="p-8 max-w-md w-full bg-slate-800/50 backdrop-blur-xl border-purple-500/50 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          {isWinner ? (
            <>
              <Crown className="w-20 h-20 mx-auto text-yellow-500 animate-bounce" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Victory!
              </h1>
              <p className="text-slate-400">You are the champion!</p>
            </>
          ) : (
            <>
              <Trophy className="w-20 h-20 mx-auto text-purple-500" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Game Over
              </h1>
              <p className="text-slate-400">Better luck next time!</p>
            </>
          )}
        </div>
        
        <div className="bg-slate-900/50 p-6 rounded-lg border border-purple-500/30">
          <div className="text-sm text-slate-400 mb-2">YOUR SCORE</div>
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
            {score}
          </div>
          
          <div className="border-t border-slate-700 pt-4 mt-4">
            <div className="text-sm text-slate-400 mb-2">WINNER</div>
            <div className="text-2xl font-bold text-yellow-400 mb-3">{winnerName}</div>
            
            <Button
              asChild
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6"
            >
              <a href={winnerLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Visit Winner's Link
              </a>
            </Button>
            <p className="text-xs text-slate-500 mt-2">Support the winner by checking out their link!</p>
          </div>
        </div>
        
        <Button 
          onClick={onRestart}
          variant="outline"
          className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 py-6 text-lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
      </div>
    </Card>
  );
}