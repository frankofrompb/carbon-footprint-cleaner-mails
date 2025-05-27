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
  const [volume, setVolume] = useState([0.3]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    {
      title: "Calm Piano",
      artist: "Free Music Archive",
      url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kevin_MacLeod/Impact/Kevin_MacLeod_-_Wallpaper.mp3"
    },
    {
      title: "Peaceful Guitar", 
      artist: "Free Music Archive",
      url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kevin_MacLeod/Classical/Kevin_MacLeod_-_Gymnopedie_No_1.mp3"
    },
    {
      title: "Ambient Relaxation",
      artist: "Free Music Archive",
      url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kevin_MacLeod/Electronica/Kevin_MacLeod_-_Healing.mp3"
    }
  ];

  // Debug: Log du rendu du composant
  console.log("MusicPlayer rendu - isVisible:", isVisible, "isPlaying:", isPlaying);

  // Écouter l'événement d'activation de la musique
  useEffect(() => {
    const handleActivateMusic = () => {
      console.log("Événement activateMusic reçu dans MusicPlayer");
      console.log("État actuel - isPlaying:", isPlaying, "isVisible:", isVisible);
      setIsPlaying(true);
    };

    window.addEventListener('activateMusic', handleActivateMusic);
    console.log("Event listener activateMusic ajouté");
    
    return () => {
      window.removeEventListener('activateMusic', handleActivateMusic);
      console.log("Event listener activateMusic retiré");
    };
  }, []);

  // Créer et gérer l'élément audio
  useEffect(() => {
    console.log("Effet audio - currentTrack:", currentTrack);
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      console.log("Nouvel élément audio créé");
    }

    const audio = audioRef.current;
    
    // Mettre à jour la source audio quand la piste change
    audio.src = tracks[currentTrack].url;
    audio.volume = isMuted ? 0 : volume[0];
    console.log("Audio source mise à jour:", tracks[currentTrack].url);

    // Événements audio
    const handleLoadedMetadata = () => {
      console.log("Audio metadata chargées, durée:", audio.duration);
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log("Piste terminée, passage à la suivante");
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    };

    const handleError = (e: Event) => {
      console.error("Erreur audio:", e);
    };

    const handleCanPlay = () => {
      console.log("Audio prêt à être lu");
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [currentTrack]);

  // Gérer la lecture/pause
  useEffect(() => {
    if (!audioRef.current) {
      console.log("Pas d'élément audio disponible");
      return;
    }

    const audio = audioRef.current;
    console.log("Effet lecture - isPlaying:", isPlaying, "currentTrack:", currentTrack);

    if (isPlaying) {
      console.log("Tentative de démarrage de la lecture:", tracks[currentTrack].title);
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Lecture démarrée avec succès");
          })
          .catch(error => {
            console.error("Erreur lors de la lecture:", error);
            setIsPlaying(false);
          });
      }
    } else {
      console.log("Pause de la lecture");
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Mettre à jour le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) {
    console.log("MusicPlayer non visible");
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <Card className="w-80 shadow-lg border-[#38c39d] bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#38c39d] rounded-full animate-pulse"></div>
              <h3 className="font-medium text-sm">Musique zen</h3>
            </div>
            {isScanning && (
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                Scan en cours
              </span>
            )}
          </div>
          
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-800">
              {tracks[currentTrack].title}
            </p>
            <p className="text-xs text-gray-500">
              {tracks[currentTrack].artist}
            </p>
          </div>

          {/* Barre de progression */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-[#38c39d] h-1 rounded-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicPlayer;
