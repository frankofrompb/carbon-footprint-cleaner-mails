
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.3]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pistes d'ambiance zen (URLs libres de droits ou sons générés)
  const tracks = [
    {
      name: "Forêt Tranquille",
      url: "https://www.soundjay.com/misc/sounds/forest-sounds.wav", // Placeholder - vous devrez remplacer par de vrais sons
      duration: "10:00"
    },
    {
      name: "Pluie Douce",
      url: "https://www.soundjay.com/nature/sounds/rain-03.wav", // Placeholder
      duration: "8:30"
    },
    {
      name: "Vagues Océan",
      url: "https://www.soundjay.com/nature/sounds/waves-crashing.wav", // Placeholder
      duration: "12:15"
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
      audioRef.current.loop = true;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        toast("Musique en pause", {
          icon: "⏸️"
        });
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        toast("Musique d'ambiance activée", {
          icon: "🎵"
        });
      }
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      toast("Impossible de lire la musique", {
        description: "Vérifiez vos paramètres audio",
        variant: "destructive"
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast(isMuted ? "Son activé" : "Son coupé", {
      icon: isMuted ? "🔊" : "🔇"
    });
  };

  const changeTrack = (direction: 'next' | 'prev') => {
    const newTrack = direction === 'next' 
      ? (currentTrack + 1) % tracks.length
      : (currentTrack - 1 + tracks.length) % tracks.length;
    
    setCurrentTrack(newTrack);
    if (isPlaying && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
    
    toast(`Piste: ${tracks[newTrack].name}`, {
      icon: "🎵"
    });
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-200 z-50">
      <div className="flex flex-col items-center space-y-4 w-64">
        {/* Tourne-disque */}
        <div className="relative">
          <div 
            className={`w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black border-4 border-gray-600 relative ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '3s' }}
          >
            {/* Centre du disque */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            </div>
            
            {/* Rainures du disque */}
            <div className="absolute inset-2 rounded-full border border-gray-500 opacity-30"></div>
            <div className="absolute inset-4 rounded-full border border-gray-500 opacity-20"></div>
            <div className="absolute inset-6 rounded-full border border-gray-500 opacity-10"></div>
          </div>
          
          {/* Bras de lecture */}
          <div 
            className={`absolute -top-2 -right-1 w-1 h-12 bg-gray-400 rounded-full origin-bottom transition-transform duration-500 ${
              isPlaying ? 'rotate-12' : 'rotate-45'
            }`}
          >
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Infos piste */}
        <div className="text-center">
          <h4 className="font-medium text-sm text-gray-800">{tracks[currentTrack].name}</h4>
          <p className="text-xs text-gray-500">{tracks[currentTrack].duration}</p>
        </div>

        {/* Contrôles */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeTrack('prev')}
            className="h-8 w-8 p-0"
          >
            ⏮️
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="h-10 w-10 p-0"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeTrack('next')}
            className="h-8 w-8 p-0"
          >
            ⏭️
          </Button>
        </div>

        {/* Contrôle volume */}
        <div className="flex items-center space-x-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={1}
            step={0.1}
            className="flex-1"
          />
        </div>

        {/* Element audio */}
        <audio
          ref={audioRef}
          src={tracks[currentTrack].url}
          preload="metadata"
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
