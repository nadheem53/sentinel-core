import React, { useEffect, useRef } from 'react';

interface RadarSweepProps {
  isScanning: boolean;
  detectedCount: number;
  threatDetected?: boolean;
}

export const RadarSweep: React.FC<RadarSweepProps> = ({
  isScanning,
  detectedCount,
  threatDetected = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const blipsRef = useRef<{ x: number; y: number; alpha: number; isThreat: boolean }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      ctx.clearRect(0, 0, width, height);

      // Draw Concentric Cyber Grid Rings
      ctx.lineWidth = 1;
      const ringSteps = [0.25, 0.5, 0.75, 1.0];
      ringSteps.forEach((step) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * step, 0, Math.PI * 2);
        ctx.strokeStyle = threatDetected ? 'rgba(244, 63, 94, 0.25)' : 'rgba(0, 243, 255, 0.2)';
        ctx.stroke();
      });

      // Draw Crosshair Axes
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = threatDetected ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 243, 255, 0.15)';
      ctx.stroke();

      // Outer Border Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = threatDetected ? 'rgba(244, 63, 94, 0.6)' : 'rgba(0, 243, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isScanning) {
        // Rotating Radar Sweep Cone
        angleRef.current = (angleRef.current + 0.04) % (Math.PI * 2);
        const currentAngle = angleRef.current;

        // Gradient Sweep Sector
        const sweepGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
        sweepGradient.addColorStop(0, threatDetected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(0, 243, 255, 0.4)');
        sweepGradient.addColorStop(1, threatDetected ? 'rgba(244, 63, 94, 0.0)' : 'rgba(0, 243, 255, 0.0)');

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle - 0.4, currentAngle);
        ctx.closePath();
        ctx.fillStyle = sweepGradient;
        ctx.fill();

        // Main Sweep Leading Edge Line
        const edgeX = centerX + Math.cos(currentAngle) * radius;
        const edgeY = centerY + Math.sin(currentAngle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(edgeX, edgeY);
        ctx.strokeStyle = threatDetected ? '#f43f5e' : '#00f3ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Randomly spawn blips on scan sweep
        if (Math.random() < 0.15 && blipsRef.current.length < 12) {
          const randAngle = Math.random() * Math.PI * 2;
          const randDist = (0.2 + Math.random() * 0.7) * radius;
          blipsRef.current.push({
            x: centerX + Math.cos(randAngle) * randDist,
            y: centerY + Math.sin(randAngle) * randDist,
            alpha: 1.0,
            isThreat: Math.random() < (threatDetected ? 0.6 : 0.2),
          });
        }
      }

      // Render & Fade Radar Blips
      for (let i = blipsRef.current.length - 1; i >= 0; i--) {
        const blip = blipsRef.current[i];
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, blip.isThreat ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = blip.isThreat
          ? `rgba(244, 63, 94, ${blip.alpha})`
          : `rgba(0, 243, 255, ${blip.alpha})`;
        ctx.shadowColor = blip.isThreat ? '#f43f5e' : '#00f3ff';
        ctx.shadowBlur = blip.isThreat ? 10 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        blip.alpha -= isScanning ? 0.015 : 0.005;
        if (blip.alpha <= 0) {
          blipsRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isScanning, threatDetected]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="w-[240px] h-[240px] rounded-full drop-shadow-[0_0_20px_rgba(0,243,255,0.2)]"
      />
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          {isScanning ? 'RADAR ACTIVE' : 'STANDBY'}
        </span>
        {detectedCount > 0 && (
          <span className="text-xs font-mono font-bold text-cyber-crimson mt-0.5 animate-pulse">
            {detectedCount} BLIPS
          </span>
        )}
      </div>
    </div>
  );
};
