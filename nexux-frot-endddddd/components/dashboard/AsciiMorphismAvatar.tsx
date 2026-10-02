"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";


interface AsciiMorphismAvatarProps {
  avatarUrl: string;
  name: string;
  className?: string;
}

export function AsciiMorphismAvatar({
  avatarUrl,

  className = "",
}: AsciiMorphismAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isHovered, setIsHovered] = useState(false);
  const [lensRadius, setLensRadius] = useState(110);
  const [viewMode, setViewMode] = useState<"lens" | "decrypt" | "matrix">("lens");
  const [isLoaded, setIsLoaded] = useState(false);

  // Mouse & Lens Physics
  const mousePos = useRef({ x: -500, y: -500 });
  const lensPos = useRef({ x: -500, y: -500 });
  const targetLensRadius = useRef(0);
  const currentLensRadius = useRef(0);
  const animFrameId = useRef<number | null>(null);

  // ASCII Matrix Data
  const matrixDataRef = useRef<{
    cols: number;
    rows: number;
    cellW: number;
    cellH: number;
    chars: string[][];
    alphas: number[][];
  } | null>(null);

  // Standard high-density ASCII character ramp from dark to bright
  const ASCII_RAMP = " .:-=+*#%@";

  // Precompute ASCII matrix from image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = avatarUrl;

    img.onload = () => {
      // Offscreen analysis canvas
      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      const cols = 64;
      const rows = 74;
      offCanvas.width = cols;
      offCanvas.height = rows;

      // Draw image scaled down to sample grid
      offCtx.drawImage(img, 0, 0, cols, rows);
      const imgData = offCtx.getImageData(0, 0, cols, rows).data;

      const chars: string[][] = [];
      const alphas: number[][] = [];

      for (let r = 0; r < rows; r++) {
        const rowChars: string[] = [];
        const rowAlphas: number[] = [];

        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4;
          const red = imgData[idx];
          const green = imgData[idx + 1];
          const blue = imgData[idx + 2];
          const alpha = imgData[idx + 3] / 255.0;

          // Perceived luminance
          const lum = (0.299 * red + 0.587 * green + 0.114 * blue) * alpha;

          // Normalized luminance
          const norm = Math.min(1.0, Math.max(0.0, lum / 255.0));
          const charIdx = Math.min(
            ASCII_RAMP.length - 1,
            Math.floor(norm * ASCII_RAMP.length)
          );

          rowChars.push(ASCII_RAMP[charIdx]);
          rowAlphas.push(norm);
        }
        chars.push(rowChars);
        alphas.push(rowAlphas);
      }

      matrixDataRef.current = {
        cols,
        rows,
        cellW: 0, // will be computed on render resize
        cellH: 0,
        chars,
        alphas,
      };

      setIsLoaded(true);
    };
  }, [avatarUrl]);

  // Handle Mouse Movement inside container
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mousePos.current = { x: -500, y: -500 };
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load original image for direct drawing underneath
    const baseImg = new window.Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = avatarUrl;

    let clock = 0;

    const render = () => {
      animFrameId.current = requestAnimationFrame(render);
      clock += 0.04;

      const rect = containerRef.current?.getBoundingClientRect();
      const displayW = rect?.width || 380;
      const displayH = rect?.height || 440;

      // Handle Retina scaling
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Target lens radius determination
      if (viewMode === "decrypt") {
        targetLensRadius.current = Math.hypot(displayW, displayH);
      } else if (viewMode === "matrix") {
        targetLensRadius.current = 0;
      } else {
        // "lens" mode
        targetLensRadius.current = isHovered ? lensRadius : 0;
      }

      // Smooth exponential lerp
      currentLensRadius.current +=
        (targetLensRadius.current - currentLensRadius.current) * 0.12;

      // Smooth lens position tracking
      if (isHovered && viewMode === "lens") {
        lensPos.current.x += (mousePos.current.x - lensPos.current.x) * 0.18;
        lensPos.current.y += (mousePos.current.y - lensPos.current.y) * 0.18;
      } else if (viewMode === "decrypt") {
        lensPos.current.x = displayW / 2;
        lensPos.current.y = displayH / 2;
      }

      // -------------------------------------------------------------
      // 1. Draw Base Clear Avatar Image
      // -------------------------------------------------------------
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, displayW, displayH);

      if (baseImg.complete) {
        ctx.drawImage(baseImg, 0, 0, displayW, displayH);
      }

      // -------------------------------------------------------------
      // 2. Draw ASCII Matrix on Top with Localized Cutout Lens
      // -------------------------------------------------------------
      const matrix = matrixDataRef.current;
      if (matrix && currentLensRadius.current < Math.hypot(displayW, displayH) * 0.98) {
        // Create an offscreen buffer for the ASCII layer so we can punch out the lens
        const offscreen = document.createElement("canvas");
        offscreen.width = displayW * dpr;
        offscreen.height = displayH * dpr;
        const offCtx = offscreen.getContext("2d");

        if (offCtx) {
          offCtx.scale(dpr, dpr);

          // Dark dense mask background
          offCtx.fillStyle = "rgba(7, 8, 11, 0.92)";
          offCtx.fillRect(0, 0, displayW, displayH);

          // Render Monospace ASCII Characters
          const cellW = displayW / matrix.cols;
          const cellH = displayH / matrix.rows;
          offCtx.font = "bold 8px monospace";
          offCtx.textAlign = "center";
          offCtx.textBaseline = "middle";

          for (let r = 0; r < matrix.rows; r++) {
            for (let c = 0; c < matrix.cols; c++) {
              const char = matrix.chars[r][c];
              if (char === " ") continue;

              const lum = matrix.alphas[r][c];
              // Subtle shimmer
              const shimmer = Math.sin(clock + r * 0.5 + c * 0.3) * 0.08;
              const alpha = Math.min(1.0, Math.max(0.2, lum + shimmer));

              // High-contrast monochromatic typography
              if (lum > 0.75) {
                offCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              } else if (lum > 0.4) {
                offCtx.fillStyle = `rgba(212, 212, 216, ${alpha * 0.9})`;
              } else {
                offCtx.fillStyle = `rgba(113, 113, 122, ${alpha * 0.75})`;
              }

              offCtx.fillText(char, c * cellW + cellW / 2, r * cellH + cellH / 2);
            }
          }

          // -----------------------------------------------------------
          // 3. Localized Cutout Aperture (Matching Reference Image)
          // -----------------------------------------------------------
          if (currentLensRadius.current > 2) {
            offCtx.save();
            offCtx.globalCompositeOperation = "destination-out";

            const grad = offCtx.createRadialGradient(
              lensPos.current.x,
              lensPos.current.y,
              Math.max(0, currentLensRadius.current - 40),
              lensPos.current.x,
              lensPos.current.y,
              currentLensRadius.current
            );
            grad.addColorStop(0, "rgba(0, 0, 0, 1)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");

            offCtx.fillStyle = grad;
            offCtx.beginPath();
            offCtx.arc(
              lensPos.current.x,
              lensPos.current.y,
              currentLensRadius.current,
              0,
              Math.PI * 2
            );
            offCtx.fill();
            offCtx.restore();
          }

          // Draw the composited ASCII layer back onto main canvas
          ctx.drawImage(offscreen, 0, 0, displayW, displayH);
        }
      }

      // -------------------------------------------------------------
      // 4. Luminous Cybernetic Lens Ring Boundary
      // -------------------------------------------------------------
      if (
        isHovered &&
        viewMode === "lens" &&
        currentLensRadius.current > 10 &&
        currentLensRadius.current < Math.hypot(displayW, displayH) * 0.8
      ) {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 210, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(
          lensPos.current.x,
          lensPos.current.y,
          currentLensRadius.current - 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        // Crosshair reticle accents
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        const retSize = 8;
        // Top
        ctx.beginPath();
        ctx.moveTo(lensPos.current.x, lensPos.current.y - currentLensRadius.current);
        ctx.lineTo(lensPos.current.x, lensPos.current.y - currentLensRadius.current - retSize);
        ctx.stroke();
        // Bottom
        ctx.beginPath();
        ctx.moveTo(lensPos.current.x, lensPos.current.y + currentLensRadius.current);
        ctx.lineTo(lensPos.current.x, lensPos.current.y + currentLensRadius.current + retSize);
        ctx.stroke();
        // Left
        ctx.beginPath();
        ctx.moveTo(lensPos.current.x - currentLensRadius.current, lensPos.current.y);
        ctx.lineTo(lensPos.current.x - currentLensRadius.current - retSize, lensPos.current.y);
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(lensPos.current.x + currentLensRadius.current, lensPos.current.y);
        ctx.lineTo(lensPos.current.x + currentLensRadius.current + retSize, lensPos.current.y);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [avatarUrl, isLoaded, isHovered, lensRadius, viewMode]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Main Interactive Avatar Frame */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[380px] aspect-[1/1.14] rounded-sm border border-hairline overflow-hidden bg-black cursor-crosshair select-none shadow-2xl mx-auto"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Top-Right HUD Badge */}
        <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-white/20 bg-black/80 backdrop-blur-sm font-mono text-[9px] text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ASCII // MORPHISM</span>
        </div>

        {/* Floating Instruction Banner at Rest */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full border border-white/20 bg-black/80 backdrop-blur-sm font-mono text-[9px] text-white transition-opacity duration-300 ${
            isHovered ? "opacity-0" : "opacity-90"
          }`}
        >
          HOVER CURSOR TO DECRYPT AVATAR
        </div>
      </div>

      {/* 2. Tactical Control Deck */}
      <div className="max-w-[380px] mx-auto p-3 rounded-sm border border-hairline bg-paper/60 backdrop-blur-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider">
            DECRYPTION MODE:
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => setViewMode("lens")}
              className={`px-2 py-0.5 rounded border transition-colors ${
                viewMode === "lens"
                  ? "border-ink bg-ink text-onink font-bold"
                  : "border-hairline text-muted hover:text-ink"
              }`}
            >
              LENS REVEAL
            </button>
            <button
              onClick={() => setViewMode("decrypt")}
              className={`px-2 py-0.5 rounded border transition-colors ${
                viewMode === "decrypt"
                  ? "border-ink bg-ink text-onink font-bold"
                  : "border-hairline text-muted hover:text-ink"
              }`}
            >
              CLEAR PHOTO
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-2 py-0.5 rounded border transition-colors ${
                viewMode === "matrix"
                  ? "border-ink bg-ink text-onink font-bold"
                  : "border-hairline text-muted hover:text-ink"
              }`}
            >
              MATRIX LOCK
            </button>
          </div>
        </div>

        {/* Lens Aperture Slider */}
        {viewMode === "lens" && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-hairline/60 font-mono text-[10px] text-muted">
            <span>APERTURE SIZE:</span>
            <input
              type="range"
              min={70}
              max={180}
              value={lensRadius}
              onChange={(e) => setLensRadius(Number(e.target.value))}
              className="w-32 accent-ink cursor-pointer"
            />
            <span className="font-bold text-ink w-8 text-right">{lensRadius}px</span>
          </div>
        )}
      </div>
    </div>
  );
}
