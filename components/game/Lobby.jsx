import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Lobby({ session, players, currentPlayerId, onStartGame }) {
  const [copied, setCopied] = React.useState(false);

  const copyGameCode = () => {
    navigator.clipboard.writeText(session.session_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = players[0]?.id === currentPlayerId;

  return (
    <Card className="p-8 max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl border-purple-500/50">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            Game Lobby
          </h1>
          <p className="text-slate-400">Waiting for players to join...</p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-purple-500/30 text-center">
          <p className="text-sm text-slate-400 mb-2">Share this code with friends:</p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-widest">
              {session.session_code}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyGameCode}
              className="border-purple-500/50 hover:bg-purple-500/20"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Players ({players.length})</h3>
          </div>
          
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`bg-slate-900/50 p-4 rounded-lg border ${
                  player.id === currentPlayerId ? 'border-cyan-500/50' : 'border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {player.player_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{player.player_name}</span>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                            HOST
                          </Badge>
                        )}
                        {player.id === currentPlayerId && (
                          <Badge variant="outline" className="text-xs border-cyan-500 text-cyan-500">
                            YOU
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-xs">{player.promotional_link}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <Button
            onClick={onStartGame}
            disabled={players.length < 1}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6 text-lg"
          >
            Start Game
          </Button>
        )}

        {!isHost && (
          <div className="text-center text-slate-400 py-4">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </Card>
  );
}