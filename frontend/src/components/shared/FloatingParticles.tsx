import { useMemo } from 'react'

const EMOJIS = [
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
  '🐝',
]
export default function FloatingParticles({ count = 20 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        // Horizontal distribution
        left: `${(i / count) * 100 + Math.sin(i * 1.7) * 3}%`,
        // Different delays to avoid all the emojis coming at the same time
        delay: `-${(i * (15 / count)).toFixed(1)}s`,
        // Different duration - some will appear and disappear faster than others
        duration: `${12 + (i % 5) * 3}s`,
        // Different size to have deeper effect
        size: `${0.8 + (i % 4) * 0.3}rem`,
      })),
    [count]
  )

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute bottom-0 select-none"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
