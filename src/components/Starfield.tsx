import { useEffect, useRef } from 'react';

interface StarfieldProps {
  density?: number;
  className?: string;
}

// Animated star field on canvas. Low CPU: uses requestAnimationFrame, pauses when tab inactive.
export default function Starfield({ density = 80, className = '' }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: { x: number; y: number; z: number; size: number; twinkle: number }[] = [];
    let animationId: number | null = null;
    let running = true;

    function resize() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.offsetWidth * dpr;
      canvas.height = parent.offsetHeight * dpr;
      canvas.style.width = parent.offsetWidth + 'px';
      canvas.style.height = parent.offsetHeight + 'px';
      ctx.scale(dpr, dpr);
      initStars();
    }

    function initStars() {
      if (!canvas) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      if (!canvas || !ctx || !running) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.twinkle += 0.02;
        const alpha = (Math.sin(s.twinkle) * 0.3 + 0.7) * s.z;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
        ctx.fill();

        // Occasional orange star
        if (s.z > 0.7) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 107, 0, ${alpha * 0.5})`;
          ctx.fill();
        }
      }
      if (!prefersReduced) {
        animationId = requestAnimationFrame(draw);
      }
    }

    resize();
    draw();

    const handleVisibility = () => {
      running = !document.hidden;
      if (running && !prefersReduced) {
        draw();
      } else if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true" />;
}
