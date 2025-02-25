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
  
  getStartValueFromAttribute(wrapper, min, max, markers) {
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

  // Nouvelle méthode pour calculer la valeur basée sur les marqueurs
  calculateValueFromMarkers(percentage, markers) {
    if (percentage <= 0) return markers[0];
    if (percentage >= 1) return markers[markers.length - 1];
    
    // Trouver l'index correspondant à la position
    const index = percentage * (markers.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    
    // Si on est pile sur un marqueur
    if (lowerIndex === upperIndex) return markers[lowerIndex];
    
    // Interpolation entre deux marqueurs
    const lowerValue = markers[lowerIndex];
    const upperValue = markers[upperIndex];
    const weight = index - lowerIndex;
    
    // Interpolation logarithmique
    if (lowerValue <= 0) return lowerValue + weight * (upperValue - lowerValue);
    
    // Calculer une progression logarithmique entre les deux marqueurs
    const logLower = Math.log(lowerValue);
    const logUpper = Math.log(upperValue);
    return Math.exp(logLower + weight * (logUpper - logLower));
  }

  // Nouvelle méthode pour calculer la position basée sur les marqueurs
  calculatePositionFromMarkers(value, markers) {
    const min = markers[0];
    const max = markers[markers.length - 1];
    
    if (value <= min) return 0;
    if (value >= max) return 1;
    
    // Trouver les deux marqueurs les plus proches
    let lowerIndex = 0;
    let upperIndex = markers.length - 1;
    
    for (let i = 0; i < markers.length - 1; i++) {
      if (value >= markers[i] && value <= markers[i + 1]) {
        lowerIndex = i;
        upperIndex = i + 1;
        break;
      }
    }
    
    // Interpolation logarithmique
    const lowerValue = markers[lowerIndex];
    const upperValue = markers[upperIndex];
    
    if (lowerValue <= 0) {
      // Interpolation linéaire si les valeurs sont négatives ou nulles
      const valueOffset = value - lowerValue;
      const range = upperValue - lowerValue;
      const relativePosition = valueOffset / range;
      return (lowerIndex + relativePosition) / (markers.length - 1);
    }
    
    // Calculer la position avec interpolation logarithmique
    const logValue = Math.log(value);
    const logLower = Math.log(lowerValue);
    const logUpper = Math.log(upperValue);
    const relativePosition = (logValue - logLower) / (logUpper - logLower);
    
    return (lowerIndex + relativePosition) / (markers.length - 1);
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

    const markers = this.getScaleFromAttribute(wrapper);
    const currency = this.getCurrencyFromAttribute(wrapper);
    const min = markers[0];
    const max = markers[markers.length - 1];
    const startValue = this.getStartValueFromAttribute(wrapper, min, max, markers);

    let isDragging = false;

    const updateUI = (percentage) => {
      percentage = Math.max(0, Math.min(1, percentage));
      const value = Math.round(this.calculateValueFromMarkers(percentage, markers));
      const formattedValue = this.formatNumber(value);
      
      elements.handle.style.left = `${percentage * 100}%`;
      if (elements.fill) elements.fill.style.width = `${percentage * 100}%`;
      if (elements.display) elements.display.textContent = currency ? `${formattedValue}${currency}` : formattedValue;
      if (elements.input) elements.input.value = value;
      
      // Publier la valeur pour le calculateur ROI
      this.publishValue(wrapper, value);
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
    const startPosition = this.calculatePositionFromMarkers(startValue, markers);
    updateUI(startPosition);
  }
  
  // Pour communiquer avec le calculateur ROI
  getSliderIdentifier(wrapper) {
    // Essayer de trouver data-roi ou un autre identifiant
    for (const attr of wrapper.attributes) {
      if (attr.name.startsWith('data-roi')) {
        return attr.value || attr.name.substring(9); // Enlever 'data-roi='
      }
    }
    
    // Essayer data-slider-id
    const sliderId = wrapper.getAttribute('data-slider-id');
    if (sliderId) return sliderId;
    
    // Si aucun identifiant n'est trouvé
    return 'unnamed-slider';
  }
  
  publishValue(wrapper, value) {
    // Récupérer l'identifiant du slider
    const sliderId = this.getSliderIdentifier(wrapper);
    
    // Logger dans la console
    console.log(`Slider value update - ${sliderId}: ${value}`);
    
    // Stocker dans une variable globale
    if (!window.sliderValues) {
      window.sliderValues = {};
    }
    window.sliderValues[sliderId] = value;
    
    // Créer un événement personnalisé
    const event = new CustomEvent('sliderValueChange', {
      detail: {
        id: sliderId,
        value: value
      }
    });
    document.dispatchEvent(event);
  }
}

// Initialize
new LogarithmicSlider();
