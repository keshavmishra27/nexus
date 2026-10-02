"use client";

import React, { useEffect, useRef } from "react";

export type RunnerGameState = "RUNNING" | "FAIL_CRASH" | "SUCCESS_SPRINT";

interface RunnerGameCanvasProps {
  gameState: RunnerGameState;
  onSuccessComplete?: () => void;
  className?: string;
}

export function RunnerGameCanvas({
  gameState,
  onSuccessComplete,
  className = "",
}: RunnerGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Keep live references to props so the game loop never tears down on keystrokes
  const stateRef = useRef(gameState);
  const onSuccessRef = useRef(onSuccessComplete);

  useEffect(() => {
    stateRef.current = gameState;
    onSuccessRef.current = onSuccessComplete;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // Game World Variables
    // -------------------------------------------------------------
    let score = 340;
    const gameSpeed = 5.2;
    const groundY = height * 0.78;
    let dashOffset = 0;
    let screenShake = 0;
    let lastKnownState: RunnerGameState = "RUNNING";

    // -------------------------------------------------------------
    // 1. Crawler Robot Character (Monochromatic HAVU Pixel Art)
    // -------------------------------------------------------------
    const crawler = {
      x: 140,
      y: groundY - 32,
      w: 30,
      h: 30,
      vy: 0,
      gravity: 0.65,
      jumpForce: -12.8,
      isGrounded: true,
      legFrame: 0,
      isDead: false,
      rotation: 0,
      sprintSpeed: 0,
      hasSprintedOffscreen: false,
    };

    // -------------------------------------------------------------
    // 2. Randomized Obstacle System
    // -------------------------------------------------------------
    interface Obstacle {
      x: number;
      w: number;
      h: number;
      type: "pillar" | "stepped" | "spire";
    }
    const obstacles: Obstacle[] = [];
    let nextObstacleDistance = 320;

    const spawnObstacle = () => {
      // Randomized widths, heights, and interval gaps
      const types: Array<"pillar" | "stepped" | "spire"> = ["pillar", "stepped", "spire"];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      
      let w = 22;
      let h = 30;

      if (chosenType === "pillar") {
        w = 20 + Math.floor(Math.random() * 8); // 20 - 28
        h = 28 + Math.floor(Math.random() * 14); // 28 - 42
      } else if (chosenType === "stepped") {
        w = 32 + Math.floor(Math.random() * 10); // 32 - 42
        h = 24 + Math.floor(Math.random() * 8); // 24 - 32
      } else {
        w = 18;
        h = 36 + Math.floor(Math.random() * 12); // 36 - 48
      }

      obstacles.push({
        x: width + 40,
        w,
        h,
        type: chosenType,
      });

      // Randomized spacing between 280px and 560px
      nextObstacleDistance = 280 + Math.random() * 280;
    };

    // -------------------------------------------------------------
    // 3. HAVU Roaming UFOs (21x8 Cell Vector Pixel Craft)
    // -------------------------------------------------------------
    interface UFO {
      x: number;
      y: number;
      baseY: number;
      speed: number;
      beamWidth: number;
      pulsePhase: number;
      cell: number;
    }

    const ufos: UFO[] = [
      {
        x: width * 0.75,
        y: height * 0.12,
        baseY: height * 0.12,
        speed: -0.65, // Roams to the left
        beamWidth: 54,
        pulsePhase: 0,
        cell: 3,
      },
      {
        x: width * 0.18,
        y: height * 0.22,
        baseY: height * 0.22,
        speed: 0.50, // Roams to the right
        beamWidth: 46,
        pulsePhase: Math.PI,
        cell: 2.5,
      },
    ];

    // -------------------------------------------------------------
    // 4. Parallax Monochromatic Starfield
    // -------------------------------------------------------------
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      twinkleSpeed: number;
    }
    const stars: Star[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (groundY - 40),
      size: Math.random() > 0.85 ? 2 : 1,
      alpha: 0.2 + Math.random() * 0.7,
      twinkleSpeed: 0.02 + Math.random() * 0.04,
    }));

    // -------------------------------------------------------------
    // 5. Monochromatic Particles (Explosion & Jet Boost)
    // -------------------------------------------------------------
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      gravity: number;
    }
    const particles: Particle[] = [];

    const spawnDeathExplosion = () => {
      screenShake = 16;
      for (let i = 0; i < 45; i++) {
        const speed = 2 + Math.random() * 9;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: crawler.x + crawler.w / 2,
          y: crawler.y + crawler.h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: Math.floor(Math.random() * 4) + 2,
          color: Math.random() > 0.4 ? "#ffffff" : Math.random() > 0.5 ? "#a1a1aa" : "#3f3f46",
          life: 1.0,
          gravity: 0.25,
        });
      }
    };

    // -------------------------------------------------------------
    // Main Autonomous Game Loop
    // -------------------------------------------------------------
    let frameCount = 0;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      frameCount++;

      const currentState = stateRef.current;

      // Handle Transitions
      if (currentState !== lastKnownState) {
        if (currentState === "FAIL_CRASH" && !crawler.isDead) {
          crawler.isDead = true;
          crawler.rotation = 0.55;
          spawnDeathExplosion();
        } else if (currentState === "SUCCESS_SPRINT") {
          crawler.sprintSpeed = 14;
        } else if (currentState === "RUNNING" && crawler.isDead) {
          // Respawn robot cleanly if user begins typing again
          crawler.isDead = false;
          crawler.rotation = 0;
          crawler.y = groundY - crawler.h;
          crawler.vy = 0;
          crawler.isGrounded = true;
        }
        lastKnownState = currentState;
      }

      // -----------------------------------------------------------
      // Canvas Rendering (Pure Monochromatic Black #000000)
      // -----------------------------------------------------------
      ctx.save();

      // Screen Shake on death
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake *= 0.88;
        if (screenShake < 0.5) screenShake = 0;
      }

      // Base Black Background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Starfield
      for (const star of stars) {
        star.alpha += Math.sin(frameCount * star.twinkleSpeed) * 0.015;
        const clampedAlpha = Math.max(0.1, Math.min(0.9, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Distant Monochromatic Skyline Silhouettes (Brutalist blocks)
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, groundY - 60, width, 60);
      for (let sx = 0; sx < width; sx += 90) {
        const blockH = 20 + ((sx * 31) % 45);
        ctx.fillRect(sx, groundY - blockH, 50, blockH);
      }
      ctx.fillStyle = "#121215";
      for (let sx = 40; sx < width; sx += 120) {
        const blockH = 15 + ((sx * 47) % 35);
        ctx.fillRect(sx, groundY - blockH, 40, blockH);
      }

      // -----------------------------------------------------------
      // Roaming UFOs (HAVU 21x8 Pixel Art with Tractor Beams)
      // -----------------------------------------------------------
      for (const ufo of ufos) {
        ufo.x += ufo.speed;
        ufo.pulsePhase += 0.05;
        ufo.y = ufo.baseY + Math.sin(ufo.pulsePhase) * 6;

        // Wrap around boundaries
        if (ufo.speed < 0 && ufo.x < -120) {
          ufo.x = width + 60;
        } else if (ufo.speed > 0 && ufo.x > width + 120) {
          ufo.x = -60;
        }

        const c = ufo.cell; // cell size
        const ufoW = 21 * c;
        const ufoH = 8 * c;

        // Draw Animated Downward Tractor Beam
        const beamTopX = ufo.x + ufoW / 2;
        const beamTopY = ufo.y + ufoH;
        const beamBottomW = ufo.beamWidth * 2.2;
        const beamOpacity = 0.06 + Math.sin(ufo.pulsePhase * 2) * 0.03;

        const beamGrad = ctx.createLinearGradient(beamTopX, beamTopY, beamTopX, groundY);
        beamGrad.addColorStop(0, `rgba(255, 255, 255, ${beamOpacity * 1.5})`);
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamTopX - (5 * c) / 2, beamTopY);
        ctx.lineTo(beamTopX + (5 * c) / 2, beamTopY);
        ctx.lineTo(beamTopX + beamBottomW / 2, groundY);
        ctx.lineTo(beamTopX - beamBottomW / 2, groundY);
        ctx.closePath();
        ctx.fill();

        // Beam Scanlines
        ctx.strokeStyle = `rgba(255, 255, 255, ${beamOpacity * 0.8})`;
        ctx.lineWidth = 1;
        const scanlineY = beamTopY + ((frameCount * 2) % (groundY - beamTopY));
        if (scanlineY < groundY) {
          const progress = (scanlineY - beamTopY) / (groundY - beamTopY);
          const currentScanW = (5 * c) + (beamBottomW - (5 * c)) * progress;
          ctx.beginPath();
          ctx.moveTo(beamTopX - currentScanW / 2, scanlineY);
          ctx.lineTo(beamTopX + currentScanW / 2, scanlineY);
          ctx.stroke();
        }

        // Draw 21x8 UFO Sprite Cells
        ctx.save();
        ctx.translate(ufo.x, ufo.y);

        // Row 0-1: Dome Center (White)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8 * c, 0 * c, 5 * c, 1 * c);
        ctx.fillRect(7 * c, 1 * c, 7 * c, 1 * c);

        // Row 2: Upper Rim (Light Gray)
        ctx.fillStyle = "#e4e4e7";
        ctx.fillRect(3 * c, 2 * c, 15 * c, 1 * c);

        // Row 3: Widest Mid Rim (White + Blinking Signal Lights)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0 * c, 3 * c, 21 * c, 1 * c);

        // 3 Animated blinking dots on the saucer rim
        const blink1 = Math.floor(frameCount / 18) % 2 === 0;
        const blink2 = Math.floor((frameCount + 9) / 18) % 2 === 0;
        ctx.fillStyle = blink1 ? "#000000" : "#ffffff";
        ctx.fillRect(4 * c, 3 * c, 2 * c, 1 * c);
        ctx.fillRect(15 * c, 3 * c, 2 * c, 1 * c);
        ctx.fillStyle = blink2 ? "#000000" : "#ffffff";
        ctx.fillRect(10 * c, 3 * c, 1 * c, 1 * c);

        // Row 4: Lower Rim (Mid Gray)
        ctx.fillStyle = "#71717a";
        ctx.fillRect(2 * c, 4 * c, 17 * c, 1 * c);

        // Row 5: Undercarriage (Dark Charcoal)
        ctx.fillStyle = "#27272a";
        ctx.fillRect(6 * c, 5 * c, 9 * c, 1 * c);

        // Row 6: Beam Emitter Lens (White)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8 * c, 6 * c, 5 * c, 1 * c);

        ctx.restore();
      }

      // -----------------------------------------------------------
      // Ground Track (1px White Hairline & Dashed Rail)
      // -----------------------------------------------------------
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, groundY, width, 1.5);

      dashOffset = (dashOffset + (crawler.isDead ? 0 : gameSpeed)) % 40;
      ctx.fillStyle = "#27272a";
      for (let x = -dashOffset; x < width; x += 40) {
        ctx.fillRect(x, groundY + 10, 16, 2);
      }

      // Telemetry Score Header (Monochromatic Pixel Readout)
      ctx.font = "12px monospace";
      ctx.fillStyle = "#71717a";
      ctx.fillText(`TELEMETRY: RUNNER ACTIVE // SCORE ${String(Math.floor(score)).padStart(5, "0")}`, 24, 38);

      // -----------------------------------------------------------
      // Obstacle Updates & Drawing
      // -----------------------------------------------------------
      if (!crawler.isDead) {
        score += 0.12;

        nextObstacleDistance -= gameSpeed;
        if (nextObstacleDistance <= 0 && currentState !== "SUCCESS_SPRINT") {
          spawnObstacle();
        }
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (!crawler.isDead) {
          obs.x -= gameSpeed;
        }

        // Draw Monochromatic Brutalist Obstacle
        // Outer dark box
        ctx.fillStyle = "#121215";
        ctx.fillRect(obs.x, groundY - obs.h, obs.w, obs.h);

        // 1px White Hairline Frame
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(obs.x + 0.5, groundY - obs.h + 0.5, obs.w - 1, obs.h - 1);

        // Inner 'H' stamped monogram (HAVU homage)
        ctx.fillStyle = "#ffffff";
        const midX = obs.x + Math.floor(obs.w / 2);
        const midY = groundY - Math.floor(obs.h / 2);
        ctx.fillRect(midX - 5, midY - 6, 2, 12);
        ctx.fillRect(midX + 3, midY - 6, 2, 12);
        ctx.fillRect(midX - 5, midY - 1, 10, 2);

        // Remove offscreen
        if (obs.x + obs.w < -60) {
          obstacles.splice(i, 1);
        }
      }

      // -----------------------------------------------------------
      // Crawler Physics & Auto-Jumping AI
      // -----------------------------------------------------------
      if (!crawler.isDead) {
        // Auto-jumping AI: detects oncoming obstacle and leaps safely
        const nearestObstacle = obstacles.find((obs) => obs.x > crawler.x);
        if (nearestObstacle && nearestObstacle.x - crawler.x < 118 && crawler.isGrounded) {
          crawler.vy = crawler.jumpForce;
          crawler.isGrounded = false;
        }

        // Apply Gravity
        crawler.y += crawler.vy;
        crawler.vy += crawler.gravity;

        if (crawler.y >= groundY - crawler.h) {
          crawler.y = groundY - crawler.h;
          crawler.vy = 0;
          crawler.isGrounded = true;
        }

        // Leg stride frame
        crawler.legFrame = (crawler.legFrame + 0.22) % 2;

        // SUCCESS SPRINT Transition
        if (currentState === "SUCCESS_SPRINT") {
          crawler.x += crawler.sprintSpeed;
          crawler.sprintSpeed += 0.85;

          // Rocket booster particles
          particles.push({
            x: crawler.x,
            y: crawler.y + crawler.h / 2 + (Math.random() - 0.5) * 8,
            vx: -Math.random() * 8 - 4,
            vy: (Math.random() - 0.5) * 3,
            size: Math.floor(Math.random() * 3) + 2,
            color: "#ffffff",
            life: 0.8,
            gravity: 0,
          });

          // Callback once completely exited frame
          if (crawler.x > width + 120 && !crawler.hasSprintedOffscreen) {
            crawler.hasSprintedOffscreen = true;
            onSuccessRef.current?.();
          }
        }
      }

      // -----------------------------------------------------------
      // Draw Crawler Robot (Pure Monochromatic Pixel Art)
      // -----------------------------------------------------------
      ctx.save();
      ctx.translate(crawler.x, crawler.y);

      if (crawler.isDead) {
        ctx.rotate(crawler.rotation);
      } else if (currentState === "SUCCESS_SPRINT") {
        ctx.rotate(0.18); // Lean forward into sprint
      }

      // 1. Robot Head / Chassis (Crisp Solid White #ffffff)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(4, 0, 22, 22);
      ctx.fillRect(0, 4, 30, 14);

      // Antenna atop robot head
      ctx.fillRect(14, -6, 2, 6);
      ctx.fillRect(13, -8, 4, 2);

      // 2. Visor Screen (Pure Black #000000)
      ctx.fillStyle = "#000000";
      ctx.fillRect(4, 4, 22, 13);

      // 3. Eyes
      if (crawler.isDead) {
        // "X X" Dead Pixel Eyes
        ctx.fillStyle = "#ffffff";
        // Left X
        ctx.fillRect(7, 7, 2, 2);
        ctx.fillRect(11, 7, 2, 2);
        ctx.fillRect(9, 9, 2, 2);
        ctx.fillRect(7, 11, 2, 2);
        ctx.fillRect(11, 11, 2, 2);
        // Right X
        ctx.fillRect(17, 7, 2, 2);
        ctx.fillRect(21, 7, 2, 2);
        ctx.fillRect(19, 9, 2, 2);
        ctx.fillRect(17, 11, 2, 2);
        ctx.fillRect(21, 11, 2, 2);
      } else {
        // Glowing White Dot Matrix Eyes (4x4)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(7, 7, 4, 4);
        ctx.fillRect(17, 7, 4, 4);
      }

      // 4. Mechanical Articulation Legs (Alternating 2-frame stride)
      ctx.fillStyle = "#71717a";
      if (Math.floor(crawler.legFrame) === 0 || !crawler.isGrounded) {
        ctx.fillRect(6, 22, 6, 8);
        ctx.fillRect(18, 22, 6, 8);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(6, 28, 8, 2);
        ctx.fillRect(18, 28, 8, 2);
      } else {
        ctx.fillRect(3, 22, 6, 8);
        ctx.fillRect(21, 22, 6, 8);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(3, 28, 8, 2);
        ctx.fillRect(21, 28, 8, 2);
      }

      ctx.restore();

      // -----------------------------------------------------------
      // Particle System (Debris & Smoke)
      // -----------------------------------------------------------
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.028;

        // Ground bounce for debris
        if (p.y >= groundY) {
          p.y = groundY;
          p.vy = -p.vy * 0.45;
          p.vx *= 0.65;
        }

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.globalAlpha = 1.0;
        }
      }

      // -----------------------------------------------------------
      // Top Glitch Death Banner (if Failed)
      // -----------------------------------------------------------
      if (crawler.isDead) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, width, 84);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 83.5, width, 1);

        ctx.font = "bold 13px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("[ SYSTEM ALERT: AUTHENTICATION REJECTED // CRAWLER TERMINATED ]", width / 2, 38);

        ctx.font = "11px monospace";
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText("UPDATE CREDENTIALS IN THE GATEWAY TO REBOOT THE RUNNER ENGINE", width / 2, 58);
        ctx.textAlign = "start";
      }

      ctx.restore();
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []); // Empty array ensures game loop runs continuously across keystrokes!

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
