/**
 * Global Interactive Audio Controller
 * Manages theme-wide audio state and provides interaction-based sound feedback
 * Designed to complement scroll-driven Raga system
 */

(function () {
  "use strict";

  class ThemeAudio {
    constructor() {
      if (ThemeAudio.instance) {
        return ThemeAudio.instance;
      }
      ThemeAudio.instance = this;

      // Settings from theme
      this.settings = window.themeAudioSettings || {
        enabled: true,
        volume: 0.5,
        scrollSounds: true,
        hoverSounds: true,
        clickSounds: true,
      };

      // State management
      this.audioContext = null;
      this.enabled = this.loadEnabledState();
      this.activeOscillators = [];
      this.lastScrollSound = 0;
      this.isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );

      // Initialize
      this.init();
    }

    init() {
      // Don't initialize AudioContext until user interaction
      document.addEventListener("click", () => this.ensureAudioContext(), {
        once: true,
      });
      document.addEventListener("touchstart", () => this.ensureAudioContext(), {
        once: true,
      });

      // Set up event listeners if audio is enabled
      if (this.enabled) {
        this.attachListeners();
      }

      // Dispatch initial state
      this.dispatchStateChange();
    }

    ensureAudioContext() {
      if (!this.audioContext) {
        this.audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    }

    attachListeners() {
      if (this.settings.hoverSounds) {
        this.setupHoverListeners();
      }
      if (this.settings.clickSounds) {
        this.setupClickListeners();
      }
    }

    setupHoverListeners() {
      // Debounced hover sound for product cards and buttons
      let hoverTimeout;
      const handleHover = (e) => {
        if (!this.enabled) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          this.playHoverSound();
        }, 50);
      };

      // Add listeners to common interactive elements
      const selectors = [
        ".card-product",
        ".product-card",
        "button:not(.audio-toggle)",
        "a.button",
        ".collection-card",
      ];

      selectors.forEach((selector) => {
        document.addEventListener(
          "mouseenter",
          (e) => {
            if (e.target.matches(selector)) {
              handleHover(e);
            }
          },
          true,
        );
      });
    }

    setupClickListeners() {
      document.addEventListener("click", (e) => {
        if (!this.enabled) return;

        const button = e.target.closest('button, a.button, [role="button"]');
        if (button && !button.classList.contains("audio-toggle")) {
          // Check if it's an add to cart button
          if (button.matches('[name="add"], .product-form__submit')) {
            this.playSuccessSound();
          } else {
            this.playClickSound();
          }
        }
      });
    }

    // Sound generation methods
    playHoverSound() {
      if (!this.enabled || !this.audioContext) return;

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);

      gain.gain.setValueAtTime(0.03 * this.settings.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      this.trackOscillator(osc);
    }

    playClickSound() {
      if (!this.enabled || !this.audioContext) return;

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.05 * this.settings.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.2);

      this.trackOscillator(osc);
    }

    playSuccessSound() {
      if (!this.enabled || !this.audioContext) return;

      const now = this.audioContext.currentTime;
      const frequencies = [440, 660, 880];

      frequencies.forEach((freq, i) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.03 * this.settings.volume, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + i * 0.08);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + 0.5 + i * 0.08);

        this.trackOscillator(osc);
      });
    }

    trackOscillator(osc) {
      this.activeOscillators.push(osc);
      osc.onended = () => {
        const index = this.activeOscillators.indexOf(osc);
        if (index > -1) {
          this.activeOscillators.splice(index, 1);
        }
      };

      // Limit polyphony (mobile optimization)
      if (this.isMobile && this.activeOscillators.length > 3) {
        const oldOsc = this.activeOscillators.shift();
        try {
          oldOsc.stop();
        } catch (e) {}
      }
    }

    // State management
    loadEnabledState() {
      const stored = localStorage.getItem("theme_audio_enabled");
      if (stored !== null) {
        return stored === "true";
      }
      return this.settings.enabled !== false;
    }

    saveEnabledState() {
      localStorage.setItem("theme_audio_enabled", this.enabled.toString());
    }

    toggle() {
      this.enabled = !this.enabled;
      this.saveEnabledState();
      this.dispatchStateChange();

      if (this.enabled) {
        this.ensureAudioContext();
        this.attachListeners();
      }

      return this.enabled;
    }

    enable() {
      if (!this.enabled) {
        this.toggle();
      }
    }

    disable() {
      if (this.enabled) {
        this.toggle();
      }
    }

    isEnabled() {
      return this.enabled;
    }

    setVolume(volume) {
      this.settings.volume = Math.max(0, Math.min(1, volume));
    }

    getVolume() {
      return this.settings.volume;
    }

    dispatchStateChange() {
      const event = new CustomEvent("audioStateChanged", {
        detail: {
          enabled: this.enabled,
          volume: this.settings.volume,
        },
      });
      document.dispatchEvent(event);
    }

    // Stop all active sounds
    stopAll() {
      this.activeOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {}
      });
      this.activeOscillators = [];

      if (this.audioContext && this.audioContext.state === "running") {
        this.audioContext.suspend();
      }
    }
  }

  // Initialize and expose globally
  window.ThemeAudio = new ThemeAudio();

  // Listen for cart additions
  document.addEventListener("cart:item-added", () => {
    if (window.ThemeAudio.isEnabled()) {
      window.ThemeAudio.playSuccessSound();
    }
  });

  // Make toggle function available globally for UI
  window.toggleThemeAudio = function () {
    const newState = window.ThemeAudio.toggle();
    console.log(`Theme audio ${newState ? "enabled" : "disabled"}`);
    return newState;
  };
})();
