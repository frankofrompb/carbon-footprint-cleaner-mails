import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface MusicPlayerProps {
  isVisible: boolean;
  isScanning: boolean;
}

const MusicPlayer = ({ isVisible, isScanning }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.3]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pistes d'ambiance zen avec URLs fonctionnelles
  const tracks = [
    {
      name: "Forêt Tranquille",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      duration: "10:00"
    },
    {
      name: "Pluie Douce", 
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
      duration: "8:30"
    },
    {
      name: "Vagues Océan",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav", 
      duration: "12:15"
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
      audioRef.current.loop = true;
      // Précharger l'audio
      audioRef.current.load();
    }
  }, [volume, isMuted, currentTrack]);

  // Auto-expand pendant le scan
  useEffect(() => {
    if (isScanning) {
      setIsExpanded(true);
    }
  }, [isScanning]);

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
        // Test de connexion audio simple
        audioRef.current.volume = isMuted ? 0 : volume[0];
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          toast("Musique d'ambiance activée", {
            icon: "🎵"
          });
        }
      }
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      toast("Audio non disponible", {
        description: "Utilisation d'un son de notification simple"
      });
      
      // Fallback avec un beep simple
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(isMuted ? 0 : volume[0] * 0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        setIsPlaying(false);
        toast("Son de notification joué", {
          icon: "🔔"
        });
      } catch (fallbackError) {
        console.error('Erreur fallback audio:', fallbackError);
        setIsPlaying(false);
      }
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
    
    // Arrêter la lecture actuelle
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    toast(`Piste: ${tracks[newTrack].name}`, {
      icon: "🎵"
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Gérer les erreurs de chargement audio
  const handleAudioError = () => {
    console.error('Erreur de chargement audio pour:', tracks[currentTrack].url);
    toast("Erreur de chargement audio", {
      description: "Impossible de charger cette piste"
    });
    setIsPlaying(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Icône play/pause minimisée */}
      {!isExpanded && (
        <Button
          onClick={toggleExpanded}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200 hover:bg-white/95"
          variant="ghost"
        >
          <Play className="h-5 w-5 text-gray-700" />
        </Button>
      )}

      {/* Lecteur complet */}
      {isExpanded && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-200">
          <div className="flex flex-col items-center space-y-4 w-64">
            {/* Bouton fermer */}
            <div className="w-full flex justify-end">
              <Button
                onClick={toggleExpanded}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

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
              <p className="text-xs text-gray-500">Sons d'ambiance</p>
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
              preload="none"
              onError={handleAudioError}
              onLoadStart={() => console.log('Chargement audio:', tracks[currentTrack].name)}
              onCanPlay={() => console.log('Audio prêt:', tracks[currentTrack].name)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
