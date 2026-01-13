/**
 * Haptic Feedback Utility
 * Provides iOS-like haptic feedback with audio and vibration
 */

let audioCtx: AudioContext | null = null

/**
 * Initialize audio context (should be called on first user interaction)
 */
export const initializeAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)()
  }
  return audioCtx
}

/**
 * Get the audio context instance
 */
export const getAudioContext = () => audioCtx

/**
 * Play iOS-like haptic swap sound
 * Creates a short, crisp "tap" sound similar to iOS haptic feedback
 */
export const playSwapHaptic = () => {
  if (!audioCtx) return

  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    // iOS haptic feedback uses a very short, crisp tone
    // Two-tone "tap" sound that mimics iOS swap haptic
    osc.type = 'sine'

    // Quick frequency shift for "tap" effect (1000Hz -> 800Hz)
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.01)

    // Very quick attack and decay (iOS haptics are very short)
    gain.gain.setValueAtTime(0, audioCtx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04)

    // Tight low-pass filter for that "muffled tap" iOS sound
    filter.type = 'lowpass'
    filter.frequency.value = 1500
    filter.Q.value = 1

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.04)
  } catch (e) {
    // Silent fail if AudioContext not supported
  }

  // iOS-style haptic vibration pattern
  if ('vibrate' in navigator) {
    navigator.vibrate(15) // Very short, crisp vibration like iOS
  }
}

/**
 * Play a comparison sound (lighter tap)
 * For when elements are being compared but not swapped
 */
export const playComparisonHaptic = () => {
  if (!audioCtx) return

  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime)

    // Softer and shorter than swap sound
    gain.gain.setValueAtTime(0, audioCtx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02)

    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filter.Q.value = 1

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.02)
  } catch (e) {
    // Silent fail
  }

  // Very light vibration
  if ('vibrate' in navigator) {
    navigator.vibrate(8)
  }
}

/**
 * Play a completion sound (success)
 * For when sorting is complete
 */
export const playCompletionHaptic = () => {
  if (!audioCtx) return

  try {
    // Play a pleasant ascending chord
    const frequencies = [523.25, 659.25, 783.99] // C, E, G chord
    const startTime = audioCtx.currentTime

    frequencies.forEach((freq, index) => {
      const osc = audioCtx!.createOscillator()
      const gain = audioCtx!.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0, startTime + index * 0.05)
      gain.gain.linearRampToValueAtTime(0.1, startTime + index * 0.05 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.05 + 0.3)

      osc.connect(gain)
      gain.connect(audioCtx!.destination)

      osc.start(startTime + index * 0.05)
      osc.stop(startTime + index * 0.05 + 0.3)
    })
  } catch (e) {
    // Silent fail
  }

  // Success vibration pattern
  if ('vibrate' in navigator) {
    navigator.vibrate([30, 20, 30]) // Double tap pattern
  }
}

/**
 * Cleanup audio context (call on unmount if needed)
 */
export const cleanupAudioContext = () => {
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
}
