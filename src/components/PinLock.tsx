import { useState, useEffect } from 'react'

const PIN_KEY = 'armbaile_pin'
const UNLOCKED_KEY = 'armbaile_unlocked'
const UNLOCK_DURATION = 30 * 60 * 1000 // 30 minutes

export function usePinLock() {
  const storedPin = localStorage.getItem(PIN_KEY)
  const hasPin = !!storedPin

  const isUnlocked = () => {
    if (!hasPin) return true
    const ts = parseInt(localStorage.getItem(UNLOCKED_KEY) || '0')
    return Date.now() - ts < UNLOCK_DURATION
  }

  const unlock = (pin: string) => {
    if (pin === storedPin) {
      localStorage.setItem(UNLOCKED_KEY, Date.now().toString())
      return true
    }
    return false
  }

  const setPin = (pin: string) => {
    localStorage.setItem(PIN_KEY, pin)
    localStorage.setItem(UNLOCKED_KEY, Date.now().toString())
  }

  const removePin = () => {
    localStorage.removeItem(PIN_KEY)
    localStorage.removeItem(UNLOCKED_KEY)
  }

  const lock = () => localStorage.removeItem(UNLOCKED_KEY)

  return { hasPin, isUnlocked, unlock, setPin, removePin, lock, storedPin }
}

interface PinScreenProps {
  mode: 'unlock' | 'setup' | 'change'
  onSuccess: () => void
  onCancel?: () => void
}

export function PinScreen({ mode, onSuccess, onCancel }: PinScreenProps) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const { unlock, setPin: savePin } = usePinLock()

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleDigit = (d: string) => {
    setError('')
    if (mode === 'unlock') {
      const next = pin + d
      setPin(next)
      if (next.length === 4) {
        if (unlock(next)) {
          onSuccess()
        } else {
          triggerShake()
          setError('Incorrect PIN')
          setTimeout(() => setPin(''), 600)
        }
      }
    } else {
      // setup / change
      if (step === 'enter') {
        const next = pin + d
        setPin(next)
        if (next.length === 4) setStep('confirm')
      } else {
        const next = confirm + d
        setConfirm(next)
        if (next.length === 4) {
          if (next === pin) {
            savePin(next)
            onSuccess()
          } else {
            triggerShake()
            setError('PINs do not match — try again')
            setTimeout(() => { setConfirm(''); setPin(''); setStep('enter') }, 700)
          }
        }
      }
    }
  }

  const handleDelete = () => {
    setError('')
    if (mode === 'unlock' || step === 'enter') {
      setPin(p => p.slice(0, -1))
    } else {
      if (confirm.length > 0) setConfirm(c => c.slice(0, -1))
      else { setStep('enter'); setPin(p => p.slice(0, -1)) }
    }
  }

  const current = (mode === 'unlock' || step === 'enter') ? pin : confirm
  const title = mode === 'unlock' ? 'Enter your PIN'
    : step === 'enter' ? 'Choose a 4-digit PIN'
    : 'Confirm your PIN'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#1F3A32' }}>
      <div className="text-5xl mb-4">🏡</div>
      <h1 className="font-display text-2xl font-bold text-white mb-1">Ár mBaile</h1>
      <p className="text-white/60 text-sm mb-10">{title}</p>

      {/* Dots */}
      <div className={`flex gap-4 mb-8 transition-transform ${shake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < current.length ? 'bg-white border-white' : 'border-white/40'}`} />
        ))}
      </div>

      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
          d === '' ? <div key={i} /> :
          <button key={i} onClick={() => d === '⌫' ? handleDelete() : handleDigit(d)}
            className={`w-16 h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
              d === '⌫' ? 'text-white/50 hover:text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}>
            {d}
          </button>
        ))}
      </div>

      {onCancel && (
        <button onClick={onCancel} className="text-white/40 text-sm hover:text-white/70 transition-colors">
          Cancel
        </button>
      )}
    </div>
  )
}

// Settings component for PIN management
export function PinSettings() {
  const { hasPin, removePin, lock } = usePinLock()
  const [mode, setMode] = useState<'idle' | 'setup' | 'change'>('idle')

  useEffect(() => { /* refresh on mount */ }, [])

  if (mode !== 'idle') {
    return <PinScreen mode={mode} onSuccess={() => setMode('idle')} onCancel={() => setMode('idle')} />
  }

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
      <h3 className="font-semibold text-sm mb-4" style={{ color: '#1F3A32' }}>🔐 PIN Lock</h3>
      {hasPin ? (
        <div className="space-y-2">
          <p className="text-xs opacity-60 mb-3">PIN is active. App locks automatically after 30 minutes.</p>
          <button onClick={() => setMode('change')} className="w-full py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5', color: '#1F3A32' }}>Change PIN</button>
          <button onClick={lock} className="w-full py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5', color: '#3A3A3C' }}>Lock Now</button>
          <button onClick={removePin} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#FFF0F0', color: '#6A1E2C' }}>Remove PIN</button>
        </div>
      ) : (
        <div>
          <p className="text-xs opacity-60 mb-3">No PIN set. Add one to protect your data.</p>
          <button onClick={() => setMode('setup')} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>Set up PIN</button>
        </div>
      )}
    </div>
  )
}
