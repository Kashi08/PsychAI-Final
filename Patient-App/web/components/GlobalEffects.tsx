'use client';
import { useEffect } from 'react';

/* ==========================================================================
   GlobalEffects — ported from psychai-portal/src/main.js
   Adds to the patient app:
     1. Mouse click sparkle particles (coloured dots bursting out on every click)
     2. Confetti explosion on any .btn-confetti element
     3. Interactive 3D tilt on any .tilt-card element
   ========================================================================== */

const SPARKLE_COLORS = ['#0DA99E', '#7C6FCD', '#FF79C6', '#FBBF24', '#0E9F6E', '#38bdf8'];
const CONFETTI_COLORS = ['#0DA99E', '#7C6FCD', '#38bdf8', '#fb7185', '#facc15', '#4ade80'];

// ── Sparkle burst (small coloured dots on every non-button click) ──────────
function spawnSparkles(x: number, y: number, count = 6) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'click-sparkle-particle';
    const size = Math.random() * 8 + 4;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 50 + 20;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist - 20}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

// ── Confetti explosion (larger pieces on CTA / save buttons) ──────────────
export function createConfetti(x: number, y: number, count = 32) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-burst-piece';
    el.style.width  = `${Math.random() * 8 + 6}px`;
    el.style.height = `${Math.random() * 12 + 6}px`;
    el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const vel   = Math.random() * 100 + 40;
    el.style.setProperty('--dx', `${Math.cos(angle) * vel}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * vel - 10}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

// ── 3-D tilt initialiser ──────────────────────────────────────────────────
function initTilt() {
  // Disabled 3D tilt effect to keep cards stable on hover
  return;
}

// ── Confetti on .btn-confetti buttons via Event Delegation ────────────────
function initConfettiButtons() {
  document.addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn-confetti');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    createConfetti(cx - 20, cy);
    createConfetti(cx + 20, cy);
  });
}

// ── Global click sparkles (skip if clicking a button / link) ──────────────
function initClickSparkles() {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea')) return;
    spawnSparkles(e.clientX, e.clientY);
  });
}

export default function GlobalEffects() {
  useEffect(() => {
    initClickSparkles();
    initConfettiButtons();
  }, []);

  return null; // purely behavioural — no UI
}
