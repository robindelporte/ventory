class LogarithmicSlider {
  constructor() {
    this.attributePrefix = 'data-log-slider';
    this.config = {
      wrapperAttr: 'fs-rangeslider-element="wrapper"',
      handleAttr: 'fs-rangeslider-element="handle"',
      trackAttr: 'fs-rangeslider-element="track"',
      fillAttr: 'fs-rangeslider-element="fill"',
      displayAttr: 'fs-rangeslider-element="display-value"',
      inputAttr: 'input[type="range"]'
    };

    // Initialiser tous les sliders quand le DOM est chargé
    document.addEventListener('DOMContentLoaded', () => {
      const sliders = document.querySelectorAll(`[${this.config.wrapperAttr}]`);
      sliders.forEach(wrapper => this.setupSlider(wrapper));
    });
  }

  getScaleFromAttribute(wrapper) {
    const scaleAttr = wrapper.getAttribute(`${this.attributePrefix}-scale`);
    if (!scaleAttr) return [0, 10000]; // Échelle par défaut
    try {
      return JSON.parse(scaleAttr);
    } catch (e) {
      console.error('Invalid scale format:', scaleAttr);
      return [0, 10000];
    }
  }

  getCurrencyFromAttribute(wrapper) {
    return wrapper.getAttribute(`${this.attributePrefix}-currency`) || '';
  }

  calculateValue(percentage, min, max) {
    if (percentage <= 0) return min;
    if (percentage >= 1) return max;

    // Utiliser une échelle logarithmique
    const minp = 0;
    const maxp = 1;

    // La courbe logarithmique
    const minv = Math.log(min || 1);
    const maxv = Math.log(max);

    // Calcul de l'échelle
    const scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (percentage - minp));
  }

  formatNumber(number) {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  setupSlider(wrapper) {
    const elements = {
      track: wrapper.querySelector(`[${this.config.trackAttr}]`),
      fill: wrapper.querySelector(`[${this.config.fillAttr}]`),
      handle: wrapper.querySelector(`[${this.config.handleAttr}]`),
      display: wrapper.querySelector(`[${this.config.displayAttr}]`),
      input: wrapper.querySelector(this.config.inputAttr)
    };

    if (!elements.track || !elements.handle) return;

    const scale = this.getScaleFromAttribute(wrapper);
    const currency = this.getCurrencyFromAttribute(wrapper);
    const min = scale[0];
    const max = scale[scale.length - 1];

    let isDragging = false;

    const updateUI = (percentage) => {
      percentage = Math.max(0, Math.min(1, percentage));
      const value = Math.round(this.calculateValue(percentage, min, max));
      const formattedValue = this.formatNumber(value);
      
      elements.handle.style.left = `${percentage * 100}%`;
      if (elements.fill) elements.fill.style.width = `${percentage * 100}%`;
      if (elements.display) elements.display.textContent = currency ? `${formattedValue}${currency}` : formattedValue;
      if (elements.input) elements.input.value = value;
    };

    const handleMove = (clientX) => {
      const rect = elements.track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = x / rect.width;
      updateUI(percentage);
    };

    elements.track.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleMove(e.clientX);
      document.addEventListener('mousemove', handleDrag);
    });

    elements.handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.stopPropagation();
      document.addEventListener('mousemove', handleDrag);
    });

    const handleDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      handleMove(e.clientX);
    };

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
      }
    });

    // Touch events
    const handleTouch = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX);
    };

    elements.track.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleTouch(e);
      document.addEventListener('touchmove', handleTouch);
    });

    elements.handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.stopPropagation();
      document.addEventListener('touchmove', handleTouch);
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        document.removeEventListener('touchmove', handleTouch);
      }
    });

    // Initial state
    updateUI(0);
  }
}

// Initialize
new LogarithmicSlider();
