'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, ImageUp, RotateCcw, X } from 'lucide-react';
import { compressImage } from '../../lib/compressImage';

interface CameraUploadProps {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  facingMode?: 'user' | 'environment';
}

export function CameraUpload({ label, value, onChange, className, facingMode = 'environment' }: CameraUploadProps) {
  const [mode, setMode] = useState<'idle' | 'camera'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
    } catch {
      setMode('idle');
    }
  }, [facingMode]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const rawFile = new File([blob], `captured_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const compressed = await compressImage(rawFile);
        onChange(compressed);
      }
    }, 'image/jpeg', 0.92);

    stopCamera();
    setMode('idle');
  }, [onChange, stopCamera]);

  const cancelCamera = useCallback(() => {
    stopCamera();
    setMode('idle');
  }, [stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (mode === 'camera') {
    return (
      <div className={className}>
        {label && (
          <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl overflow-hidden bg-black/80 border border-border">
          <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              type="button"
              onClick={cancelCamera}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full bg-white border-4 border-white/40 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-xl bg-surface border border-border p-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{value.name}</p>
            <p className="text-[10px] text-muted-foreground">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border border-dashed p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
          >
            <ImageUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Upload</span>
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border border-dashed p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
          >
            <Camera className="w-4 h-4" />
            <span className="text-xs font-semibold">Camera</span>
          </button>
        </div>
      )}
    </div>
  );
}
