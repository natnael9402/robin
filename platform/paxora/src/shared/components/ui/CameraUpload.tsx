'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, ImageUp, RotateCcw, X, AlertTriangle, ScanLine } from 'lucide-react';
import { compressImage } from '../../lib/compressImage';

interface CameraUploadProps {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  facingMode?: 'user' | 'environment';
}

export function CameraUpload({ label, value, onChange, className, facingMode = 'environment' }: CameraUploadProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMsg('');
    setMode('camera');
    setIsReady(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported on this device/browser.');
      }
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      video.setAttribute('muted', '');
      video.muted = true;
      try {
        await video.play();
      } catch {
        // autoplay-blocked; capture still works once metadata loads
      }
      const markReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsReady(true);
        }
      };
      video.addEventListener('loadedmetadata', markReady);
      if (video.readyState >= 1) markReady();
      // Some iOS builds need a tick before dimensions are available
      setTimeout(markReady, 600);
      setTimeout(() => setIsReady(true), 1500);
    } catch (err: unknown) {
      stopCamera();
      setMode('error');
      setErrorMsg((err as Error)?.message || 'Unable to open camera. Please check permissions.');
    }
  }, [facingMode, stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 960;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
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

  const handleNativeCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) onChange(file);
    e.target.value = '';
  }, [onChange]);

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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
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
              disabled={!isReady}
              className="w-14 h-14 rounded-full bg-white border-4 border-white/40 flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="w-10 h-10 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className={className}>
        {label && (
          <label className="text-[10px] text-muted-foreground font-bold uppercase block mb-1.5 tracking-wider">
            {label}
          </label>
        )}
        <div className="rounded-xl bg-surface border border-border p-3">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">{errorMsg}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface-hover border border-border p-2.5 text-foreground hover:bg-surface-hover/70 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs font-semibold">Retry</span>
            </button>
            <button
              type="button"
              onClick={() => nativeInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground p-2.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span className="text-xs font-semibold">Open Camera</span>
            </button>
          </div>
          <input
            ref={nativeInputRef}
            type="file"
            accept="image/*"
            capture={facingMode === 'user' ? 'user' : 'environment'}
            onChange={handleNativeCapture}
            className="hidden"
          />
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
      <input
        ref={nativeInputRef}
        type="file"
        accept="image/*"
        capture={facingMode === 'user' ? 'user' : 'environment'}
        onChange={handleNativeCapture}
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
            onClick={() => nativeInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border border-dashed p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
          >
            <Camera className="w-4 h-4" />
            <span className="text-xs font-semibold">Camera</span>
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border border-dashed p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span className="text-xs font-semibold">Live Preview</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-surface border border-border border-dashed p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
          >
            <ImageUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Upload</span>
          </button>
        </div>
      )}
    </div>
  );
}
