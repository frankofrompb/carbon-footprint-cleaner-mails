
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const tracks = [
    {
      title: "Pluie douce",
      type: "rain"
    },
    {
      title: "Vagues océan", 
      type: "ocean"
    },
    {
      title: "Vent dans les arbres",
      type: "wind"
    }
  ];

  // Créer un son d'ambiance synthétique
  const createAmbientSound = (type: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const context = audioContextRef.current;
    
    // Arrêter l'oscillateur précédent s'il existe
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    // Créer un nouveau gain node
    const gainNode = context.createGain();
    gainNodeRef.current = gainNode;
    
    // Régler le volume
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume[0] * 0.3, context.currentTime);
    gainNode.connect(context.destination);

    // Créer différents types de sons selon le type
    switch (type) {
      case "rain":
        // Son de pluie avec du bruit blanc filtré
        createRainSound(context, gainNode);
        break;
      case "ocean":
        // Son d'océan avec oscillation basse fréquence
        createOceanSound(context, gainNode);
        break;
      case "wind":
        // Son de vent avec filtrage passe-haut
        createWindSound(context, gainNode);
        break;
    }
  };

  const createRainSound = (context: AudioContext, gainNode: GainNode) => {
    // Créer du bruit blanc pour simuler la pluie
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = context.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    // Filtrer pour créer l'effet pluie
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3000, context.currentTime);
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    whiteNoise.start();
    
    oscillatorRef.current = whiteNoise as any;
  };

  const createOceanSound = (context: AudioContext, gainNode: GainNode) => {
    // Oscillateur principal pour les vagues
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(80, context.currentTime);
    
    // Modulation pour l'effet vague
    const modulator = context.createOscillator();
    modulator.type = "sine";
    modulator.frequency.setValueAtTime(0.2, context.currentTime);
    
    const modulatorGain = context.createGain();
    modulatorGain.gain.setValueAtTime(20, context.currentTime);
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);
    
    oscillator.connect(gainNode);
    oscillator.start();
    modulator.start();
    
    oscillatorRef.current = oscillator;
  };

  const createWindSound = (context: AudioContext, gainNode: GainNode) => {
    // Bruit rose pour le vent
    const bufferSize = 2 * context.sampleRate;
    const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
    
    const pinkNoise = context.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;
    
    // Filtre passe-haut pour l'effet vent
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(500, context.currentTime);
    
    pinkNoise.connect(filter);
    filter.connect(gainNode);
    pinkNoise.start();
    
    oscillatorRef.current = pinkNoise as any;
  };

  // Écouter l'événement d'activation de la musique
  useEffect(() => {
    const handleActivateMusic = () => {
      console.log("Événement activateMusic reçu");
      if (!isPlaying) {
        setIsPlaying(true);
      }
    };

    window.addEventListener('activateMusic', handleActivateMusic);
    return () => window.removeEventListener('activateMusic', handleActivateMusic);
  }, [isPlaying]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume[0] * 0.3, 
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      createAmbientSound(tracks[currentTrack].type);
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // L'oscillateur était déjà arrêté
        }
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // L'oscillateur était déjà arrêté
        }
      }
    };
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicPlayer;
