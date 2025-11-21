import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformDisplayProps {
  audioUrl: string;
  color: string;
  isPlaying: boolean;
}

const WaveformDisplay = ({ audioUrl, color, isPlaying }: WaveformDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: color,
      progressColor: `${color}dd`,
      height: 64,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 0,
      normalize: true,
    });

    wavesurferRef.current.load(audioUrl);

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl, color]);

  useEffect(() => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.play();
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);

  return <div ref={containerRef} className="w-full" />;
};

export default WaveformDisplay;