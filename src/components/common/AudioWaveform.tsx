import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import './AudioWaveform.css';

interface AudioWaveformProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  onTimeUpdate,
  className = ''
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!waveformRef.current) return;

    let wavesurfer: WaveSurfer | null = null;
    let isSubscribed = true;

    const initWaveSurfer = async () => {
      try {
        // 기존 인스턴스가 있으면 먼저 정리
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }

        // WaveSurfer 인스턴스 생성
        wavesurfer = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: '#fff5f0',
          progressColor: '#EDB09A',
          cursorColor: '#000',
          barWidth: 3,
          barGap: 1,
          barRadius: 2,
          height: 50,
          normalize: true,
        });

        if (!isSubscribed) {
          wavesurfer.destroy();
          return;
        }

        wavesurferRef.current = wavesurfer;

        // 이벤트 리스너 등록
        wavesurfer.on('ready', () => {
          if (!isSubscribed) return;
          console.log('✅ Audio ready');
          const dur = wavesurfer!.getDuration();
          setDuration(formatTime(dur));
          setIsLoading(false);
        });

        wavesurfer.on('error', (err) => {
          if (!isSubscribed) return;
          console.error('❌ WaveSurfer error:', err);
          setError(`재생 오류: ${err || '알 수 없는 오류'}`);
          setIsLoading(false);
        });

        wavesurfer.on('audioprocess', (time) => {
          if (!isSubscribed) return;
          setCurrentTime(formatTime(time));
          onTimeUpdate?.(time);
        });

        wavesurfer.on('interaction', () => {
          if (!isSubscribed) return;
          const time = wavesurfer!.getCurrentTime();
          setCurrentTime(formatTime(time));
          onTimeUpdate?.(time);
        });

        wavesurfer.on('play', () => {
          if (!isSubscribed) return;
          setIsPlaying(true);
        });

        wavesurfer.on('pause', () => {
          if (!isSubscribed) return;
          setIsPlaying(false);
        });

        // 오디오 파일 로드
        console.log('🎵 Loading audio:', audioUrl);
        await wavesurfer.load(audioUrl);

      } catch (err: any) {
        if (!isSubscribed) return;
        console.error('❌ Load failed:', err);

        // AbortError는 무시 (정상적인 cleanup)
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.log('ℹ️ Load aborted (cleanup)');
          return;
        }

        setError(`로드 실패: ${err.message || '알 수 없는 오류'}`);
        setIsLoading(false);
      }
    };

    initWaveSurfer();

    return () => {
      console.log('🧹 Cleanup WaveSurfer');
      isSubscribed = false;

      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  if (error) {
    return (
      <div className={`audio-waveform ${className}`}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`audio-waveform ${className}`}>
      {isLoading && (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          
        </div>
      )}
      <div className="waveform-container" ref={waveformRef} />
      <div className="audio-controls">
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? '■' : '▶'}
        </button>
        <div className="time-display">
          <span className="current-time">{currentTime}</span>
          <span className="time-separator"> | </span>
          <span className="duration">{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
