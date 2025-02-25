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
  
  getStartValueFromAttribute(wrapper, min, max) {
    const startAttr = wrapper.getAttribute(`${this.attributePrefix}-start`);
    if (!startAttr) return min; // Valeur par défaut = min
    
    try {
      const startValue = parseFloat(startAttr);
      // S'assurer que la valeur est dans la plage
      return Math.max(min, Math.min(max, startValue));
    } catch (e) {
      console.error('Invalid start value:', startAttr);
      return min;
    }
  }

  formatNumber(number) {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (number >= 10000) {
      return (number / 1000).toFixed(0) + 'K';
    }
    if (number >= 1000) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return number.toString();
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
  
  calculatePosition(value, min, max) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    
    // Éviter log(0)
    min = min <= 0 ? 0.1 : min;
    value = value <= 0 ? 0.1 : value;
    
    // Utiliser une échelle logarithmique inverse
    const minv = Math.log(min);
    const maxv = Math.log(max);
    
    return (Math.log(value) - minv) / (maxv - minv);
  }

  publishValue(wrapper, value) {
    // Récupérer l'identifiant du slider (data-roi ou autre attribut)
    const sliderId = this.getSliderIdentifier(wrapper);
    
    // Logger dans la console
    console.log(`Slider value update - ${sliderId}: ${value}`);
    
    // Créer un événement personnalisé
    const event = new CustomEvent('sliderValueChange', {
      detail: {
        id: sliderId,
        value: value
      }
    });
    document.dispatchEvent(event);
    
    // Si dataLayer existe (pour GTM), publier l'événement
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'sliderValueChange',
        sliderId: sliderId,
        sliderValue: value
      });
    }
    
    // Stocker dans une variable globale
    if (!window.sliderValues) {
      window.sliderValues = {};
    }
    window.sliderValues[sliderId] = value;
  }
  
  getSliderIdentifier(wrapper) {
    // Essayer de trouver data-roi ou un autre identifiant
    for (const attr of wrapper.attributes) {
      if (attr.name.startsWith('data-roi')) {
        return attr.value || attr.name.replace('data-', '');
      }
    }
    
    // Essayer data-slider-id
    const sliderId = wrapper.getAttribute('data-slider-id');
    if (sliderId) return sliderId;
    
    // Si aucun identifiant n'est trouvé, utiliser une valeur par défaut
    return 'unnamed-slider';
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
    const startValue = this.getStartValueFromAttribute(wrapper, min, max);

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

    // Initial position based on startValue
    const startPosition = this.calculatePosition(startValue, min, max);
    updateUI(startPosition);
  }
}

// Initialize
new LogarithmicSlider();
