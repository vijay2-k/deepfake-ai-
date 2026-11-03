import React, { useEffect, useRef } from 'react';

interface ParticleWaveBackgroundProps {
  className?: string;
}

export const ParticleWaveBackground: React.FC<ParticleWaveBackgroundProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width * 0.5;
    let mouseY = height * 0.4;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle Wave lines config
    // 6 undulating wave ribbons:
    // Waves 0 & 1: Amber / Orange accents on the left & lower hero (matching reference)
    // Waves 2 & 3: Electric Cyan #00E5FF
    // Waves 4 & 5: Violet #8B5CF6 and Electric Blue #267CFF
    const waveCount = 5;
    const pointsPerWave = 90;

    let time = 0;

    const render = () => {
      time += 0.015;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle radial ambient glows
      // Cyan glow top-right
      const cyanGlow = ctx.createRadialGradient(
        width * 0.75,
        height * 0.25,
        20,
        width * 0.75,
        height * 0.25,
        width * 0.5
      );
      cyanGlow.addColorStop(0, 'rgba(0, 229, 255, 0.07)');
      cyanGlow.addColorStop(0.5, 'rgba(38, 124, 255, 0.03)');
      cyanGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, width, height);

      // Amber/Orange glow bottom-left (as in reference image)
      const amberGlow = ctx.createRadialGradient(
        width * 0.15,
        height * 0.5,
        10,
        width * 0.15,
        height * 0.5,
        width * 0.45
      );
      amberGlow.addColorStop(0, 'rgba(255, 157, 50, 0.06)');
      amberGlow.addColorStop(0.5, 'rgba(255, 120, 0, 0.02)');
      amberGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = amberGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Digital Particle Waves
      for (let w = 0; w < waveCount; w++) {
        const isAmber = w < 2; // Left side warm particle wave
        const isCyan = w >= 2 && w < 4;
        const isViolet = w >= 4;

        const baseColor = isAmber
          ? '255, 157, 50'
          : isCyan
          ? '0, 229, 255'
          : '139, 92, 246';

        const waveY = height * (0.35 + w * 0.08);
        const waveSpeed = 0.8 + w * 0.2;
        const waveFreq = 0.0022 - w * 0.0003;
        const waveAmp = 42 + w * 12;

        ctx.beginPath();
        const coords: { x: number; y: number; alpha: number; radius: number }[] = [];

        for (let i = 0; i <= pointsPerWave; i++) {
          const x = (i / pointsPerWave) * width;
          const distToMouse = Math.hypot(x - mouseX, waveY - mouseY);
          const mouseDisplace = Math.sin(Math.min(distToMouse * 0.008, Math.PI)) * 18;

          const y =
            waveY +
            Math.sin(x * waveFreq + time * waveSpeed + w * 1.5) * waveAmp +
            Math.cos(x * waveFreq * 1.8 - time * 0.5) * (waveAmp * 0.4) +
            mouseDisplace;

          // Fade out based on screen position
          let alpha = 0.45;
          if (isAmber) {
            // Emphasize left side for amber wave
            alpha = Math.max(0, 0.7 - (x / width) * 0.8);
          } else {
            // Emphasize right and center for cyan / violet
            alpha = Math.min(0.7, 0.2 + (x / width) * 0.6);
          }

          const radius = (1.2 + Math.sin(x * 0.01 + time) * 0.6) * (1 + (w % 2) * 0.3);
          coords.push({ x, y, alpha, radius });

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Draw connecting thin laser line
        ctx.strokeStyle = `rgba(${baseColor}, ${isAmber ? 0.15 : 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw individual luminous dots along the wave
        for (let j = 0; j < coords.length; j += 2) {
          const p = coords[j];
          if (p.alpha <= 0.03) continue;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor}, ${p.alpha})`;
          ctx.fill();

          // Subtle glow on periodic nodes
          if (j % 6 === 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${baseColor}, ${p.alpha * 0.28})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.88 }}
    />
  );
};

