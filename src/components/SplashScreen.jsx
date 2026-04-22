import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 2000)
    const t2 = setTimeout(() => onFinish(), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(145deg, #E84510 0%, #F0501E 45%, #FF3D6B 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      opacity: phase === 'out' ? 0 : 1,
      transition: 'opacity 0.7s ease',
    }}>
      <p style={{
        color: '#fff', fontSize: 80, fontWeight: 900, margin: 0,
        letterSpacing: '-3px', fontFamily: "'Arial Black', Arial, sans-serif",
        lineHeight: 1,
        animation: 'splashBounce 1s cubic-bezier(0.36,0.07,0.19,0.97) both',
      }}>
        rappi
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.82)', fontSize: 13, margin: 0,
        letterSpacing: '0.06em',
        animation: 'splashFade 0.5s ease 0.9s both',
      }}>
        Dashboard de disponibilidad de tiendas
      </p>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'rgba(255,255,255,0.3)',
        animation: 'splashBar 2s linear both',
        transformOrigin: 'left',
      }} />
      <style>{`
        @keyframes splashBounce {
          0% { transform: scale(0.3); opacity: 0; }
          55% { transform: scale(1.08); opacity: 1; }
          75% { transform: scale(0.95); }
          90% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
