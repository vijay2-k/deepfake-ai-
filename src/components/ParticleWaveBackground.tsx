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
    let mouseY = height * 0.3;
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

    // Ethereal purple and cyan wave lines
    const waveCount = 4;
    const pointsPerWave = 80;
    let time = 0;

    const render = () => {
      time += 0.012;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric grid dots in soft lilac
      ctx.fillStyle = 'rgba(85, 21, 216, 0.035)';
      const dotSpacing = 36;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4 graceful flowing cybernetic lines in purple, violet & blue
      const waveColors = [
        { stroke: 'rgba(85, 21, 216, 0.12)', fill: 'rgba(139, 50, 255, 0.015)' },
        { stroke: 'rgba(22, 119, 255, 0.10)', fill: 'rgba(22, 119, 255, 0.012)' },
        { stroke: 'rgba(0, 217, 255, 0.09)', fill: 'rgba(0, 217, 255, 0.010)' },
        { stroke: 'rgba(139, 50, 255, 0.10)', fill: 'rgba(85, 21, 216, 0.012)' },
      ];

      for (let w = 0; w < waveCount; w++) {
        const color = waveColors[w % waveColors.length];
        const baseHeight = height * 0.35 + w * 45;
        const speed = 0.5 + w * 0.2;
        const amplitude = 30 + w * 12;

        ctx.beginPath();
        ctx.strokeStyle = color.stroke;
        ctx.fillStyle = color.fill;
        ctx.lineWidth = 1.25;

        for (let i = 0; i <= pointsPerWave; i++) {
          const x = (i / pointsPerWave) * width;
          const normalizedX = x / width;

          // Multi-frequency wave calculation with smooth cursor deflection
          const distToMouse = Math.hypot(x - mouseX, baseHeight - mouseY);
          const mouseInfluence = Math.max(0, 1 - distToMouse / 350) * 20;

          const y =
            baseHeight +
            Math.sin(normalizedX * 6 + time * speed) * amplitude +
            Math.cos(normalizedX * 10 - time * 0.7) * (amplitude * 0.35) -
            mouseInfluence;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
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
      style={{ opacity: 0.85 }}
    />
  );
};
