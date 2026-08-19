"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string;
  alt?: string;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 8.0;
const SNAP_DELAY_MS = 160;

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleMotion = useMotionValue(1);

  const springX = useSpring(x, { stiffness: 400, damping: 35, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 400, damping: 35, mass: 0.8 });
  const springScale = useSpring(scaleMotion, { stiffness: 350, damping: 30, mass: 1 });

  const [displayScale, setDisplayScale] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef({ x: 0, y: 0, ix: 0, iy: 0 });
  const touchState = useRef<{ dist: number; scale: number } | null>(null);
  const rubberSnapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wheel zoom — must be imperative to use { passive: false }
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const currentScale = scaleMotion.get();
      const rawDelta = e.deltaY > 0 ? 0.92 : 1.1;
      const rawScale = currentScale * rawDelta;

      let newScale: number;
      if (rawScale < MIN_SCALE) {
        newScale = MIN_SCALE - (MIN_SCALE - rawScale) * 0.2;
      } else if (rawScale > MAX_SCALE) {
        newScale = MAX_SCALE + (rawScale - MAX_SCALE) * 0.2;
      } else {
        newScale = rawScale;
      }

      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const scaleFactor = newScale / currentScale;
      const newX = cx + (x.get() - cx) * scaleFactor;
      const newY = cy + (y.get() - cy) * scaleFactor;

      x.set(newX);
      y.set(newY);
      scaleMotion.set(newScale);
      setDisplayScale(Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)) * 100));

      if (rubberSnapTimer.current) clearTimeout(rubberSnapTimer.current);
      rubberSnapTimer.current = setTimeout(() => {
        const s = scaleMotion.get();
        const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
        if (Math.abs(s - clamped) > 0.005) {
          const sf = clamped / s;
          x.set(x.get() * sf);
          y.set(y.get() * sf);
          scaleMotion.set(clamped);
          setDisplayScale(Math.round(clamped * 100));
        }
      }, SNAP_DELAY_MS);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (rubberSnapTimer.current) clearTimeout(rubberSnapTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const zoomBy = (factor: number) => {
    const current = scaleMotion.get();
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current * factor));
    const sf = next / current;
    x.set(x.get() * sf);
    y.set(y.get() * sf);
    scaleMotion.set(next);
    setDisplayScale(Math.round(next * 100));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    scaleMotion.set(1);
    setDisplayScale(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStart.current = { x: e.clientX, y: e.clientY, ix: x.get(), iy: y.get() };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    x.set(pointerStart.current.ix + (e.clientX - pointerStart.current.x));
    y.set(pointerStart.current.iy + (e.clientY - pointerStart.current.y));
  };

  const onPointerUp = () => setIsDragging(false);

  const getTouchDist = (t: React.TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchState.current = { dist: getTouchDist(e.touches), scale: scaleMotion.get() };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchState.current) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const sf = newDist / touchState.current.dist;
      const raw = touchState.current.scale * sf;
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, raw));
      scaleMotion.set(clamped);
      setDisplayScale(Math.round(clamped * 100));
    }
  };

  const onTouchEnd = () => {
    touchState.current = null;
  };

  const btnBase =
    "apple-press-feedback p-1.5 rounded text-zinc-400 hover:text-white transition-colors";

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-zinc-950 rounded-xl overflow-hidden select-none"
      style={{ height: "360px" }}
    >
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10">
        <button onClick={() => zoomBy(0.8)} className={btnBase} title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-zinc-300 tabular-nums w-9 text-center">
          {displayScale}%
        </span>
        <button onClick={() => zoomBy(1.25)} className={btnBase} title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-white/20 mx-0.5" />
        <button onClick={reset} className={btnBase} title="Reset zoom">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={toggleFullscreen} className={btnBase} title="Toggle fullscreen">
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Hint */}
      {imageLoaded && !imageError && (
        <div className="absolute bottom-2 left-2 z-10 text-xs text-zinc-600 pointer-events-none">
          Scroll to zoom · Drag to pan
        </div>
      )}

      {/* Image transform layer */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          scale: springScale,
          cursor: isDragging ? "grabbing" : "grab",
          position: "absolute",
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-50%",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="w-80 h-52 bg-zinc-800 rounded-lg animate-pulse" />
        )}

        {/* Error state */}
        {imageError && (
          <div className="flex flex-col items-center justify-center gap-2 w-80 h-52 bg-zinc-800/60 rounded-lg border border-zinc-700/40">
            <span className="text-xs text-zinc-400">Document URL has expired</span>
            <span className="text-xs text-zinc-500">Close and reopen to refresh</span>
          </div>
        )}

        <img
          src={src}
          alt={alt ?? "KYC document"}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
          className={cn(
            "max-w-none rounded-lg shadow-2xl transition-opacity duration-300",
            imageLoaded && !imageError ? "opacity-100" : "opacity-0 absolute"
          )}
          style={{ maxWidth: "520px", maxHeight: "320px", objectFit: "contain" }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
