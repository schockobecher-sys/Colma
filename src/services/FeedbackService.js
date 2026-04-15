/**
 * FeedbackService for synthesized 'gaming' sound effects and haptic feedback.
 */
class FeedbackService {
  constructor() {
    this.audioCtx = null;
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Play a short 'gaming' synthesized sound
   * @param {string} type - 'success' or 'remove'
   */
  async playSound(type = 'success') {
    try {
      this.initAudio();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        // "Ding" sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // "Pop" sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  /**
   * Trigger haptic vibration
   * @param {number|number[]} pattern - vibration pattern in ms
   */
  vibrate(pattern = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Combined feedback for "Add to Collection"
   */
  triggerAdd() {
    this.playSound('success');
    this.vibrate([10, 30, 10]);
  }

  /**
   * Combined feedback for "Remove from Collection"
   */
  triggerRemove() {
    this.playSound('remove');
    this.vibrate(15);
  }
}

export default new FeedbackService();
