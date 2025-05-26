import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerProps {
  isVisible: boolean;
  isScanning: boolean;
}

const MusicPlayer = ({ isVisible, isScanning }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pistes zen d'ambiance
  const tracks = [
    {
      title: "Rivière paisible",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    },
    {
      title: "Forêt zen", 
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav"
    },
    {
      title: "Méditation douce",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-03.wav"
    }
  ];

  // Écouter l'événement d'activation de la musique
  useEffect(() => {
    const handleActivateMusic = () => {
      if (audioRef.current && !isPlaying) {
        setIsPlaying(true);
        audioRef.current.play().catch(console.error);
      }
    };

    window.addEventListener('activateMusic', handleActivateMusic);
    return () => window.removeEventListener('activateMusic', handleActivateMusic);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="w-80 shadow-lg border-[#38c39d] bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#38c39d] rounded-full animate-pulse"></div>
              <h3 className="font-medium text-sm">Ambiance zen</h3>
            </div>
            {isScanning && (
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                Scan en cours
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            {tracks[currentTrack].title}
          </p>
          
          <div className="flex items-center space-x-2 mb-3">
            <Button
              onClick={togglePlay}
              size="sm"
              className="h-8 w-8 rounded-full bg-[#38c39d] hover:bg-[#2ea384]"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={nextTrack}
              size="sm"
              variant="outline"
              className="h-8 w-8 rounded-full"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={toggleMute}
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={tracks[currentTrack].url}
            loop
            onError={(e) => {
              console.log("Erreur audio:", e);
              // En cas d'erreur, passer à la piste suivante
              nextTrack();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicPlayer;
