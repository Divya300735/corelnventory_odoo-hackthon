import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

/* ─── Inventory-themed floating icons ─── */
const ICONS = ['📦', '🏷️', '🚚', '📋', '🔖', '⚙️', '📊', '🏪', '📁', '🔢'];

interface FloatingItem {
  id: number;
  icon: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const items: FloatingItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  icon: ICONS[i % ICONS.length],
  x: 5 + (i / 17) * 90,          // spread across full width
  size: Math.random() * 18 + 16,  // 16–34px
  duration: Math.random() * 14 + 16, // 16–30s
  delay: -(Math.random() * 20),   // negative = already mid-air
  opacity: Math.random() * 0.18 + 0.08,
}));

/* ─── Grid network lines (SVG) ─── */
function GridLines() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/* ─── Radial glow blobs ─── */
const BLOBS = [
  { cx: '10%', cy: '20%', r: 280, color: '#6366f1' },
  { cx: '85%', cy: '70%', r: 220, color: '#a855f7' },
  { cx: '50%', cy: '90%', r: 180, color: '#ec4899' },
  { cx: '75%', cy: '15%', r: 160, color: '#3b82f6' },
];

export default function AuthLayout() {
  const { isDark, toggleTheme } = useThemeStore();

  // Apply saved theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots: { x: number; y: number; vx: number; vy: number }[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDarkNow = document.documentElement.classList.contains('dark');
      const dot = isDarkNow ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.35)';
      const line = isDarkNow ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';

      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = dot;
        ctx.fill();
      });

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = line;
            ctx.lineWidth = (160 - dist) / 160;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">

      {/* ─── Glow blobs ─── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {BLOBS.map((b, i) => (
          <div key={i} className="absolute rounded-full blur-3xl opacity-[0.12] dark:opacity-[0.18]"
            style={{
              left: b.cx, top: b.cy, width: b.r * 2, height: b.r * 2,
              background: b.color, transform: 'translate(-50%,-50%)'
            }} />
        ))}
      </div>

      {/* ─── Grid ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none"><GridLines /></div>

      {/* ─── Particle network canvas ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* ─── Floating inventory icons (rain upward) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {items.map(item => (
          <motion.div
            key={item.id}
            className="absolute select-none"
            style={{ left: `${item.x}%`, bottom: '-10%', fontSize: item.size, opacity: item.opacity }}
            animate={{ y: [0, -(window.innerHeight + 120)] }}
            transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'linear' }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* ─── Theme toggle (top-right) ─── */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-30 p-2.5 rounded-xl glass border shadow-sm hover:scale-110 transition-all duration-200"
        title="Toggle theme"
      >
        {isDark
          ? <Sun className="w-5 h-5 text-amber-400" />
          : <Moon className="w-5 h-5 text-indigo-500" />
        }
      </button>

      {/* ─── Card ─── */}
      <div className="z-10 w-full max-w-md px-4 py-6 relative">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-7">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-primary/15 backdrop-blur-sm border border-primary/30 p-3 rounded-2xl mb-4 inline-flex shadow-lg"
          >
            <Package className="h-9 w-9 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            CoreInventory
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground mt-1.5 text-sm text-center"
          >
            Modern Inventory Management System
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="glass border rounded-2xl p-8 shadow-2xl"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
